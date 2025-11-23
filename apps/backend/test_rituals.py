"""Test script for rituals service"""
import asyncio
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.rituals import rituals_service
from app.services.lunar import lunar_service
from datetime import date


async def test_meditation_generation():
    """Test meditation script generation"""
    print("\n" + "="*80)
    print("TEST: Meditation Script Generation")
    print("="*80)
    
    goals = ["money", "love", "health", "peace"]
    
    for goal in goals:
        print(f"\n--- Testing {goal.upper()} meditation ---")
        try:
            result = rituals_service.generate_meditation_script(
                goal=goal,
                duration=10,
                natal_chart=None
            )
            
            print(f"✅ Goal: {result['goal']}")
            print(f"✅ Duration: {result['duration']} minutes")
            print(f"✅ Chakra: {result['chakra']}")
            print(f"✅ Element: {result['element']}")
            print(f"✅ Best Time: {result['best_time']}")
            print(f"✅ Affirmations: {len(result['affirmations'])} affirmations")
            print(f"✅ Script Length: {len(result['script'])} characters")
            print(f"\nFirst 200 characters of script:")
            print(result['script'][:200] + "...")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n✅ Meditation generation test completed")


async def test_lunar_rituals():
    """Test lunar ritual retrieval"""
    print("\n" + "="*80)
    print("TEST: Lunar Rituals")
    print("="*80)
    
    phases = ["new_moon", "full_moon", "waxing_moon", "waning_moon"]
    
    for phase in phases:
        print(f"\n--- Testing {phase.replace('_', ' ').upper()} ritual ---")
        try:
            result = rituals_service.get_lunar_ritual(
                phase=phase,
                natal_chart=None
            )
            
            print(f"✅ Name: {result['name']}")
            print(f"✅ Purpose: {result['purpose']}")
            print(f"✅ Duration: {result['duration']}")
            print(f"✅ Best Time: {result['best_time']}")
            print(f"✅ Items Needed: {len(result['items_needed'])} items")
            print(f"✅ Steps: {len(result['steps'])} steps")
            print(f"✅ Affirmations: {len(result['affirmations'])} affirmations")
            
            print(f"\nFirst step:")
            if result['steps']:
                step = result['steps'][0]
                print(f"  {step['step']}. {step['title']}")
                print(f"     {step['description'][:100]}...")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n✅ Lunar rituals test completed")


async def test_daily_affirmations():
    """Test daily affirmations generation"""
    print("\n" + "="*80)
    print("TEST: Daily Affirmations")
    print("="*80)
    
    try:
        # Test without natal chart
        result = rituals_service.generate_daily_affirmations(
            count=5,
            natal_chart=None,
            current_moon_sign="Pisces"
        )
        
        print(f"✅ Date: {result['date']}")
        print(f"✅ Theme: {result['theme']}")
        print(f"✅ Moon Sign: {result['moon_sign']}")
        print(f"✅ Is Personalized: {result['is_personalized']}")
        print(f"✅ Affirmations ({len(result['affirmations'])}):")
        for i, aff in enumerate(result['affirmations'], 1):
            print(f"   {i}. {aff}")
        
        # Test with mock natal chart
        print("\n--- Testing with natal chart ---")
        mock_natal_chart = {
            "planets": {
                "sun": {"sign": "Leo", "position": 120.5},
                "moon": {"sign": "Cancer", "position": 95.3}
            }
        }
        
        result = rituals_service.generate_daily_affirmations(
            count=3,
            natal_chart=mock_natal_chart,
            current_moon_sign="Pisces"
        )
        
        print(f"✅ Zodiac Sign: {result['zodiac_sign']}")
        print(f"✅ Is Personalized: {result['is_personalized']}")
        print(f"✅ Affirmations ({len(result['affirmations'])}):")
        for i, aff in enumerate(result['affirmations'], 1):
            print(f"   {i}. {aff}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Daily affirmations test completed")


async def test_ritual_library():
    """Test ritual library"""
    print("\n" + "="*80)
    print("TEST: Ritual Library")
    print("="*80)
    
    try:
        result = rituals_service.get_ritual_library()
        
        print(f"✅ Total Rituals: {result['total']}")
        print(f"✅ Categories: {', '.join(result['categories'])}")
        
        print(f"\nFirst 5 rituals:")
        for ritual in result['rituals'][:5]:
            print(f"  - {ritual['name']} ({ritual['category']})")
            print(f"    Purpose: {ritual['purpose']}")
            print(f"    Duration: {ritual['duration']}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Ritual library test completed")


async def test_ritual_recommendations():
    """Test ritual recommendations"""
    print("\n" + "="*80)
    print("TEST: Ritual Recommendations")
    print("="*80)
    
    try:
        # Mock natal chart with some aspects
        mock_natal_chart = {
            "planets": {
                "sun": {"sign": "Aries", "position": 15.5},
                "moon": {"sign": "Pisces", "position": 340.2},
                "venus": {"sign": "Taurus", "position": 45.8},
                "jupiter": {"sign": "Sagittarius", "position": 265.3}
            },
            "aspects": [
                {"planet1": "sun", "planet2": "mars", "type": "square", "orb": 2.5},
                {"planet1": "moon", "planet2": "venus", "type": "trine", "orb": 1.2}
            ]
        }
        
        # Get current lunar phase
        lunar_data = lunar_service.calculate_lunar_phase()
        current_phase = lunar_data["phase"]
        
        print(f"Current Lunar Phase: {lunar_data['phase_name']}")
        
        recommendations = rituals_service.get_ritual_recommendations(
            natal_chart=mock_natal_chart,
            current_lunar_phase=current_phase,
            current_transits=None
        )
        
        print(f"\n✅ Recommendations: {len(recommendations)}")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['ritual_name']}")
            print(f"   Priority: {rec['priority']}")
            print(f"   Reason: {rec['reason']}")
            if rec['best_date']:
                print(f"   Best Date: {rec['best_date']}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Ritual recommendations test completed")


async def test_current_lunar_ritual():
    """Test getting ritual for current lunar phase"""
    print("\n" + "="*80)
    print("TEST: Current Lunar Ritual")
    print("="*80)
    
    try:
        # Get current lunar phase
        lunar_data = lunar_service.calculate_lunar_phase()
        current_phase = lunar_data["phase"]
        
        print(f"Current Lunar Phase: {lunar_data['phase_name']}")
        print(f"Moon in: {lunar_data['zodiac_sign']}")
        print(f"Illumination: {lunar_data['illumination']:.1f}%")
        
        # Get ritual for current phase
        result = rituals_service.get_lunar_ritual(
            phase=current_phase,
            natal_chart=None
        )
        
        print(f"\n✅ Ritual: {result['name']}")
        print(f"✅ Purpose: {result['purpose']}")
        print(f"✅ Duration: {result['duration']}")
        print(f"✅ Best Time: {result['best_time']}")
        print(f"\nItems needed:")
        for item in result['items_needed']:
            print(f"  - {item}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n✅ Current lunar ritual test completed")


async def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("RITUALS SERVICE TEST SUITE")
    print("="*80)
    
    try:
        await test_meditation_generation()
        await test_lunar_rituals()
        await test_daily_affirmations()
        await test_ritual_library()
        await test_ritual_recommendations()
        await test_current_lunar_ritual()
        
        print("\n" + "="*80)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
