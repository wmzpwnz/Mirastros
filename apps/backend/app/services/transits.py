"""Transits calculation service using Kerykeion"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
from kerykeion import AstrologicalSubject
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import math

logger = logging.getLogger(__name__)


class TransitsService:
    """Service for calculating planetary transits"""
    
    def __init__(self):
        self.aspect_orbs = {
            "conjunction": 8.0,
            "opposition": 8.0,
            "trine": 8.0,
            "square": 7.0,
            "sextile": 6.0
        }
        
        self.aspect_angles = {
            "conjunction": 0,
            "opposition": 180,
            "trine": 120,
            "square": 90,
            "sextile": 60
        }
    
    def calculate_current_transits(
        self,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calculate current planetary positions (transits)
        
        Args:
            target_date: Date for transit calculation (defaults to today)
        
        Returns:
            Dictionary with current planetary positions and lunar phase
        """
        try:
            if target_date is None:
                target_date = date.today()
            
            # Create a subject for the current moment
            # Using Greenwich as reference point
            transit_subject = AstrologicalSubject(
                name="Transit",
                year=target_date.year,
                month=target_date.month,
                day=target_date.day,
                hour=12,  # Noon UTC
                minute=0,
                lat=51.5074,  # London coordinates as reference
                lng=-0.1278,
                tz_str="UTC"
            )
            
            # Extract planetary positions
            planets = self._extract_transit_planets(transit_subject)
            
            # Calculate lunar phase
            lunar_phase, lunar_percentage = self._calculate_lunar_phase(
                transit_subject.sun.position,
                transit_subject.moon.position
            )
            
            return {
                "date": datetime.combine(target_date, datetime.min.time()),
                "planetary_positions": planets,
                "lunar_phase": lunar_phase,
                "lunar_phase_percentage": lunar_percentage
            }
            
        except Exception as e:
            logger.error(f"Error calculating current transits: {str(e)}")
            raise ValueError(f"Failed to calculate transits: {str(e)}")
    
    def calculate_personal_transits(
        self,
        natal_chart_data: Dict[str, Any],
        target_date: Optional[date] = None,
        days_ahead: int = 30
    ) -> Dict[str, Any]:
        """
        Calculate personal transits by comparing current positions with natal chart
        
        Args:
            natal_chart_data: User's natal chart data
            target_date: Date for transit analysis (defaults to today)
            days_ahead: Number of days to look ahead for significant transits
        
        Returns:
            Dictionary with personal transit analysis
        """
        try:
            if target_date is None:
                target_date = date.today()
            
            # Get current transits
            current_transits = self.calculate_current_transits(target_date)
            
            # Calculate aspects between transit and natal planets
            aspects = self._calculate_transit_aspects(
                current_transits["planetary_positions"],
                natal_chart_data["planets"]
            )
            
            # Find significant upcoming transits
            significant_transits = self._find_significant_transits(
                natal_chart_data["planets"],
                target_date,
                days_ahead
            )
            
            return {
                "date": current_transits["date"],
                "current_transits": current_transits["planetary_positions"],
                "aspects_to_natal": aspects,
                "significant_transits": significant_transits
            }
            
        except Exception as e:
            logger.error(f"Error calculating personal transits: {str(e)}")
            raise ValueError(f"Failed to calculate personal transits: {str(e)}")
    
    def _extract_transit_planets(self, subject: AstrologicalSubject) -> Dict[str, Any]:
        """Extract planetary positions from transit subject"""
        planets = {}
        
        planet_objects = {
            "sun": subject.sun,
            "moon": subject.moon,
            "mercury": subject.mercury,
            "venus": subject.venus,
            "mars": subject.mars,
            "jupiter": subject.jupiter,
            "saturn": subject.saturn,
            "uranus": subject.uranus,
            "neptune": subject.neptune,
            "pluto": subject.pluto
        }
        
        for name, planet in planet_objects.items():
            planets[name] = {
                "sign": planet.sign,
                "degree": planet.position,
                "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                "sign_num": planet.sign_num
            }
        
        return planets
    
    def _calculate_lunar_phase(self, sun_position: float, moon_position: float) -> tuple:
        """
        Calculate lunar phase from Sun and Moon positions
        
        Returns:
            Tuple of (phase_name, phase_percentage)
        """
        # Calculate angle between Sun and Moon
        angle = (moon_position - sun_position) % 360
        
        # Determine phase
        if angle < 45:
            phase = "New Moon"
        elif angle < 90:
            phase = "Waxing Crescent"
        elif angle < 135:
            phase = "First Quarter"
        elif angle < 180:
            phase = "Waxing Gibbous"
        elif angle < 225:
            phase = "Full Moon"
        elif angle < 270:
            phase = "Waning Gibbous"
        elif angle < 315:
            phase = "Last Quarter"
        else:
            phase = "Waning Crescent"
        
        # Calculate percentage (0-100)
        percentage = (angle / 360) * 100
        
        return phase, round(percentage, 2)
    
    def _calculate_transit_aspects(
        self,
        transit_planets: Dict[str, Any],
        natal_planets: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Calculate aspects between transit and natal planets"""
        aspects = []
        
        for transit_name, transit_data in transit_planets.items():
            transit_pos = transit_data["degree"]
            
            for natal_name, natal_data in natal_planets.items():
                natal_pos = natal_data["degree"]
                
                # Calculate angular distance
                angle = abs(transit_pos - natal_pos)
                if angle > 180:
                    angle = 360 - angle
                
                # Check for aspects
                for aspect_name, aspect_angle in self.aspect_angles.items():
                    orb = self.aspect_orbs[aspect_name]
                    diff = abs(angle - aspect_angle)
                    
                    if diff <= orb:
                        # Determine influence
                        if aspect_name in ["trine", "sextile"]:
                            influence = "positive"
                        elif aspect_name in ["square", "opposition"]:
                            influence = "challenging"
                        else:  # conjunction
                            influence = "neutral"
                        
                        aspects.append({
                            "transit_planet": transit_name,
                            "natal_planet": natal_name,
                            "aspect_type": aspect_name,
                            "orb": round(diff, 2),
                            "exact_date": None,  # Could calculate exact date
                            "influence": influence
                        })
        
        # Sort by orb (closest first)
        aspects.sort(key=lambda x: x["orb"])
        
        return aspects
    
    def _find_significant_transits(
        self,
        natal_planets: Dict[str, Any],
        start_date: date,
        days_ahead: int
    ) -> List[Dict[str, Any]]:
        """Find significant upcoming transits"""
        significant = []
        
        # Outer planets (slower moving, more significant)
        outer_planets = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
        
        # Check a few key dates in the period
        check_dates = [
            start_date,
            start_date + timedelta(days=days_ahead // 3),
            start_date + timedelta(days=2 * days_ahead // 3),
            start_date + timedelta(days=days_ahead)
        ]
        
        for check_date in check_dates:
            try:
                transits = self.calculate_current_transits(check_date)
                transit_planets = transits["planetary_positions"]
                
                # Check for sign changes (ingress)
                for planet_name in outer_planets:
                    if planet_name in transit_planets:
                        planet_data = transit_planets[planet_name]
                        
                        # Check if planet is near sign boundary (within 2 degrees)
                        degree = planet_data["degree"] % 30
                        if degree < 2 or degree > 28:
                            significant.append({
                                "planet": planet_name.capitalize(),
                                "event_type": "entering_sign",
                                "description": f"{planet_name.capitalize()} entering {planet_data['sign']}",
                                "date": check_date.isoformat(),
                                "importance": "high" if planet_name in ["saturn", "uranus", "neptune", "pluto"] else "medium"
                            })
                
                # Check for major aspects to natal planets
                aspects = self._calculate_transit_aspects(transit_planets, natal_planets)
                for aspect in aspects[:5]:  # Top 5 closest aspects
                    if aspect["transit_planet"] in outer_planets and aspect["orb"] < 2:
                        significant.append({
                            "planet": aspect["transit_planet"].capitalize(),
                            "event_type": "aspect",
                            "description": f"{aspect['transit_planet'].capitalize()} {aspect['aspect_type']} natal {aspect['natal_planet'].capitalize()}",
                            "date": check_date.isoformat(),
                            "importance": "high" if aspect["influence"] == "challenging" else "medium"
                        })
                        
            except Exception as e:
                logger.warning(f"Error checking transits for {check_date}: {str(e)}")
                continue
        
        # Remove duplicates and sort by importance
        seen = set()
        unique_transits = []
        for transit in significant:
            key = f"{transit['planet']}_{transit['event_type']}_{transit['date']}"
            if key not in seen:
                seen.add(key)
                unique_transits.append(transit)
        
        # Sort by importance and date
        importance_order = {"high": 0, "medium": 1, "low": 2}
        unique_transits.sort(key=lambda x: (importance_order[x["importance"]], x["date"]))
        
        return unique_transits[:10]  # Return top 10
    
    def generate_interpretation_prompt(
        self,
        transit_data: Dict[str, Any],
        natal_chart_data: Dict[str, Any],
        user_name: str = "User"
    ) -> str:
        """
        Generate prompt for AI interpretation of transits
        
        Args:
            transit_data: Transit data from calculate_personal_transits()
            natal_chart_data: User's natal chart data
            user_name: User's name
        
        Returns:
            Formatted prompt for LLM
        """
        aspects = transit_data["aspects_to_natal"]
        significant = transit_data["significant_transits"]
        
        prompt = f"""Provide a comprehensive transit interpretation for {user_name}.

Current Planetary Transits:
"""
        
        # Add major aspects
        if aspects:
            prompt += "\nMajor Aspects to Natal Chart:\n"
            for aspect in aspects[:5]:  # Top 5 aspects
                prompt += f"- Transit {aspect['transit_planet'].capitalize()} {aspect['aspect_type']} Natal {aspect['natal_planet'].capitalize()} (orb: {aspect['orb']}°)\n"
        
        # Add significant upcoming transits
        if significant:
            prompt += "\nSignificant Upcoming Transits:\n"
            for transit in significant[:5]:  # Top 5 significant
                prompt += f"- {transit['description']} on {transit['date']}\n"
        
        prompt += """
Please provide:
1. Overview of Current Cosmic Climate
2. Key Influences This Period
3. Opportunities for Growth
4. Challenges to Navigate
5. Practical Advice and Timing

Keep the interpretation mystical, insightful, and practical. Focus on how these transits affect daily life and personal growth."""

        return prompt


# Global service instance
transits_service = TransitsService()
