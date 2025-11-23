"""Numerology Service - Numerology Calculations and Interpretations"""

from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.data.numerology import (
    calculate_life_path_number,
    calculate_destiny_number,
    calculate_soul_urge_number,
    calculate_personality_number,
    get_number_meaning,
    get_all_number_meanings
)
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.models.numerology_calculation import NumerologyCalculation


class NumerologyService:
    """Service for numerology calculations and interpretations"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
    
    async def calculate_numerology(
        self,
        db: AsyncSession,
        full_name: str,
        birth_date: str,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Calculate numerology numbers and generate interpretation
        
        Args:
            db: Database session
            full_name: Full name (first, middle, last)
            birth_date: Birth date in YYYY-MM-DD format
            user_id: Optional user ID to store calculation
        
        Returns:
            Calculation result with numbers and interpretation
        """
        # Calculate all numerology numbers
        life_path = calculate_life_path_number(birth_date)
        destiny = calculate_destiny_number(full_name)
        soul_urge = calculate_soul_urge_number(full_name)
        personality = calculate_personality_number(full_name)
        
        numbers = {
            "life_path_number": life_path,
            "destiny_number": destiny,
            "soul_urge_number": soul_urge,
            "personality_number": personality
        }
        
        # Generate AI interpretation
        interpretation = await self._generate_interpretation(
            db=db,
            full_name=full_name,
            birth_date=birth_date,
            numbers=numbers
        )
        
        # Store calculation in database if user_id is provided
        if user_id:
            # Check if user already has a calculation
            result = await db.execute(
                select(NumerologyCalculation)
                .where(NumerologyCalculation.user_id == user_id)
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                # Update existing calculation
                existing.full_name = full_name
                existing.birth_date = birth_date
                existing.life_path_number = life_path
                existing.destiny_number = destiny
                existing.soul_urge_number = soul_urge
                existing.personality_number = personality
                existing.interpretation = interpretation
                existing.updated_at = datetime.utcnow()
            else:
                # Create new calculation
                calculation = NumerologyCalculation(
                    user_id=user_id,
                    full_name=full_name,
                    birth_date=birth_date,
                    life_path_number=life_path,
                    destiny_number=destiny,
                    soul_urge_number=soul_urge,
                    personality_number=personality,
                    interpretation=interpretation
                )
                db.add(calculation)
            
            await db.commit()
        
        return {
            "full_name": full_name,
            "birth_date": birth_date,
            "numbers": numbers,
            "interpretation": interpretation,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        full_name: str,
        birth_date: str,
        numbers: Dict[str, int]
    ) -> str:
        """Generate AI interpretation of numerology numbers"""
        
        # Build context from RAG
        rag_query = f"numerology interpretation life path {numbers['life_path_number']} destiny {numbers['destiny_number']}"
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="numerology"
        )
        
        # Get meanings for all numbers
        life_path_meaning = get_number_meaning(numbers["life_path_number"])
        destiny_meaning = get_number_meaning(numbers["destiny_number"])
        soul_urge_meaning = get_number_meaning(numbers["soul_urge_number"])
        personality_meaning = get_number_meaning(numbers["personality_number"])
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            full_name=full_name,
            birth_date=birth_date,
            numbers=numbers,
            life_path_meaning=life_path_meaning,
            destiny_meaning=destiny_meaning,
            soul_urge_meaning=soul_urge_meaning,
            personality_meaning=personality_meaning
        )
        
        # Generate interpretation
        interpretation = await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=1200,
            temperature=0.7
        )
        
        return interpretation
    
    def _build_interpretation_prompt(
        self,
        full_name: str,
        birth_date: str,
        numbers: Dict[str, int],
        life_path_meaning: Dict,
        destiny_meaning: Dict,
        soul_urge_meaning: Dict,
        personality_meaning: Dict
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a mystical oracle and master of Numerology. "
        prompt += "Interpret this numerology calculation with wisdom, insight, and compassion.\n\n"
        
        prompt += f"Name: {full_name}\n"
        prompt += f"Birth Date: {birth_date}\n\n"
        
        prompt += "Numerology Numbers:\n\n"
        
        # Life Path Number
        prompt += f"Life Path Number: {numbers['life_path_number']} - {life_path_meaning['name']}\n"
        prompt += f"Keywords: {', '.join(life_path_meaning['keywords'])}\n"
        prompt += f"Meaning: {life_path_meaning['life_path']}\n\n"
        
        # Destiny Number
        prompt += f"Destiny Number: {numbers['destiny_number']} - {destiny_meaning['name']}\n"
        prompt += f"Keywords: {', '.join(destiny_meaning['keywords'])}\n"
        prompt += f"Description: {destiny_meaning['description']}\n\n"
        
        # Soul Urge Number
        prompt += f"Soul Urge Number: {numbers['soul_urge_number']} - {soul_urge_meaning['name']}\n"
        prompt += f"Keywords: {', '.join(soul_urge_meaning['keywords'])}\n"
        prompt += f"Description: {soul_urge_meaning['description']}\n\n"
        
        # Personality Number
        prompt += f"Personality Number: {numbers['personality_number']} - {personality_meaning['name']}\n"
        prompt += f"Keywords: {', '.join(personality_meaning['keywords'])}\n"
        prompt += f"Description: {personality_meaning['description']}\n\n"
        
        prompt += "Provide a comprehensive numerology interpretation that:\n"
        prompt += "1. Explains the significance of each number in the person's life\n"
        prompt += "2. Shows how the Life Path Number reveals their life purpose and journey\n"
        prompt += "3. Explains how the Destiny Number shows their life mission and potential\n"
        prompt += "4. Describes how the Soul Urge Number reveals their inner desires and motivations\n"
        prompt += "5. Explains how the Personality Number shows how others perceive them\n"
        prompt += "6. Connects the numbers to create a holistic picture of the person\n"
        prompt += "7. Offers practical guidance for living in alignment with their numbers\n"
        prompt += "8. Maintains a mystical yet grounded and compassionate tone\n"
        prompt += "9. Highlights both strengths and challenges associated with each number\n"
        prompt += "10. Provides actionable advice for personal growth and fulfillment\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_number_meaning(self, number: int) -> Dict:
        """Get the meaning of a specific numerology number"""
        if number not in [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]:
            raise ValueError(f"Invalid numerology number: {number}. Must be 1-9, 11, 22, or 33")
        return get_number_meaning(number)
    
    def get_all_number_meanings(self) -> Dict[int, Dict]:
        """Get meanings for all numerology numbers"""
        return get_all_number_meanings()
    
    async def get_user_numerology(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Optional[Dict]:
        """Get user's stored numerology calculation"""
        result = await db.execute(
            select(NumerologyCalculation)
            .where(NumerologyCalculation.user_id == user_id)
        )
        calculation = result.scalar_one_or_none()
        
        if not calculation:
            return None
        
        return {
            "id": str(calculation.id),
            "full_name": calculation.full_name,
            "birth_date": calculation.birth_date,
            "numbers": {
                "life_path_number": calculation.life_path_number,
                "destiny_number": calculation.destiny_number,
                "soul_urge_number": calculation.soul_urge_number,
                "personality_number": calculation.personality_number
            },
            "interpretation": calculation.interpretation,
            "created_at": calculation.created_at.isoformat(),
            "updated_at": calculation.updated_at.isoformat()
        }
    
    async def get_calculation_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> list[Dict]:
        """Get user's numerology calculation history"""
        result = await db.execute(
            select(NumerologyCalculation)
            .where(NumerologyCalculation.user_id == user_id)
            .order_by(NumerologyCalculation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        calculations = result.scalars().all()
        
        return [
            {
                "id": str(calc.id),
                "full_name": calc.full_name,
                "birth_date": calc.birth_date,
                "numbers": {
                    "life_path_number": calc.life_path_number,
                    "destiny_number": calc.destiny_number,
                    "soul_urge_number": calc.soul_urge_number,
                    "personality_number": calc.personality_number
                },
                "interpretation": calc.interpretation,
                "created_at": calc.created_at.isoformat()
            }
            for calc in calculations
        ]
