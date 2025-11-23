"""Test script for I Ching service"""

import asyncio
from app.data.iching import get_all_hexagrams, get_hexagram_by_number, get_hexagram_by_binary


def test_hexagram_database():
    """Test that hexagram database is properly loaded"""
    print("Testing I Ching Hexagram Database...")
    print("=" * 60)
    
    # Test getting all hexagrams
    hexagrams = get_all_hexagrams()
    print(f"\n✓ Total hexagrams loaded: {len(hexagrams)}")
    
    # Test getting specific hexagrams
    hexagram_1 = get_hexagram_by_number(1)
    print(f"\n✓ Hexagram #1: {hexagram_1['name']} - {hexagram_1['chinese']}")
    print(f"  Meaning: {hexagram_1['meaning'][:80]}...")
    
    hexagram_64 = get_hexagram_by_number(64)
    print(f"\n✓ Hexagram #64: {hexagram_64['name']} - {hexagram_64['chinese']}")
    print(f"  Meaning: {hexagram_64['meaning'][:80]}...")
    
    # Test getting by binary
    hexagram_peace = get_hexagram_by_binary("000111")
    if hexagram_peace:
        print(f"\n✓ Binary '000111': {hexagram_peace['name']} - {hexagram_peace['chinese']}")
    
    # Display sample hexagrams
    print("\n" + "=" * 60)
    print("Sample Hexagrams:")
    print("=" * 60)
    
    for hex_num in [1, 11, 29, 42, 63]:
        hex_data = get_hexagram_by_number(hex_num)
        if hex_data:
            print(f"\n#{hex_data['number']}: {hex_data['name']} - {hex_data['chinese']}")
            print(f"Trigrams: {hex_data['trigrams']['upper']} above {hex_data['trigrams']['lower']}")
            print(f"Keywords: {', '.join(hex_data['keywords'])}")
            print(f"Judgment: {hex_data['judgment'][:100]}...")


def test_coin_toss_simulation():
    """Test coin toss simulation"""
    print("\n" + "=" * 60)
    print("Testing Coin Toss Simulation")
    print("=" * 60)
    
    from app.services.iching import IChingService
    from app.services.llm import UnifiedLLMService
    from app.services.rag import RAGService
    
    llm_service = UnifiedLLMService()
    rag_service = RAGService()
    iching_service = IChingService(llm_service, rag_service)
    
    # Simulate 5 coin tosses
    print("\nSimulating 5 hexagram casts:")
    for i in range(5):
        primary, changing, resulting = iching_service._coin_toss_method()
        print(f"\nCast #{i+1}:")
        print(f"  Primary: #{primary['number']} - {primary['name']}")
        if changing:
            print(f"  Changing Lines: {changing}")
        if resulting:
            print(f"  Resulting: #{resulting['number']} - {resulting['name']}")
        else:
            print(f"  No changing lines - stable hexagram")


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("I CHING SERVICE TEST")
    print("=" * 60)
    
    test_hexagram_database()
    test_coin_toss_simulation()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
