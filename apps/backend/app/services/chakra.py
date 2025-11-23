"""Chakra Analysis Service"""

from datetime import datetime, date
from typing import Dict, Any, List
from app.data.chakra import CHAKRAS
from app.services.llm import llm_service


class ChakraService:
    """Service for chakra analysis based on birth date"""
    
    def __init__(self):
        self.llm = llm_service
        self.chakras_data = CHAKRAS
    
    def _calculate_chakra_status(self, birth_date: date, chakra_index: int) -> Dict[str, Any]:
        """
        Calculate chakra status based on birth date numerology
        
        Args:
            birth_date: User's birth date
            chakra_index: Index of chakra (0-6)
            
        Returns:
            Dictionary with status and percentage
        """
        # Use birth date numerology to determine chakra balance
        day = birth_date.day
        month = birth_date.month
        year = birth_date.year
        
        # Calculate life path number
        life_path = sum(int(d) for d in str(day) + str(month) + str(year))
        while life_path > 9 and life_path not in [11, 22, 33]:
            life_path = sum(int(d) for d in str(life_path))
        
        # Each chakra is influenced by different aspects of birth date
        chakra_number = (day + month + chakra_index) % 9 + 1
        
        # Determine status based on numerology
        if chakra_number in [1, 5, 9]:  # Strong numbers
            status = "balanced"
            percentage = 75 + (chakra_number % 3) * 8
        elif chakra_number in [2, 6]:  # Moderate numbers
            status = "overactive"
            percentage = 60 + (chakra_number % 2) * 10
        else:  # Weak numbers
            status = "blocked"
            percentage = 40 + (chakra_number % 3) * 10
        
        return {"status": status, "percentage": percentage}
    
    async def analyze_chakras(self, birth_date: date) -> Dict[str, Any]:
        """
        Analyze all chakras based on birth date
        
        Args:
            birth_date: User's birth date
            
        Returns:
            Dictionary with chakra analysis
        """
        chakras_info = []
        total_balance = 0
        
        for i, chakra_data in enumerate(self.chakras_data):
            status_info = self._calculate_chakra_status(birth_date, i)
            
            chakra_info = {
                "name": chakra_data["name"],
                "sanskrit_name": chakra_data["sanskrit_name"],
                "color": chakra_data["color"],
                "location": chakra_data["location"],
                "status": status_info["status"],
                "percentage": status_info["percentage"],
                "description": f"{chakra_data['name']} governs {', '.join(chakra_data['keywords'])}",
                "balancing_practices": chakra_data["balancing_practices"]
            }
            
            chakras_info.append(chakra_info)
            total_balance += status_info["percentage"]
        
        overall_balance = total_balance // len(self.chakras_data)
        
        # Generate AI interpretation
        chakra_summary = "\n".join([
            f"- {c['name']} ({c['sanskrit_name']}): {c['status']} at {c['percentage']}%"
            for c in chakras_info
        ])
        
        prompt = f"""You are an expert energy healer and chakra specialist. Analyze this person's chakra system:

Birth Date: {birth_date}
Overall Balance: {overall_balance}%

Chakra Status:
{chakra_summary}

Provide:
1. A comprehensive interpretation of their energy system
2. Identify the most blocked chakras and their life impact
3. Explain how their birth date influences their chakras
4. Give 3-5 specific recommendations for overall balance

Keep the response compassionate, insightful, and actionable."""

        interpretation = await self.llm.generate(prompt)
        
        # Generate recommendations based on most blocked chakras
        blocked_chakras = [c for c in chakras_info if c["status"] == "blocked"]
        recommendations = []
        
        if blocked_chakras:
            for chakra in blocked_chakras[:2]:  # Top 2 blocked
                recommendations.extend(chakra["balancing_practices"][:2])
        else:
            recommendations = [
                "Continue your current spiritual practices",
                "Maintain balance through regular meditation",
                "Stay grounded with nature walks"
            ]
        
        return {
            "birth_date": birth_date.isoformat(),
            "chakras": chakras_info,
            "overall_balance": overall_balance,
            "interpretation": interpretation,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }


# Singleton instance
chakra_service = ChakraService()
