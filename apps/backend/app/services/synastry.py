"""Synastry (compatibility) calculation service"""
from typing import Dict, Any, List, Tuple
from datetime import date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import math
import logging

from app.models.synastry import Synastry
from app.services.natal_chart import natal_chart_service

logger = logging.getLogger(__name__)


class SynastryService:
    """Service for calculating synastry (compatibility) between two people"""
    
    # Aspect definitions with orbs
    ASPECTS = {
        "conjunction": {"angle": 0, "orb": 8, "weight": 1.0, "nature": "neutral"},
        "sextile": {"angle": 60, "orb": 6, "weight": 0.8, "nature": "harmonious"},
        "square": {"angle": 90, "orb": 7, "weight": 0.9, "nature": "challenging"},
        "trine": {"angle": 120, "orb": 8, "weight": 1.0, "nature": "harmonious"},
        "opposition": {"angle": 180, "orb": 8, "weight": 0.9, "nature": "challenging"}
    }
    
    # Planet weights for compatibility calculation
    PLANET_WEIGHTS = {
        "sun": 1.0,      # Core identity
        "moon": 1.0,     # Emotions
        "venus": 0.9,    # Love and affection
        "mars": 0.8,     # Passion and drive
        "mercury": 0.7,  # Communication
        "jupiter": 0.6,  # Growth and expansion
        "saturn": 0.7,   # Commitment and structure
        "uranus": 0.4,   # Excitement and change
        "neptune": 0.4,  # Spirituality and dreams
        "pluto": 0.5     # Transformation
    }
    
    def calculate_synastry(
        self,
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any],
        relationship_type: str = "romantic"
    ) -> Dict[str, Any]:
        """
        Calculate synastry between two natal charts
        
        Args:
            person1_chart: First person's natal chart data
            person2_chart: Second person's natal chart data
            relationship_type: Type of relationship (romantic, friendship, business)
        
        Returns:
            Dictionary with synastry analysis
        """
        try:
            # Calculate inter-chart aspects
            aspects = self._calculate_inter_chart_aspects(
                person1_chart["planets"],
                person2_chart["planets"]
            )
            
            # Calculate compatibility scores
            compatibility = self._calculate_compatibility(
                aspects,
                person1_chart,
                person2_chart,
                relationship_type
            )
            
            # Identify strengths and challenges
            strengths = self._identify_strengths(aspects, person1_chart, person2_chart)
            challenges = self._identify_challenges(aspects, person1_chart, person2_chart)
            
            return {
                "aspects": aspects,
                "compatibility": compatibility,
                "strengths": strengths,
                "challenges": challenges
            }
            
        except Exception as e:
            logger.error(f"Error calculating synastry: {str(e)}")
            raise ValueError(f"Failed to calculate synastry: {str(e)}")
    
    def _calculate_inter_chart_aspects(
        self,
        person1_planets: Dict[str, Any],
        person2_planets: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Calculate aspects between planets in two charts"""
        aspects = []
        
        for p1_name, p1_data in person1_planets.items():
            for p2_name, p2_data in person2_planets.items():
                # Calculate angular distance
                angle_diff = abs(p1_data["degree"] - p2_data["degree"])
                
                # Normalize to 0-180 range
                if angle_diff > 180:
                    angle_diff = 360 - angle_diff
                
                # Check for aspects
                for aspect_name, aspect_data in self.ASPECTS.items():
                    target_angle = aspect_data["angle"]
                    orb = aspect_data["orb"]
                    
                    if abs(angle_diff - target_angle) <= orb:
                        orb_value = abs(angle_diff - target_angle)
                        
                        aspects.append({
                            "person1_planet": p1_name,
                            "person2_planet": p2_name,
                            "aspect_type": aspect_name,
                            "orb": orb_value,
                            "nature": aspect_data["nature"],
                            "weight": aspect_data["weight"],
                            "description": self._get_aspect_description(
                                p1_name, p2_name, aspect_name
                            )
                        })
        
        return aspects
    
    def _calculate_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any],
        relationship_type: str
    ) -> Dict[str, float]:
        """Calculate compatibility scores"""
        
        # Calculate overall compatibility from aspects
        harmonious_score = 0
        challenging_score = 0
        total_weight = 0
        
        for aspect in aspects:
            p1_planet = aspect["person1_planet"]
            p2_planet = aspect["person2_planet"]
            
            # Get planet weights
            weight = (
                self.PLANET_WEIGHTS.get(p1_planet, 0.5) +
                self.PLANET_WEIGHTS.get(p2_planet, 0.5)
            ) / 2
            
            # Apply aspect weight
            weight *= aspect["weight"]
            
            # Reduce weight based on orb (tighter orb = stronger aspect)
            orb_factor = 1 - (aspect["orb"] / 8)
            weight *= orb_factor
            
            if aspect["nature"] == "harmonious":
                harmonious_score += weight
            elif aspect["nature"] == "challenging":
                challenging_score += weight
            
            total_weight += weight
        
        # Calculate overall score (0-100)
        if total_weight > 0:
            overall_score = (harmonious_score / total_weight) * 100
            # Challenging aspects reduce score but not below 0
            overall_score = max(0, overall_score - (challenging_score / total_weight) * 30)
        else:
            overall_score = 50  # Neutral if no significant aspects
        
        # Calculate specific compatibility areas
        emotional = self._calculate_emotional_compatibility(aspects, person1_chart, person2_chart)
        intellectual = self._calculate_intellectual_compatibility(aspects, person1_chart, person2_chart)
        physical = self._calculate_physical_compatibility(aspects, person1_chart, person2_chart)
        spiritual = self._calculate_spiritual_compatibility(aspects, person1_chart, person2_chart)
        
        # Adjust based on relationship type
        if relationship_type == "romantic":
            # Romantic relationships weight emotional and physical more
            overall_score = (
                overall_score * 0.3 +
                emotional * 0.3 +
                physical * 0.25 +
                intellectual * 0.1 +
                spiritual * 0.05
            )
        elif relationship_type == "friendship":
            # Friendships weight emotional and intellectual more
            overall_score = (
                overall_score * 0.3 +
                emotional * 0.25 +
                intellectual * 0.3 +
                spiritual * 0.1 +
                physical * 0.05
            )
        elif relationship_type == "business":
            # Business relationships weight intellectual and practical more
            overall_score = (
                overall_score * 0.4 +
                intellectual * 0.35 +
                emotional * 0.15 +
                physical * 0.05 +
                spiritual * 0.05
            )
        
        return {
            "overall_score": round(overall_score, 1),
            "emotional_compatibility": round(emotional, 1),
            "intellectual_compatibility": round(intellectual, 1),
            "physical_compatibility": round(physical, 1),
            "spiritual_compatibility": round(spiritual, 1)
        }
    
    def _calculate_emotional_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> float:
        """Calculate emotional compatibility (Moon, Venus)"""
        emotional_planets = ["moon", "venus"]
        return self._calculate_area_compatibility(aspects, emotional_planets)
    
    def _calculate_intellectual_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> float:
        """Calculate intellectual compatibility (Mercury, Jupiter)"""
        intellectual_planets = ["mercury", "jupiter"]
        return self._calculate_area_compatibility(aspects, intellectual_planets)
    
    def _calculate_physical_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> float:
        """Calculate physical compatibility (Mars, Venus)"""
        physical_planets = ["mars", "venus"]
        return self._calculate_area_compatibility(aspects, physical_planets)
    
    def _calculate_spiritual_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> float:
        """Calculate spiritual compatibility (Neptune, Jupiter, Pluto)"""
        spiritual_planets = ["neptune", "jupiter", "pluto"]
        return self._calculate_area_compatibility(aspects, spiritual_planets)
    
    def _calculate_area_compatibility(
        self,
        aspects: List[Dict[str, Any]],
        relevant_planets: List[str]
    ) -> float:
        """Calculate compatibility for a specific area"""
        harmonious = 0
        challenging = 0
        total = 0
        
        for aspect in aspects:
            if (aspect["person1_planet"] in relevant_planets or
                aspect["person2_planet"] in relevant_planets):
                
                weight = aspect["weight"] * (1 - aspect["orb"] / 8)
                
                if aspect["nature"] == "harmonious":
                    harmonious += weight
                elif aspect["nature"] == "challenging":
                    challenging += weight
                
                total += weight
        
        if total > 0:
            score = (harmonious / total) * 100
            score = max(0, score - (challenging / total) * 30)
            return score
        
        return 50  # Neutral if no aspects
    
    def _identify_strengths(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> List[str]:
        """Identify relationship strengths based on harmonious aspects"""
        strengths = []
        
        # Look for strong harmonious aspects
        harmonious_aspects = [a for a in aspects if a["nature"] == "harmonious" and a["orb"] < 5]
        
        for aspect in harmonious_aspects:
            p1 = aspect["person1_planet"]
            p2 = aspect["person2_planet"]
            aspect_type = aspect["aspect_type"]
            
            if p1 == "sun" and p2 == "moon":
                strengths.append("Deep emotional understanding and mutual support")
            elif p1 == "venus" and p2 == "venus":
                strengths.append("Shared values and appreciation for beauty")
            elif p1 == "mars" and p2 == "mars":
                strengths.append("Aligned energy and drive towards common goals")
            elif p1 == "mercury" and p2 == "mercury":
                strengths.append("Excellent communication and mental connection")
            elif "moon" in [p1, p2] and "venus" in [p1, p2]:
                strengths.append("Emotional warmth and affection flow naturally")
            elif "sun" in [p1, p2] and "jupiter" in [p1, p2]:
                strengths.append("Mutual growth and optimism in the relationship")
        
        # Add general strengths if not enough specific ones
        if len(strengths) < 3:
            if len(harmonious_aspects) > 5:
                strengths.append("Strong overall harmony and ease in the relationship")
            if any(a["person1_planet"] == "venus" or a["person2_planet"] == "venus" for a in harmonious_aspects):
                strengths.append("Natural affection and appreciation for each other")
        
        return strengths[:5]  # Return top 5 strengths
    
    def _identify_challenges(
        self,
        aspects: List[Dict[str, Any]],
        person1_chart: Dict[str, Any],
        person2_chart: Dict[str, Any]
    ) -> List[str]:
        """Identify relationship challenges based on challenging aspects"""
        challenges = []
        
        # Look for strong challenging aspects
        challenging_aspects = [a for a in aspects if a["nature"] == "challenging" and a["orb"] < 5]
        
        for aspect in challenging_aspects:
            p1 = aspect["person1_planet"]
            p2 = aspect["person2_planet"]
            aspect_type = aspect["aspect_type"]
            
            if p1 == "sun" and p2 == "sun":
                challenges.append("Potential ego conflicts and power struggles")
            elif p1 == "mars" and p2 == "mars":
                challenges.append("Competing drives and potential for conflict")
            elif p1 == "saturn" and p2 == "sun":
                challenges.append("One partner may feel restricted or criticized")
            elif "moon" in [p1, p2] and "saturn" in [p1, p2]:
                challenges.append("Emotional coldness or difficulty expressing feelings")
            elif "venus" in [p1, p2] and "mars" in [p1, p2] and aspect_type == "square":
                challenges.append("Tension between affection and desire")
            elif "mercury" in [p1, p2] and "mercury" in [p1, p2]:
                challenges.append("Communication misunderstandings and different thinking styles")
        
        # Add general challenges if not enough specific ones
        if len(challenges) < 3:
            if len(challenging_aspects) > 5:
                challenges.append("Need to work through differences and find compromise")
            if any(a["person1_planet"] == "saturn" or a["person2_planet"] == "saturn" for a in challenging_aspects):
                challenges.append("Building trust and overcoming fears takes time")
        
        return challenges[:5]  # Return top 5 challenges
    
    def _get_aspect_description(
        self,
        planet1: str,
        planet2: str,
        aspect_type: str
    ) -> str:
        """Get human-readable description of aspect"""
        return f"{planet1.capitalize()} {aspect_type} {planet2.capitalize()}"
    
    async def save_synastry(
        self,
        db: AsyncSession,
        user_id: str,
        person1_name: str,
        person1_chart: Dict[str, Any],
        person2_name: str,
        person2_chart: Dict[str, Any],
        synastry_data: Dict[str, Any],
        relationship_type: str,
        interpretation: str = None,
        advice: str = None
    ) -> Synastry:
        """
        Save synastry analysis to database
        
        Args:
            db: Database session
            user_id: User UUID
            person1_name: First person's name
            person1_chart: First person's chart data
            person2_name: Second person's name
            person2_chart: Second person's chart data
            synastry_data: Synastry analysis data
            relationship_type: Type of relationship
            interpretation: AI interpretation
            advice: AI advice
        
        Returns:
            Synastry model instance
        """
        try:
            synastry = Synastry(
                user_id=user_id,
                person1_name=person1_name,
                person1_chart=person1_chart,
                person2_name=person2_name,
                person2_chart=person2_chart,
                aspects=synastry_data["aspects"],
                compatibility_score=synastry_data["compatibility"]["overall_score"],
                relationship_type=relationship_type,
                interpretation=interpretation,
                strengths=synastry_data["strengths"],
                challenges=synastry_data["challenges"],
                advice=advice
            )
            
            db.add(synastry)
            await db.commit()
            await db.refresh(synastry)
            return synastry
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving synastry: {str(e)}")
            raise
    
    async def get_synastry_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> Tuple[List[Synastry], int]:
        """
        Get synastry history for user
        
        Args:
            db: Database session
            user_id: User UUID
            limit: Maximum number of results
            offset: Offset for pagination
        
        Returns:
            Tuple of (list of synastries, total count)
        """
        # Get synastries
        result = await db.execute(
            select(Synastry)
            .where(Synastry.user_id == user_id)
            .order_by(desc(Synastry.calculated_at))
            .limit(limit)
            .offset(offset)
        )
        synastries = result.scalars().all()
        
        # Get total count
        count_result = await db.execute(
            select(Synastry)
            .where(Synastry.user_id == user_id)
        )
        total = len(count_result.scalars().all())
        
        return synastries, total
    
    def generate_interpretation_prompt(
        self,
        person1_name: str,
        person2_name: str,
        synastry_data: Dict[str, Any],
        relationship_type: str
    ) -> str:
        """
        Generate prompt for AI interpretation of synastry
        
        Args:
            person1_name: First person's name
            person2_name: Second person's name
            synastry_data: Synastry analysis data
            relationship_type: Type of relationship
        
        Returns:
            Formatted prompt for LLM
        """
        compatibility = synastry_data["compatibility"]
        aspects = synastry_data["aspects"]
        strengths = synastry_data["strengths"]
        challenges = synastry_data["challenges"]
        
        # Get key aspects
        key_aspects = [a for a in aspects if a["orb"] < 5][:10]
        aspects_text = "\n".join([
            f"- {a['description']}: {a['aspect_type']} (orb: {a['orb']:.1f}°, {a['nature']})"
            for a in key_aspects
        ])
        
        prompt = f"""Provide a comprehensive synastry (compatibility) analysis for {person1_name} and {person2_name} in a {relationship_type} relationship.

Compatibility Scores:
- Overall: {compatibility['overall_score']:.1f}%
- Emotional: {compatibility['emotional_compatibility']:.1f}%
- Intellectual: {compatibility['intellectual_compatibility']:.1f}%
- Physical: {compatibility['physical_compatibility']:.1f}%
- Spiritual: {compatibility['spiritual_compatibility']:.1f}%

Key Inter-Chart Aspects:
{aspects_text}

Identified Strengths:
{chr(10).join([f'- {s}' for s in strengths])}

Identified Challenges:
{chr(10).join([f'- {c}' for c in challenges])}

Please provide:
1. Overall Relationship Dynamic
2. Emotional Connection and Understanding
3. Communication and Intellectual Bond
4. Physical and Romantic Chemistry (if romantic relationship)
5. Growth Potential and Long-term Compatibility
6. Practical Advice for Navigating Challenges
7. How to Maximize Strengths

Keep the interpretation mystical, insightful, and constructive. Focus on growth opportunities and how both individuals can support each other's evolution."""

        return prompt


# Global service instance
synastry_service = SynastryService()
