"""Numerology Data - Number Meanings and Calculations"""

from typing import Dict, Optional, List

# Number meanings (1-9, 11, 22, 33)
NUMBER_MEANINGS = {
    1: {
        "name": "The Leader",
        "keywords": ["independence", "leadership", "innovation", "ambition", "courage"],
        "description": "Number 1 represents new beginnings, independence, and leadership. Those with this number are natural pioneers and innovators.",
        "strengths": "Independent, ambitious, creative, strong-willed, courageous",
        "challenges": "Can be domineering, stubborn, impatient, self-centered",
        "life_path": "You are here to develop independence and leadership. Your path involves pioneering new ideas and inspiring others.",
        "career": "Entrepreneur, executive, inventor, artist, any leadership role",
        "relationships": "You need a partner who respects your independence and supports your ambitions."
    },
    2: {
        "name": "The Peacemaker",
        "keywords": ["harmony", "cooperation", "diplomacy", "sensitivity", "partnership"],
        "description": "Number 2 represents balance, partnership, and diplomacy. Those with this number are natural mediators and peacekeepers.",
        "strengths": "Diplomatic, cooperative, patient, sensitive, intuitive",
        "challenges": "Can be overly sensitive, indecisive, dependent, passive-aggressive",
        "life_path": "You are here to create harmony and build partnerships. Your path involves bringing people together.",
        "career": "Counselor, mediator, diplomat, teacher, team player",
        "relationships": "You thrive in partnerships and need emotional connection and harmony."
    },
    3: {
        "name": "The Creative",
        "keywords": ["creativity", "expression", "joy", "communication", "optimism"],
        "description": "Number 3 represents creativity, self-expression, and joy. Those with this number are natural communicators and artists.",
        "strengths": "Creative, expressive, optimistic, sociable, inspiring",
        "challenges": "Can be scattered, superficial, overly optimistic, unfocused",
        "life_path": "You are here to express yourself creatively and bring joy to others. Your path involves communication and art.",
        "career": "Artist, writer, performer, speaker, designer, entertainer",
        "relationships": "You need a partner who appreciates your creativity and shares your zest for life."
    },
    4: {
        "name": "The Builder",
        "keywords": ["stability", "structure", "discipline", "practicality", "hard work"],
        "description": "Number 4 represents stability, structure, and hard work. Those with this number are natural builders and organizers.",
        "strengths": "Practical, disciplined, reliable, organized, hardworking",
        "challenges": "Can be rigid, stubborn, overly serious, resistant to change",
        "life_path": "You are here to build solid foundations and create lasting structures. Your path involves discipline and perseverance.",
        "career": "Engineer, architect, accountant, manager, craftsperson",
        "relationships": "You need a stable, committed partner who values security and loyalty."
    },
    5: {
        "name": "The Freedom Seeker",
        "keywords": ["freedom", "adventure", "change", "versatility", "curiosity"],
        "description": "Number 5 represents freedom, adventure, and change. Those with this number are natural explorers and adventurers.",
        "strengths": "Adventurous, versatile, curious, adaptable, energetic",
        "challenges": "Can be restless, impulsive, irresponsible, scattered",
        "life_path": "You are here to experience freedom and embrace change. Your path involves exploration and variety.",
        "career": "Travel guide, journalist, salesperson, entrepreneur, any dynamic role",
        "relationships": "You need a partner who gives you freedom and shares your love of adventure."
    },
    6: {
        "name": "The Nurturer",
        "keywords": ["responsibility", "nurturing", "service", "harmony", "family"],
        "description": "Number 6 represents responsibility, nurturing, and service. Those with this number are natural caregivers and healers.",
        "strengths": "Nurturing, responsible, compassionate, harmonious, protective",
        "challenges": "Can be overly responsible, self-sacrificing, controlling, anxious",
        "life_path": "You are here to serve and nurture others. Your path involves creating harmony and caring for family.",
        "career": "Teacher, counselor, nurse, social worker, homemaker",
        "relationships": "You are devoted and need a partner who appreciates your caring nature."
    },
    7: {
        "name": "The Seeker",
        "keywords": ["wisdom", "spirituality", "analysis", "introspection", "mystery"],
        "description": "Number 7 represents wisdom, spirituality, and analysis. Those with this number are natural seekers and philosophers.",
        "strengths": "Analytical, spiritual, intuitive, wise, introspective",
        "challenges": "Can be isolated, aloof, overly analytical, secretive",
        "life_path": "You are here to seek truth and develop wisdom. Your path involves spiritual growth and deep understanding.",
        "career": "Researcher, analyst, philosopher, spiritual teacher, scientist",
        "relationships": "You need a partner who respects your need for solitude and shares your depth."
    },
    8: {
        "name": "The Powerhouse",
        "keywords": ["power", "success", "abundance", "authority", "achievement"],
        "description": "Number 8 represents power, success, and material abundance. Those with this number are natural leaders in business.",
        "strengths": "Ambitious, authoritative, successful, confident, powerful",
        "challenges": "Can be materialistic, controlling, workaholic, ruthless",
        "life_path": "You are here to achieve success and master the material world. Your path involves power and abundance.",
        "career": "Executive, entrepreneur, banker, politician, any position of authority",
        "relationships": "You need a partner who respects your ambition and shares your drive for success."
    },
    9: {
        "name": "The Humanitarian",
        "keywords": ["compassion", "wisdom", "completion", "humanitarianism", "idealism"],
        "description": "Number 9 represents compassion, wisdom, and humanitarianism. Those with this number are natural healers and teachers.",
        "strengths": "Compassionate, wise, idealistic, generous, humanitarian",
        "challenges": "Can be overly idealistic, self-sacrificing, emotionally distant, impractical",
        "life_path": "You are here to serve humanity and share your wisdom. Your path involves compassion and completion.",
        "career": "Humanitarian, teacher, healer, artist, philanthropist",
        "relationships": "You need a partner who shares your ideals and supports your humanitarian goals."
    },
    11: {
        "name": "The Illuminator (Master Number)",
        "keywords": ["intuition", "inspiration", "enlightenment", "idealism", "vision"],
        "description": "Master Number 11 represents intuition, inspiration, and spiritual enlightenment. This is a powerful spiritual number.",
        "strengths": "Intuitive, inspirational, visionary, idealistic, spiritual",
        "challenges": "Can be overly sensitive, impractical, nervous, self-doubting",
        "life_path": "You are here to inspire and enlighten others. Your path involves spiritual leadership and vision.",
        "career": "Spiritual teacher, counselor, artist, inventor, visionary leader",
        "relationships": "You need a partner who understands your sensitivity and supports your spiritual path."
    },
    22: {
        "name": "The Master Builder (Master Number)",
        "keywords": ["mastery", "achievement", "vision", "practicality", "power"],
        "description": "Master Number 22 represents the master builder who can turn dreams into reality. This is the most powerful number.",
        "strengths": "Visionary, practical, powerful, disciplined, masterful",
        "challenges": "Can be overwhelmed by potential, self-doubting, overly ambitious",
        "life_path": "You are here to build something of lasting value for humanity. Your path involves manifesting grand visions.",
        "career": "Architect, entrepreneur, world leader, master craftsperson, visionary",
        "relationships": "You need a partner who supports your grand vision and shares your commitment."
    },
    33: {
        "name": "The Master Teacher (Master Number)",
        "keywords": ["compassion", "healing", "teaching", "service", "enlightenment"],
        "description": "Master Number 33 represents the master teacher and healer. This is the number of unconditional love and service.",
        "strengths": "Compassionate, healing, nurturing, wise, selfless",
        "challenges": "Can be overly self-sacrificing, burdened by responsibility, martyrdom",
        "life_path": "You are here to teach and heal on a grand scale. Your path involves selfless service to humanity.",
        "career": "Spiritual teacher, healer, humanitarian leader, counselor",
        "relationships": "You need a partner who appreciates your devotion to service and supports your mission."
    }
}


def calculate_life_path_number(birth_date: str) -> int:
    """
    Calculate Life Path Number from birth date
    
    Args:
        birth_date: Birth date in format YYYY-MM-DD
    
    Returns:
        Life Path Number (1-9, 11, 22, 33)
    """
    # Remove dashes and convert to string of digits
    date_str = birth_date.replace("-", "")
    
    # Sum all digits
    total = sum(int(digit) for digit in date_str)
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_destiny_number(full_name: str) -> int:
    """
    Calculate Destiny Number from full name
    
    Args:
        full_name: Full name (first, middle, last)
    
    Returns:
        Destiny Number (1-9, 11, 22, 33)
    """
    # Letter to number mapping (Pythagorean system)
    letter_values = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }
    
    # Convert name to uppercase and remove spaces
    name = full_name.upper().replace(" ", "")
    
    # Sum letter values
    total = sum(letter_values.get(char, 0) for char in name if char.isalpha())
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_soul_urge_number(full_name: str) -> int:
    """
    Calculate Soul Urge Number from vowels in full name
    
    Args:
        full_name: Full name (first, middle, last)
    
    Returns:
        Soul Urge Number (1-9, 11, 22, 33)
    """
    # Letter to number mapping
    letter_values = {
        'A': 1, 'E': 5, 'I': 9, 'O': 6, 'U': 3, 'Y': 7
    }
    
    # Convert name to uppercase
    name = full_name.upper()
    
    # Sum vowel values
    total = sum(letter_values.get(char, 0) for char in name if char in letter_values)
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_personality_number(full_name: str) -> int:
    """
    Calculate Personality Number from consonants in full name
    
    Args:
        full_name: Full name (first, middle, last)
    
    Returns:
        Personality Number (1-9, 11, 22, 33)
    """
    # Letter to number mapping (Pythagorean system)
    letter_values = {
        'B': 2, 'C': 3, 'D': 4, 'F': 6, 'G': 7, 'H': 8,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'V': 4, 'W': 5, 'X': 6, 'Z': 8
    }
    
    # Convert name to uppercase
    name = full_name.upper()
    
    # Sum consonant values (exclude vowels)
    vowels = 'AEIOUY'
    total = sum(letter_values.get(char, 0) for char in name if char.isalpha() and char not in vowels)
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def get_number_meaning(number: int) -> Dict:
    """
    Get the meaning of a numerology number
    
    Args:
        number: Numerology number (1-9, 11, 22, 33)
    
    Returns:
        Dictionary with number meaning
    """
    return NUMBER_MEANINGS.get(number, NUMBER_MEANINGS[1])


def get_all_number_meanings() -> Dict[int, Dict]:
    """Get all number meanings"""
    return NUMBER_MEANINGS


def calculate_personal_year_number(birth_date: str, target_year: int) -> int:
    """
    Calculate Personal Year Number for a specific year
    
    Args:
        birth_date: Birth date in format YYYY-MM-DD
        target_year: Year to calculate personal year for
    
    Returns:
        Personal Year Number (1-9, 11, 22, 33)
    """
    # Extract month and day from birth date
    parts = birth_date.split("-")
    birth_month = int(parts[1])
    birth_day = int(parts[2])
    
    # Personal Year = (birth month + birth day + target year) reduced to single digit
    total = birth_month + birth_day + target_year
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_personal_month_number(personal_year: int, month: int) -> int:
    """
    Calculate Personal Month Number
    
    Args:
        personal_year: Personal Year Number
        month: Month number (1-12)
    
    Returns:
        Personal Month Number (1-9, 11, 22, 33)
    """
    total = personal_year + month
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_personal_day_number(personal_month: int, day: int) -> int:
    """
    Calculate Personal Day Number
    
    Args:
        personal_month: Personal Month Number
        day: Day of month (1-31)
    
    Returns:
        Personal Day Number (1-9, 11, 22, 33)
    """
    total = personal_month + day
    
    # Reduce to single digit or master number
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(digit) for digit in str(total))
    
    return total


def calculate_lucky_numbers_from_numerology(
    birth_date: str,
    target_date: str,
    life_path: Optional[int] = None,
    destiny: Optional[int] = None
) -> List[int]:
    """
    Calculate lucky numbers based on numerology for a specific date
    
    Args:
        birth_date: Birth date in format YYYY-MM-DD
        target_date: Target date in format YYYY-MM-DD
        life_path: Optional Life Path Number (will be calculated if not provided)
        destiny: Optional Destiny Number (will be calculated if not provided)
    
    Returns:
        List of 5 lucky numbers (1-99)
    """
    from datetime import datetime
    
    # Parse dates
    birth_parts = birth_date.split("-")
    target_parts = target_date.split("-")
    
    birth_year = int(birth_parts[0])
    birth_month = int(birth_parts[1])
    birth_day = int(birth_parts[2])
    
    target_year = int(target_parts[0])
    target_month = int(target_parts[1])
    target_day = int(target_parts[2])
    
    # Calculate numerology numbers if not provided
    if life_path is None:
        life_path = calculate_life_path_number(birth_date)
    
    # Calculate Personal Year, Month, Day
    personal_year = calculate_personal_year_number(birth_date, target_year)
    personal_month = calculate_personal_month_number(personal_year, target_month)
    personal_day = calculate_personal_day_number(personal_month, target_day)
    
    # Base numbers from numerology
    base_numbers = [
        life_path,
        personal_year,
        personal_month,
        personal_day
    ]
    
    # Add destiny if provided
    if destiny is not None:
        base_numbers.append(destiny)
    
    # Generate additional numbers based on numerology combinations
    # Combine personal numbers in various ways
    lucky_numbers = set()
    
    # Add base numbers (ensure they're in valid range 1-99)
    for num in base_numbers:
        if 1 <= num <= 99:
            lucky_numbers.add(num)
    
    # Generate combinations
    # Personal Year + Personal Month
    combo1 = personal_year + personal_month
    while combo1 > 99:
        combo1 = sum(int(d) for d in str(combo1))
    if 1 <= combo1 <= 99:
        lucky_numbers.add(combo1)
    
    # Personal Month + Personal Day
    combo2 = personal_month + personal_day
    while combo2 > 99:
        combo2 = sum(int(d) for d in str(combo2))
    if 1 <= combo2 <= 99:
        lucky_numbers.add(combo2)
    
    # Life Path * 10 + Personal Day (if reasonable)
    combo3 = life_path * 10 + personal_day
    if 1 <= combo3 <= 99:
        lucky_numbers.add(combo3)
    
    # Personal Year * 10 + Personal Month (if reasonable)
    combo4 = personal_year * 10 + personal_month
    if 1 <= combo4 <= 99:
        lucky_numbers.add(combo4)
    
    # Fill to 5 numbers if needed using date-based calculations
    while len(lucky_numbers) < 5:
        # Use day of year as additional number
        day_of_year = datetime(target_year, target_month, target_day).timetuple().tm_yday
        day_num = day_of_year % 99 + 1
        lucky_numbers.add(day_num)
        
        if len(lucky_numbers) >= 5:
            break
        
        # Use month * day
        month_day = (target_month * target_day) % 99 + 1
        lucky_numbers.add(month_day)
        
        if len(lucky_numbers) >= 5:
            break
    
    # Convert to sorted list and take first 5
    result = sorted(list(lucky_numbers))[:5]
    
    # Ensure we have exactly 5 numbers
    while len(result) < 5:
        # Add numbers based on date components
        if len(result) < 5:
            result.append((target_day * 3) % 99 + 1)
        if len(result) < 5:
            result.append((target_month * 7) % 99 + 1)
        if len(result) < 5:
            result.append((target_year % 100) % 99 + 1)
    
    return sorted(result[:5])
