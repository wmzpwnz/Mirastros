"""Test Numerology Service"""

import asyncio
from app.data.numerology import (
    calculate_life_path_number,
    calculate_destiny_number,
    calculate_soul_urge_number,
    calculate_personality_number,
    get_number_meaning
)


def test_calculations():
    """Test numerology calculations"""
    
    print("=" * 60)
    print("NUMEROLOGY CALCULATION TEST")
    print("=" * 60)
    
    # Test data
    full_name = "John Michael Smith"
    birth_date = "1990-05-15"
    
    print(f"\nName: {full_name}")
    print(f"Birth Date: {birth_date}")
    print("\n" + "-" * 60)
    
    # Calculate Life Path Number
    life_path = calculate_life_path_number(birth_date)
    print(f"\nLife Path Number: {life_path}")
    life_path_meaning = get_number_meaning(life_path)
    print(f"Name: {life_path_meaning['name']}")
    print(f"Keywords: {', '.join(life_path_meaning['keywords'])}")
    print(f"Description: {life_path_meaning['description']}")
    
    # Calculate Destiny Number
    destiny = calculate_destiny_number(full_name)
    print(f"\nDestiny Number: {destiny}")
    destiny_meaning = get_number_meaning(destiny)
    print(f"Name: {destiny_meaning['name']}")
    print(f"Keywords: {', '.join(destiny_meaning['keywords'])}")
    print(f"Description: {destiny_meaning['description']}")
    
    # Calculate Soul Urge Number
    soul_urge = calculate_soul_urge_number(full_name)
    print(f"\nSoul Urge Number: {soul_urge}")
    soul_urge_meaning = get_number_meaning(soul_urge)
    print(f"Name: {soul_urge_meaning['name']}")
    print(f"Keywords: {', '.join(soul_urge_meaning['keywords'])}")
    print(f"Description: {soul_urge_meaning['description']}")
    
    # Calculate Personality Number
    personality = calculate_personality_number(full_name)
    print(f"\nPersonality Number: {personality}")
    personality_meaning = get_number_meaning(personality)
    print(f"Name: {personality_meaning['name']}")
    print(f"Keywords: {', '.join(personality_meaning['keywords'])}")
    print(f"Description: {personality_meaning['description']}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)


def test_master_numbers():
    """Test master number calculations"""
    
    print("\n" + "=" * 60)
    print("MASTER NUMBERS TEST")
    print("=" * 60)
    
    # Test cases that should produce master numbers
    test_cases = [
        ("Master Eleven", "1990-11-11"),  # Should produce 11
        ("Master Twenty Two", "1988-02-22"),  # Should produce 22
        ("Master Thirty Three", "1987-03-15"),  # Should produce 33
    ]
    
    for name, date in test_cases:
        life_path = calculate_life_path_number(date)
        print(f"\n{name} ({date})")
        print(f"Life Path Number: {life_path}")
        if life_path in [11, 22, 33]:
            meaning = get_number_meaning(life_path)
            print(f"Master Number: {meaning['name']}")
            print(f"Keywords: {', '.join(meaning['keywords'])}")
    
    print("\n" + "=" * 60)


def test_edge_cases():
    """Test edge cases"""
    
    print("\n" + "=" * 60)
    print("EDGE CASES TEST")
    print("=" * 60)
    
    # Test with different name formats
    test_names = [
        "A B",  # Short name
        "Alexander Christopher Montgomery",  # Long name
        "Mary-Jane O'Connor",  # Special characters
        "José María García",  # Accented characters (will be treated as regular letters)
    ]
    
    for name in test_names:
        try:
            destiny = calculate_destiny_number(name)
            soul_urge = calculate_soul_urge_number(name)
            personality = calculate_personality_number(name)
            print(f"\n{name}")
            print(f"  Destiny: {destiny}, Soul Urge: {soul_urge}, Personality: {personality}")
        except Exception as e:
            print(f"\n{name}")
            print(f"  Error: {e}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    test_calculations()
    test_master_numbers()
    test_edge_cases()
