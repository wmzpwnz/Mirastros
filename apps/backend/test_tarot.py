"""Manual test script for Tarot service"""

import asyncio
from app.data.tarot import get_all_cards, get_card_by_id, get_cards_by_suit


async def test_tarot_data():
    """Test Tarot card database"""
    print("Testing Tarot Card Database...")
    print("=" * 50)
    
    # Test get all cards
    all_cards = get_all_cards()
    print(f"\n✓ Total cards: {len(all_cards)}")
    assert len(all_cards) == 78, "Should have 78 cards"
    
    # Test get card by ID
    fool = get_card_by_id(0)
    print(f"\n✓ Card by ID (0): {fool['name']}")
    assert fool['name'] == "The Fool", "Card 0 should be The Fool"
    
    # Test get cards by suit
    major_arcana = get_cards_by_suit("major")
    print(f"\n✓ Major Arcana cards: {len(major_arcana)}")
    assert len(major_arcana) == 22, "Should have 22 Major Arcana cards"
    
    wands = get_cards_by_suit("wands")
    print(f"✓ Wands cards: {len(wands)}")
    assert len(wands) == 14, "Should have 14 Wands cards"
    
    cups = get_cards_by_suit("cups")
    print(f"✓ Cups cards: {len(cups)}")
    assert len(cups) == 14, "Should have 14 Cups cards"
    
    swords = get_cards_by_suit("swords")
    print(f"✓ Swords cards: {len(swords)}")
    assert len(swords) == 14, "Should have 14 Swords cards"
    
    pentacles = get_cards_by_suit("pentacles")
    print(f"✓ Pentacles cards: {len(pentacles)}")
    assert len(pentacles) == 14, "Should have 14 Pentacles cards"
    
    # Display sample cards
    print("\n" + "=" * 50)
    print("Sample Cards:")
    print("=" * 50)
    
    print(f"\n{fool['name']} (Major Arcana)")
    print(f"Keywords: {', '.join(fool['keywords'])}")
    print(f"Upright: {fool['upright'][:100]}...")
    
    ace_wands = get_card_by_id(22)
    print(f"\n{ace_wands['name']} ({ace_wands['suit'].title()})")
    print(f"Keywords: {', '.join(ace_wands['keywords'])}")
    print(f"Upright: {ace_wands['upright'][:100]}...")
    
    print("\n" + "=" * 50)
    print("✅ All tests passed!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test_tarot_data())
