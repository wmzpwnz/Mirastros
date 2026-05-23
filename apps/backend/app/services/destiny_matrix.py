"""Destiny Matrix Service - Matrix of Destiny (22 Arcana) Calculations."""

from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.destiny_matrix import DestinyMatrix
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService

BASIC_LINE_KEYS = ("destiny", "character", "purpose", "health")


def reduce_to_arcana(number: int) -> int:
    """
    Reduce a number to arcana range (1-22).

    If number is 0, return 22 (Fool arcana).
    If number > 22, sum digits until 1-22.
    """
    if number == 0:
        return 22

    while number > 22:
        number = sum(int(digit) for digit in str(number))
        if number == 0:
            return 22

    return number if number > 0 else 22


def calculate_basic_lines(day: int, month: int, year: int) -> Dict[str, int]:
    """Calculate base 4-line matrix values."""
    destiny = reduce_to_arcana(day + month)
    character = reduce_to_arcana(day + year)
    purpose = reduce_to_arcana(month + year)
    health = reduce_to_arcana(destiny + character + purpose)
    return {
        "destiny": destiny,
        "character": character,
        "purpose": purpose,
        "health": health,
    }


def calculate_extended_lines(lines_basic: Dict[str, int]) -> Dict[str, List[int]]:
    """Calculate deterministic v2 axes from basic lines."""
    destiny = lines_basic["destiny"]
    character = lines_basic["character"]
    purpose = lines_basic["purpose"]
    health = lines_basic["health"]

    line_of_heaven = [destiny, reduce_to_arcana(destiny + purpose), purpose]
    line_of_earth = [character, reduce_to_arcana(character + health), health]
    line_of_man = [destiny, reduce_to_arcana(destiny + character), character]
    line_of_woman = [purpose, reduce_to_arcana(purpose + health), health]

    return {
        "line_of_heaven": line_of_heaven,
        "line_of_earth": line_of_earth,
        "line_of_man": line_of_man,
        "line_of_woman": line_of_woman,
    }


def calculate_positions(lines_basic: Dict[str, int]) -> Dict[str, int]:
    """Calculate key v2 positions used in full page and hero preview."""
    destiny = lines_basic["destiny"]
    character = lines_basic["character"]
    purpose = lines_basic["purpose"]
    health = lines_basic["health"]

    core = reduce_to_arcana(destiny + character + purpose + health)
    soul = reduce_to_arcana(destiny + character)
    realization = reduce_to_arcana(purpose + health)
    talent = reduce_to_arcana(character + purpose)
    karmic = reduce_to_arcana(destiny + health)
    shadow = reduce_to_arcana(core + talent)

    return {
        "core": core,
        "soul": soul,
        "realization": realization,
        "talent": talent,
        "karmic": karmic,
        "shadow": shadow,
    }


def build_personalized_matrix(
    lines_basic: Dict[str, int],
    lines_extended: Dict[str, List[int]],
    positions: Dict[str, int],
) -> List[List[int]]:
    """Build deterministic personalized 4x4 matrix for v2."""
    values = [
        lines_basic["destiny"],
        positions["soul"],
        lines_basic["purpose"],
        positions["realization"],
        lines_basic["character"],
        positions["core"],
        lines_basic["health"],
        positions["talent"],
        lines_extended["line_of_man"][1],
        lines_extended["line_of_heaven"][1],
        lines_extended["line_of_woman"][1],
        lines_extended["line_of_earth"][1],
        positions["karmic"],
        positions["shadow"],
        reduce_to_arcana(lines_basic["destiny"] + lines_basic["purpose"]),
        reduce_to_arcana(lines_basic["character"] + lines_basic["health"]),
    ]

    matrix = []
    for row_idx in range(4):
        start = row_idx * 4
        matrix.append([reduce_to_arcana(v) for v in values[start : start + 4]])
    return matrix


def collect_active_arcana(
    lines_basic: Dict[str, int],
    lines_extended: Dict[str, List[int]],
    positions: Dict[str, int],
) -> List[int]:
    """Collect unique active arcana from all key v2 entities."""
    all_values: List[int] = list(lines_basic.values()) + list(positions.values())
    for line in lines_extended.values():
        all_values.extend(line)
    return sorted(set(reduce_to_arcana(v) for v in all_values))


def normalize_lines_payload(lines_payload: Any) -> Tuple[str, Dict[str, int], Dict[str, List[int]], Dict[str, int], Dict[str, Any]]:
    """Normalize stored lines payload for both legacy v1 and v2 records."""
    if isinstance(lines_payload, dict):
        if "basic" in lines_payload:
            lines_basic = lines_payload.get("basic", {})
            calculation_version = str(lines_payload.get("calculation_version", "v2"))
            lines_extended = lines_payload.get("extended") or calculate_extended_lines(lines_basic)
            positions = lines_payload.get("positions") or calculate_positions(lines_basic)
            layout_meta = lines_payload.get("layout_meta") or {}
            return calculation_version, lines_basic, lines_extended, positions, layout_meta

        if all(k in lines_payload for k in BASIC_LINE_KEYS):
            lines_basic = {
                "destiny": reduce_to_arcana(int(lines_payload["destiny"])),
                "character": reduce_to_arcana(int(lines_payload["character"])),
                "purpose": reduce_to_arcana(int(lines_payload["purpose"])),
                "health": reduce_to_arcana(int(lines_payload["health"])),
            }
            return (
                "v1",
                lines_basic,
                calculate_extended_lines(lines_basic),
                calculate_positions(lines_basic),
                {"shape": "4x4", "mode": "legacy-v1"},
            )

    raise ValueError("Invalid lines payload format in destiny matrix storage")


class DestinyMatrixService:
    """Service for destiny matrix calculations and interpretations."""

    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service

    def calculate_matrix(self, birth_date: str) -> Dict[str, Any]:
        """Calculate v2 destiny matrix from birth date."""
        try:
            date_parts = birth_date.split("-")
            year = int(date_parts[0])
            month = int(date_parts[1])
            day = int(date_parts[2])
        except (ValueError, IndexError):
            raise ValueError(f"Invalid birth date format: {birth_date}. Expected YYYY-MM-DD")

        lines_basic = calculate_basic_lines(day, month, year)
        lines_extended = calculate_extended_lines(lines_basic)
        positions = calculate_positions(lines_basic)
        matrix_data = build_personalized_matrix(lines_basic, lines_extended, positions)
        active_arcana = collect_active_arcana(lines_basic, lines_extended, positions)
        layout_meta = {
            "shape": "4x4",
            "mode": "deterministic-v2",
            "source": "basic+extended+positions",
        }

        return {
            "calculation_version": "v2",
            "birth_date": birth_date,
            "matrix_data": matrix_data,
            "lines_basic": lines_basic,
            "lines_extended": lines_extended,
            "positions": positions,
            "layout_meta": layout_meta,
            "active_arcana": active_arcana,
        }

    async def calculate_and_interpret(
        self,
        db: AsyncSession,
        birth_date: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Calculate destiny matrix, generate interpretation, and persist for user."""
        matrix_result = self.calculate_matrix(birth_date)
        interpretation = await self._generate_interpretation(
            db=db,
            birth_date=birth_date,
            lines_basic=matrix_result["lines_basic"],
            lines_extended=matrix_result["lines_extended"],
            positions=matrix_result["positions"],
            active_arcana=matrix_result["active_arcana"],
        )

        matrix_id = None
        if user_id:
            result = await db.execute(
                select(DestinyMatrix).where(DestinyMatrix.user_id == user_id)
            )
            existing = result.scalar_one_or_none()

            lines_payload = {
                "calculation_version": matrix_result["calculation_version"],
                "basic": matrix_result["lines_basic"],
                "extended": matrix_result["lines_extended"],
                "positions": matrix_result["positions"],
                "layout_meta": matrix_result["layout_meta"],
            }

            if existing:
                existing.birth_date = birth_date
                existing.matrix_data = matrix_result["matrix_data"]
                existing.lines = lines_payload
                existing.active_arcana = matrix_result["active_arcana"]
                existing.interpretation = interpretation
                matrix_id = str(existing.id)
            else:
                matrix = DestinyMatrix(
                    user_id=user_id,
                    birth_date=birth_date,
                    matrix_data=matrix_result["matrix_data"],
                    lines=lines_payload,
                    active_arcana=matrix_result["active_arcana"],
                    interpretation=interpretation,
                )
                db.add(matrix)
                await db.flush()
                matrix_id = str(matrix.id)

            await db.commit()

        return {
            **matrix_result,
            "interpretation": interpretation,
            "matrix_id": matrix_id,
        }

    async def _generate_interpretation(
        self,
        db: AsyncSession,
        birth_date: str,
        lines_basic: Dict[str, int],
        lines_extended: Dict[str, List[int]],
        positions: Dict[str, int],
        active_arcana: List[int],
    ) -> str:
        """Generate AI interpretation of destiny matrix."""
        rag_query = (
            "destiny matrix 22 arcana tarot interpretation "
            f"lines {lines_basic['destiny']} {lines_basic['character']} "
            f"{lines_basic['purpose']} {lines_basic['health']}"
        )
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="astrology",
        )

        prompt = self._build_interpretation_prompt(
            birth_date=birth_date,
            lines_basic=lines_basic,
            lines_extended=lines_extended,
            positions=positions,
            active_arcana=active_arcana,
        )

        return await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=1200,
            temperature=0.7,
        )

    def _build_interpretation_prompt(
        self,
        birth_date: str,
        lines_basic: Dict[str, int],
        lines_extended: Dict[str, List[int]],
        positions: Dict[str, int],
        active_arcana: List[int],
    ) -> str:
        """Build the prompt for AI interpretation."""
        prompt = "You are Mirastros, a mystical oracle and master of the Destiny Matrix (22 Arcana). "
        prompt += "Interpret this expanded v2 destiny matrix with wisdom, insight, and compassion.\n\n"
        prompt += f"Birth Date: {birth_date}\n\n"

        prompt += "Basic Lines:\n"
        prompt += f"- Destiny: Arcana {lines_basic['destiny']}\n"
        prompt += f"- Character: Arcana {lines_basic['character']}\n"
        prompt += f"- Purpose: Arcana {lines_basic['purpose']}\n"
        prompt += f"- Health: Arcana {lines_basic['health']}\n\n"

        prompt += "Extended Lines:\n"
        prompt += f"- Heaven: {' - '.join(map(str, lines_extended['line_of_heaven']))}\n"
        prompt += f"- Earth: {' - '.join(map(str, lines_extended['line_of_earth']))}\n"
        prompt += f"- Man: {' - '.join(map(str, lines_extended['line_of_man']))}\n"
        prompt += f"- Woman: {' - '.join(map(str, lines_extended['line_of_woman']))}\n\n"

        prompt += "Positions:\n"
        for key, value in positions.items():
            prompt += f"- {key}: Arcana {value}\n"
        prompt += "\n"

        prompt += f"Active Arcana: {', '.join(map(str, active_arcana))}\n\n"
        prompt += "Provide a practical yet mystical interpretation with strengths, challenges, and concrete guidance.\n\n"
        prompt += "Interpretation:"
        return prompt

    async def get_user_matrix(
        self,
        db: AsyncSession,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Get user's stored destiny matrix in normalized dual-format."""
        result = await db.execute(
            select(DestinyMatrix).where(DestinyMatrix.user_id == user_id)
        )
        matrix = result.scalar_one_or_none()
        if not matrix:
            return None

        calculation_version, lines_basic, lines_extended, positions, layout_meta = normalize_lines_payload(
            matrix.lines
        )

        return {
            "id": str(matrix.id),
            "birth_date": matrix.birth_date,
            "calculation_version": calculation_version,
            "matrix_data": matrix.matrix_data,
            "lines": lines_basic,
            "lines_basic": lines_basic,
            "lines_extended": lines_extended,
            "positions": positions,
            "layout_meta": layout_meta,
            "active_arcana": matrix.active_arcana,
            "interpretation": matrix.interpretation,
            "created_at": matrix.created_at.isoformat(),
            "updated_at": matrix.updated_at.isoformat(),
        }


destiny_matrix_service: Optional[DestinyMatrixService] = None


def get_destiny_matrix_service(
    llm_service: UnifiedLLMService,
    rag_service: RAGService,
) -> DestinyMatrixService:
    """Get or create destiny matrix service instance."""
    global destiny_matrix_service
    if destiny_matrix_service is None:
        destiny_matrix_service = DestinyMatrixService(llm_service, rag_service)
    return destiny_matrix_service
