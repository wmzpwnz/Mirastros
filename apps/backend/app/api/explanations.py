"""Authenticated, bounded explanations of existing consultation results."""
from uuid import UUID
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.services import result_explanations as service

router = APIRouter(prefix='/explanations', tags=['Result explanations'])


class ExplanationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str | None = Field(default=None, min_length=1, max_length=300)

    @field_validator('question')
    @classmethod
    def nonempty(cls, value):
        if value is not None and not value.strip():
            raise ValueError('Укажите вопрос об этом результате.')
        return value


@router.get('/{kind}/{result_id}')
async def get_explanation(kind: str, result_id: UUID, response: Response, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_active_user)):
    response.headers["Cache-Control"] = "private, no-store"
    await service.owned_result(db, user, kind, result_id)
    conv = await service.conversation(db, user, kind, result_id)
    return await service.access(db, user, kind, result_id, conv)


@router.post('/{kind}/{result_id}')
async def create_explanation(kind: str, result_id: UUID, request: ExplanationRequest, response: Response, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_active_user)):
    response.headers["Cache-Control"] = "private, no-store"
    return await service.explain(db, user, kind, result_id, request.question)
