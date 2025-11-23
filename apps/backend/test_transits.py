"""Test script for transits service"""
import asyncio
from datetime import date, time
from app.services.transits import transits_service
from app.services.natal_chart import natal_chart_service


async def test_current_transits():
    """Test current transits calculation"""
    print("\n" + "="*60)
    print("Testing Current Transits")
    print("="*60)
    
    try:
        # Get current transits
        transits = transits_service.calculate_current_transits()
        
        print(f"\nDate: {transits['date']}")
        print(f"Lunar Phase: {transits['lunar_phase']} ({transits['lunar_phase_percentage']}%)")
        print("\nPlanetary Positions:")
        
        for planet, data in transits['planetary_positions'].items():
            retrograde = " (R)" if data['retrograde'] else ""
            print(f"  {planet.capitalize():12} {data['sign']:12} {data['degree']:6.2f}°{retrograde}")
        
        print("\n✅ Current transits test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Current transits test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_personal_transits():
    """Test personal transits calculation"""
    print("\n" + "="*60)
    print("Testing Personal Transits")
    print("="*60)
    
    try:
        # Create a sample natal chart
        print("\nCalculating sample natal chart...")
        natal_chart = natal_chart_service.calculate_chart(
            name="Test User",
            birth_date=date(1990, 6, 15),
            birth_time=time(14, 30),
            latitude=40.7128,
            longitude=-74.0060,
            city="New York",
            nation="USA"
        )
        
        print(f"Natal Sun: {natal_chart['planets']['sun']['sign']} {natal_chart['planets']['sun']['degree']:.2f}°")
        print(f"Natal Moon: {natal_chart['planets']['moon']['sign']} {natal_chart['planets']['moon']['degree']:.2f}°")
        
        # Calculate personal transits
        print("\nCalculating personal transits...")
        personal_transits = transits_service.calculate_personal_transits(
            natal_chart_data=natal_chart,
            target_date=None,  # Today
            days_ahead=30
        )
        
        print(f"\nDate: {personal_transits['date']}")
        
        # Show aspects to natal chart
        print(f"\nAspects to Natal Chart ({len(personal_transits['aspects_to_natal'])} found):")
        for i, aspect in enumerate(personal_transits['aspects_to_natal'][:5], 1):
            print(f"  {i}. Transit {aspect['transit_planet'].capitalize()} {aspect['aspect_type']} "
                  f"Natal {aspect['natal_planet'].capitalize()} "
                  f"(orb: {aspect['orb']:.2f}°, {aspect['influence']})")
        
        # Show significant transits
        print(f"\nSignificant Upcoming Transits ({len(personal_transits['significant_transits'])} found):")
        for i, transit in enumerate(personal_transits['significant_transits'][:5], 1):
            print(f"  {i}. {transit['description']} on {transit['date']} ({transit['importance']})")
        
        print("\n✅ Personal transits test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Personal transits test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_interpretation_prompt():
    """Test interpretation prompt generation"""
    print("\n" + "="*60)
    print("Testing Interpretation Prompt")
    print("="*60)
    
    try:
        # Create a sample natal chart
        natal_chart = natal_chart_service.calculate_chart(
            name="Test User",
            birth_date=date(1990, 6, 15),
            birth_time=time(14, 30),
            latitude=40.7128,
            longitude=-74.0060,
            city="New York",
            nation="USA"
        )
        
        # Calculate personal transits
        personal_transits = transits_service.calculate_personal_transits(
            natal_chart_data=natal_chart,
            target_date=None,
            days_ahead=30
        )
        
        # Generate interpretation prompt
        prompt = transits_service.generate_interpretation_prompt(
            transit_data=personal_transits,
            natal_chart_data=natal_chart,
            user_name="Test User"
        )
        
        print("\nGenerated Prompt:")
        print("-" * 60)
        print(prompt)
        print("-" * 60)
        
        print("\n✅ Interpretation prompt test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Interpretation prompt test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("TRANSITS SERVICE TEST SUITE")
    print("="*60)
    
    results = []
    
    # Run tests
    results.append(await test_current_transits())
    results.append(await test_personal_transits())
    results.append(await test_interpretation_prompt())
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
