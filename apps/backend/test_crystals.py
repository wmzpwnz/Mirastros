"""Test script for Crystals Service"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.crystals import CrystalsService
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.data.crystals import (
    get_all_crystals,
    get_crystal_by_id,
    get_crystals_by_zodiac,
    get_crystals_by_property,
    get_crystals_by_chakra
)


async def test_crystal_data():
    """Test crystal database functions"""
    print("\n" + "="*60)
    print("Testing Crystal Database")
    print("="*60)
    
    # Test get all crystals
    all_crystals = get_all_crystals()
    print(f"\n✓ Total crystals in database: {len(all_crystals)}")
    
    # Test get crystal by ID
    crystal = get_crystal_by_id(1)
    print(f"\n✓ Crystal by ID (1): {crystal['name']}")
    print(f"  Color: {crystal['color']}")
    print(f"  Properties: {', '.join(crystal['properties'])}")
    
    # Test get crystals by zodiac
    leo_crystals = get_crystals_by_zodiac("Leo")
    print(f"\n✓ Crystals for Leo: {len(leo_crystals)} found")
    for c in leo_crystals[:3]:
        print(f"  - {c['name']}")
    
    # Test get crystals by property
    protection_crystals = get_crystals_by_property("protection")
    print(f"\n✓ Crystals for protection: {len(protection_crystals)} found")
    for c in protection_crystals[:3]:
        print(f"  - {c['name']}")
    
    # Test get crystals by chakra
    heart_crystals = get_crystals_by_chakra("heart")
    print(f"\n✓ Crystals for Heart chakra: {len(heart_crystals)} found")
    for c in heart_crystals[:3]:
        print(f"  - {c['name']}")


async def test_crystal_recommendations():
    """Test crystal recommendation service"""
    print("\n" + "="*60)
    print("Testing Crystal Recommendations Service")
    print("="*60)
    
    # Initialize services (without actual DB connection for testing)
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    crystals_service = CrystalsService(llm_service, rag_service)
    
    # Test 1: Recommendations by zodiac
    print("\n--- Test 1: Recommendations for Scorpio ---")
    scorpio_crystals = crystals_service.get_crystals_by_zodiac("Scorpio")
    print(f"Found {len(scorpio_crystals)} crystals for Scorpio:")
    for crystal in scorpio_crystals[:3]:
        print(f"  - {crystal['name']}: {', '.join(crystal['properties'])}")
    
    # Test 2: Recommendations by property
    print("\n--- Test 2: Recommendations for Love ---")
    love_crystals = crystals_service.get_crystals_by_property("love")
    print(f"Found {len(love_crystals)} crystals for love:")
    for crystal in love_crystals[:3]:
        print(f"  - {crystal['name']}: {crystal['description'][:80]}...")
    
    # Test 3: Recommendations by chakra
    print("\n--- Test 3: Recommendations for Root Chakra ---")
    root_crystals = crystals_service.get_crystals_by_chakra("root")
    print(f"Found {len(root_crystals)} crystals for root chakra:")
    for crystal in root_crystals[:3]:
        print(f"  - {crystal['name']}: {crystal['chakra']}")
    
    # Test 4: Get all crystals
    print("\n--- Test 4: All Crystals ---")
    all_crystals = crystals_service.get_all_crystals()
    print(f"Total crystals available: {len(all_crystals)}")
    print("Sample crystals:")
    for crystal in all_crystals[:5]:
        print(f"  {crystal['id']}. {crystal['name']} - {crystal['color']}")


async def test_recommendation_logic():
    """Test the recommendation logic without AI"""
    print("\n" + "="*60)
    print("Testing Recommendation Logic")
    print("="*60)
    
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    crystals_service = CrystalsService(llm_service, rag_service)
    
    # Test scenario 1: Protection for Scorpio
    print("\n--- Scenario 1: Protection for Scorpio ---")
    zodiac_crystals = crystals_service.get_crystals_by_zodiac("Scorpio")
    property_crystals = crystals_service.get_crystals_by_property("protection")
    
    # Combine and deduplicate
    combined = []
    seen = set()
    for crystal in zodiac_crystals + property_crystals:
        if crystal["id"] not in seen:
            seen.add(crystal["id"])
            combined.append(crystal)
    
    print(f"Combined recommendations: {len(combined)} crystals")
    for crystal in combined[:5]:
        print(f"  - {crystal['name']}")
        print(f"    Zodiac: {', '.join(crystal['zodiac_signs'])}")
        print(f"    Properties: {', '.join(crystal['properties'])}")
    
    # Test scenario 2: Love and Heart Chakra
    print("\n--- Scenario 2: Love and Heart Chakra ---")
    love_crystals = crystals_service.get_crystals_by_property("love")
    heart_crystals = crystals_service.get_crystals_by_chakra("heart")
    
    combined2 = []
    seen2 = set()
    for crystal in love_crystals + heart_crystals:
        if crystal["id"] not in seen2:
            seen2.add(crystal["id"])
            combined2.append(crystal)
    
    print(f"Combined recommendations: {len(combined2)} crystals")
    for crystal in combined2[:5]:
        print(f"  - {crystal['name']}")
        print(f"    Chakra: {crystal['chakra']}")
        print(f"    Uses: {crystal['uses'][:60]}...")


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("CRYSTALS SERVICE TEST SUITE")
    print("="*60)
    
    try:
        await test_crystal_data()
        await test_crystal_recommendations()
        await test_recommendation_logic()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nThe crystals service is ready to use!")
        print("\nAvailable endpoints:")
        print("  POST /crystals/recommend - Get personalized recommendations")
        print("  GET  /crystals/all - Get all crystals")
        print("  GET  /crystals/{id} - Get crystal by ID")
        print("  POST /crystals/by-zodiac - Get crystals by zodiac sign")
        print("  POST /crystals/by-property - Get crystals by property")
        print("  GET  /crystals/by-chakra/{chakra} - Get crystals by chakra")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
