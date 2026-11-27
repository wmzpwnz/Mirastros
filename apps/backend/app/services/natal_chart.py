"""Natal chart calculation service using Kerykeion"""
from typing import Dict, Any, Optional
from datetime import datetime, date, time, timezone
from importlib.metadata import PackageNotFoundError, version as package_version
from pathlib import Path
from zoneinfo import TZPATH, ZoneInfo
from kerykeion import AstrologicalSubject
from tzfpy import get_tz
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.natal_chart import NatalChart
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


def _timezone_database_version() -> str:
    """Return the tzdb edition actually used by ZoneInfo where it is discoverable."""
    # ZoneInfo searches system paths before the Python tzdata wheel. Prefer the
    # version from those paths so the recorded edition reflects the data used.
    for root in TZPATH:
        try:
            first_line = (Path(root) / "tzdata.zi").read_text(encoding="ascii").splitlines()[0]
            if first_line.startswith("# version "):
                return first_line.removeprefix("# version ").strip()
        except (OSError, IndexError):
            continue
    try:
        return package_version("tzdata")
    except PackageNotFoundError:
        return "system-unknown"


class NatalChartService:
    """Service for calculating and managing natal charts"""

    calculation_version = "mirastros-natal-2"
    
    def __init__(self):
        self.house_systems = {
            "placidus": "P",
            "koch": "K",
            "equal": "E",
            "whole_sign": "W",
            "campanus": "C",
            "regiomontanus": "R"
        }

    def _normalize_house(self, value: Any) -> int:
        """Kerykeion versions may return house as int or as 'Second_House' string."""
        if isinstance(value, int):
            if 1 <= value <= 12:
                return value
            raise ValueError(f"Некорректный номер дома планеты: {value!r}")
        if isinstance(value, float) and value.is_integer():
            number = int(value)
            if 1 <= number <= 12:
                return number
            raise ValueError(f"Некорректный номер дома планеты: {value!r}")

        if isinstance(value, str):
            raw = value.strip()
            if raw.isdigit():
                number = int(raw)
                if 1 <= number <= 12:
                    return number
                raise ValueError(f"Некорректный номер дома планеты: {value!r}")

            lowered = raw.lower()
            # Common Kerykeion style: 'Second_House'
            ordinals = {
                "first": 1,
                "second": 2,
                "third": 3,
                "fourth": 4,
                "fifth": 5,
                "sixth": 6,
                "seventh": 7,
                "eighth": 8,
                "ninth": 9,
                "tenth": 10,
                "eleventh": 11,
                "twelfth": 12,
            }
            for k, v in ordinals.items():
                if k in lowered:
                    return v

        raise ValueError(f"Не удалось однозначно определить дом планеты: {value!r}")
    
    def calculate_chart(
        self,
        name: str,
        birth_date: date,
        birth_time: time,
        latitude: float,
        longitude: float,
        city: str = "",
        nation: str = "",
        house_system: str = "placidus"
    ) -> Dict[str, Any]:
        """
        Calculate natal chart using Kerykeion
        
        Args:
            name: Person's name
            birth_date: Birth date
            birth_time: Birth time
            latitude: Birth location latitude
            longitude: Birth location longitude
            city: City name (optional)
            nation: Country name (optional)
            house_system: House system to use (default: placidus)
        
        Returns:
            Dictionary with natal chart data
        """
        try:
            # Birth data stores civil/local time. Resolve its historical IANA
            # timezone from the selected coordinates before sending it to the
            # astrology engine; interpreting every birthplace as UTC shifts
            # planetary positions and angles by hours.
            birth_datetime = datetime.combine(birth_date, birth_time)
            timezone_name = get_tz(longitude, latitude)
            if not timezone_name:
                raise ValueError("Не удалось определить часовой пояс места рождения. Выберите город точнее.")
            zone = ZoneInfo(timezone_name)
            utc_candidates = []
            for fold in (0, 1):
                candidate = birth_datetime.replace(tzinfo=zone, fold=fold).astimezone(timezone.utc)
                if candidate.astimezone(zone).replace(tzinfo=None) == birth_datetime and candidate not in utc_candidates:
                    utc_candidates.append(candidate)
            if len(utc_candidates) != 1:
                raise ValueError("Это местное время неоднозначно из-за перевода часов. Уточните время рождения.")
            birth_datetime_utc = utc_candidates[0]
            
            # Get house system code
            normalized_house_system = (house_system or "placidus").lower()
            if normalized_house_system not in self.house_systems:
                raise ValueError("Выбрана неизвестная система астрологических домов.")
            hs_code = self.house_systems[normalized_house_system]
            
            # Create astrological subject
            subject = AstrologicalSubject(
                name=name,
                year=birth_datetime.year,
                month=birth_datetime.month,
                day=birth_datetime.day,
                hour=birth_datetime.hour,
                minute=birth_datetime.minute,
                lat=latitude,
                lng=longitude,
                tz_str=timezone_name,
                city=city,
                nation=nation,
                houses_system_identifier=hs_code,
                zodiac_type="Tropical",
                perspective_type="Apparent Geocentric",
            )
            
            # Extract planetary positions
            planets = self._extract_planets(subject)
            
            # Extract houses
            houses = self._extract_houses(subject)
            
            # Calculate aspects
            aspects = self._calculate_aspects(subject)
            
            # Extract special points
            ascendant = {
                "sign": subject.first_house.sign,
                "degree": subject.first_house.position
            }
            
            midheaven = {
                "sign": subject.tenth_house.sign,
                "degree": subject.tenth_house.position
            }
            
            lunar_nodes = {
                "north_node": {
                    "sign": subject.mean_node.sign,
                    "degree": subject.mean_node.position
                },
                "south_node": {
                    "sign": self._opposite_sign(subject.mean_node.sign),
                    # Keep degree within sign to match the rest of chart data.
                    "degree": subject.mean_node.position
                }
            }
            
            return {
                "planets": planets,
                "houses": houses,
                "aspects": aspects,
                "ascendant": ascendant,
                "midheaven": midheaven,
                "lunar_nodes": lunar_nodes,
                "house_system": normalized_house_system,
                "calculation_metadata": {
                    "version": self.calculation_version,
                    "engine": "Kerykeion",
                    "engine_version": package_version("kerykeion"),
                    "ephemeris": "Swiss Ephemeris",
                    "ephemeris_version": package_version("pyswisseph"),
                    "lunar_node": "Mean Node",
                    "zodiac": "Tropical",
                    "perspective": "Apparent Geocentric",
                    "house_system": normalized_house_system,
                    "birth_timezone": timezone_name,
                    "timezone_database_version": _timezone_database_version(),
                    "birth_datetime_utc": birth_datetime_utc.isoformat(),
                    "coordinates": {"latitude": latitude, "longitude": longitude},
                },
            }
            
        except Exception as e:
            logger.error(f"Error calculating natal chart: {str(e)}")
            raise ValueError(f"Failed to calculate natal chart: {str(e)}")
    
    def _extract_planets(self, subject: AstrologicalSubject) -> Dict[str, Any]:
        """Extract planetary positions from subject"""
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
                "house": self._normalize_house(getattr(planet, "house", None)),
                "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                "sign_num": planet.sign_num
            }
        
        return planets
    
    def _extract_houses(self, subject: AstrologicalSubject) -> list:
        """Extract house cusps from subject"""
        houses = []
        
        house_objects = [
            subject.first_house,
            subject.second_house,
            subject.third_house,
            subject.fourth_house,
            subject.fifth_house,
            subject.sixth_house,
            subject.seventh_house,
            subject.eighth_house,
            subject.ninth_house,
            subject.tenth_house,
            subject.eleventh_house,
            subject.twelfth_house
        ]
        
        for i, house in enumerate(house_objects, 1):
            houses.append({
                "cusp": i,
                "sign": house.sign,
                "degree": house.position,
                "sign_num": house.sign_num
            })
        
        return houses
    
    def _calculate_aspects(self, subject: AstrologicalSubject) -> list:
        """Calculate planetary aspects"""
        aspects = []
        
        # Get all aspects from Kerykeion
        if hasattr(subject, 'aspects_list'):
            for aspect in subject.aspects_list:
                aspects.append({
                    "planet1": aspect['p1_name'],
                    "planet2": aspect['p2_name'],
                    "type": aspect['aspect'],
                    "orb": aspect['orbit'],
                    "applying": aspect.get('applying', None)
                })
        
        return aspects
    
    def _opposite_sign(self, sign: str) -> str:
        """Get opposite zodiac sign"""
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer",
            "Leo", "Virgo", "Libra", "Scorpio",
            "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        
        try:
            # Support abbreviations like 'Aqu', 'Ari', etc.
            normalized = sign
            if isinstance(sign, str) and len(sign) == 3:
                mapping = {
                    "Ari": "Aries",
                    "Tau": "Taurus",
                    "Gem": "Gemini",
                    "Can": "Cancer",
                    "Leo": "Leo",
                    "Vir": "Virgo",
                    "Lib": "Libra",
                    "Sco": "Scorpio",
                    "Sag": "Sagittarius",
                    "Cap": "Capricorn",
                    "Aqu": "Aquarius",
                    "Pis": "Pisces",
                }
                normalized = mapping.get(sign, sign)

            index = signs.index(normalized)
            opposite_index = (index + 6) % 12
            return signs[opposite_index]
        except ValueError:
            return sign
    
    async def save_natal_chart(
        self,
        db: AsyncSession,
        user_id: str,
        chart_data: Dict[str, Any]
    ) -> NatalChart:
        """
        Save or update natal chart in database
        
        Args:
            db: Database session
            user_id: User UUID
            chart_data: Chart data from calculate_chart()
        
        Returns:
            NatalChart model instance
        """
        try:
            # Check if chart already exists
            result = await db.execute(
                select(NatalChart).where(NatalChart.user_id == user_id)
            )
            existing_chart = result.scalar_one_or_none()
            
            if existing_chart:
                # Update existing chart
                existing_chart.planets = chart_data["planets"]
                existing_chart.houses = chart_data["houses"]
                existing_chart.aspects = chart_data["aspects"]
                existing_chart.ascendant = chart_data["ascendant"]
                existing_chart.midheaven = chart_data["midheaven"]
                existing_chart.lunar_nodes = chart_data["lunar_nodes"]
                existing_chart.house_system = chart_data["house_system"]
                existing_chart.calculation_metadata = chart_data.get("calculation_metadata", {})
                existing_chart.updated_at = datetime.now(timezone.utc)
                
                await db.commit()
                await db.refresh(existing_chart)
                return existing_chart
            else:
                # Create new chart
                new_chart = NatalChart(
                    user_id=user_id,
                    planets=chart_data["planets"],
                    houses=chart_data["houses"],
                    aspects=chart_data["aspects"],
                    ascendant=chart_data["ascendant"],
                    midheaven=chart_data["midheaven"],
                    lunar_nodes=chart_data["lunar_nodes"],
                    house_system=chart_data["house_system"],
                    calculation_metadata=chart_data.get("calculation_metadata", {})
                )
                
                db.add(new_chart)
                await db.commit()
                await db.refresh(new_chart)
                return new_chart
                
        except Exception as e:
            await db.rollback()
            logger.error(f"Error saving natal chart: {str(e)}")
            raise
    
    async def get_natal_chart(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Optional[NatalChart]:
        """
        Get natal chart from database
        
        Args:
            db: Database session
            user_id: User UUID
        
        Returns:
            NatalChart model instance or None
        """
        result = await db.execute(
            select(NatalChart).where(NatalChart.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    def generate_interpretation_prompt(
        self,
        chart_data: Dict[str, Any],
        user_name: str = "User"
    ) -> str:
        """
        Generate prompt for AI interpretation of natal chart
        
        Args:
            chart_data: Chart data from calculate_chart()
            user_name: User's name
        
        Returns:
            Formatted prompt for LLM
        """
        planets = chart_data["planets"]
        ascendant = chart_data["ascendant"]
        
        prompt = f"""Provide a comprehensive natal chart interpretation for {user_name}.

Birth Chart Overview:
- Ascendant (Rising Sign): {ascendant['sign']} at {ascendant['degree']:.2f}°
- Sun: {planets['sun']['sign']} at {planets['sun']['degree']:.2f}° in House {planets['sun']['house']}
- Moon: {planets['moon']['sign']} at {planets['moon']['degree']:.2f}° in House {planets['moon']['house']}
- Mercury: {planets['mercury']['sign']} at {planets['mercury']['degree']:.2f}° in House {planets['mercury']['house']}
- Venus: {planets['venus']['sign']} at {planets['venus']['degree']:.2f}° in House {planets['venus']['house']}
- Mars: {planets['mars']['sign']} at {planets['mars']['degree']:.2f}° in House {planets['mars']['house']}
- Jupiter: {planets['jupiter']['sign']} at {planets['jupiter']['degree']:.2f}° in House {planets['jupiter']['house']}
- Saturn: {planets['saturn']['sign']} at {planets['saturn']['degree']:.2f}° in House {planets['saturn']['house']}

Please provide:
1. Core Identity (Sun, Moon, Ascendant)
2. Communication & Thinking (Mercury)
3. Love & Relationships (Venus)
4. Drive & Ambition (Mars)
5. Growth & Expansion (Jupiter)
6. Challenges & Lessons (Saturn)
7. Overall Life Path and Purpose

Keep the interpretation mystical, insightful, and empowering. Focus on strengths and growth opportunities."""

        return prompt


# Global service instance
natal_chart_service = NatalChartService()
