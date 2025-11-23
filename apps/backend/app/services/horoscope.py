"""Horoscope generation service with AI and transit integration"""
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
from kerykeion import AstrologicalSubject
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.horoscope import Horoscope, HoroscopePeriod
from app.models.natal_chart import NatalChart
from app.models.user import User
import logging
import random

logger = logging.getLogger(__name__)


class HoroscopeService:
    """Service for generating horoscopes with AI and transit integration"""
    
    def __init__(self):
        self.zodiac_signs = [
            "aries", "taurus", "gemini", "cancer",
            "leo", "virgo", "libra", "scorpio",
            "sagittarius", "capricorn", "aquarius", "pisces"
        ]
        
        # Zodiac sign date ranges (approximate)
        self.sign_dates = {
            "aries": (3, 21, 4, 19),
            "taurus": (4, 20, 5, 20),
            "gemini": (5, 21, 6, 20),
            "cancer": (6, 21, 7, 22),
            "leo": (7, 23, 8, 22),
            "virgo": (8, 23, 9, 22),
            "libra": (9, 23, 10, 22),
            "scorpio": (10, 23, 11, 21),
            "sagittarius": (11, 22, 12, 21),
            "capricorn": (12, 22, 1, 19),
            "aquarius": (1, 20, 2, 18),
            "pisces": (2, 19, 3, 20)
        }
        
        # Element and modality for each sign
        self.sign_properties = {
            "aries": {"element": "fire", "modality": "cardinal", "ruler": "Mars"},
            "taurus": {"element": "earth", "modality": "fixed", "ruler": "Venus"},
            "gemini": {"element": "air", "modality": "mutable", "ruler": "Mercury"},
            "cancer": {"element": "water", "modality": "cardinal", "ruler": "Moon"},
            "leo": {"element": "fire", "modality": "fixed", "ruler": "Sun"},
            "virgo": {"element": "earth", "modality": "mutable", "ruler": "Mercury"},
            "libra": {"element": "air", "modality": "cardinal", "ruler": "Venus"},
            "scorpio": {"element": "water", "modality": "fixed", "ruler": "Pluto"},
            "sagittarius": {"element": "fire", "modality": "mutable", "ruler": "Jupiter"},
            "capricorn": {"element": "earth", "modality": "cardinal", "ruler": "Saturn"},
            "aquarius": {"element": "air", "modality": "fixed", "ruler": "Uranus"},
            "pisces": {"element": "water", "modality": "mutable", "ruler": "Neptune"}
        }
    
    def calculate_current_transits(self, target_date: date = None) -> Dict[str, Any]:
        """
        Calculate current planetary positions (transits)
        
        Args:
            target_date: Date for transit calculation (defaults to today)
        
        Returns:
            Dictionary with current planetary positions
        """
        try:
            if target_date is None:
                target_date = date.today()
            
            # Create a generic subject for current sky positions
            subject = AstrologicalSubject(
                name="Transit",
                year=target_date.year,
                month=target_date.month,
                day=target_date.day,
                hour=12,  # Noon UTC
                minute=0,
                lat=0.0,
                lng=0.0,
                tz_str="UTC"
            )
            
            transits = {
                "date": target_date.isoformat(),
                "planets": {
                    "sun": {"sign": subject.sun.sign, "degree": subject.sun.position},
                    "moon": {"sign": subject.moon.sign, "degree": subject.moon.position},
                    "mercury": {"sign": subject.mercury.sign, "degree": subject.mercury.position},
                    "venus": {"sign": subject.venus.sign, "degree": subject.venus.position},
                    "mars": {"sign": subject.mars.sign, "degree": subject.mars.position},
                    "jupiter": {"sign": subject.jupiter.sign, "degree": subject.jupiter.position},
                    "saturn": {"sign": subject.saturn.sign, "degree": subject.saturn.position}
                }
            }
            
            return transits
            
        except Exception as e:
            logger.error(f"Error calculating transits: {str(e)}")
            return {"date": target_date.isoformat(), "planets": {}}
    
    def calculate_personalized_transits(
        self,
        natal_chart: NatalChart,
        target_date: date = None
    ) -> Dict[str, Any]:
        """
        Calculate transits affecting user's natal chart
        
        Args:
            natal_chart: User's natal chart
            target_date: Date for transit calculation
        
        Returns:
            Dictionary with significant transits and aspects
        """
        try:
            current_transits = self.calculate_current_transits(target_date)
            
            # Analyze significant aspects between transits and natal planets
            significant_aspects = []
            
            transit_planets = current_transits.get("planets", {})
            natal_planets = natal_chart.planets
            
            # Check for major aspects (conjunction, opposition, square, trine, sextile)
            for transit_name, transit_data in transit_planets.items():
                for natal_name, natal_data in natal_planets.items():
                    aspect = self._calculate_aspect(
                        transit_data.get("degree", 0),
                        natal_data.get("degree", 0)
                    )
                    
                    if aspect:
                        significant_aspects.append({
                            "transit_planet": transit_name,
                            "natal_planet": natal_name,
                            "aspect": aspect["type"],
                            "orb": aspect["orb"],
                            "transit_sign": transit_data.get("sign"),
                            "natal_sign": natal_data.get("sign")
                        })
            
            return {
                "current_transits": current_transits,
                "significant_aspects": significant_aspects,
                "natal_sun_sign": natal_planets.get("sun", {}).get("sign"),
                "natal_moon_sign": natal_planets.get("moon", {}).get("sign")
            }
            
        except Exception as e:
            logger.error(f"Error calculating personalized transits: {str(e)}")
            return {"current_transits": current_transits, "significant_aspects": []}
    
    def _calculate_aspect(self, degree1: float, degree2: float) -> Optional[Dict[str, Any]]:
        """Calculate aspect between two planetary positions"""
        diff = abs(degree1 - degree2)
        if diff > 180:
            diff = 360 - diff
        
        # Major aspects with orbs
        aspects = [
            {"type": "conjunction", "angle": 0, "orb": 8},
            {"type": "opposition", "angle": 180, "orb": 8},
            {"type": "trine", "angle": 120, "orb": 8},
            {"type": "square", "angle": 90, "orb": 7},
            {"type": "sextile", "angle": 60, "orb": 6}
        ]
        
        for aspect in aspects:
            if abs(diff - aspect["angle"]) <= aspect["orb"]:
                return {
                    "type": aspect["type"],
                    "orb": abs(diff - aspect["angle"])
                }
        
        return None
    
    def generate_lucky_numbers(self, sign: str, target_date: date) -> List[int]:
        """Generate lucky numbers based on sign and date"""
        # Use date as seed for consistency
        seed = int(target_date.strftime("%Y%m%d")) + hash(sign)
        random.seed(seed)
        
        # Generate 5 lucky numbers between 1 and 99
        numbers = random.sample(range(1, 100), 5)
        return sorted(numbers)
    
    def generate_lucky_colors(self, sign: str) -> List[str]:
        """Generate lucky colors based on zodiac sign"""
        color_map = {
            "aries": ["Red", "Orange", "White"],
            "taurus": ["Green", "Pink", "Earth tones"],
            "gemini": ["Yellow", "Light Blue", "Silver"],
            "cancer": ["Silver", "White", "Cream"],
            "leo": ["Gold", "Orange", "Purple"],
            "virgo": ["Navy Blue", "Grey", "Beige"],
            "libra": ["Pink", "Light Blue", "Lavender"],
            "scorpio": ["Deep Red", "Black", "Maroon"],
            "sagittarius": ["Purple", "Royal Blue", "Turquoise"],
            "capricorn": ["Brown", "Black", "Dark Green"],
            "aquarius": {"Electric Blue", "Silver", "Turquoise"},
            "pisces": ["Sea Green", "Lavender", "Purple"]
        }
        
        return color_map.get(sign.lower(), ["White", "Silver", "Gold"])
    
    def get_compatible_signs(self, sign: str) -> List[str]:
        """Get compatible zodiac signs"""
        compatibility_map = {
            "aries": ["leo", "sagittarius", "gemini", "aquarius"],
            "taurus": ["virgo", "capricorn", "cancer", "pisces"],
            "gemini": ["libra", "aquarius", "aries", "leo"],
            "cancer": ["scorpio", "pisces", "taurus", "virgo"],
            "leo": ["aries", "sagittarius", "gemini", "libra"],
            "virgo": ["taurus", "capricorn", "cancer", "scorpio"],
            "libra": ["gemini", "aquarius", "leo", "sagittarius"],
            "scorpio": ["cancer", "pisces", "virgo", "capricorn"],
            "sagittarius": ["aries", "leo", "libra", "aquarius"],
            "capricorn": ["taurus", "virgo", "scorpio", "pisces"],
            "aquarius": ["gemini", "libra", "aries", "sagittarius"],
            "pisces": ["cancer", "scorpio", "taurus", "capricorn"]
        }
        
        return compatibility_map.get(sign.lower(), [])
    
    def generate_horoscope_prompt(
        self,
        sign: str,
        period: str,
        target_date: date,
        transits: Optional[Dict[str, Any]] = None,
        natal_chart: Optional[NatalChart] = None
    ) -> str:
        """
        Generate prompt for AI horoscope generation
        
        Args:
            sign: Zodiac sign
            period: daily, weekly, or monthly
            target_date: Date for horoscope
            transits: Current transit data
            natal_chart: User's natal chart (for personalized horoscopes)
        
        Returns:
            Formatted prompt for LLM
        """
        sign_props = self.sign_properties.get(sign.lower(), {})
        
        # Base prompt
        prompt = f"""Generate a {period} horoscope for {sign.capitalize()}.

Date: {target_date.strftime('%B %d, %Y')}
Element: {sign_props.get('element', 'unknown').capitalize()}
Ruling Planet: {sign_props.get('ruler', 'unknown')}
"""
        
        # Add transit information
        if transits and transits.get("planets"):
            prompt += "\nCurrent Planetary Positions:\n"
            for planet, data in transits["planets"].items():
                prompt += f"- {planet.capitalize()}: {data.get('sign')} at {data.get('degree', 0):.1f}°\n"
        
        # Add personalization if natal chart provided
        if natal_chart:
            natal_sun = natal_chart.planets.get("sun", {})
            natal_moon = natal_chart.planets.get("moon", {})
            prompt += f"\nPersonalized for:\n"
            prompt += f"- Sun in {natal_sun.get('sign')} (House {natal_sun.get('house')})\n"
            prompt += f"- Moon in {natal_moon.get('sign')} (House {natal_moon.get('house')})\n"
            
            if transits and transits.get("significant_aspects"):
                prompt += "\nSignificant Transits:\n"
                for aspect in transits["significant_aspects"][:3]:  # Top 3 aspects
                    prompt += f"- Transit {aspect['transit_planet'].capitalize()} {aspect['aspect']} Natal {aspect['natal_planet'].capitalize()}\n"
        
        # Instructions for AI
        prompt += f"""
Please provide a {period} horoscope that includes:
1. Overall energy and themes for the period
2. Love and relationships
3. Career and finances
4. Health and wellness
5. Specific advice and recommendations

Keep the tone mystical, insightful, and empowering. Focus on opportunities and growth.
The horoscope should be approximately 200-300 words."""
        
        return prompt
    
    async def save_horoscope(
        self,
        db: AsyncSession,
        sign: str,
        period: str,
        target_date: date,
        prediction: str,
        lucky_numbers: List[int],
        lucky_colors: List[str],
        compatibility_signs: List[str],
        advice: str,
        user_id: Optional[str] = None,
        is_personalized: bool = False,
        transit_data: Optional[Dict[str, Any]] = None
    ) -> Horoscope:
        """Save horoscope to database"""
        try:
            horoscope = Horoscope(
                user_id=user_id,
                zodiac_sign=sign.lower(),
                period=period,
                date=target_date,
                prediction=prediction,
                lucky_numbers=lucky_numbers,
                lucky_colors=lucky_colors,
                compatibility_signs=compatibility_signs,
                advice=advice,
                is_personalized="true" if is_personalized else "false",
                transit_data=transit_data
            )
            
            db.add(horoscope)
            await db.commit()
            await db.refresh(horoscope)
            return horoscope
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving horoscope: {str(e)}")
            raise
    
    async def get_cached_horoscope(
        self,
        db: AsyncSession,
        sign: str,
        period: str,
        target_date: date,
        user_id: Optional[str] = None
    ) -> Optional[Horoscope]:
        """Get horoscope from database cache"""
        try:
            query = select(Horoscope).where(
                and_(
                    Horoscope.zodiac_sign == sign.lower(),
                    Horoscope.period == period,
                    Horoscope.date == target_date
                )
            )
            
            # If user_id provided, look for personalized horoscope
            if user_id:
                query = query.where(Horoscope.user_id == user_id)
            else:
                query = query.where(Horoscope.user_id.is_(None))
            
            result = await db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error(f"Error retrieving cached horoscope: {str(e)}")
            return None
    
    def generate_compatibility_prompt(
        self,
        sign1: str,
        sign2: str
    ) -> str:
        """Generate prompt for zodiac compatibility analysis"""
        props1 = self.sign_properties.get(sign1.lower(), {})
        props2 = self.sign_properties.get(sign2.lower(), {})
        
        prompt = f"""Analyze the zodiac compatibility between {sign1.capitalize()} and {sign2.capitalize()}.

{sign1.capitalize()}:
- Element: {props1.get('element', 'unknown').capitalize()}
- Modality: {props1.get('modality', 'unknown').capitalize()}
- Ruling Planet: {props1.get('ruler', 'unknown')}

{sign2.capitalize()}:
- Element: {props2.get('element', 'unknown').capitalize()}
- Modality: {props2.get('modality', 'unknown').capitalize()}
- Ruling Planet: {props2.get('ruler', 'unknown')}

Please provide:
1. Overall compatibility score (0-100)
2. Detailed compatibility analysis (200-250 words)
3. Three key strengths of this pairing
4. Three key challenges of this pairing
5. Practical advice for making the relationship work

Format your response as JSON:
{{
  "compatibility_score": <number>,
  "analysis": "<text>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "challenges": ["<challenge1>", "<challenge2>", "<challenge3>"],
  "advice": "<text>"
}}"""
        
        return prompt


# Global service instance
horoscope_service = HoroscopeService()
