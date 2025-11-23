"""Rituals and meditation service"""
from typing import Dict, Any, Optional, List
from datetime import date, datetime
import random
import logging

from app.data.rituals import (
    MEDITATION_GOALS,
    LUNAR_RITUALS,
    ZODIAC_AFFIRMATIONS,
    MEDITATION_TEMPLATES,
    CHAKRAS
)

logger = logging.getLogger(__name__)


class RitualsService:
    """Service for generating personalized meditations and rituals"""
    
    def __init__(self):
        self.meditation_goals = MEDITATION_GOALS
        self.lunar_rituals = LUNAR_RITUALS
        self.zodiac_affirmations = ZODIAC_AFFIRMATIONS
        self.meditation_templates = MEDITATION_TEMPLATES
        self.chakras = CHAKRAS
    
    def generate_meditation_script(
        self,
        goal: str,
        duration: int = 10,
        natal_chart: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized meditation script
        
        Args:
            goal: Meditation goal (money, love, health, etc.)
            duration: Duration in minutes
            natal_chart: User's natal chart for personalization
        
        Returns:
            Dictionary with meditation script and details
        """
        try:
            if goal not in self.meditation_goals:
                raise ValueError(f"Invalid meditation goal: {goal}")
            
            goal_data = self.meditation_goals[goal]
            chakra_name = goal_data["chakra"]
            chakra_data = self.chakras[chakra_name]
            
            # Select affirmations
            affirmations = goal_data["affirmations"]
            selected_affirmations = random.sample(affirmations, min(3, len(affirmations)))
            
            # Build meditation script
            script = self._build_meditation_script(
                goal=goal,
                goal_data=goal_data,
                chakra_name=chakra_name,
                chakra_data=chakra_data,
                duration=duration,
                affirmations=selected_affirmations,
                natal_chart=natal_chart
            )
            
            # Determine best time based on goal
            best_time = self._get_best_meditation_time(goal, natal_chart)
            
            is_personalized = natal_chart is not None
            
            return {
                "goal": goal_data["name"],
                "duration": duration,
                "script": script,
                "affirmations": selected_affirmations,
                "chakra": chakra_name.replace("_", " ").title(),
                "element": goal_data["element"],
                "best_time": best_time,
                "is_personalized": is_personalized
            }
            
        except Exception as e:
            logger.error(f"Error generating meditation script: {str(e)}")
            raise
    
    def _build_meditation_script(
        self,
        goal: str,
        goal_data: Dict,
        chakra_name: str,
        chakra_data: Dict,
        duration: int,
        affirmations: List[str],
        natal_chart: Optional[Any]
    ) -> str:
        """Build the meditation script"""
        
        # Opening based on goal
        openings = {
            "money": "Welcome to this meditation for prosperity and abundance. In this practice, we'll connect with the energy of wealth and open ourselves to receiving.",
            "love": "Welcome to this meditation for love and connection. In this practice, we'll open our hearts to give and receive love freely.",
            "health": "Welcome to this meditation for health and vitality. In this practice, we'll connect with our body's natural healing wisdom.",
            "peace": "Welcome to this meditation for inner peace and calm. In this practice, we'll release tension and embrace tranquility.",
            "success": "Welcome to this meditation for success and achievement. In this practice, we'll align with our highest potential.",
            "protection": "Welcome to this meditation for protection and safety. In this practice, we'll create a shield of divine light around us.",
            "creativity": "Welcome to this meditation for creativity and inspiration. In this practice, we'll open the channels of creative flow.",
            "wisdom": "Welcome to this meditation for wisdom and clarity. In this practice, we'll connect with our inner knowing."
        }
        
        opening = openings.get(goal, "Welcome to this meditation.")
        
        # Body of meditation based on duration
        if duration <= 5:
            body = f"""
Focus on your breath. With each inhale, draw in {goal_data['element']} energy. With each exhale, release any blocks to {goal_data['name'].lower()}.

Feel the {chakra_data['color']} light at your {chakra_name.replace('_', ' ')} growing stronger, radiating {', '.join(chakra_data['qualities'])}.
"""
        elif duration <= 10:
            body = f"""
Take a moment to scan your body from head to toe. Notice any areas of tension and breathe into them, allowing them to soften.

Now, bring your awareness to your {chakra_name.replace('_', ' ')} chakra. Visualize a beautiful {chakra_data['color']} light spinning gently at {chakra_data['location']}.

With each breath, this light grows brighter and stronger. It radiates the qualities of {', '.join(chakra_data['qualities'])}, filling your entire being.

Imagine this energy extending beyond your body, creating a field of {goal_data['name'].lower()} around you. You are a magnet for {goal_data['themes'][0]}.
"""
        else:  # 20+ minutes
            body = f"""
Begin by taking three deep, cleansing breaths. Inhale through your nose, filling your lungs completely. Exhale through your mouth, releasing all tension.

Scan your body from the crown of your head down to your toes. Notice any areas holding tension. Breathe into these areas, imagining the breath as healing light, dissolving any blocks.

Now, bring your full attention to your {chakra_name.replace('_', ' ')} chakra, located at {chakra_data['location']}. Visualize a beautiful, spinning wheel of {chakra_data['color']} light.

This chakra is the center of {', '.join(chakra_data['qualities'])}. As you breathe, see this wheel spinning faster and brighter, perfectly balanced and aligned.

The {chakra_data['color']} light begins to expand, filling your entire body. Every cell is bathed in this healing, empowering energy. You feel {goal_data['themes'][0]} flowing through you.

Now, imagine this light extending beyond your physical body, creating a radiant aura around you. This is your field of {goal_data['name'].lower()}. It attracts {goal_data['themes'][1]} and {goal_data['themes'][2]} to you effortlessly.

You are connected to the infinite source of {goal_data['element']} energy. The universe supports your intention for {goal_data['name'].lower()}.
"""
        
        # Visualization
        visualizations = {
            "money": "See yourself living in abundance. Your needs are met, your desires fulfilled. Feel the security and freedom that prosperity brings.",
            "love": "See yourself surrounded by loving relationships. Your heart is open, giving and receiving love freely. Feel the warmth of connection.",
            "health": "See yourself vibrant and healthy. Your body is strong, your energy high. Feel the vitality flowing through every cell.",
            "peace": "See yourself in perfect calm. Your mind is clear, your heart at ease. Feel the serenity that comes from inner peace.",
            "success": "See yourself achieving your goals. Your efforts bear fruit, your dreams manifest. Feel the satisfaction of accomplishment.",
            "protection": "See yourself surrounded by a shield of white light. You are safe, secure, and protected. Feel the strength of divine protection.",
            "creativity": "See creative ideas flowing through you like a river. Your imagination is limitless. Feel the joy of creative expression.",
            "wisdom": "See yourself making wise decisions with clarity. Your intuition is strong and clear. Feel the confidence of inner knowing."
        }
        
        visualization = visualizations.get(goal, "")
        
        # Format affirmations
        affirmation_text = "\n".join([f"'{aff}'" for aff in affirmations])
        
        # Personalization
        personalization = ""
        if natal_chart:
            try:
                # Get relevant planetary positions
                planets = natal_chart.get("planets", {})
                relevant_planets = goal_data.get("planets", [])
                
                planet_notes = []
                for planet in relevant_planets:
                    planet_lower = planet.lower()
                    if planet_lower in planets:
                        planet_data = planets[planet_lower]
                        sign = planet_data.get("sign", "")
                        planet_notes.append(f"Your natal {planet} in {sign} supports this intention")
                
                if planet_notes:
                    personalization = "\n\nPersonal Note: " + ". ".join(planet_notes) + "."
            except Exception as e:
                logger.warning(f"Could not personalize meditation: {str(e)}")
        
        # Assemble script
        script = f"""{opening}

Find a comfortable seated position, either on a chair with feet flat on the floor or cross-legged on a cushion. Lengthen your spine, relax your shoulders, and rest your hands gently on your knees or in your lap.

Close your eyes softly. Take a deep breath in through your nose... and out through your mouth. Again, breathe in deeply... and release completely.

{body}

{visualization}

Now, as you continue to breathe naturally, repeat these affirmations silently or aloud. Feel the truth of each statement:

{affirmation_text}

Allow these affirmations to sink deep into your subconscious mind. They are planting seeds that will grow and manifest in your life.{personalization}

Take a few more deep breaths, feeling gratitude for this time you've given yourself. Thank your body, your mind, and your spirit for this practice.

When you're ready, gently wiggle your fingers and toes. Slowly open your eyes, carrying this {goal_data['name'].lower()} energy with you throughout your day.

Namaste.
"""
        
        return script.strip()
    
    def _get_best_meditation_time(self, goal: str, natal_chart: Optional[Any]) -> str:
        """Determine best time for meditation based on goal"""
        
        time_recommendations = {
            "money": "Morning (6-9 AM) or during waxing moon",
            "love": "Evening (6-9 PM) or during full moon",
            "health": "Morning (sunrise) or noon",
            "peace": "Evening (sunset) or before bed",
            "success": "Morning (sunrise) or noon",
            "protection": "Night (before sleep) or during waning moon",
            "creativity": "Afternoon (2-5 PM) or during new moon",
            "wisdom": "Early morning (4-6 AM) or during quiet hours"
        }
        
        return time_recommendations.get(goal, "Anytime that feels right for you")
    
    def get_lunar_ritual(
        self,
        phase: str,
        natal_chart: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Get lunar phase ritual
        
        Args:
            phase: Lunar phase (new_moon, full_moon, waxing_moon, waning_moon)
            natal_chart: User's natal chart for personalization
        
        Returns:
            Dictionary with ritual details
        """
        try:
            if phase not in self.lunar_rituals:
                raise ValueError(f"Invalid lunar phase: {phase}")
            
            ritual_data = self.lunar_rituals[phase].copy()
            
            # Convert steps to proper format
            steps = []
            for step_data in ritual_data["steps"]:
                steps.append({
                    "step": step_data["step"],
                    "title": step_data["title"],
                    "description": step_data["description"],
                    "duration": step_data["duration"]
                })
            
            is_personalized = False
            personalization_notes = None
            
            # Personalize if natal chart provided
            if natal_chart:
                is_personalized = True
                personalization_notes = self._personalize_lunar_ritual(phase, natal_chart)
            
            return {
                "name": ritual_data["name"],
                "phase": phase,
                "purpose": ritual_data["purpose"],
                "duration": ritual_data["duration"],
                "best_time": ritual_data["best_time"],
                "items_needed": ritual_data["items_needed"],
                "steps": steps,
                "affirmations": ritual_data["affirmations"],
                "is_personalized": is_personalized,
                "personalization_notes": personalization_notes
            }
            
        except Exception as e:
            logger.error(f"Error getting lunar ritual: {str(e)}")
            raise
    
    def _personalize_lunar_ritual(self, phase: str, natal_chart: Any) -> str:
        """Add personalization notes to lunar ritual"""
        try:
            planets = natal_chart.get("planets", {})
            
            # Get Moon sign from natal chart
            moon = planets.get("moon", {})
            moon_sign = moon.get("sign", "")
            
            notes = []
            
            if moon_sign:
                notes.append(f"With your natal Moon in {moon_sign}, this {phase.replace('_', ' ')} ritual resonates especially well with your emotional nature.")
            
            # Phase-specific personalization
            if phase == "new_moon":
                sun = planets.get("sun", {})
                sun_sign = sun.get("sign", "")
                if sun_sign:
                    notes.append(f"As a {sun_sign}, focus your new moon intentions on {self._get_sign_focus(sun_sign)}.")
            
            elif phase == "full_moon":
                if moon_sign:
                    notes.append(f"Your {moon_sign} Moon may feel particularly emotional during the full moon. Honor these feelings in your release ceremony.")
            
            return " ".join(notes) if notes else None
            
        except Exception as e:
            logger.warning(f"Could not personalize lunar ritual: {str(e)}")
            return None
    
    def _get_sign_focus(self, sign: str) -> str:
        """Get focus area for zodiac sign"""
        focus_areas = {
            "Aries": "leadership and new beginnings",
            "Taurus": "financial stability and sensual pleasures",
            "Gemini": "communication and learning",
            "Cancer": "home and emotional security",
            "Leo": "creativity and self-expression",
            "Virgo": "health and organization",
            "Libra": "relationships and balance",
            "Scorpio": "transformation and deep healing",
            "Sagittarius": "adventure and expansion",
            "Capricorn": "career and long-term goals",
            "Aquarius": "innovation and community",
            "Pisces": "spirituality and compassion"
        }
        return focus_areas.get(sign, "personal growth")
    
    def generate_daily_affirmations(
        self,
        count: int = 3,
        natal_chart: Optional[Any] = None,
        current_moon_sign: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate daily affirmations
        
        Args:
            count: Number of affirmations to generate
            natal_chart: User's natal chart for personalization
            current_moon_sign: Current moon sign
        
        Returns:
            Dictionary with daily affirmations
        """
        try:
            today = date.today()
            affirmations = []
            zodiac_sign = None
            is_personalized = False
            
            # Get user's sun sign from natal chart
            if natal_chart:
                is_personalized = True
                planets = natal_chart.get("planets", {})
                sun = planets.get("sun", {})
                zodiac_sign = sun.get("sign", "")
                
                if zodiac_sign and zodiac_sign in self.zodiac_affirmations:
                    # Get affirmations for user's sign
                    sign_affirmations = self.zodiac_affirmations[zodiac_sign]
                    affirmations.extend(random.sample(sign_affirmations, min(count, len(sign_affirmations))))
            
            # If not enough affirmations or no natal chart, add general ones
            if len(affirmations) < count:
                general_affirmations = [
                    "I am exactly where I need to be",
                    "I trust the journey of my life",
                    "I am open to receiving abundance",
                    "I radiate positive energy",
                    "I am grateful for this day",
                    "I choose peace and joy",
                    "I am worthy of all good things",
                    "I trust my intuition",
                    "I am growing and evolving",
                    "I embrace change with grace"
                ]
                needed = count - len(affirmations)
                affirmations.extend(random.sample(general_affirmations, min(needed, len(general_affirmations))))
            
            # Determine theme based on day of week
            themes = {
                0: "New Beginnings",  # Monday
                1: "Balance and Harmony",  # Tuesday
                2: "Communication and Connection",  # Wednesday
                3: "Growth and Expansion",  # Thursday
                4: "Love and Beauty",  # Friday
                5: "Wisdom and Discipline",  # Saturday
                6: "Rest and Spirituality"  # Sunday
            }
            theme = themes[today.weekday()]
            
            return {
                "date": today,
                "affirmations": affirmations[:count],
                "zodiac_sign": zodiac_sign,
                "moon_sign": current_moon_sign,
                "is_personalized": is_personalized,
                "theme": theme
            }
            
        except Exception as e:
            logger.error(f"Error generating daily affirmations: {str(e)}")
            raise
    
    def get_ritual_library(self) -> Dict[str, Any]:
        """
        Get library of available rituals
        
        Returns:
            Dictionary with ritual library
        """
        try:
            rituals = []
            
            # Add lunar rituals
            for phase, ritual_data in self.lunar_rituals.items():
                rituals.append({
                    "id": f"lunar_{phase}",
                    "name": ritual_data["name"],
                    "category": "lunar",
                    "purpose": ritual_data["purpose"],
                    "duration": ritual_data["duration"],
                    "difficulty": "beginner",
                    "requires_items": True
                })
            
            # Add meditation practices
            for goal, goal_data in self.meditation_goals.items():
                rituals.append({
                    "id": f"meditation_{goal}",
                    "name": f"{goal_data['name']} Meditation",
                    "category": "meditation",
                    "purpose": f"Meditation for {goal_data['name'].lower()}",
                    "duration": "5-20 minutes",
                    "difficulty": "beginner",
                    "requires_items": False
                })
            
            categories = ["lunar", "meditation"]
            
            return {
                "rituals": rituals,
                "total": len(rituals),
                "categories": categories
            }
            
        except Exception as e:
            logger.error(f"Error getting ritual library: {str(e)}")
            raise
    
    def get_ritual_recommendations(
        self,
        natal_chart: Any,
        current_lunar_phase: str,
        current_transits: Optional[Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Get personalized ritual recommendations
        
        Args:
            natal_chart: User's natal chart
            current_lunar_phase: Current lunar phase
            current_transits: Current planetary transits
        
        Returns:
            List of recommended rituals
        """
        try:
            recommendations = []
            
            # Always recommend current lunar phase ritual
            recommendations.append({
                "ritual_id": f"lunar_{current_lunar_phase}",
                "ritual_name": self.lunar_rituals[current_lunar_phase]["name"],
                "reason": f"The {current_lunar_phase.replace('_', ' ')} is happening now - perfect time for this ritual",
                "best_date": date.today(),
                "priority": "high"
            })
            
            # Analyze natal chart for recommendations
            planets = natal_chart.get("planets", {})
            
            # Check for challenging aspects - recommend peace/protection
            if self._has_challenging_aspects(natal_chart):
                recommendations.append({
                    "ritual_id": "meditation_peace",
                    "ritual_name": "Inner Peace and Calm Meditation",
                    "reason": "Your chart shows some tension - this meditation will help bring balance",
                    "best_date": None,
                    "priority": "medium"
                })
            
            # Check Venus for love meditations
            venus = planets.get("venus", {})
            if venus:
                recommendations.append({
                    "ritual_id": "meditation_love",
                    "ritual_name": "Love and Relationships Meditation",
                    "reason": "Venus in your chart suggests focusing on love and relationships",
                    "best_date": None,
                    "priority": "medium"
                })
            
            # Check Jupiter for success/prosperity
            jupiter = planets.get("jupiter", {})
            if jupiter:
                recommendations.append({
                    "ritual_id": "meditation_money",
                    "ritual_name": "Prosperity and Abundance Meditation",
                    "reason": "Jupiter's placement supports prosperity work",
                    "best_date": None,
                    "priority": "medium"
                })
            
            return recommendations[:5]  # Return top 5
            
        except Exception as e:
            logger.error(f"Error getting ritual recommendations: {str(e)}")
            return []
    
    def _has_challenging_aspects(self, natal_chart: Any) -> bool:
        """Check if natal chart has challenging aspects"""
        try:
            aspects = natal_chart.get("aspects", [])
            challenging_types = ["square", "opposition"]
            
            for aspect in aspects:
                if aspect.get("type", "").lower() in challenging_types:
                    return True
            
            return False
        except:
            return False


# Global service instance
rituals_service = RitualsService()
