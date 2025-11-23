"""Crystals Service - Crystal Recommendations and Information"""

from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.crystals import (
    get_all_crystals,
    get_crystal_by_id,
    get_crystals_by_zodiac,
    get_crystals_by_property,
    get_crystals_by_chakra
)
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService


class CrystalsService:
    """Service for crystal recommendations and information"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.crystals = get_all_crystals()
    
    async def get_recommendations(
        self,
        db: AsyncSession,
        goal: Optional[str] = None,
        zodiac_sign: Optional[str] = None,
        chakra: Optional[str] = None,
        user_context: Optional[Dict] = None
    ) -> Dict:
        """
        Get crystal recommendations based on criteria
        
        Args:
            db: Database session
            goal: Specific goal (protection, love, wealth, etc.)
            zodiac_sign: User's zodiac sign
            chakra: Specific chakra to work with
            user_context: Additional user context
        
        Returns:
            Recommendations with crystals and AI interpretation
        """
        # Collect matching crystals
        recommended_crystals = []
        
        # Filter by zodiac sign
        if zodiac_sign:
            zodiac_crystals = get_crystals_by_zodiac(zodiac_sign)
            recommended_crystals.extend(zodiac_crystals)
        
        # Filter by goal/property
        if goal:
            property_crystals = get_crystals_by_property(goal)
            recommended_crystals.extend(property_crystals)
        
        # Filter by chakra
        if chakra:
            chakra_crystals = get_crystals_by_chakra(chakra)
            recommended_crystals.extend(chakra_crystals)
        
        # If no filters provided, return popular crystals
        if not recommended_crystals:
            # Return top 5 versatile crystals
            recommended_crystals = [
                get_crystal_by_id(3),  # Clear Quartz
                get_crystal_by_id(1),  # Amethyst
                get_crystal_by_id(2),  # Rose Quartz
                get_crystal_by_id(4),  # Black Tourmaline
                get_crystal_by_id(5),  # Citrine
            ]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_crystals = []
        for crystal in recommended_crystals:
            if crystal["id"] not in seen:
                seen.add(crystal["id"])
                unique_crystals.append(crystal)
        
        # Limit to top 5 recommendations
        top_recommendations = unique_crystals[:5]
        
        # Generate AI interpretation
        interpretation = await self._generate_interpretation(
            db=db,
            crystals=top_recommendations,
            goal=goal,
            zodiac_sign=zodiac_sign,
            chakra=chakra,
            user_context=user_context
        )
        
        return {
            "recommendations": top_recommendations,
            "interpretation": interpretation,
            "total": len(top_recommendations)
        }
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        crystals: List[Dict],
        goal: Optional[str],
        zodiac_sign: Optional[str],
        chakra: Optional[str],
        user_context: Optional[Dict]
    ) -> str:
        """Generate AI interpretation of crystal recommendations"""
        
        # Build context from RAG
        rag_query = "crystal healing properties recommendations"
        if goal:
            rag_query += f" {goal}"
        if zodiac_sign:
            rag_query += f" {zodiac_sign}"
        
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="crystals"
        )
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            crystals=crystals,
            goal=goal,
            zodiac_sign=zodiac_sign,
            chakra=chakra,
            user_context=user_context,
            rag_context=rag_context
        )
        
        # Generate interpretation
        interpretation = await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=600,
            temperature=0.7
        )
        
        return interpretation
    
    def _build_interpretation_prompt(
        self,
        crystals: List[Dict],
        goal: Optional[str],
        zodiac_sign: Optional[str],
        chakra: Optional[str],
        user_context: Optional[Dict],
        rag_context: str
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a mystical oracle with deep knowledge of crystal healing and energy work. "
        prompt += "Provide personalized crystal recommendations with wisdom and insight.\n\n"
        
        if zodiac_sign:
            prompt += f"User's Zodiac Sign: {zodiac_sign}\n"
        
        if goal:
            prompt += f"User's Goal: {goal}\n"
        
        if chakra:
            prompt += f"Chakra Focus: {chakra}\n"
        
        prompt += "\nRecommended Crystals:\n"
        
        for i, crystal in enumerate(crystals, 1):
            prompt += f"\n{i}. {crystal['name']} ({crystal['color']})\n"
            prompt += f"   Chakra: {crystal['chakra']}\n"
            prompt += f"   Properties: {', '.join(crystal['properties'])}\n"
            prompt += f"   Element: {crystal['element']}\n"
            prompt += f"   Planet: {crystal['planet']}\n"
            prompt += f"   Description: {crystal['description']}\n"
            prompt += f"   Uses: {crystal['uses']}\n"
        
        prompt += "\nProvide a personalized interpretation that:\n"
        prompt += "1. Explains why these crystals are perfect for the user\n"
        prompt += "2. Describes how to use them together or separately\n"
        prompt += "3. Offers specific guidance for achieving their goal\n"
        prompt += "4. Includes practical tips for working with these crystals\n"
        prompt += "5. Maintains a mystical yet practical tone\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def get_all_crystals(self) -> List[Dict]:
        """Get all crystals from database"""
        return self.crystals
    
    def get_crystal_by_id(self, crystal_id: int) -> Optional[Dict]:
        """Get a specific crystal by ID"""
        return get_crystal_by_id(crystal_id)
    
    def get_crystals_by_zodiac(self, zodiac_sign: str) -> List[Dict]:
        """Get crystals for a specific zodiac sign"""
        return get_crystals_by_zodiac(zodiac_sign)
    
    def get_crystals_by_property(self, property_name: str) -> List[Dict]:
        """Get crystals with a specific property"""
        return get_crystals_by_property(property_name)
    
    def get_crystals_by_chakra(self, chakra: str) -> List[Dict]:
        """Get crystals for a specific chakra"""
        return get_crystals_by_chakra(chakra)
