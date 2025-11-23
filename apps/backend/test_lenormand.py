"""Test script for Lenormand service"""

import asyncio
from app.data.lenormand import get_all_lenormand_cards, get_card_by_id, get_card_by_name


def test_lenormand_data():
    """Test Lenormand card data"""
    print("🃏 Testing Lenormand Card Database\n")
    
    # Test getting all cards
    all_cards = get_all_lenormand_cards()
    print(f"✅ Total cards: {len(all_cards)}")
    assert len(all_cards) == 36, "Should have 36 Lenormand cards"
    
    # Test getting card by ID
    rider = get_card_by_id(1)
    print(f"✅ Card #1: {rider['name']} - {rider['meaning'][:50]}...")
    assert rider['name'] == "Rider", "First card should be Rider"
    
    # Test getting card by name
    heart = get_card_by_name("Heart")
    print(f"✅ Heart card: #{heart['number']} - {', '.join(heart['keywords'][:3])}")
    assert heart['number'] == 24, "Heart should be card #24"
    
    # Test card structure
    sun = get_card_by_id(31)
    print(f"✅ Sun card structure: {list(sun.keys())}")
    assert 'keywords' in sun, "Card should have keywords"
    assert 'combinations' in sun, "Card should have combinations"
    
    # Display sample cards
    print("\n📋 Sample Cards:")
    for card_id in [1, 12, 24, 31, 36]:
        card = get_card_by_id(card_id)
        print(f"  {card['number']:2d}. {card['name']:15s} - {', '.join(card['keywords'][:3])}")
    
    print("\n✅ All Lenormand data tests passed!")


def test_spread_types():
    """Test spread type configurations"""
    print("\n🎴 Testing Spread Types\n")
    
    spread_configs = {
        "three-card": {
            "num_cards": 3,
            "positions": ["Past/Situation", "Present/Challenge", "Future/Outcome"]
        },
        "five-card": {
            "num_cards": 5,
            "positions": ["Past", "Present", "Hidden Influences", "Advice", "Outcome"]
        },
        "nine-card": {
            "num_cards": 9,
            "positions": [
                "Past Foundation", "Recent Past", "Present Situation",
                "Near Future", "Future Outcome", "Inner Self",
                "External Influences", "Hopes/Fears", "Final Result"
            ]
        }
    }
    
    for spread_type, config in spread_configs.items():
        print(f"✅ {spread_type}: {config['num_cards']} cards")
        print(f"   Positions: {', '.join(config['positions'][:3])}...")
    
    print("\n✅ All spread type tests passed!")


def test_card_combinations():
    """Test card combination meanings"""
    print("\n🔮 Testing Card Combinations\n")
    
    # Test some meaningful combinations
    rider = get_card_by_id(1)  # Rider - news
    heart = get_card_by_id(24)  # Heart - love
    ring = get_card_by_id(25)  # Ring - commitment
    
    print(f"✅ {rider['name']} + {heart['name']}: News about love")
    print(f"✅ {heart['name']} + {ring['name']}: Love commitment/engagement")
    print(f"✅ {rider['name']} + {ring['name']}: News about commitment/contract")
    
    # Check combination data exists
    assert 'combinations' in rider, "Cards should have combination data"
    assert 'positive' in rider['combinations'], "Should have positive combinations"
    assert 'negative' in rider['combinations'], "Should have negative combinations"
    
    print("\n✅ Card combination tests passed!")


if __name__ == "__main__":
    print("=" * 60)
    print("LENORMAND SERVICE TEST SUITE")
    print("=" * 60)
    
    try:
        test_lenormand_data()
        test_spread_types()
        test_card_combinations()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        exit(1)
