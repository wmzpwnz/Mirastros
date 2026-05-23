"""Lenormand Service - Card Readings"""

import random
from typing import List, Dict, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.lenormand import get_all_lenormand_cards, get_card_by_id
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.models.lenormand_reading import LenormandReading


class LenormandService:
    """Service for performing Lenormand card readings"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.cards = get_all_lenormand_cards()
    
    async def perform_reading(
        self,
        db: AsyncSession,
        spread_type: str,
        question: Optional[str] = None,
        user_context: Optional[Dict] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Perform a Lenormand card reading
        
        Args:
            db: Database session
            spread_type: Type of spread (three-card, five-card, nine-card)
            question: Optional question from user
            user_context: Optional user context (natal chart, etc.)
            user_id: Optional user ID to save reading to database
        
        Returns:
            Reading result with cards and interpretation
        """
        # Validate spread type
        if spread_type not in ["three-card", "five-card", "nine-card"]:
            raise ValueError(f"Invalid spread type: {spread_type}")
        
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
        
        # Save reading to database if user_id provided
        if user_id:
            reading_record = LenormandReading(
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
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _draw_cards(self, spread_type: str) -> List[Dict]:
        """Draw cards for the reading"""
        num_cards = {
            "three-card": 3,
            "five-card": 5,
            "nine-card": 9
        }[spread_type]
        
        # Randomly select cards (no duplicates)
        selected_cards = random.sample(self.cards, num_cards)
        
        # Build drawn cards with positions
        drawn_cards = []
        for i, card in enumerate(selected_cards):
            position = self._get_position_name(spread_type, i)
            
            drawn_cards.append({
                "id": card["id"],
                "name": card["name"],
                "number": card["number"],
                "keywords": card["keywords"],
                "meaning": card["meaning"],
                "position": position,
                "position_index": i
            })
        
        return drawn_cards
    
    def _get_position_name(self, spread_type: str, index: int) -> str:
        """Get the name of the position in the spread"""
        positions = {
            "three-card": [
                "Past/Situation",
                "Present/Challenge", 
                "Future/Outcome"
            ],
            "five-card": [
                "Past",
                "Present",
                "Hidden Influences",
                "Advice",
                "Outcome"
            ],
            "nine-card": [
                "Past Foundation",
                "Recent Past",
                "Present Situation",
                "Near Future",
                "Future Outcome",
                "Inner Self",
                "External Influences",
                "Hopes/Fears",
                "Final Result"
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
        rag_query = f"lenormand card reading interpretation {spread_type}"
        if question:
            rag_query += f" {question}"
        
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="lenormand"
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
        
        prompt = "You are Mirastros, a mystical oracle skilled in the art of Lenormand card reading. "
        prompt += "Lenormand cards provide concrete, practical answers and focus on everyday life situations. "
        prompt += "Interpret this reading with clarity and practical wisdom.\n\n"
        
        if question:
            prompt += f"Question: {question}\n\n"
        
        prompt += f"Spread Type: {spread_type.replace('-', ' ').title()}\n\n"
        prompt += "Cards Drawn:\n"
        
        for card in drawn_cards:
            prompt += f"- {card['position']}: {card['name']} (#{card['number']})\n"
            prompt += f"  Keywords: {', '.join(card['keywords'])}\n"
            prompt += f"  Meaning: {card['meaning']}\n\n"
        
        # Add combination analysis for multi-card spreads
        if len(drawn_cards) >= 2:
            prompt += "Card Combinations:\n"
            for i in range(len(drawn_cards) - 1):
                card1 = drawn_cards[i]
                card2 = drawn_cards[i + 1]
                prompt += f"- {card1['name']} + {card2['name']}: "
                prompt += "These cards together create a specific meaning based on their combination.\n"
            prompt += "\n"
        
        if user_context and "zodiac_sign" in user_context:
            prompt += f"User's Zodiac Sign: {user_context['zodiac_sign']}\n\n"
        
        prompt += "Provide a comprehensive interpretation that:\n"
        prompt += "1. Gives concrete, practical answers (Lenormand is known for being direct)\n"
        prompt += "2. Analyzes card combinations and their specific meanings\n"
        prompt += "3. Addresses the question with clear, actionable guidance\n"
        prompt += "4. Focuses on everyday life situations and practical matters\n"
        prompt += "5. Provides timing indicators if relevant\n"
        prompt += "6. Maintains a mystical yet grounded and practical tone\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_all_cards(self) -> List[Dict]:
        """Get all 36 Lenormand cards"""
        return self.cards
    
    def get_card_by_id(self, card_id: int) -> Optional[Dict]:
        """Get a specific card by ID"""
        return get_card_by_id(card_id)
