"""Crystals and Stones Database"""

CRYSTALS_DATABASE = [
    {
        "id": 1,
        "name": "Amethyst",
        "color": "Purple",
        "chakra": "Crown, Third Eye",
        "zodiac_signs": ["Pisces", "Virgo", "Aquarius", "Capricorn"],
        "properties": ["spiritual protection", "intuition", "clarity", "peace"],
        "healing": "Relieves stress, enhances meditation, promotes restful sleep, aids in overcoming addictions",
        "uses": "Place under pillow for peaceful sleep, meditate with it for spiritual growth, wear for protection",
        "element": "Air, Water",
        "planet": "Jupiter, Neptune",
        "description": "Amethyst is a powerful protective stone that guards against psychic attack and negative energy. It enhances spiritual awareness and promotes inner peace."
    },
    {
        "id": 2,
        "name": "Rose Quartz",
        "color": "Pink",
        "chakra": "Heart",
        "zodiac_signs": ["Taurus", "Libra"],
        "properties": ["love", "compassion", "emotional healing", "self-love"],
        "healing": "Heals emotional wounds, attracts love, promotes self-acceptance, calms anxiety",
        "uses": "Wear near heart for love attraction, place in bedroom for harmony, meditate for self-love",
        "element": "Water",
        "planet": "Venus",
        "description": "Rose Quartz is the stone of unconditional love and infinite peace. It opens the heart chakra and teaches the true essence of love."
    },
    {
        "id": 3,
        "name": "Clear Quartz",
        "color": "Clear, White",
        "chakra": "All Chakras",
        "zodiac_signs": ["All Signs"],
        "properties": ["amplification", "clarity", "energy", "healing"],
        "healing": "Master healer, amplifies energy and intention, enhances clarity, balances all chakras",
        "uses": "Program with intentions, use in crystal grids, amplify other crystals, meditation",
        "element": "All Elements",
        "planet": "Sun",
        "description": "Clear Quartz is the most versatile healing stone. It amplifies energy and thought, as well as the effect of other crystals."
    },
    {
        "id": 4,
        "name": "Black Tourmaline",
        "color": "Black",
        "chakra": "Root",
        "zodiac_signs": ["Capricorn", "Scorpio"],
        "properties": ["protection", "grounding", "purification", "EMF protection"],
        "healing": "Shields from negative energy, grounds spiritual energy, protects from electromagnetic radiation",
        "uses": "Place near electronics, carry for protection, place at home entrance, grounding meditation",
        "element": "Earth",
        "planet": "Saturn",
        "description": "Black Tourmaline is a powerful grounding stone that provides protection from negative energies and electromagnetic frequencies."
    },
    {
        "id": 5,
        "name": "Citrine",
        "color": "Yellow, Golden",
        "chakra": "Solar Plexus, Sacral",
        "zodiac_signs": ["Aries", "Gemini", "Leo", "Libra"],
        "properties": ["abundance", "manifestation", "joy", "success"],
        "healing": "Attracts wealth and prosperity, enhances creativity, boosts confidence, promotes joy",
        "uses": "Place in cash register or wallet, wear for confidence, meditate for manifestation",
        "element": "Fire",
        "planet": "Sun",
        "description": "Citrine is known as the merchant's stone for its ability to attract wealth and success. It never needs cleansing as it doesn't hold negative energy."
    },
    {
        "id": 6,
        "name": "Selenite",
        "color": "White, Clear",
        "chakra": "Crown, Third Eye",
        "zodiac_signs": ["Taurus", "Cancer"],
        "properties": ["cleansing", "clarity", "peace", "angelic connection"],
        "healing": "Cleanses other crystals, promotes mental clarity, connects to higher realms, brings peace",
        "uses": "Cleanse other crystals, create protective grid, meditation, place in bedroom",
        "element": "Air",
        "planet": "Moon",
        "description": "Selenite is a high-vibration crystal that cleanses and charges other stones. It brings clarity of mind and access to angelic consciousness."
    },
    {
        "id": 7,
        "name": "Labradorite",
        "color": "Gray with blue, green, gold flashes",
        "chakra": "Third Eye, Crown",
        "zodiac_signs": ["Leo", "Scorpio", "Sagittarius"],
        "properties": ["transformation", "intuition", "protection", "magic"],
        "healing": "Awakens psychic abilities, protects aura, facilitates transformation, enhances intuition",
        "uses": "Wear for psychic protection, meditate for spiritual awakening, carry during transitions",
        "element": "Water, Air",
        "planet": "Uranus",
        "description": "Labradorite is a stone of transformation and magic. It awakens mystical abilities and protects the aura from energy leaks."
    },
    {
        "id": 8,
        "name": "Carnelian",
        "color": "Orange, Red-Orange",
        "chakra": "Sacral, Root",
        "zodiac_signs": ["Taurus", "Cancer", "Leo", "Virgo"],
        "properties": ["courage", "creativity", "vitality", "motivation"],
        "healing": "Boosts energy and vitality, enhances creativity, increases courage, stimulates passion",
        "uses": "Wear for confidence, carry for motivation, meditate for creativity, place in workspace",
        "element": "Fire",
        "planet": "Mars",
        "description": "Carnelian is a stone of motivation and endurance. It stimulates creativity and gives courage to take action."
    },
    {
        "id": 9,
        "name": "Moonstone",
        "color": "White, Cream, Peach",
        "chakra": "Crown, Third Eye, Sacral",
        "zodiac_signs": ["Cancer", "Libra", "Scorpio"],
        "properties": ["intuition", "feminine energy", "emotional balance", "new beginnings"],
        "healing": "Balances emotions, enhances intuition, supports new beginnings, connects to lunar energy",
        "uses": "Wear during full moon, meditate for intuition, support fertility, emotional healing",
        "element": "Water",
        "planet": "Moon",
        "description": "Moonstone is deeply connected to the moon and divine feminine energy. It enhances intuition and brings emotional balance."
    },
    {
        "id": 10,
        "name": "Tiger's Eye",
        "color": "Golden Brown",
        "chakra": "Solar Plexus, Root",
        "zodiac_signs": ["Capricorn", "Leo"],
        "properties": ["confidence", "protection", "grounding", "willpower"],
        "healing": "Enhances confidence, provides protection, grounds energy, strengthens willpower",
        "uses": "Carry for confidence, wear for protection, meditate for grounding, place in workspace",
        "element": "Fire, Earth",
        "planet": "Sun",
        "description": "Tiger's Eye combines earth energy with sun energy to create a high vibrational state that is grounded and centered."
    },
    {
        "id": 11,
        "name": "Lapis Lazuli",
        "color": "Deep Blue with gold flecks",
        "chakra": "Third Eye, Throat",
        "zodiac_signs": ["Sagittarius", "Libra"],
        "properties": ["wisdom", "truth", "communication", "spiritual insight"],
        "healing": "Enhances wisdom, promotes truthful communication, awakens third eye, brings spiritual insight",
        "uses": "Wear for communication, meditate for wisdom, place on third eye, carry for truth",
        "element": "Water",
        "planet": "Jupiter, Venus",
        "description": "Lapis Lazuli is a stone of wisdom and truth. It has been treasured by ancient civilizations for its ability to enhance spiritual insight."
    },
    {
        "id": 12,
        "name": "Malachite",
        "color": "Green with banding",
        "chakra": "Heart, Solar Plexus",
        "zodiac_signs": ["Scorpio", "Capricorn"],
        "properties": ["transformation", "protection", "healing", "emotional release"],
        "healing": "Facilitates deep emotional healing, protects from negative energy, supports transformation",
        "uses": "Wear for protection, meditate for emotional healing, place on heart chakra (use with caution)",
        "element": "Fire, Earth",
        "planet": "Venus",
        "description": "Malachite is a powerful stone of transformation. It absorbs negative energies and pollutants from the atmosphere and body."
    },
    {
        "id": 13,
        "name": "Aventurine",
        "color": "Green",
        "chakra": "Heart",
        "zodiac_signs": ["Aries", "Leo"],
        "properties": ["luck", "prosperity", "opportunity", "heart healing"],
        "healing": "Attracts luck and prosperity, heals heart chakra, promotes optimism, releases old patterns",
        "uses": "Carry for luck, place in wallet, meditate for prosperity, wear for heart healing",
        "element": "Earth, Water",
        "planet": "Mercury",
        "description": "Green Aventurine is known as the stone of opportunity. It is thought to be the luckiest of all crystals."
    },
    {
        "id": 14,
        "name": "Obsidian",
        "color": "Black",
        "chakra": "Root",
        "zodiac_signs": ["Scorpio", "Sagittarius"],
        "properties": ["protection", "grounding", "truth", "shadow work"],
        "healing": "Provides powerful protection, grounds spiritual energy, reveals truth, aids shadow work",
        "uses": "Carry for protection, meditate for shadow work, place at home entrance, scrying",
        "element": "Fire, Earth",
        "planet": "Saturn, Pluto",
        "description": "Obsidian is a highly protective stone that shields against negativity. It brings hidden truths to the surface."
    },
    {
        "id": 15,
        "name": "Fluorite",
        "color": "Purple, Green, Clear, Rainbow",
        "chakra": "Third Eye, Heart",
        "zodiac_signs": ["Capricorn", "Pisces"],
        "properties": ["focus", "clarity", "learning", "protection"],
        "healing": "Enhances mental clarity, improves focus, aids learning, protects from electromagnetic stress",
        "uses": "Place on desk for focus, meditate for clarity, wear for learning, cleanse aura",
        "element": "Air, Water",
        "planet": "Mercury",
        "description": "Fluorite is an excellent learning aid. It increases concentration and helps absorb new information."
    },
    {
        "id": 16,
        "name": "Pyrite",
        "color": "Metallic Gold",
        "chakra": "Solar Plexus",
        "zodiac_signs": ["Leo"],
        "properties": ["abundance", "confidence", "manifestation", "willpower"],
        "healing": "Attracts wealth and abundance, boosts confidence, enhances willpower, shields from negative energy",
        "uses": "Place in workspace for success, carry for confidence, meditate for manifestation",
        "element": "Fire, Earth",
        "planet": "Mars",
        "description": "Pyrite is a powerful protection stone that shields from negative energy while attracting abundance and wealth."
    },
    {
        "id": 17,
        "name": "Aquamarine",
        "color": "Light Blue, Blue-Green",
        "chakra": "Throat, Heart",
        "zodiac_signs": ["Pisces", "Aries", "Gemini"],
        "properties": ["communication", "courage", "calming", "clarity"],
        "healing": "Enhances clear communication, calms anxiety, promotes courage, brings emotional clarity",
        "uses": "Wear for communication, meditate for courage, place in water for elixir, carry for calm",
        "element": "Water",
        "planet": "Moon, Neptune",
        "description": "Aquamarine is a stone of courage and communication. It calms the mind and reduces stress."
    },
    {
        "id": 18,
        "name": "Hematite",
        "color": "Metallic Gray, Black",
        "chakra": "Root",
        "zodiac_signs": ["Aries", "Aquarius"],
        "properties": ["grounding", "protection", "focus", "balance"],
        "healing": "Grounds and protects, enhances focus and concentration, balances body-mind-spirit",
        "uses": "Carry for grounding, wear for protection, meditate for balance, place in workspace",
        "element": "Earth",
        "planet": "Mars",
        "description": "Hematite is a powerful grounding stone that connects you to the earth. It absorbs negative energy and calms in times of stress."
    },
    {
        "id": 19,
        "name": "Jade",
        "color": "Green",
        "chakra": "Heart",
        "zodiac_signs": ["Aries", "Taurus", "Gemini", "Libra"],
        "properties": ["luck", "prosperity", "harmony", "longevity"],
        "healing": "Attracts good luck, promotes harmony, supports longevity, brings prosperity",
        "uses": "Wear for luck, carry for prosperity, meditate for harmony, gift for good fortune",
        "element": "Earth",
        "planet": "Venus",
        "description": "Jade is a symbol of purity and serenity. It attracts good luck and friendship while stabilizing the personality."
    },
    {
        "id": 20,
        "name": "Sodalite",
        "color": "Blue with white veining",
        "chakra": "Throat, Third Eye",
        "zodiac_signs": ["Sagittarius"],
        "properties": ["logic", "truth", "intuition", "communication"],
        "healing": "Enhances logic and rational thought, promotes truth, stimulates intuition, aids communication",
        "uses": "Meditate for clarity, wear for communication, place in workspace, carry for truth",
        "element": "Water, Air",
        "planet": "Venus",
        "description": "Sodalite brings order and calmness to the mind. It encourages rational thought, objectivity, and truth."
    }
]

def get_all_crystals():
    """Get all crystals from database"""
    return CRYSTALS_DATABASE

def get_crystal_by_id(crystal_id: int):
    """Get a specific crystal by ID"""
    for crystal in CRYSTALS_DATABASE:
        if crystal["id"] == crystal_id:
            return crystal
    return None

def get_crystal_by_name(name: str):
    """Get a specific crystal by name"""
    for crystal in CRYSTALS_DATABASE:
        if crystal["name"].lower() == name.lower():
            return crystal
    return None

def get_crystals_by_zodiac(zodiac_sign: str):
    """Get crystals recommended for a specific zodiac sign"""
    matching_crystals = []
    for crystal in CRYSTALS_DATABASE:
        if zodiac_sign in crystal["zodiac_signs"] or "All Signs" in crystal["zodiac_signs"]:
            matching_crystals.append(crystal)
    return matching_crystals

def get_crystals_by_property(property_name: str):
    """Get crystals with a specific property"""
    matching_crystals = []
    property_lower = property_name.lower()
    for crystal in CRYSTALS_DATABASE:
        if any(property_lower in prop.lower() for prop in crystal["properties"]):
            matching_crystals.append(crystal)
    return matching_crystals

def get_crystals_by_chakra(chakra: str):
    """Get crystals associated with a specific chakra"""
    matching_crystals = []
    chakra_lower = chakra.lower()
    for crystal in CRYSTALS_DATABASE:
        if chakra_lower in crystal["chakra"].lower() or "all chakras" in crystal["chakra"].lower():
            matching_crystals.append(crystal)
    return matching_crystals
