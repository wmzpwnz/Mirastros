"""Horary Astrology Service"""

from datetime import datetime
from typing import Dict, Any
from kerykeion import AstrologicalSubject
from app.services.llm import llm_service


class HoraryService:
    """Service for horary astrology calculations and interpretations"""
    
    def __init__(self):
        self.llm = llm_service
    
    async def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Answer a horary astrology question
        
        Args:
            question: The specific question to answer
            
        Returns:
            Dictionary with answer, timing, chart data, and interpretation
        """
        # Get current moment for horary chart
        now = datetime.now()
        
        # Calculate horary chart for the moment of question
        # Using a default location (can be customized based on user location)
        chart = AstrologicalSubject(
            name="Horary Question",
            year=now.year,
            month=now.month,
            day=now.day,
            hour=now.hour,
            minute=now.minute,
            city="Moscow",
            nation="RU",
            lng=37.6173,
            lat=55.7558,
            tz_str="Europe/Moscow"
        )
        
        # Extract chart data
        chart_data = {
            "sun": {"sign": chart.sun["sign"], "position": chart.sun["position"]},
            "moon": {"sign": chart.moon["sign"], "position": chart.moon["position"]},
            "ascendant": {"sign": chart.first_house["sign"], "position": chart.first_house["position"]},
            "houses": [
                {"number": i+1, "sign": house["sign"], "position": house["position"]}
                for i, house in enumerate([
                    chart.first_house, chart.second_house, chart.third_house,
                    chart.fourth_house, chart.fifth_house, chart.sixth_house,
                    chart.seventh_house, chart.eighth_house, chart.ninth_house,
                    chart.tenth_house, chart.eleventh_house, chart.twelfth_house
                ])
            ]
        }
        
        # Generate AI interpretation
        prompt = f"""You are an expert horary astrologer. A person has asked: "{question}"

The horary chart for this question shows:
- Sun in {chart.sun['sign']} at {chart.sun['position']:.2f}°
- Moon in {chart.moon['sign']} at {chart.moon['position']:.2f}°
- Ascendant in {chart.first_house['sign']} at {chart.first_house['position']:.2f}°

Using traditional horary astrology rules:
1. Provide a clear YES or NO answer
2. Explain the reasoning based on the chart
3. Estimate timing if applicable (days, weeks, months)
4. Give practical advice

Keep the response concise and actionable."""

        interpretation = await self.llm.generate(prompt)
        
        # Extract answer (simple heuristic based on Moon-Sun aspect)
        moon_pos = chart.moon['position']
        sun_pos = chart.sun['position']
        aspect_diff = abs(moon_pos - sun_pos)
        
        # Simplified yes/no logic (in real horary, this is much more complex)
        if aspect_diff < 10 or (aspect_diff > 110 and aspect_diff < 130):  # Conjunction or trine
            answer = "YES"
            timing = "Within 1-3 months"
        elif aspect_diff > 170 or (aspect_diff > 80 and aspect_diff < 100):  # Opposition or square
            answer = "NO"
            timing = "Not in the near future"
        else:
            answer = "UNCERTAIN"
            timing = "Timing is unclear"
        
        return {
            "question": question,
            "answer": answer,
            "timing": timing,
            "chart_data": chart_data,
            "interpretation": interpretation,
            "timestamp": now.isoformat()
        }


# Singleton instance
horary_service = HoraryService()
