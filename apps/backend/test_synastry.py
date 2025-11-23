"""Test script for synastry service"""
import asyncio
from datetime import date, time
from app.services.synastry import synastry_service
from app.services.natal_chart import natal_chart_service


async def test_synastry():
    """Test synastry calculation"""
    print("🔮 Testing Synastry Service\n")
    
    # Person 1: John (Aries Sun, Leo Moon)
    print("👤 Person 1: John")
    person1_chart = natal_chart_service.calculate_chart(
        name="John",
        birth_date=date(1990, 3, 25),
        birth_time=time(14, 30),
        latitude=40.7128,
        longitude=-74.0060,
        city="New York",
        nation="USA"
    )
    print(f"   Sun: {person1_chart['planets']['sun']['sign']}")
    print(f"   Moon: {person1_chart['planets']['moon']['sign']}")
    print(f"   Ascendant: {person1_chart['ascendant']['sign']}\n")
    
    # Person 2: Sarah (Libra Sun, Sagittarius Moon)
    print("👤 Person 2: Sarah")
    person2_chart = natal_chart_service.calculate_chart(
        name="Sarah",
        birth_date=date(1992, 10, 15),
        birth_time=time(9, 15),
        latitude=40.7128,
        longitude=-74.0060,
        city="New York",
        nation="USA"
    )
    print(f"   Sun: {person2_chart['planets']['sun']['sign']}")
    print(f"   Moon: {person2_chart['planets']['moon']['sign']}")
    print(f"   Ascendant: {person2_chart['ascendant']['sign']}\n")
    
    # Calculate synastry
    print("💕 Calculating Synastry (Romantic Relationship)...\n")
    synastry_data = synastry_service.calculate_synastry(
        person1_chart=person1_chart,
        person2_chart=person2_chart,
        relationship_type="romantic"
    )
    
    # Display results
    print("=" * 60)
    print("COMPATIBILITY SCORES")
    print("=" * 60)
    compatibility = synastry_data["compatibility"]
    print(f"Overall:       {compatibility['overall_score']:.1f}%")
    print(f"Emotional:     {compatibility['emotional_compatibility']:.1f}%")
    print(f"Intellectual:  {compatibility['intellectual_compatibility']:.1f}%")
    print(f"Physical:      {compatibility['physical_compatibility']:.1f}%")
    print(f"Spiritual:     {compatibility['spiritual_compatibility']:.1f}%")
    print()
    
    # Display key aspects
    print("=" * 60)
    print("KEY INTER-CHART ASPECTS")
    print("=" * 60)
    key_aspects = [a for a in synastry_data["aspects"] if a["orb"] < 5][:10]
    for aspect in key_aspects:
        nature_emoji = "✨" if aspect["nature"] == "harmonious" else "⚡"
        print(f"{nature_emoji} {aspect['description']}")
        print(f"   Type: {aspect['aspect_type'].capitalize()}, Orb: {aspect['orb']:.1f}°")
    print()
    
    # Display strengths
    print("=" * 60)
    print("RELATIONSHIP STRENGTHS")
    print("=" * 60)
    for i, strength in enumerate(synastry_data["strengths"], 1):
        print(f"{i}. {strength}")
    print()
    
    # Display challenges
    print("=" * 60)
    print("RELATIONSHIP CHALLENGES")
    print("=" * 60)
    for i, challenge in enumerate(synastry_data["challenges"], 1):
        print(f"{i}. {challenge}")
    print()
    
    # Generate interpretation prompt
    print("=" * 60)
    print("AI INTERPRETATION PROMPT")
    print("=" * 60)
    prompt = synastry_service.generate_interpretation_prompt(
        person1_name="John",
        person2_name="Sarah",
        synastry_data=synastry_data,
        relationship_type="romantic"
    )
    print(prompt[:500] + "...\n")
    
    # Test different relationship types
    print("=" * 60)
    print("TESTING DIFFERENT RELATIONSHIP TYPES")
    print("=" * 60)
    
    for rel_type in ["romantic", "friendship", "business"]:
        synastry = synastry_service.calculate_synastry(
            person1_chart=person1_chart,
            person2_chart=person2_chart,
            relationship_type=rel_type
        )
        print(f"{rel_type.capitalize()}: {synastry['compatibility']['overall_score']:.1f}%")
    
    print("\n✅ Synastry service test completed!")


if __name__ == "__main__":
    asyncio.run(test_synastry())
