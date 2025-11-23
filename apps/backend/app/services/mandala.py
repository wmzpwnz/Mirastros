"""Mandala Generation Service"""

from datetime import datetime, date
from typing import Dict, Any, List
import math
from app.services.llm import llm_service


class MandalaService:
    """Service for personalized mandala generation"""
    
    def __init__(self):
        self.llm = llm_service
        self.zodiac_colors = {
            "Aries": ["#FF0000", "#FF6B6B"],
            "Taurus": ["#00FF00", "#90EE90"],
            "Gemini": ["#FFFF00", "#FFD700"],
            "Cancer": ["#C0C0C0", "#E8E8E8"],
            "Leo": ["#FFD700", "#FFA500"],
            "Virgo": ["#8B4513", "#D2691E"],
            "Libra": ["#FFB6C1", "#FF69B4"],
            "Scorpio": ["#8B0000", "#DC143C"],
            "Sagittarius": ["#800080", "#9370DB"],
            "Capricorn": ["#000000", "#696969"],
            "Aquarius": ["#00FFFF", "#87CEEB"],
            "Pisces": ["#4B0082", "#9370DB"]
        }
    
    def _get_zodiac_sign(self, birth_date: date) -> str:
        """Get zodiac sign from birth date"""
        month, day = birth_date.month, birth_date.day
        
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return "Aries"
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return "Taurus"
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return "Gemini"
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return "Cancer"
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return "Leo"
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return "Virgo"
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return "Libra"
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return "Scorpio"
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return "Sagittarius"
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return "Capricorn"
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return "Aquarius"
        else:
            return "Pisces"
    
    def _generate_svg_mandala(self, colors: List[str], num_petals: int) -> str:
        """Generate SVG mandala"""
        size = 400
        center = size // 2
        
        svg_parts = [
            f'<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">',
            f'<rect width="{size}" height="{size}" fill="#FFFFFF"/>',
            f'<circle cx="{center}" cy="{center}" r="{center - 20}" fill="{colors[0]}" opacity="0.1"/>'
        ]
        
        # Generate petals
        for i in range(num_petals):
            angle = (2 * math.pi * i) / num_petals
            x = center + (center - 60) * math.cos(angle)
            y = center + (center - 60) * math.sin(angle)
            color = colors[i % len(colors)]
            svg_parts.append(
                f'<circle cx="{x:.2f}" cy="{y:.2f}" r="40" fill="{color}" opacity="0.6"/>'
            )
        
        # Center circle
        svg_parts.append(f'<circle cx="{center}" cy="{center}" r="50" fill="{colors[-1]}" opacity="0.8"/>')
        svg_parts.append(f'<circle cx="{center}" cy="{center}" r="30" fill="#FFFFFF"/>')
        
        svg_parts.append('</svg>')
        return ''.join(svg_parts)
    
    async def generate_mandala(self, birth_date: date, intention: str) -> Dict[str, Any]:
        """
        Generate personalized mandala
        
        Args:
            birth_date: User's birth date
            intention: Meditation intention
            
        Returns:
            Dictionary with mandala data
        """
        # Get zodiac sign and colors
        zodiac = self._get_zodiac_sign(birth_date)
        colors = self.zodiac_colors.get(zodiac, ["#FFD700", "#FFA500"])
        
        # Calculate number of petals based on birth date
        life_path = sum(int(d) for d in str(birth_date.day) + str(birth_date.month) + str(birth_date.year))
        while life_path > 9 and life_path not in [11, 22, 33]:
            life_path = sum(int(d) for d in str(life_path))
        
        num_petals = life_path * 2  # 2-18 petals
        
        # Generate symbols based on zodiac
        symbols = [
            f"{zodiac} energy",
            "Sacred geometry",
            f"{num_petals}-fold symmetry",
            "Cosmic unity"
        ]
        
        # Generate AI meditation instructions
        prompt = f"""You are a meditation guide. Create meditation instructions for a personalized mandala.

Birth Date: {birth_date}
Zodiac Sign: {zodiac}
Intention: {intention}
Mandala Colors: {', '.join(colors)}
Number of Petals: {num_petals}

Provide:
1. Step-by-step meditation instructions (5-7 steps)
2. How to use the mandala for meditation
3. Breathing techniques
4. Visualization guidance
5. A powerful affirmation related to their intention

Keep the instructions clear, calming, and transformative."""

        meditation_instructions = await self.llm.generate(prompt)
        
        # Generate affirmation
        affirmation = f"I am aligned with {intention}. My energy flows in perfect harmony with the universe."
        
        # Generate SVG mandala
        svg_data = self._generate_svg_mandala(colors, num_petals)
        
        # Generate description
        mandala_description = f"A personalized {zodiac} mandala with {num_petals} petals, designed to support your intention of {intention}. The colors {' and '.join(colors)} resonate with your birth energy."
        
        return {
            "birth_date": birth_date.isoformat(),
            "intention": intention,
            "mandala_description": mandala_description,
            "colors": colors,
            "symbols": symbols,
            "meditation_instructions": meditation_instructions,
            "affirmation": affirmation,
            "svg_data": svg_data,
            "timestamp": datetime.now().isoformat()
        }


# Singleton instance
mandala_service = MandalaService()
