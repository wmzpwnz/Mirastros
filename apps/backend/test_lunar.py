"""Test script for lunar calendar service"""
import asyncio
from datetime import date, timedelta
from app.services.lunar import lunar_service


async def test_lunar_service():
    """Test lunar calendar service functionality"""
    
    print("=" * 80)
    print("LUNAR CALENDAR SERVICE TEST")
    print("=" * 80)
    
    # Test 1: Calculate current lunar phase
    print("\n1. Testing current lunar phase calculation...")
    print("-" * 80)
    
    lunar_data = lunar_service.calculate_lunar_phase()
    print(f"Date: {lunar_data['date']}")
    print(f"Phase: {lunar_data['phase_name']}")
    print(f"Illumination: {lunar_data['illumination']}%")
    print(f"Moon Sign: {lunar_data['zodiac_sign']}")
    print(f"Moon Degree: {lunar_data['moon_degree']}°")
    print(f"Next Full Moon: {lunar_data['next_full_moon']}")
    print(f"Next New Moon: {lunar_data['next_new_moon']}")
    print(f"\nDescription: {lunar_data['description']}")
    
    # Test 2: Generate activity recommendations
    print("\n2. Testing activity recommendations...")
    print("-" * 80)
    
    recommendations = lunar_service.generate_activity_recommendations()
    print(f"Date: {recommendations['date']}")
    print(f"Lunar Phase: {recommendations['lunar_phase']}")
    print(f"Moon Sign: {recommendations['moon_sign']}")
    print(f"\nGeneral Advice:\n{recommendations['general_advice']}")
    
    print("\nActivity Recommendations:")
    for rec in recommendations['recommendations']:
        print(f"\n  {rec['activity'].upper()}")
        print(f"  Favorability: {rec['favorability']} (Score: {rec['score']}/100)")
        print(f"  {rec['recommendation']}")
    
    # Test 3: Generate lunar calendar
    print("\n3. Testing lunar calendar generation (7 days)...")
    print("-" * 80)
    
    calendar = lunar_service.generate_lunar_calendar(
        start_date=date.today(),
        days=7
    )
    
    print(f"Calendar Period: {calendar['start_date']} to {calendar['end_date']}")
    print(f"\nSpecial Events: {len(calendar['special_events'])}")
    for event in calendar['special_events']:
        print(f"  - {event['description']} on {event['date']}")
    
    print("\nDaily Overview:")
    for day in calendar['days']:
        print(f"\n  {day['date']} - {day['lunar_phase']} in {day['moon_sign']}")
        print(f"  Illumination: {day['illumination']}% | Energy: {day['energy_level']}")
        print(f"  Favorable: {', '.join(day['favorable_activities'][:3])}")
        print(f"  Unfavorable: {', '.join(day['unfavorable_activities'][:3])}")
    
    # Test 4: Test specific dates
    print("\n4. Testing specific lunar phases...")
    print("-" * 80)
    
    # Test a range of dates to find different phases
    test_dates = [date.today() + timedelta(days=i) for i in range(0, 30, 3)]
    
    phases_found = set()
    for test_date in test_dates:
        lunar_data = lunar_service.calculate_lunar_phase(test_date)
        phase = lunar_data['phase']
        if phase not in phases_found:
            phases_found.add(phase)
            print(f"\n  {test_date}: {lunar_data['phase_name']}")
            print(f"  Moon in {lunar_data['zodiac_sign']} ({lunar_data['illumination']}% illuminated)")
    
    print(f"\n  Found {len(phases_found)} different lunar phases in 30-day period")
    
    # Test 5: Test activity scoring
    print("\n5. Testing activity scoring across phases...")
    print("-" * 80)
    
    activities_to_test = ["haircut", "wedding", "business", "surgery", "spiritual"]
    
    for activity in activities_to_test:
        scores = []
        for i in range(0, 30, 5):
            test_date = date.today() + timedelta(days=i)
            recs = lunar_service.generate_activity_recommendations(test_date)
            for rec in recs['recommendations']:
                if rec['activity'] == activity:
                    scores.append((test_date, rec['score'], recs['lunar_phase']))
                    break
        
        print(f"\n  {activity.upper()} scores over 30 days:")
        for test_date, score, phase in scores:
            print(f"    {test_date} ({phase}): {score}/100")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_lunar_service())
