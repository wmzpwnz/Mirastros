"""Horoscope generation service with AI and transit integration"""
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, date, timedelta
from kerykeion import AstrologicalSubject
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.horoscope import Horoscope, HoroscopePeriod
from app.models.natal_chart import NatalChart
from app.models.user import User
import logging
import random
import re

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

        self.month_names_ru = {
            1: "января",
            2: "февраля",
            3: "марта",
            4: "апреля",
            5: "мая",
            6: "июня",
            7: "июля",
            8: "августа",
            9: "сентября",
            10: "октября",
            11: "ноября",
            12: "декабря",
        }

        self.color_map_ru = {
            "red": "Красный",
            "orange": "Оранжевый",
            "white": "Белый",
            "green": "Зеленый",
            "pink": "Розовый",
            "earth tones": "Землистые оттенки",
            "yellow": "Желтый",
            "light blue": "Голубой",
            "silver": "Серебряный",
            "cream": "Кремовый",
            "gold": "Золотой",
            "purple": "Фиолетовый",
            "navy blue": "Темно-синий",
            "grey": "Серый",
            "beige": "Бежевый",
            "lavender": "Лавандовый",
            "deep red": "Темно-красный",
            "black": "Черный",
            "maroon": "Бордовый",
            "royal blue": "Королевский синий",
            "turquoise": "Бирюзовый",
            "brown": "Коричневый",
            "dark green": "Темно-зеленый",
            "electric blue": "Электрик",
            "sea green": "Морская волна",
        }

    def _is_cyrillic_text(self, value: str) -> bool:
        if not value:
            return False
        return bool(re.search(r"[А-Яа-яЁё]", value))

    def normalize_markdown_to_plain(self, text: str) -> str:
        if not text:
            return ""
        plain = re.sub(r"```[\s\S]*?```", " ", text)
        plain = re.sub(r"`([^`]*)`", r"\1", plain)
        plain = re.sub(r"[*_~#>\[\]\(\)]", " ", plain)
        plain = re.sub(r"\s{2,}", " ", plain).strip()
        return plain

    def _fallback_prediction_ru(self, sign: str, period: str, target_date: date) -> str:
        sign_ru = {
            "aries": "Овна",
            "taurus": "Тельца",
            "gemini": "Близнецов",
            "cancer": "Рака",
            "leo": "Льва",
            "virgo": "Девы",
            "libra": "Весов",
            "scorpio": "Скорпиона",
            "sagittarius": "Стрельца",
            "capricorn": "Козерога",
            "aquarius": "Водолея",
            "pisces": "Рыб",
        }.get(sign.lower(), "вашего знака")
        period_ru = {
            "daily": "сегодня",
            "weekly": "на этой неделе",
            "monthly": "в этом месяце",
        }.get(period, "в этот период")
        return (
            f"Для {sign_ru} {period_ru} важны спокойный ритм, ясные приоритеты и внимательность к деталям. "
            "Фокусируйтесь на ключевых задачах, сохраняйте эмоциональный баланс и оставляйте время на восстановление."
        )

    def _normalize_color_ru(self, color: str) -> str:
        if not color:
            return ""
        cleaned = color.strip()
        if self._is_cyrillic_text(cleaned):
            return cleaned
        return self.color_map_ru.get(cleaned.lower(), cleaned.capitalize())

    def normalize_lucky_colors(self, colors: Optional[List[str]]) -> List[str]:
        if not colors:
            return []
        normalized = [self._normalize_color_ru(color) for color in colors if color]
        return [color for color in normalized if color]

    def validate_and_normalize_horoscope_content(
        self,
        sign: str,
        period: str,
        target_date: date,
        prediction: str,
        advice: str,
        lucky_colors: Optional[List[str]],
    ) -> Dict[str, Any]:
        rich_text = (prediction or "").strip()
        plain_prediction = self.normalize_markdown_to_plain(rich_text)
        plain_advice = self.normalize_markdown_to_plain(advice or "")

        if not self._is_cyrillic_text(plain_prediction):
            logger.warning("horoscope_language_mismatch: prediction is not ru for sign=%s period=%s", sign, period)
            plain_prediction = self._fallback_prediction_ru(sign, period, target_date)

        if plain_advice and not self._is_cyrillic_text(plain_advice):
            plain_advice = "Слушайте интуицию и не спешите с резкими решениями."
        elif not plain_advice:
            plain_advice = "Слушайте интуицию и действуйте последовательно."

        return {
            "prediction": plain_prediction,
            "advice": plain_advice,
            "lucky_colors": self.normalize_lucky_colors(lucky_colors),
            "plain_text": plain_prediction,
            "rich_text": rich_text or plain_prediction,
            "language": "ru",
        }

    def get_period_range_label(self, period: str, target_date: date) -> str:
        if period == "daily":
            month = self.month_names_ru[target_date.month]
            return f"{target_date.day} {month} {target_date.year}"
        if period == "weekly":
            week_start = target_date
            week_end = week_start + timedelta(days=6)
            if week_start.month == week_end.month:
                month = self.month_names_ru[week_start.month]
                return f"{week_start.day}–{week_end.day} {month} {week_start.year}"
            return (
                f"{week_start.day} {self.month_names_ru[week_start.month]} – "
                f"{week_end.day} {self.month_names_ru[week_end.month]} {week_start.year}"
            )
        month = self.month_names_ru[target_date.month]
        return f"{month.capitalize()} {target_date.year}"

    def get_best_time_windows(self, zodiac_sign: str, period: str) -> List[str]:
        base = {
            "aries": ["09:00-11:00", "14:00-16:00", "20:00-21:30"],
            "taurus": ["08:00-10:00", "13:00-15:00", "19:00-20:30"],
            "gemini": ["10:00-12:00", "15:00-17:00", "21:00-22:30"],
            "cancer": ["07:30-09:30", "12:30-14:30", "18:30-20:00"],
            "leo": ["09:30-11:30", "16:00-18:00", "20:30-22:00"],
            "virgo": ["08:30-10:30", "13:30-15:30", "19:30-21:00"],
            "libra": ["10:00-12:00", "14:30-16:30", "20:00-21:30"],
            "scorpio": ["09:00-10:30", "15:00-17:00", "21:00-22:30"],
            "sagittarius": ["08:00-10:00", "14:00-16:00", "19:30-21:00"],
            "capricorn": ["07:30-09:00", "12:00-14:00", "18:00-19:30"],
            "aquarius": ["10:30-12:30", "16:30-18:30", "21:00-22:30"],
            "pisces": ["08:30-10:00", "13:00-15:00", "19:00-20:30"],
        }
        windows = base.get(zodiac_sign.lower(), ["09:00-11:00", "14:00-16:00", "19:00-21:00"])
        return windows[:2] if period == "daily" else windows

    def build_rating_explanations(
        self,
        ratings: Optional[Dict[str, int]]
    ) -> Optional[Dict[str, str]]:
        if not ratings:
            return None

        def reason(area: str, value: int) -> str:
            if value >= 4:
                return {
                    "finance": "Благоприятный фон для денежных решений и практичных шагов.",
                    "love": "Высокая эмоциональная вовлеченность и шанс на теплый контакт.",
                    "career": "Подходящий момент для инициативы и заметного прогресса.",
                    "health": "Хороший энергетический тонус при умеренной нагрузке.",
                }[area]
            if value == 3:
                return {
                    "finance": "Стабильный фон: действуйте по плану и избегайте импульсивных трат.",
                    "love": "Нейтральный баланс: важны спокойный диалог и внимание к деталям.",
                    "career": "Рабочий темп ровный, лучше завершать начатое.",
                    "health": "Энергия умеренная, держите режим сна и восстановления.",
                }[area]
            return {
                "finance": "Требуется осторожность в расходах и финансовых обязательствах.",
                "love": "Эмоциональный фон нестабилен, не форсируйте важные разговоры.",
                "career": "Лучше снизить темп и не брать лишние обязательства.",
                "health": "Нужны отдых и щадящий режим без перегрузок.",
            }[area]

        return {
            "finance_reason": reason("finance", ratings.get("finance", 3)),
            "love_reason": reason("love", ratings.get("love", 3)),
            "career_reason": reason("career", ratings.get("career", 3)),
            "health_reason": reason("health", ratings.get("health", 3)),
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
    
    def generate_lucky_numbers(
        self, 
        sign: str, 
        target_date: date,
        user_birth_date: Optional[date] = None,
        user_life_path: Optional[int] = None,
        user_destiny: Optional[int] = None
    ) -> List[int]:
        """
        Generate lucky numbers based on numerology (if birth date available) or sign-based calculation
        
        Args:
            sign: Zodiac sign
            target_date: Target date for horoscope
            user_birth_date: Optional user birth date for personalized numerology calculation
            user_life_path: Optional Life Path Number (calculated if birth_date provided)
            user_destiny: Optional Destiny Number (not used if birth_date not provided)
        
        Returns:
            List of 5 lucky numbers (1-99)
        """
        # If user birth date is available, use real numerology calculations
        if user_birth_date:
            try:
                from app.data.numerology import (
                    calculate_lucky_numbers_from_numerology,
                    calculate_life_path_number
                )
                
                # Calculate life path if not provided
                if user_life_path is None:
                    birth_date_str = user_birth_date.strftime("%Y-%m-%d")
                    user_life_path = calculate_life_path_number(birth_date_str)
                
                # Calculate lucky numbers using numerology
                birth_date_str = user_birth_date.strftime("%Y-%m-%d")
                target_date_str = target_date.strftime("%Y-%m-%d")
                
                numbers = calculate_lucky_numbers_from_numerology(
                    birth_date=birth_date_str,
                    target_date=target_date_str,
                    life_path=user_life_path,
                    destiny=user_destiny
                )
                
                logger.info(f"Generated numerology-based lucky numbers for {sign} on {target_date}: {numbers}")
                return numbers
            except Exception as e:
                logger.warning(f"Failed to calculate numerology-based lucky numbers: {e}. Falling back to sign-based.")
        
        # Stable across workers and independent of Python's randomized hash.
        sign_number = self.zodiac_signs.index(sign.lower()) + 1
        rng = random.Random(f"{target_date.isoformat()}:{sign_number}")

        # Generate numbers based on sign element and date components
        sign_elements = {
            "aries": 1, "leo": 1, "sagittarius": 1,  # Fire
            "taurus": 4, "virgo": 4, "capricorn": 4,  # Earth
            "gemini": 3, "libra": 3, "aquarius": 3,   # Air
            "cancer": 2, "scorpio": 2, "pisces": 2    # Water
        }
        
        element_num = sign_elements.get(sign.lower(), 5)
        
        # Generate numbers based on date and sign
        numbers = set()
        
        # Add date-based numbers
        day_num = target_date.day % 99 + 1
        month_num = target_date.month % 99 + 1
        year_num = (target_date.year % 100) % 99 + 1
        
        numbers.add(day_num)
        numbers.add(month_num)
        numbers.add(year_num)
        
        # Add element-based number
        element_lucky = (element_num * 10 + day_num) % 99 + 1
        numbers.add(element_lucky)
        
        numbers.add(sign_number)
        for candidate in ((day_num * month_num) % 99 + 1, (year_num + element_num) % 99 + 1):
            if len(numbers) < 5:
                numbers.add(candidate)
        remaining = sorted(set(range(1, 100)) - numbers)
        numbers.update(rng.sample(remaining, 5 - len(numbers)))
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
            "aquarius": ["Electric Blue", "Silver", "Turquoise"],
            "pisces": ["Sea Green", "Lavender", "Purple"]
        }

        return self.normalize_lucky_colors(color_map.get(sign.lower(), ["White", "Silver", "Gold"]))
    
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
        
        period_ru = {
            "daily": "день",
            "weekly": "неделю",
            "monthly": "месяц",
        }.get(period, "период")
        # Base prompt
        prompt = f"""Сгенерируй персональный гороскоп на {period_ru} для знака {sign.capitalize()}.

Дата: {target_date.strftime('%d.%m.%Y')}
Стихия: {sign_props.get('element', 'unknown')}
Управляющая планета: {sign_props.get('ruler', 'unknown')}
Язык ответа: только русский.
Формат: без markdown-символов, без **, без *.
"""
        
        # Add transit information
        if transits and transits.get("planets"):
            prompt += "\nТекущие положения планет:\n"
            for planet, data in transits["planets"].items():
                prompt += f"- {planet.capitalize()}: {data.get('sign')} на {data.get('degree', 0):.1f}°\n"
        
        # Add personalization if natal chart provided
        if natal_chart:
            natal_sun = natal_chart.planets.get("sun", {})
            natal_moon = natal_chart.planets.get("moon", {})
            prompt += f"\nПерсональные данные натальной карты:\n"
            prompt += f"- Солнце в {natal_sun.get('sign')} (дом {natal_sun.get('house')})\n"
            prompt += f"- Луна в {natal_moon.get('sign')} (дом {natal_moon.get('house')})\n"
            
            if transits and transits.get("significant_aspects"):
                prompt += "\nКлючевые транзиты:\n"
                for aspect in transits["significant_aspects"][:3]:  # Top 3 aspects
                    prompt += (
                        f"- Транзит {aspect['transit_planet'].capitalize()} "
                        f"{aspect['aspect']} к натальной {aspect['natal_planet'].capitalize()}\n"
                    )
        
        # Instructions for AI
        prompt += f"""
Сформируй гороскоп на русском, 180-260 слов, с разделами:
1. Общая энергия периода
2. Любовь и отношения
3. Карьера и финансы
4. Самочувствие и ресурс
5. Практический совет

Тон: мистический, поддерживающий, конкретный.
Без англицизмов, без markdown-разметки."""
        
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
                period=HoroscopePeriod(period),
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
                    Horoscope.period == HoroscopePeriod(period),
                    Horoscope.date == target_date
                )
            )
            
            # If user_id provided, look for personalized horoscope
            if user_id:
                query = query.where(Horoscope.user_id == user_id)
            else:
                query = query.where(Horoscope.user_id.is_(None))
            
            result = await db.execute(query.order_by(Horoscope.created_at.desc(), Horoscope.id.desc()).limit(1))
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
        
        prompt = f"""Проанализируй совместимость знаков {sign1.capitalize()} и {sign2.capitalize()}.

{sign1.capitalize()}:
- Element: {props1.get('element', 'unknown').capitalize()}
- Modality: {props1.get('modality', 'unknown').capitalize()}
- Ruling Planet: {props1.get('ruler', 'unknown')}

{sign2.capitalize()}:
- Element: {props2.get('element', 'unknown').capitalize()}
- Modality: {props2.get('modality', 'unknown').capitalize()}
- Ruling Planet: {props2.get('ruler', 'unknown')}

Ответ на русском языке. Предоставь:
1. Оценку совместимости (0-100)
2. Подробный анализ (200-250 слов)
3. Три ключевые сильные стороны
4. Три ключевые сложности
5. Практический совет

Формат ответа JSON:
{{
  "compatibility_score": <number>,
  "analysis": "<text>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "challenges": ["<challenge1>", "<challenge2>", "<challenge3>"],
  "advice": "<text>"
}}"""
        
        return prompt
    
    def calculate_life_area_ratings(
        self,
        zodiac_sign: str,
        transits: Dict[str, Any],
        natal_chart: Optional[NatalChart] = None,
        target_date: Optional[date] = None
    ) -> Dict[str, int]:
        """
        Calculate life area ratings based on transits and natal chart
        
        Args:
            zodiac_sign: User's zodiac sign
            transits: Current transit data
            natal_chart: Optional natal chart for personalization
            target_date: Target date for calculation
        
        Returns:
            Dictionary with ratings (1-5) for finance, love, career, health
        """
        if target_date is None:
            target_date = date.today()
        
        # Base ratings (neutral)
        ratings = {
            "finance": 3,
            "love": 3,
            "career": 3,
            "health": 3
        }
        
        try:
            transit_planets = transits.get("planets", {})
            houses = natal_chart.houses if (natal_chart and natal_chart.houses) else []
            
            # Finance: Jupiter, Venus, 2nd and 8th houses
            finance_score = 0
            if "jupiter" in transit_planets:
                jupiter_sign = transit_planets["jupiter"].get("sign", "").lower()
                # Jupiter in earth signs (Taurus, Virgo, Capricorn) = good for finance
                if jupiter_sign in ["taurus", "virgo", "capricorn"]:
                    finance_score += 1
                # Jupiter in fire signs (Aries, Leo, Sagittarius) = moderate
                elif jupiter_sign in ["aries", "leo", "sagittarius"]:
                    finance_score += 0.5
            
            if "venus" in transit_planets:
                venus_sign = transit_planets["venus"].get("sign", "").lower()
                # Venus in earth signs = good for finance
                if venus_sign in ["taurus", "virgo", "capricorn"]:
                    finance_score += 1
                elif venus_sign in ["libra", "pisces"]:
                    finance_score += 0.5
            
            # Check natal chart houses if available
            if houses:
                # Check 2nd house (finances) and 8th house (shared resources)
                for house in houses:
                    if isinstance(house, dict):
                        house_num = house.get("cusp") or house.get("house")
                        if house_num == 2 or house_num == 8:
                            # If beneficial planets in these houses, add score
                            finance_score += 0.5
            
            ratings["finance"] = min(5, max(1, int(3 + finance_score)))
            
            # Love: Venus, Mars, 5th and 7th houses
            love_score = 0
            if "venus" in transit_planets:
                venus_sign = transit_planets["venus"].get("sign", "").lower()
                # Venus in air/water signs = good for love
                if venus_sign in ["libra", "pisces", "cancer", "scorpio"]:
                    love_score += 1
                elif venus_sign in ["taurus", "leo"]:
                    love_score += 0.5
            
            if "mars" in transit_planets:
                mars_sign = transit_planets["mars"].get("sign", "").lower()
                # Mars in fire signs = passionate
                if mars_sign in ["aries", "leo", "sagittarius"]:
                    love_score += 0.5
            
            if houses:
                for house in houses:
                    if isinstance(house, dict):
                        house_num = house.get("cusp") or house.get("house")
                        if house_num == 5 or house_num == 7:
                            love_score += 0.5
            
            ratings["love"] = min(5, max(1, int(3 + love_score)))
            
            # Career: Saturn, Mars, 10th house
            career_score = 0
            if "saturn" in transit_planets:
                saturn_sign = transit_planets["saturn"].get("sign", "").lower()
                # Saturn in earth signs = disciplined career
                if saturn_sign in ["taurus", "virgo", "capricorn"]:
                    career_score += 1
                elif saturn_sign in ["scorpio", "aquarius"]:
                    career_score += 0.5
            
            if "mars" in transit_planets:
                mars_sign = transit_planets["mars"].get("sign", "").lower()
                # Mars in cardinal signs = action-oriented
                if mars_sign in ["aries", "cancer", "libra", "capricorn"]:
                    career_score += 0.5
            
            if houses:
                for house in houses:
                    if isinstance(house, dict):
                        house_num = house.get("cusp") or house.get("house")
                        if house_num == 10:
                            career_score += 1
            
            ratings["career"] = min(5, max(1, int(3 + career_score)))
            
            # Health: Mars, 6th house, aspects
            health_score = 0
            if "mars" in transit_planets:
                mars_sign = transit_planets["mars"].get("sign", "").lower()
                # Mars in fire signs = high energy
                if mars_sign in ["aries", "leo", "sagittarius"]:
                    health_score += 0.5
                # Mars in water signs = need rest
                elif mars_sign in ["cancer", "scorpio", "pisces"]:
                    health_score -= 0.5
            
            if houses:
                for house in houses:
                    if isinstance(house, dict):
                        house_num = house.get("cusp") or house.get("house")
                        if house_num == 6:
                            health_score += 0.5
            
            # Check aspects for health (challenging aspects = lower health)
            if natal_chart and natal_chart.aspects:
                challenging_aspects = ["square", "opposition"]
                for aspect in natal_chart.aspects:
                    if isinstance(aspect, dict):
                        aspect_type = aspect.get("type", "").lower()
                        if aspect_type in challenging_aspects:
                            health_score -= 0.3
            
            ratings["health"] = min(5, max(1, int(3 + health_score)))
            
        except Exception as e:
            logger.error(f"Error calculating life area ratings: {str(e)}")
            # Return default ratings on error
        
        return ratings


# Global service instance
horoscope_service = HoroscopeService()
