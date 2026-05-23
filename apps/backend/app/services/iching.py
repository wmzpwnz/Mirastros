"""I Ching Service - Book of Changes Consultations"""

import random
from typing import List, Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.iching import get_all_hexagrams, get_hexagram_by_number, get_hexagram_by_binary
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.services.astro_context import merge_astro_context
from app.models.iching_consultation import IChingConsultation


class IChingService:
    """Service for I Ching consultations"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.hexagrams = get_all_hexagrams()
    
    async def perform_consultation(
        self,
        db: AsyncSession,
        question: str,
        method: str = "coin",
        user_id: Optional[str] = None,
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Perform an I Ching consultation
        
        Args:
            db: Database session
            question: Question from user
            method: Method of divination (coin or yarrow)
            user_id: User ID for saving consultation history
            user_context: Optional user context (natal chart, etc.)
        
        Returns:
            Consultation result with hexagrams and interpretation
        """
        # Validate method
        if method not in ["coin", "yarrow"]:
            raise ValueError(f"Invalid method: {method}. Use 'coin' or 'yarrow'")
        
        # Cast hexagram using chosen method
        primary_hexagram, changing_lines, resulting_hexagram = self._cast_hexagram(method)
        
        # Generate AI interpretation
        interpretation = await self._generate_interpretation(
            db=db,
            question=question,
            primary_hexagram=primary_hexagram,
            changing_lines=changing_lines,
            resulting_hexagram=resulting_hexagram,
            user_context=user_context,
            user_id=user_id
        )
        
        # Save consultation to database if user_id provided
        if user_id:
            consultation = IChingConsultation(
                user_id=user_id,
                question=question,
                method=method,
                primary_hexagram_number=primary_hexagram["number"],
                primary_hexagram_data=primary_hexagram,
                changing_lines=changing_lines if changing_lines else None,
                resulting_hexagram_number=resulting_hexagram["number"] if resulting_hexagram else None,
                resulting_hexagram_data=resulting_hexagram,
                interpretation=interpretation
            )
            db.add(consultation)
            await db.commit()
            await db.refresh(consultation)
        
        return {
            "question": question,
            "method": method,
            "primary_hexagram": primary_hexagram,
            "changing_lines": changing_lines,
            "resulting_hexagram": resulting_hexagram,
            "interpretation": interpretation,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _cast_hexagram(self, method: str) -> tuple:
        """
        Cast a hexagram using coin toss or yarrow stalk method
        
        Returns:
            Tuple of (primary_hexagram, changing_lines, resulting_hexagram)
        """
        if method == "coin":
            return self._coin_toss_method()
        else:
            return self._yarrow_stalk_method()
    
    def _coin_toss_method(self) -> tuple:
        """
        Simulate coin toss method (3 coins, 6 times)
        
        Each toss of 3 coins produces a line:
        - 3 heads (9): old yang (changing to yin)
        - 2 heads, 1 tail (8): young yin (stable)
        - 2 tails, 1 head (7): young yang (stable)
        - 3 tails (6): old yin (changing to yang)
        """
        lines = []
        changing_lines = []
        
        for i in range(6):
            # Toss 3 coins (heads=3, tails=2)
            toss = sum(random.choice([2, 3]) for _ in range(3))
            
            if toss == 9:  # Old yang (changing)
                lines.append(1)
                changing_lines.append(i + 1)
            elif toss == 8:  # Young yin (stable)
                lines.append(0)
            elif toss == 7:  # Young yang (stable)
                lines.append(1)
            elif toss == 6:  # Old yin (changing)
                lines.append(0)
                changing_lines.append(i + 1)
        
        # Build binary representation (bottom to top)
        primary_binary = ''.join(str(line) for line in reversed(lines))
        primary_hexagram = get_hexagram_by_binary(primary_binary)
        
        # If there are changing lines, create resulting hexagram
        resulting_hexagram = None
        if changing_lines:
            resulting_lines = lines.copy()
            for line_num in changing_lines:
                # Flip the line (0->1, 1->0)
                resulting_lines[line_num - 1] = 1 - resulting_lines[line_num - 1]
            
            resulting_binary = ''.join(str(line) for line in reversed(resulting_lines))
            resulting_hexagram = get_hexagram_by_binary(resulting_binary)
        
        return primary_hexagram, changing_lines, resulting_hexagram
    
    def _yarrow_stalk_method(self) -> tuple:
        """
        Simulate yarrow stalk method (more complex, traditional)
        
        For simplicity, we'll use a weighted random approach that
        approximates the yarrow stalk probabilities
        """
        lines = []
        changing_lines = []
        
        for i in range(6):
            # Yarrow stalk probabilities:
            # Old yang (9): 1/16
            # Young yang (7): 5/16
            # Young yin (8): 7/16
            # Old yin (6): 3/16
            
            rand = random.randint(1, 16)
            
            if rand == 1:  # Old yang (changing)
                lines.append(1)
                changing_lines.append(i + 1)
            elif rand <= 6:  # Young yang (stable)
                lines.append(1)
            elif rand <= 13:  # Young yin (stable)
                lines.append(0)
            else:  # Old yin (changing)
                lines.append(0)
                changing_lines.append(i + 1)
        
        # Build binary representation (bottom to top)
        primary_binary = ''.join(str(line) for line in reversed(lines))
        primary_hexagram = get_hexagram_by_binary(primary_binary)
        
        # If there are changing lines, create resulting hexagram
        resulting_hexagram = None
        if changing_lines:
            resulting_lines = lines.copy()
            for line_num in changing_lines:
                resulting_lines[line_num - 1] = 1 - resulting_lines[line_num - 1]
            
            resulting_binary = ''.join(str(line) for line in reversed(resulting_lines))
            resulting_hexagram = get_hexagram_by_binary(resulting_binary)
        
        return primary_hexagram, changing_lines, resulting_hexagram
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        question: str,
        primary_hexagram: Dict,
        changing_lines: List[int],
        resulting_hexagram: Optional[Dict],
        user_context: Optional[Dict],
        user_id: Optional[str] = None
    ) -> str:
        """Generate AI interpretation of the I Ching consultation"""
        
        # Build context from RAG
        rag_query = f"I Ching hexagram {primary_hexagram['number']} {primary_hexagram['name']} {question}"
        
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="iching"
        )
        
        # Merge with user's astro context if user_id is provided
        if user_id:
            rag_context = await merge_astro_context(db, user_id, rag_context)
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            question=question,
            primary_hexagram=primary_hexagram,
            changing_lines=changing_lines,
            resulting_hexagram=resulting_hexagram,
            user_context=user_context,
            rag_context=rag_context
        )
        
        # Generate interpretation
        interpretation = await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=1000,
            temperature=0.7
        )
        
        return interpretation
    
    def _build_interpretation_prompt(
        self,
        question: str,
        primary_hexagram: Dict,
        changing_lines: List[int],
        resulting_hexagram: Optional[Dict],
        user_context: Optional[Dict],
        rag_context: str
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a wise oracle versed in the ancient wisdom of the I Ching, the Book of Changes. "
        prompt += "Interpret this consultation with depth, clarity, and practical guidance.\n\n"
        
        prompt += f"Question: {question}\n\n"
        
        prompt += f"Primary Hexagram: #{primary_hexagram['number']} - {primary_hexagram['name']}\n"
        prompt += f"Chinese: {primary_hexagram['chinese']}\n"
        prompt += f"Trigrams: {primary_hexagram['trigrams']['upper']} above {primary_hexagram['trigrams']['lower']}\n\n"
        
        prompt += f"Judgment: {primary_hexagram['judgment']}\n"
        prompt += f"Image: {primary_hexagram['image']}\n"
        prompt += f"Meaning: {primary_hexagram['meaning']}\n"
        prompt += f"Traditional Advice: {primary_hexagram['advice']}\n\n"
        
        if changing_lines:
            prompt += f"Changing Lines: {', '.join(f'Line {line}' for line in changing_lines)}\n"
            prompt += "These changing lines indicate transformation and movement in the situation.\n\n"
        
        if resulting_hexagram:
            prompt += f"Resulting Hexagram: #{resulting_hexagram['number']} - {resulting_hexagram['name']}\n"
            prompt += f"Chinese: {resulting_hexagram['chinese']}\n"
            prompt += f"Meaning: {resulting_hexagram['meaning']}\n"
            prompt += f"Advice: {resulting_hexagram['advice']}\n\n"
            prompt += "The resulting hexagram shows where the situation is heading.\n\n"
        
        if user_context and "zodiac_sign" in user_context:
            prompt += f"User's Zodiac Sign: {user_context['zodiac_sign']}\n\n"
        
        prompt += "Provide a comprehensive interpretation that:\n"
        prompt += "1. Directly addresses the question asked\n"
        prompt += "2. Explains the meaning of the primary hexagram in this context\n"
        prompt += "3. If present, interprets the significance of changing lines\n"
        prompt += "4. If present, explains the resulting hexagram and the transformation\n"
        prompt += "5. Offers practical, actionable advice\n"
        prompt += "6. Provides timing guidance if relevant\n"
        prompt += "7. Maintains the wisdom and depth of traditional I Ching interpretation\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_all_hexagrams(self) -> List[Dict]:
        """Get all 64 I Ching hexagrams"""
        return self.hexagrams
    
    def get_hexagram_by_number(self, number: int) -> Optional[Dict]:
        """Get a specific hexagram by number"""
        return get_hexagram_by_number(number)
    
    async def get_consultation_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """
        Get user's I Ching consultation history
        
        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of consultations to return
            offset: Number of consultations to skip
        
        Returns:
            List of consultation records
        """
        from sqlalchemy import select, desc
        
        query = (
            select(IChingConsultation)
            .where(IChingConsultation.user_id == user_id)
            .order_by(desc(IChingConsultation.created_at))
            .limit(limit)
            .offset(offset)
        )
        
        result = await db.execute(query)
        consultations = result.scalars().all()
        
        return [
            {
                "id": str(consultation.id),
                "question": consultation.question,
                "method": consultation.method,
                "primary_hexagram": consultation.primary_hexagram_data,
                "changing_lines": consultation.changing_lines,
                "resulting_hexagram": consultation.resulting_hexagram_data,
                "interpretation": consultation.interpretation,
                "created_at": consultation.created_at.isoformat()
            }
            for consultation in consultations
        ]
