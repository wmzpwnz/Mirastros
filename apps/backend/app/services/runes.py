"""Runes Service - Elder Futhark Readings"""

import random
from typing import List, Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.runes import get_all_runes, get_rune_by_id
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService


class RunesService:
    """Service for performing runic readings"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.runes = get_all_runes()
    
    async def perform_reading(
        self,
        db: AsyncSession,
        spread_type: str,
        question: Optional[str] = None,
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Perform a runic reading
        
        Args:
            db: Database session
            spread_type: Type of spread (one-rune, three-rune, cross)
            question: Optional question from user
            user_context: Optional user context (natal chart, etc.)
        
        Returns:
            Reading result with runes and interpretation
        """
        # Validate spread type
        if spread_type not in ["one-rune", "three-rune", "cross"]:
            raise ValueError(f"Invalid spread type: {spread_type}")
        
        # Draw runes based on spread type
        drawn_runes = self._draw_runes(spread_type)
        
        # Generate AI interpretation
        interpretation = await self._generate_interpretation(
            db=db,
            spread_type=spread_type,
            drawn_runes=drawn_runes,
            question=question,
            user_context=user_context
        )
        
        return {
            "spread_type": spread_type,
            "question": question,
            "runes": drawn_runes,
            "interpretation": interpretation,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _draw_runes(self, spread_type: str) -> List[Dict]:
        """Draw runes for the reading"""
        num_runes = {
            "one-rune": 1,
            "three-rune": 3,
            "cross": 5
        }[spread_type]
        
        # Randomly select runes
        selected_runes = random.sample(self.runes, num_runes)
        
        # Randomly determine if each rune is reversed
        drawn_runes = []
        for i, rune in enumerate(selected_runes):
            is_reversed = random.choice([True, False])
            position = self._get_position_name(spread_type, i)
            
            drawn_runes.append({
                "id": rune["id"],
                "name": rune["name"],
                "symbol": rune["symbol"],
                "meaning": rune["meaning"],
                "keywords": rune["keywords"],
                "position": position,
                "reversed": is_reversed,
                "interpretation": rune["reversed"] if is_reversed else rune["upright"]
            })
        
        return drawn_runes
    
    def _get_position_name(self, spread_type: str, index: int) -> str:
        """Get the name of the position in the spread"""
        positions = {
            "one-rune": ["Present Situation"],
            "three-rune": ["Past", "Present", "Future"],
            "cross": ["Center (Core Issue)", "Above (Goal)", "Below (Foundation)", 
                     "Left (Past)", "Right (Future)"]
        }
        return positions[spread_type][index]
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        spread_type: str,
        drawn_runes: List[Dict],
        question: Optional[str],
        user_context: Optional[Dict]
    ) -> str:
        """Generate AI interpretation of the reading"""
        
        # Build context from RAG
        rag_query = f"runic reading interpretation {spread_type}"
        if question:
            rag_query += f" {question}"
        
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="runes"
        )
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            spread_type=spread_type,
            drawn_runes=drawn_runes,
            question=question,
            user_context=user_context,
            rag_context=rag_context
        )
        
        # Generate interpretation
        interpretation = await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=800,
            temperature=0.7
        )
        
        return interpretation
    
    def _build_interpretation_prompt(
        self,
        spread_type: str,
        drawn_runes: List[Dict],
        question: Optional[str],
        user_context: Optional[Dict],
        rag_context: str
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a mystical oracle skilled in the ancient art of runic divination. "
        prompt += "Interpret this Elder Futhark rune reading with wisdom and insight.\n\n"
        
        if question:
            prompt += f"Question: {question}\n\n"
        
        prompt += f"Spread Type: {spread_type.replace('-', ' ').title()}\n\n"
        prompt += "Runes Drawn:\n"
        
        for rune in drawn_runes:
            reversed_text = " (Reversed)" if rune["reversed"] else ""
            prompt += f"- {rune['position']}: {rune['name']} {rune['symbol']}{reversed_text}\n"
            prompt += f"  Meaning: {rune['meaning']}\n"
            prompt += f"  Keywords: {', '.join(rune['keywords'])}\n"
            prompt += f"  Interpretation: {rune['interpretation']}\n\n"
        
        if user_context and "zodiac_sign" in user_context:
            prompt += f"User's Zodiac Sign: {user_context['zodiac_sign']}\n\n"
        
        prompt += "Provide a comprehensive interpretation that:\n"
        prompt += "1. Explains the overall message of the reading\n"
        prompt += "2. Connects the runes to each other and their positions\n"
        prompt += "3. Addresses the question if one was asked\n"
        prompt += "4. Offers practical guidance and wisdom\n"
        prompt += "5. Maintains a mystical yet grounded tone\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_all_runes(self) -> List[Dict]:
        """Get all Elder Futhark runes"""
        return self.runes
    
    def get_rune_by_id(self, rune_id: int) -> Optional[Dict]:
        """Get a specific rune by ID"""
        return get_rune_by_id(rune_id)
