"""Lunar calendar service with phase calculations and activity recommendations"""
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, date, timedelta
import swisseph as swe
from sqlalchemy.ext.asyncio import AsyncSession
import math
import logging

logger = logging.getLogger(__name__)


class LunarService:
    """Service for lunar calendar calculations and recommendations"""
    
    def __init__(self):
        # Lunar phase names
        self.phase_names = {
            "new_moon": "New Moon",
            "waxing_crescent": "Waxing Crescent",
            "first_quarter": "First Quarter",
            "waxing_gibbous": "Waxing Gibbous",
            "full_moon": "Full Moon",
            "waning_gibbous": "Waning Gibbous",
            "last_quarter": "Last Quarter",
            "waning_crescent": "Waning Crescent"
        }
        
        # Phase descriptions (English) — source for DeepSeek translation
        self.phase_descriptions_en = {
            "new_moon": "A time for new beginnings, setting intentions, and planting seeds for the future. Energy is introspective and focused on inner work.",
            "waxing_crescent": "Energy is building. Time to take action on your intentions, make plans, and start new projects. Momentum is increasing.",
            "first_quarter": "A time of challenges and decisions. Push through obstacles and take decisive action. Energy is dynamic and action-oriented.",
            "waxing_gibbous": "Refinement and adjustment phase. Fine-tune your plans, make necessary changes, and prepare for culmination. Energy is productive.",
            "full_moon": "Peak energy and illumination. Time for celebration, completion, and manifestation. Emotions are heightened. Release what no longer serves.",
            "waning_gibbous": "Gratitude and sharing phase. Share your harvest, teach others, and express gratitude. Energy is generous and reflective.",
            "last_quarter": "Time to release, let go, and clear space. Break old patterns and habits. Energy is transformative and cleansing.",
            "waning_crescent": "Rest and surrender phase. Release control, rest, and prepare for the new cycle. Energy is quiet and contemplative."
        }
        # Fallback Russian (used if DeepSeek translation fails or is disabled)
        self.phase_descriptions = {
            "new_moon": "Время новых начинаний, постановки намерений и закладки семян для будущего. Энергия интровертна и сосредоточена на внутренней работе.",
            "waxing_crescent": "Энергия нарастает. Время действовать согласно вашим намерениям, строить планы и начинать новые проекты. Импульс увеличивается.",
            "first_quarter": "Время вызовов и решений. Преодолевайте препятствия и принимайте решительные действия. Энергия динамична и ориентирована на действие.",
            "waxing_gibbous": "Фаза уточнения и корректировки. Доработайте свои планы, внесите необходимые изменения и подготовьтесь к кульминации. Энергия продуктивна.",
            "full_moon": "Пик энергии и озарения. Время для празднования, завершения и проявления. Эмоции обострены. Отпустите то, что больше не служит.",
            "waning_gibbous": "Фаза благодарности и обмена. Поделитесь своим урожаем, учите других и выражайте благодарность. Энергия щедра и рефлексивна.",
            "last_quarter": "Время отпускать, освобождаться и очищать пространство. Разрушайте старые паттерны и привычки. Энергия трансформативна и очищающая.",
            "waning_crescent": "Фаза отдыха и сдачи. Отпустите контроль, отдохните и подготовьтесь к новому циклу. Энергия тиха и созерцательна."
        }
        
        # Activity recommendations by lunar phase
        self.phase_activities = {
            "new_moon": {
                "favorable": ["spiritual", "planning", "meditation", "intention_setting"],
                "neutral": ["creative", "learning"],
                "unfavorable": ["surgery", "major_decisions", "launching"]
            },
            "waxing_crescent": {
                "favorable": ["business", "creative", "planting", "starting_projects"],
                "neutral": ["travel", "moving"],
                "unfavorable": ["surgery", "ending_relationships"]
            },
            "first_quarter": {
                "favorable": ["business", "financial", "negotiations", "competitions"],
                "neutral": ["haircut", "travel"],
                "unfavorable": ["surgery", "risky_ventures"]
            },
            "waxing_gibbous": {
                "favorable": ["business", "creative", "learning", "networking"],
                "neutral": ["haircut", "moving"],
                "unfavorable": ["surgery", "major_purchases"]
            },
            "full_moon": {
                "favorable": ["wedding", "celebration", "manifestation", "completion"],
                "neutral": ["creative", "spiritual"],
                "unfavorable": ["surgery", "starting_new_projects", "major_decisions"]
            },
            "waning_gibbous": {
                "favorable": ["teaching", "sharing", "gratitude_practices"],
                "neutral": ["travel", "creative"],
                "unfavorable": ["starting_new_ventures", "planting"]
            },
            "last_quarter": {
                "favorable": ["cleansing", "releasing", "ending_relationships", "decluttering"],
                "neutral": ["spiritual", "meditation"],
                "unfavorable": ["wedding", "starting_projects", "planting"]
            },
            "waning_crescent": {
                "favorable": ["rest", "meditation", "spiritual", "healing"],
                "neutral": ["planning", "reflection"],
                "unfavorable": ["surgery", "major_decisions", "launching"]
            }
        }
        
        # Activity recommendations by Moon sign
        self.moon_sign_activities = {
            "Aries": {
                "favorable": ["sports", "competitions", "starting_projects", "leadership"],
                "unfavorable": ["patience_required", "detailed_work"]
            },
            "Taurus": {
                "favorable": ["financial", "planting", "beauty", "sensual_activities"],
                "unfavorable": ["rushing", "major_changes"]
            },
            "Gemini": {
                "favorable": ["communication", "learning", "networking", "writing"],
                "unfavorable": ["deep_emotional_work", "commitments"]
            },
            "Cancer": {
                "favorable": ["home", "family", "emotional_healing", "cooking"],
                "unfavorable": ["public_speaking", "risky_ventures"]
            },
            "Leo": {
                "favorable": ["creative", "performance", "celebration", "romance"],
                "unfavorable": ["humility_required", "background_work"]
            },
            "Virgo": {
                "favorable": ["organization", "health", "detailed_work", "analysis"],
                "unfavorable": ["spontaneity", "risk_taking"]
            },
            "Libra": {
                "favorable": ["relationships", "beauty", "art", "diplomacy"],
                "unfavorable": ["confrontation", "solo_work"]
            },
            "Scorpio": {
                "favorable": ["transformation", "deep_work", "research", "intimacy"],
                "unfavorable": ["superficial_activities", "trust_issues"]
            },
            "Sagittarius": {
                "favorable": ["travel", "learning", "adventure", "teaching"],
                "unfavorable": ["details", "routine", "commitments"]
            },
            "Capricorn": {
                "favorable": ["business", "career", "structure", "long_term_planning"],
                "unfavorable": ["spontaneity", "emotional_expression"]
            },
            "Aquarius": {
                "favorable": ["innovation", "technology", "groups", "humanitarian"],
                "unfavorable": ["tradition", "emotional_intimacy"]
            },
            "Pisces": {
                "favorable": ["spiritual", "creative", "healing", "compassion"],
                "unfavorable": ["logic_required", "boundaries"]
            }
        }
    
    def calculate_lunar_phase(
        self,
        target_date: date = None,
        include_next_events: bool = True
    ) -> Dict[str, Any]:
        """
        Calculate current lunar phase and moon position
        
        Args:
            target_date: Date for calculation (defaults to today)
        
        Returns:
            Dictionary with lunar phase data
        """
        try:
            if target_date is None:
                target_date = date.today()
            
            noon_utc = datetime(
                target_date.year,
                target_date.month,
                target_date.day,
                12,
                0,
            )
            jd = swe.julday(noon_utc.year, noon_utc.month, noon_utc.day, 12.0)

            # Geocentric ecliptic longitudes
            sun_longitude = swe.calc_ut(jd, swe.SUN)[0][0]
            moon_longitude = swe.calc_ut(jd, swe.MOON)[0][0]
            
            # Calculate phase angle (0-360 degrees)
            phase_angle = (moon_longitude - sun_longitude) % 360
            
            # Calculate illumination percentage
            illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100
            
            # Determine phase name
            phase = self._get_phase_from_angle(phase_angle)
            
            # Get Moon's zodiac sign
            zodiac_signs = [
                "Aries",
                "Taurus",
                "Gemini",
                "Cancer",
                "Leo",
                "Virgo",
                "Libra",
                "Scorpio",
                "Sagittarius",
                "Capricorn",
                "Aquarius",
                "Pisces",
            ]
            moon_sign = zodiac_signs[int(moon_longitude // 30) % 12]
            moon_degree = moon_longitude % 30  # Degree within sign
            
            # Calculate next full and new moons
            if include_next_events:
                try:
                    next_full_moon, next_new_moon = self._calculate_next_major_phase_dates(
                        target_date
                    )
                except Exception as calc_err:
                    logger.warning(
                        "Falling back to approximate next moon dates for %s: %s",
                        target_date,
                        calc_err
                    )
                    next_full_moon = (target_date + timedelta(days=14)).isoformat()
                    next_new_moon = (target_date + timedelta(days=29)).isoformat()
            else:
                next_full_moon = (target_date + timedelta(days=14)).isoformat()
                next_new_moon = (target_date + timedelta(days=29)).isoformat()
            
            return {
                "phase": phase,
                "phase_name": self.phase_names[phase],
                "illumination": round(illumination, 1),
                "date": target_date.isoformat(),
                "zodiac_sign": moon_sign,
                "moon_degree": round(moon_degree, 2),
                "next_full_moon": next_full_moon,
                "next_new_moon": next_new_moon,
                "description": self.phase_descriptions_en[phase],
                "description_fallback_ru": self.phase_descriptions[phase],
            }
            
        except Exception as e:
            logger.error(f"Error calculating lunar phase: {str(e)}")
            # Return default values
            return {
                "phase": "new_moon",
                "phase_name": "New Moon",
                "illumination": 0.0,
                "date": target_date,
                "zodiac_sign": "Aries",
                "moon_degree": 0.0,
                "next_full_moon": target_date + timedelta(days=14),
                "next_new_moon": target_date + timedelta(days=29),
                "description": self.phase_descriptions_en["new_moon"],
                "description_fallback_ru": self.phase_descriptions["new_moon"],
            }
    
    def _get_phase_from_angle(self, angle: float) -> str:
        """Determine lunar phase from phase angle"""
        if angle < 22.5 or angle >= 337.5:
            return "new_moon"
        elif 22.5 <= angle < 67.5:
            return "waxing_crescent"
        elif 67.5 <= angle < 112.5:
            return "first_quarter"
        elif 112.5 <= angle < 157.5:
            return "waxing_gibbous"
        elif 157.5 <= angle < 202.5:
            return "full_moon"
        elif 202.5 <= angle < 247.5:
            return "waning_gibbous"
        elif 247.5 <= angle < 292.5:
            return "last_quarter"
        else:  # 292.5 <= angle < 337.5
            return "waning_crescent"

    @staticmethod
    def _signed_phase_distance(angle: float, target_angle: float) -> float:
        """
        Signed angular distance to target phase in range [-180, 180).
        Negative => before target phase, positive => after target phase.
        """
        return ((angle - target_angle + 540.0) % 360.0) - 180.0

    def _phase_angle_at(self, moment_utc: datetime) -> float:
        """Calculate Sun-Moon phase angle for a specific UTC datetime."""
        fractional_hour = (
            moment_utc.hour
            + moment_utc.minute / 60.0
            + moment_utc.second / 3600.0
        )
        jd = swe.julday(
            moment_utc.year,
            moment_utc.month,
            moment_utc.day,
            fractional_hour,
        )
        sun_longitude = swe.calc_ut(jd, swe.SUN)[0][0]
        moon_longitude = swe.calc_ut(jd, swe.MOON)[0][0]
        return (moon_longitude - sun_longitude) % 360

    def _bisect_phase_time(
        self,
        left: datetime,
        right: datetime,
        target_angle: float,
        iterations: int = 18,
    ) -> datetime:
        """Refine phase event time inside a bracket via binary search."""
        left_distance = self._signed_phase_distance(
            self._phase_angle_at(left), target_angle
        )
        right_distance = self._signed_phase_distance(
            self._phase_angle_at(right), target_angle
        )

        # Guard against unexpected non-bracketing intervals.
        if left_distance > 0 and right_distance > 0:
            return left
        if left_distance < 0 and right_distance < 0:
            return right

        for _ in range(iterations):
            mid = left + (right - left) / 2
            mid_distance = self._signed_phase_distance(
                self._phase_angle_at(mid), target_angle
            )
            if mid_distance >= 0:
                right = mid
            else:
                left = mid

        return right.replace(second=0, microsecond=0)

    def _calculate_next_major_phase_dates(self, from_date: date) -> Tuple[str, str]:
        """
        Find exact dates (UTC) of the next full moon and next new moon
        after `from_date`.
        """
        start_dt = datetime.combine(from_date, datetime.min.time())
        search_end_dt = start_dt + timedelta(days=40)
        step = timedelta(hours=2)

        target_angles = {
            "next_full_moon": 180.0,
            "next_new_moon": 0.0,
        }
        found_times: Dict[str, Optional[datetime]] = {
            "next_full_moon": None,
            "next_new_moon": None,
        }

        prev_dt = start_dt
        prev_angle = self._phase_angle_at(prev_dt)
        prev_distance = {
            key: self._signed_phase_distance(prev_angle, target_angle)
            for key, target_angle in target_angles.items()
        }

        while prev_dt < search_end_dt and not all(found_times.values()):
            curr_dt = prev_dt + step
            curr_angle = self._phase_angle_at(curr_dt)

            for key, target_angle in target_angles.items():
                if found_times[key] is not None:
                    continue

                prev_d = prev_distance[key]
                curr_d = self._signed_phase_distance(curr_angle, target_angle)

                crossed_target = prev_d < 0 <= curr_d
                hit_target = abs(curr_d) < 1e-9

                if crossed_target or hit_target:
                    left = prev_dt
                    right = curr_dt
                    found_times[key] = self._bisect_phase_time(
                        left=left,
                        right=right,
                        target_angle=target_angle,
                    )

                prev_distance[key] = curr_d

            prev_dt = curr_dt

        if found_times["next_full_moon"] is None:
            found_times["next_full_moon"] = start_dt + timedelta(days=14)
        if found_times["next_new_moon"] is None:
            found_times["next_new_moon"] = start_dt + timedelta(days=29)

        return (
            found_times["next_full_moon"].date().isoformat(),
            found_times["next_new_moon"].date().isoformat(),
        )

    def _calculate_next_full_moon(self, from_date: date) -> str:
        """Calculate exact date (UTC) of next full moon."""
        next_full_moon, _ = self._calculate_next_major_phase_dates(from_date)
        return next_full_moon

    def _calculate_next_new_moon(self, from_date: date) -> str:
        """Calculate exact date (UTC) of next new moon."""
        _, next_new_moon = self._calculate_next_major_phase_dates(from_date)
        return next_new_moon
    
    def generate_activity_recommendations(
        self,
        target_date: date = None,
        natal_chart: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Generate activity recommendations based on lunar phase and moon sign
        
        Args:
            target_date: Date for recommendations
            natal_chart: User's natal chart for personalization
        
        Returns:
            Dictionary with activity recommendations
        """
        try:
            if target_date is None:
                target_date = date.today()
            
            # Get lunar phase data
            lunar_data = self.calculate_lunar_phase(
                target_date,
                include_next_events=False
            )
            phase = lunar_data["phase"]
            moon_sign = lunar_data["zodiac_sign"]
            
            # Get phase-based activities
            phase_recs = self.phase_activities.get(phase, {})
            
            # Get moon sign-based activities
            sign_recs = self.moon_sign_activities.get(moon_sign, {})
            
            # Generate recommendations for common activities
            recommendations = []
            
            # Haircut
            haircut_score = self._calculate_activity_score(
                "haircut", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "haircut",
                "favorability": self._get_favorability(haircut_score),
                "score": haircut_score,
                "recommendation": self._generate_haircut_recommendation(phase, moon_sign, haircut_score)
            })
            
            # Wedding
            wedding_score = self._calculate_activity_score(
                "wedding", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "wedding",
                "favorability": self._get_favorability(wedding_score),
                "score": wedding_score,
                "recommendation": self._generate_wedding_recommendation(phase, moon_sign, wedding_score)
            })
            
            # Business deals
            business_score = self._calculate_activity_score(
                "business", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "business",
                "favorability": self._get_favorability(business_score),
                "score": business_score,
                "recommendation": self._generate_business_recommendation(phase, moon_sign, business_score)
            })
            
            # Surgery
            surgery_score = self._calculate_activity_score(
                "surgery", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "surgery",
                "favorability": self._get_favorability(surgery_score),
                "score": surgery_score,
                "recommendation": self._generate_surgery_recommendation(phase, moon_sign, surgery_score)
            })
            
            # Travel
            travel_score = self._calculate_activity_score(
                "travel", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "travel",
                "favorability": self._get_favorability(travel_score),
                "score": travel_score,
                "recommendation": self._generate_travel_recommendation(phase, moon_sign, travel_score)
            })
            
            # Financial decisions
            financial_score = self._calculate_activity_score(
                "financial", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "financial",
                "favorability": self._get_favorability(financial_score),
                "score": financial_score,
                "recommendation": self._generate_financial_recommendation(phase, moon_sign, financial_score)
            })
            
            # Spiritual practices
            spiritual_score = self._calculate_activity_score(
                "spiritual", phase, moon_sign, phase_recs, sign_recs
            )
            recommendations.append({
                "activity": "spiritual",
                "favorability": self._get_favorability(spiritual_score),
                "score": spiritual_score,
                "recommendation": self._generate_spiritual_recommendation(phase, moon_sign, spiritual_score)
            })
            
            # Generate general advice
            general_advice = self._generate_general_advice(phase, moon_sign, lunar_data)
            
            # Personalize if natal chart provided
            is_personalized = False
            if natal_chart:
                is_personalized = True
                general_advice = self._personalize_advice(general_advice, natal_chart, lunar_data)
            
            return {
                "date": target_date,
                "lunar_phase": lunar_data["phase_name"],
                "moon_sign": moon_sign,
                "recommendations": recommendations,
                "general_advice": general_advice,
                "is_personalized": is_personalized
            }
            
        except Exception as e:
            logger.error(f"Error generating activity recommendations: {str(e)}")
            raise
    
    def _calculate_activity_score(
        self,
        activity: str,
        phase: str,
        moon_sign: str,
        phase_recs: Dict,
        sign_recs: Dict
    ) -> int:
        """Calculate favorability score for an activity (0-100)"""
        score = 50  # Neutral baseline
        
        # Check phase recommendations
        if activity in phase_recs.get("favorable", []):
            score += 30
        elif activity in phase_recs.get("unfavorable", []):
            score -= 30
        
        # Check moon sign recommendations
        if activity in sign_recs.get("favorable", []):
            score += 20
        elif activity in sign_recs.get("unfavorable", []):
            score -= 20
        
        # Clamp to 0-100
        return max(0, min(100, score))
    
    def _get_favorability(self, score: int) -> str:
        """Convert score to favorability label"""
        if score >= 70:
            return "favorable"
        elif score >= 40:
            return "neutral"
        else:
            return "unfavorable"
    
    def _generate_haircut_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate haircut recommendation"""
        if score >= 70:
            return f"Excellent time for a haircut! The {self.phase_names[phase]} in {moon_sign} supports hair growth and vitality."
        elif score >= 40:
            return f"Neutral time for a haircut. The Moon in {moon_sign} neither strongly supports nor opposes hair care."
        else:
            return f"Consider waiting for a more favorable lunar phase. The {self.phase_names[phase]} may not support optimal hair growth."
    
    def _generate_wedding_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate wedding recommendation"""
        if score >= 70:
            return f"Auspicious time for a wedding! The {self.phase_names[phase]} in {moon_sign} brings blessings and harmony to unions."
        elif score >= 40:
            return f"Acceptable time for a wedding. The Moon in {moon_sign} provides moderate support for celebrations."
        else:
            return f"Not ideal for weddings. The {self.phase_names[phase]} suggests waiting for more favorable cosmic timing."
    
    def _generate_business_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate business recommendation"""
        if score >= 70:
            return f"Excellent time for business deals! The {self.phase_names[phase]} in {moon_sign} supports growth and success."
        elif score >= 40:
            return f"Proceed with caution in business matters. The Moon in {moon_sign} suggests careful consideration."
        else:
            return f"Unfavorable for major business decisions. The {self.phase_names[phase]} advises patience and planning."
    
    def _generate_surgery_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate surgery recommendation"""
        if score >= 70:
            return f"Favorable time for elective surgery. The {self.phase_names[phase]} in {moon_sign} supports healing."
        elif score >= 40:
            return f"Neutral time for surgery. Consult with medical professionals for timing."
        else:
            return f"Not recommended for elective surgery. The {self.phase_names[phase]} may complicate healing. Consult your doctor."
    
    def _generate_travel_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate travel recommendation"""
        if score >= 70:
            return f"Great time for travel! The {self.phase_names[phase]} in {moon_sign} brings adventure and positive experiences."
        elif score >= 40:
            return f"Acceptable time for travel. The Moon in {moon_sign} suggests normal precautions."
        else:
            return f"Consider postponing travel if possible. The {self.phase_names[phase]} may bring unexpected challenges."
    
    def _generate_financial_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate financial recommendation"""
        if score >= 70:
            return f"Favorable for financial decisions! The {self.phase_names[phase]} in {moon_sign} supports prosperity."
        elif score >= 40:
            return f"Neutral time for finances. The Moon in {moon_sign} suggests careful analysis before major decisions."
        else:
            return f"Not ideal for major financial commitments. The {self.phase_names[phase]} advises caution and patience."
    
    def _generate_spiritual_recommendation(self, phase: str, moon_sign: str, score: int) -> str:
        """Generate spiritual practice recommendation"""
        if score >= 70:
            return f"Powerful time for spiritual work! The {self.phase_names[phase]} in {moon_sign} enhances intuition and connection."
        elif score >= 40:
            return f"Good time for regular spiritual practices. The Moon in {moon_sign} supports inner work."
        else:
            return f"Focus on grounding practices. The {self.phase_names[phase]} may make deep spiritual work challenging."
    
    def _generate_general_advice(self, phase: str, moon_sign: str, lunar_data: Dict) -> str:
        """Generate general advice for the day"""
        phase_desc = self.phase_descriptions_en[phase]
        illumination = lunar_data["illumination"]
        
        advice = f"Today the Moon is in {moon_sign} during the {self.phase_names[phase]} phase ({illumination:.0f}% illuminated). "
        advice += phase_desc + " "
        
        # Add moon sign specific advice
        if moon_sign in ["Aries", "Leo", "Sagittarius"]:
            advice += "Fire Moon energy brings enthusiasm and action. Channel this dynamic energy wisely."
        elif moon_sign in ["Taurus", "Virgo", "Capricorn"]:
            advice += "Earth Moon energy brings practicality and grounding. Focus on tangible results."
        elif moon_sign in ["Gemini", "Libra", "Aquarius"]:
            advice += "Air Moon energy brings mental clarity and communication. Share your ideas."
        else:  # Water signs
            advice += "Water Moon energy brings emotional depth and intuition. Trust your feelings."
        
        return advice
    
    def _personalize_advice(
        self,
        general_advice: str,
        natal_chart: Any,
        lunar_data: Dict
    ) -> str:
        """Personalize advice based on natal chart"""
        try:
            # Get user's natal Moon sign
            natal_moon = natal_chart.planets.get("moon", {})
            natal_moon_sign = natal_moon.get("sign", "")
            
            current_moon_sign = lunar_data["zodiac_sign"]
            
            # Add personalization
            personalized = general_advice + "\n\n"
            
            if natal_moon_sign == current_moon_sign:
                personalized += f"The Moon returns to your natal Moon sign ({natal_moon_sign})! This is your personal lunar return - a time of emotional renewal and heightened intuition."
            else:
                personalized += f"With your natal Moon in {natal_moon_sign} and the current Moon in {current_moon_sign}, focus on balancing these energies for optimal well-being."
            
            return personalized
            
        except Exception as e:
            logger.error(f"Error personalizing advice: {str(e)}")
            return general_advice
    
    def generate_lunar_calendar(
        self,
        start_date: date,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Generate lunar calendar for a period
        
        Args:
            start_date: Start date
            days: Number of days to generate
        
        Returns:
            Dictionary with calendar data
        """
        try:
            calendar_days = []
            special_events = []
            
            for day_offset in range(days):
                current_date = start_date + timedelta(days=day_offset)
                lunar_data = self.calculate_lunar_phase(
                    current_date,
                    include_next_events=False
                )
                
                # Get activity recommendations
                recs = self.generate_activity_recommendations(current_date)
                
                # Determine favorable and unfavorable activities
                favorable = [r["activity"] for r in recs["recommendations"] if r["favorability"] == "favorable"]
                unfavorable = [r["activity"] for r in recs["recommendations"] if r["favorability"] == "unfavorable"]
                
                # Determine energy level
                illumination = lunar_data["illumination"]
                if illumination >= 80 or illumination <= 20:
                    energy_level = "high"
                elif 40 <= illumination <= 60:
                    energy_level = "medium"
                else:
                    energy_level = "medium"
                
                calendar_days.append({
                    "date": current_date,
                    "lunar_phase": lunar_data["phase_name"],
                    "moon_sign": lunar_data["zodiac_sign"],
                    "illumination": lunar_data["illumination"],
                    "favorable_activities": favorable[:3],  # Top 3
                    "unfavorable_activities": unfavorable[:3],  # Top 3
                    "energy_level": energy_level
                })
                
                # Track special events
                if lunar_data["phase"] == "full_moon":
                    special_events.append({
                        "event_type": "full_moon",
                        "date": current_date,
                        "zodiac_sign": lunar_data["zodiac_sign"],
                        "description": f"Full Moon in {lunar_data['zodiac_sign']}"
                    })
                elif lunar_data["phase"] == "new_moon":
                    special_events.append({
                        "event_type": "new_moon",
                        "date": current_date,
                        "zodiac_sign": lunar_data["zodiac_sign"],
                        "description": f"New Moon in {lunar_data['zodiac_sign']}"
                    })
            
            end_date = start_date + timedelta(days=days - 1)
            
            return {
                "start_date": start_date,
                "end_date": end_date,
                "days": calendar_days,
                "special_events": special_events
            }
            
        except Exception as e:
            logger.error(f"Error generating lunar calendar: {str(e)}")
            raise


# Global service instance
lunar_service = LunarService()
