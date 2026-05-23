"""Unified consultation history service - aggregates from all service tables"""
from typing import List, Optional, Tuple, Any
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.tarot_reading import TarotReading
from app.models.numerology_calculation import NumerologyCalculation
from app.models.iching_consultation import IChingConsultation
from app.models.dream_interpretation import DreamInterpretation
from app.models.lenormand_reading import LenormandReading
from app.models.synastry import Synastry


SERVICE_TABLES = {
    "tarot": (TarotReading, "created_at", "interpretation", lambda r: f"Расклад: {r.spread_type or 'Таро'}", lambda r: r.question),
    "numerology": (NumerologyCalculation, "created_at", "interpretation", lambda r: "Нумерологический расчёт", lambda r: r.full_name),
    "iching": (IChingConsultation, "created_at", "interpretation", lambda r: "И-Цзин", lambda r: r.question),
    "dreams": (DreamInterpretation, "created_at", "interpretation", lambda r: "Толкование сна", lambda r: (r.dream_description or "")[:100]),
    "lenormand": (LenormandReading, "created_at", "interpretation", lambda r: f"Ленорман: {r.spread_type or ''}", lambda r: r.question),
    "synastry": (Synastry, "calculated_at", "interpretation", lambda r: f"Синастрия: {r.person1_name} & {r.person2_name}", lambda r: None),
}


def _normalize_item(consultation_type: str, row: Any, date_field: str, text_field: str, title_fn, question_fn, include_raw: bool = False) -> dict:
    """Build unified item dict from a model row"""
    created = getattr(row, date_field, None) or getattr(row, "created_at", None)
    created_str = created.isoformat() if created else ""
    text = getattr(row, text_field, "") or ""
    preview = (text[:200] + "…") if len(text) > 200 else text
    is_fav = getattr(row, "is_favorite", False)
    out = {
        "id": str(row.id),
        "type": consultation_type,
        "title": title_fn(row) if callable(title_fn) else str(row),
        "question": question_fn(row) if question_fn and callable(question_fn) else None,
        "preview": preview,
        "created_at": created_str,
        "is_favorite": is_fav,
    }
    if include_raw:
        out["raw"] = _row_to_dict(row)
    return out


def _row_to_dict(row: Any) -> dict:
    """Convert SQLAlchemy row to JSON-serializable dict"""
    d = {}
    for c in row.__table__.columns:
        v = getattr(row, c.key, None)
        if v is None:
            d[c.key] = None
        elif hasattr(v, "isoformat"):
            d[c.key] = v.isoformat()
        elif hasattr(v, "hex"):  # UUID
            d[c.key] = str(v)
        else:
            d[c.key] = v
    return d


async def _fetch_type(
    db: AsyncSession,
    user_id: str,
    consultation_type: str,
    limit: int,
    offset: int,
) -> Tuple[List[dict], int]:
    """Fetch one type's history and total count. Returns (items, total)."""
    if consultation_type not in SERVICE_TABLES:
        return [], 0
    model, date_field, text_field, title_fn, question_fn = SERVICE_TABLES[consultation_type]
    user_col = getattr(model, "user_id", None) or getattr(model, "user_id", None)
    if user_col is None:
        return [], 0
    order_col = getattr(model, date_field, None) or getattr(model, "created_at", None)
    if order_col is None:
        return [], 0

    # Count
    count_q = select(func.count()).select_from(model).where(user_col == user_id)
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    # Items
    q = (
        select(model)
        .where(user_col == user_id)
        .order_by(order_col.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(q)
    rows = result.scalars().all()
    items = [
        _normalize_item(consultation_type, r, date_field, text_field, title_fn, question_fn, include_raw=False)
        for r in rows
    ]
    return items, total


async def _count_type(db: AsyncSession, user_id: str, consultation_type: str) -> int:
    """Count consultations for one type."""
    if consultation_type not in SERVICE_TABLES:
        return 0
    model, _, _, _, _ = SERVICE_TABLES[consultation_type]
    user_col = getattr(model, "user_id", None)
    if not user_col:
        return 0
    q = select(func.count()).select_from(model).where(user_col == user_id)
    r = await db.execute(q)
    return r.scalar() or 0


async def get_unified_history(
    db: AsyncSession,
    user_id: str,
    service_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    favorites_only: bool = False,
) -> Tuple[List[dict], int]:
    """
    Get unified consultation history. If service_type is set, only that type;
    otherwise fetch from all types, merge, sort by created_at desc, paginate.
    Returns (items, total).
    """
    if service_type and service_type not in SERVICE_TABLES:
        return [], 0

    types_to_fetch = [service_type] if service_type else list(SERVICE_TABLES.keys())

    # Total count: sum of counts per type
    total_count = 0
    for ctype in types_to_fetch:
        total_count += await _count_type(db, user_id, ctype)

    # Fetch enough from each type to fill current page after merge (oversample)
    fetch_limit = (page * page_size) + 100  # fetch extra so merge has enough
    all_items: List[dict] = []
    for ctype in types_to_fetch:
        items, _ = await _fetch_type(db, user_id, ctype, limit=fetch_limit, offset=0)
        if favorites_only:
            items = [i for i in items if i.get("is_favorite")]
        all_items.extend(items)

    # Sort by created_at desc
    all_items.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    # When favorites_only we filtered items; total is filtered size (is_favorite not in DB yet)
    if favorites_only:
        total_count = len(all_items)

    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    page_items = all_items[start:end]

    return page_items, total_count


async def get_consultation_detail(
    db: AsyncSession,
    user_id: str,
    consultation_type: str,
    consultation_id: str,
) -> Optional[dict]:
    """Get single consultation by type and id. Returns None if not found or not owner."""
    if consultation_type not in SERVICE_TABLES:
        return None
    model, date_field, text_field, title_fn, question_fn = SERVICE_TABLES[consultation_type]
    from sqlalchemy import and_
    try:
        uid = UUID(consultation_id)
    except (ValueError, TypeError):
        return None
    q = select(model).where(
        and_(model.id == uid, model.user_id == user_id)
    )
    result = await db.execute(q)
    row = result.scalar_one_or_none()
    if not row:
        return None
    created = getattr(row, date_field, None) or getattr(row, "created_at", None)
    created_str = created.isoformat() if created else ""
    text = getattr(row, text_field, "") or ""
    return {
        "id": str(row.id),
        "type": consultation_type,
        "title": title_fn(row) if callable(title_fn) else str(row),
        "question": question_fn(row) if question_fn and callable(question_fn) else None,
        "result": text,
        "created_at": created_str,
        "is_favorite": getattr(row, "is_favorite", False),
        "raw": _row_to_dict(row),
    }


async def delete_consultation(
    db: AsyncSession,
    user_id: str,
    consultation_type: str,
    consultation_id: str,
) -> bool:
    """Delete one consultation. Returns True if deleted."""
    if consultation_type not in SERVICE_TABLES:
        return False
    model, _, _, _, _ = SERVICE_TABLES[consultation_type]
    from sqlalchemy import and_, delete
    try:
        uid = UUID(consultation_id)
    except (ValueError, TypeError):
        return False
    stmt = delete(model).where(
        and_(model.id == uid, model.user_id == user_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


async def get_history_stats(db: AsyncSession, user_id: str) -> dict:
    """Aggregate stats: total, by_service, most_used, first/last dates, favorites_count."""
    by_service = {}
    first_at = None
    last_at = None
    favorites_count = 0

    for ctype, (model, date_field, _, _, _) in SERVICE_TABLES.items():
        user_col = getattr(model, "user_id", None)
        order_col = getattr(model, date_field, None) or getattr(model, "created_at", None)
        if not user_col or not order_col:
            continue
        count_q = select(func.count()).select_from(model).where(user_col == user_id)
        r = await db.execute(count_q)
        cnt = r.scalar() or 0
        by_service[ctype] = cnt
        if cnt > 0:
            # First and last date for this type
            first_q = select(order_col).where(user_col == user_id).order_by(order_col.asc()).limit(1)
            last_q = select(order_col).where(user_col == user_id).order_by(order_col.desc()).limit(1)
            fr = await db.execute(first_q)
            lr = await db.execute(last_q)
            f = fr.scalar()
            l = lr.scalar()
            if f:
                f_str = f.isoformat() if hasattr(f, "isoformat") else str(f)
                if first_at is None or f_str < first_at:
                    first_at = f_str
            if l:
                l_str = l.isoformat() if hasattr(l, "isoformat") else str(l)
                if last_at is None or l_str > last_at:
                    last_at = l_str

    total = sum(by_service.values())
    most_used = max(by_service, key=by_service.get) if by_service else "tarot"
    return {
        "total_consultations": total,
        "by_service": by_service,
        "most_used_service": most_used,
        "first_consultation_at": first_at,
        "last_consultation_at": last_at,
        "favorites_count": favorites_count,
    }
