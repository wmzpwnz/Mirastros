"""Karmic Tasks Service"""

from datetime import datetime, date
from typing import Dict, Any, List
from kerykeion import AstrologicalSubject
from app.services.llm import llm_service


class KarmicService:
    """Service for karmic analysis based on Lunar Nodes"""
    
    def __init__(self):
        self.llm = llm_service
    
    def _get_node_meaning(self, node_sign: str, is_north: bool) -> str:
        """Get meaning of node in sign"""
        node_meanings = {
            "Aries": "independence and courage" if is_north else "cooperation and diplomacy",
            "Taurus": "stability and self-worth" if is_north else "transformation and letting go",
            "Gemini": "communication and learning" if is_north else "intuition and wisdom",
            "Cancer": "emotional security and nurturing" if is_north else "responsibility and structure",
            "Leo": "self-expression and creativity" if is_north else "collaboration and equality",
            "Virgo": "service and practicality" if is_north else "faith and surrender",
            "Libra": "relationships and balance" if is_north else "self-reliance and courage",
            "Scorpio": "transformation and depth" if is_north else "simplicity and stability",
            "Sagittarius": "wisdom and expansion" if is_north else "details and communication",
            "Capricorn": "achievement and responsibility" if is_north else "emotional connection and family",
            "Aquarius": "innovation and community" if is_north else "personal creativity and self-expression",
            "Pisces": "spirituality and compassion" if is_north else "order and analysis"
        }
        return node_meanings.get(node_sign, "growth and evolution")
    
    async def analyze_karmic_path(
        self,
        birth_date: date,
        birth_time: str,
        birth_city: str,
        birth_country: str
    ) -> Dict[str, Any]:
        """
        Analyze karmic path based on Lunar Nodes
        
        Args:
            birth_date: User's birth date
            birth_time: Birth time in HH:MM format
            birth_city: Birth city
            birth_country: Birth country code
            
        Returns:
            Dictionary with karmic analysis
        """
        # Parse birth time
        hour, minute = map(int, birth_time.split(":"))
        
        # Calculate natal chart
        chart = AstrologicalSubject(
            name="Karmic Analysis",
            year=birth_date.year,
            month=birth_date.month,
            day=birth_date.day,
            hour=hour,
            minute=minute,
            city=birth_city,
            nation=birth_country
        )
        
        # Extract Lunar Nodes
        north_node = {
            "sign": chart.lunar_node["sign"],
            "position": chart.lunar_node["position"],
            "house": 1  # Simplified
        }
        
        # South Node is always opposite North Node
        south_node_signs = {
            "Aries": "Libra", "Taurus": "Scorpio", "Gemini": "Sagittarius",
            "Cancer": "Capricorn", "Leo": "Aquarius", "Virgo": "Pisces",
            "Libra": "Aries", "Scorpio": "Taurus", "Sagittarius": "Gemini",
            "Capricorn": "Cancer", "Aquarius": "Leo", "Pisces": "Virgo"
        }
        
        south_node = {
            "sign": south_node_signs.get(north_node["sign"], "Unknown"),
            "position": (north_node["position"] + 180) % 360,
            "house": 7  # Simplified
        }
        
        # Generate life purpose
        north_meaning = self._get_node_meaning(north_node["sign"], True)
        south_meaning = self._get_node_meaning(south_node["sign"], False)
        
        life_purpose = f"Your soul's purpose is to develop {north_meaning}, moving away from {south_meaning}"
        
        # Generate karmic lessons
        karmic_lessons = [
            {
                "area": "Past Life Patterns",
                "lesson": f"You come from lifetimes focused on {south_meaning}",
                "challenge": "Letting go of old comfortable patterns",
                "growth_path": f"Embrace {north_meaning} even when uncomfortable"
            },
            {
                "area": "Soul Evolution",
                "lesson": f"Your soul seeks to master {north_meaning}",
                "challenge": "Stepping into unfamiliar territory",
                "growth_path": "Trust the journey towards your North Node"
            },
            {
                "area": "Life Purpose",
                "lesson": "Balance past wisdom with future growth",
                "challenge": "Not falling back into South Node comfort",
                "growth_path": "Use South Node skills to achieve North Node goals"
            }
        ]
        
        # Generate AI interpretation
        prompt = f"""You are an expert karmic astrologer. Analyze this person's soul journey:

Birth Date: {birth_date}
North Node in {north_node['sign']}: Path of growth - {north_meaning}
South Node in {south_node['sign']}: Past life patterns - {south_meaning}

Provide:
1. Deep interpretation of their karmic path
2. Specific soul lessons they need to learn
3. How past life patterns affect current life
4. Practical steps for soul evolution
5. Their ultimate soul mission

Keep the response profound, compassionate, and transformative."""

        interpretation = await self.llm.generate(prompt)
        
        # Generate soul mission
        soul_mission = f"To evolve from {south_node['sign']} patterns into {north_node['sign']} mastery, bringing {north_meaning} to the world"
        
        # Generate recommendations
        recommendations = [
            f"Practice {north_meaning} daily",
            f"Notice when you fall into {south_meaning} patterns",
            "Meditate on your soul's purpose",
            "Journal about your karmic lessons",
            "Seek experiences that develop your North Node qualities"
        ]
        
        return {
            "birth_date": birth_date.isoformat(),
            "north_node": north_node,
            "south_node": south_node,
            "life_purpose": life_purpose,
            "karmic_lessons": karmic_lessons,
            "soul_mission": soul_mission,
            "recommendations": recommendations,
            "interpretation": interpretation,
            "timestamp": datetime.now().isoformat()
        }


# Singleton instance
karmic_service = KarmicService()
