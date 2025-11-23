"""Tarot Service - Tarot Card Readings"""

import random
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.data.tarot import get_all_cards, get_card_by_id
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.models.tarot_reading import TarotReading


class TarotService:
    """Service for performing tarot readings"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.cards = get_all_cards()
    
    async def perform_reading(
        self,
        db: AsyncSession,
        spread_type: str,
        question: Optional[str] = None,
        user_context: Optional[Dict] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Perform a tarot reading
        
        Args:
            db: Database session
            spread_type: Type of spread (one-card, three-card, five-card, celtic-cross)
            question: Optional question from user
            user_context: Optional user context (natal chart, etc.)
            user_id: Optional user ID to store reading history
        
        Returns:
            Reading result with cards and interpretation
        """
        # Validate spread type
        valid_spreads = ["one-card", "three-card", "five-card", "celtic-cross"]
        if spread_type not in valid_spreads:
            raise ValueError(f"Invalid spread type: {spread_type}. Must be one of {valid_spreads}")
        
        # Draw cards based on spread type
        drawn_cards = self._draw_cards(spread_type)
        
        # Generate AI interpretation
        interpretation = await self._generate_interpretation(
            db=db,
            spread_type=spread_type,
            drawn_cards=drawn_cards,
            question=question,
            user_context=user_context
        )
        
        # Store reading in database if user_id is provided
        if user_id:
            reading_record = TarotReading(
                user_id=user_id,
                spread_type=spread_type,
                question=question,
                cards=drawn_cards,
                interpretation=interpretation
            )
            db.add(reading_record)
            await db.commit()
        
        return {
            "spread_type": spread_type,
            "question": question,
            "cards": drawn_cards,
            "interpretation": interpretation,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _draw_cards(self, spread_type: str) -> List[Dict]:
        """Draw cards for the reading"""
        num_cards = {
            "one-card": 1,
            "three-card": 3,
            "five-card": 5,
            "celtic-cross": 10
        }[spread_type]
        
        # Randomly select cards (no duplicates)
        selected_cards = random.sample(self.cards, num_cards)
        
        # Randomly determine if each card is reversed
        drawn_cards = []
        for i, card in enumerate(selected_cards):
            is_reversed = random.choice([True, False])
            position = self._get_position_name(spread_type, i)
            
            drawn_cards.append({
                "id": card["id"],
                "name": card["name"],
                "suit": card["suit"],
                "number": card["number"],
                "keywords": card["keywords"],
                "position": position,
                "reversed": is_reversed,
                "interpretation": card["reversed"] if is_reversed else card["upright"]
            })
        
        return drawn_cards
    
    def _get_position_name(self, spread_type: str, index: int) -> str:
        """Get the name of the position in the spread"""
        positions = {
            "one-card": ["Present Situation"],
            "three-card": ["Past", "Present", "Future"],
            "five-card": ["Present Situation", "Challenge", "Past", "Future", "Outcome"],
            "celtic-cross": [
                "Present Situation",
                "Challenge/Crossing",
                "Distant Past/Foundation",
                "Recent Past",
                "Best Outcome",
                "Near Future",
                "Your Attitude",
                "External Influences",
                "Hopes and Fears",
                "Final Outcome"
            ]
        }
        return positions[spread_type][index]
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        spread_type: str,
        drawn_cards: List[Dict],
        question: Optional[str],
        user_context: Optional[Dict]
    ) -> str:
        """Generate AI interpretation of the reading"""
        
        # Build context from RAG
        rag_query = f"tarot reading interpretation {spread_type}"
        if question:
            rag_query += f" {question}"
        
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="tarot"
        )
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            spread_type=spread_type,
            drawn_cards=drawn_cards,
            question=question,
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
        spread_type: str,
        drawn_cards: List[Dict],
        question: Optional[str],
        user_context: Optional[Dict],
        rag_context: str
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a mystical oracle and master of the Tarot. "
        prompt += "Interpret this Tarot reading with wisdom, insight, and compassion.\n\n"
        
        if question:
            prompt += f"Question: {question}\n\n"
        
        prompt += f"Spread Type: {spread_type.replace('-', ' ').title()}\n\n"
        prompt += "Cards Drawn:\n"
        
        for card in drawn_cards:
            reversed_text = " (Reversed)" if card["reversed"] else ""
            prompt += f"- {card['position']}: {card['name']}{reversed_text}\n"
            prompt += f"  Suit: {card['suit'].title()}\n"
            prompt += f"  Keywords: {', '.join(card['keywords'])}\n"
            prompt += f"  Meaning: {card['interpretation']}\n\n"
        
        if user_context:
            if "zodiac_sign" in user_context:
                prompt += f"User's Zodiac Sign: {user_context['zodiac_sign']}\n"
            if "birth_date" in user_context:
                prompt += f"User's Birth Date: {user_context['birth_date']}\n"
            prompt += "\n"
        
        prompt += "Provide a comprehensive interpretation that:\n"
        prompt += "1. Explains the overall narrative and message of the reading\n"
        prompt += "2. Connects the cards to each other and their positions in the spread\n"
        prompt += "3. Addresses the question if one was asked\n"
        prompt += "4. Offers practical guidance and actionable advice\n"
        prompt += "5. Maintains a mystical yet grounded and compassionate tone\n"
        prompt += "6. Considers both upright and reversed meanings\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_all_cards(self) -> List[Dict]:
        """Get all Tarot cards"""
        return self.cards
    
    def get_card_by_id(self, card_id: int) -> Optional[Dict]:
        """Get a specific card by ID"""
        return get_card_by_id(card_id)
    
    def get_cards_by_suit(self, suit: str) -> List[Dict]:
        """Get all cards of a specific suit"""
        valid_suits = ["major", "wands", "cups", "swords", "pentacles"]
        if suit not in valid_suits:
            raise ValueError(f"Invalid suit: {suit}. Must be one of {valid_suits}")
        return [card for card in self.cards if card["suit"] == suit]
    
    async def get_reading_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """Get user's reading history"""
        result = await db.execute(
            select(TarotReading)
            .where(TarotReading.user_id == user_id)
            .order_by(TarotReading.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        readings = result.scalars().all()
        
        return [
            {
                "id": str(reading.id),
                "spread_type": reading.spread_type,
                "question": reading.question,
                "cards": reading.cards,
                "interpretation": reading.interpretation,
                "created_at": reading.created_at.isoformat()
            }
            for reading in readings
        ]
