"""Dream Symbol Dictionary"""

from typing import List, Dict, Optional


DREAM_SYMBOLS = [
    # Animals
    {
        "symbol": "bird",
        "meaning": "Freedom, spirituality, messages from the divine, transcendence",
        "keywords": ["freedom", "spirit", "message", "flight"],
        "category": "animals"
    },
    {
        "symbol": "snake",
        "meaning": "Transformation, healing, hidden fears, wisdom, kundalini energy",
        "keywords": ["transformation", "healing", "fear", "wisdom"],
        "category": "animals"
    },
    {
        "symbol": "cat",
        "meaning": "Independence, intuition, feminine energy, mystery",
        "keywords": ["independence", "intuition", "feminine", "mystery"],
        "category": "animals"
    },
    {
        "symbol": "dog",
        "meaning": "Loyalty, friendship, protection, unconditional love",
        "keywords": ["loyalty", "friendship", "protection", "love"],
        "category": "animals"
    },
    {
        "symbol": "wolf",
        "meaning": "Instinct, intelligence, freedom, social connections",
        "keywords": ["instinct", "intelligence", "freedom", "pack"],
        "category": "animals"
    },
    {
        "symbol": "butterfly",
        "meaning": "Transformation, rebirth, beauty, lightness of being",
        "keywords": ["transformation", "rebirth", "beauty", "change"],
        "category": "animals"
    },
    
    # Nature
    {
        "symbol": "water",
        "meaning": "Emotions, the unconscious mind, purification, flow of life",
        "keywords": ["emotions", "unconscious", "purification", "flow"],
        "category": "nature"
    },
    {
        "symbol": "ocean",
        "meaning": "Vast emotions, the collective unconscious, infinite possibilities",
        "keywords": ["emotions", "vastness", "unconscious", "depth"],
        "category": "nature"
    },
    {
        "symbol": "river",
        "meaning": "Life's journey, flow of time, emotional currents",
        "keywords": ["journey", "flow", "time", "movement"],
        "category": "nature"
    },
    {
        "symbol": "mountain",
        "meaning": "Obstacles, challenges, spiritual ascent, achievement",
        "keywords": ["challenge", "ascent", "achievement", "obstacle"],
        "category": "nature"
    },
    {
        "symbol": "forest",
        "meaning": "The unconscious, mystery, growth, natural wisdom",
        "keywords": ["unconscious", "mystery", "growth", "nature"],
        "category": "nature"
    },
    {
        "symbol": "fire",
        "meaning": "Passion, transformation, destruction and renewal, purification",
        "keywords": ["passion", "transformation", "purification", "energy"],
        "category": "nature"
    },
    {
        "symbol": "sun",
        "meaning": "Consciousness, vitality, masculine energy, enlightenment",
        "keywords": ["consciousness", "vitality", "masculine", "light"],
        "category": "nature"
    },
    {
        "symbol": "moon",
        "meaning": "Intuition, feminine energy, cycles, the unconscious",
        "keywords": ["intuition", "feminine", "cycles", "unconscious"],
        "category": "nature"
    },
    {
        "symbol": "stars",
        "meaning": "Hope, guidance, destiny, spiritual connection",
        "keywords": ["hope", "guidance", "destiny", "spirit"],
        "category": "nature"
    },
    {
        "symbol": "rain",
        "meaning": "Cleansing, renewal, emotional release, fertility",
        "keywords": ["cleansing", "renewal", "release", "fertility"],
        "category": "nature"
    },
    
    # Actions
    {
        "symbol": "flying",
        "meaning": "Freedom, transcendence, rising above problems, spiritual elevation",
        "keywords": ["freedom", "transcendence", "elevation", "liberation"],
        "category": "actions"
    },
    {
        "symbol": "falling",
        "meaning": "Loss of control, anxiety, fear of failure, letting go",
        "keywords": ["control", "anxiety", "fear", "surrender"],
        "category": "actions"
    },
    {
        "symbol": "running",
        "meaning": "Escape, pursuit of goals, avoiding something, urgency",
        "keywords": ["escape", "pursuit", "avoidance", "urgency"],
        "category": "actions"
    },
    {
        "symbol": "climbing",
        "meaning": "Ambition, progress, overcoming obstacles, spiritual ascent",
        "keywords": ["ambition", "progress", "overcoming", "ascent"],
        "category": "actions"
    },
    {
        "symbol": "swimming",
        "meaning": "Navigating emotions, going with the flow, emotional exploration",
        "keywords": ["emotions", "flow", "exploration", "navigation"],
        "category": "actions"
    },
    {
        "symbol": "dancing",
        "meaning": "Joy, self-expression, harmony, celebration of life",
        "keywords": ["joy", "expression", "harmony", "celebration"],
        "category": "actions"
    },
    
    # Places
    {
        "symbol": "house",
        "meaning": "The self, different aspects of personality, security",
        "keywords": ["self", "personality", "security", "home"],
        "category": "places"
    },
    {
        "symbol": "temple",
        "meaning": "Spirituality, sacred space, inner wisdom, higher consciousness",
        "keywords": ["spirituality", "sacred", "wisdom", "consciousness"],
        "category": "places"
    },
    {
        "symbol": "bridge",
        "meaning": "Transition, connection, crossing from one phase to another",
        "keywords": ["transition", "connection", "crossing", "change"],
        "category": "places"
    },
    {
        "symbol": "door",
        "meaning": "Opportunity, new beginnings, transition, choice",
        "keywords": ["opportunity", "beginning", "transition", "choice"],
        "category": "places"
    },
    {
        "symbol": "window",
        "meaning": "Perspective, opportunity, seeing clearly, new viewpoint",
        "keywords": ["perspective", "opportunity", "clarity", "view"],
        "category": "places"
    },
    {
        "symbol": "garden",
        "meaning": "Growth, cultivation, beauty, inner peace",
        "keywords": ["growth", "cultivation", "beauty", "peace"],
        "category": "places"
    },
    {
        "symbol": "cave",
        "meaning": "The unconscious, hidden aspects, retreat, inner exploration",
        "keywords": ["unconscious", "hidden", "retreat", "exploration"],
        "category": "places"
    },
    
    # Objects
    {
        "symbol": "key",
        "meaning": "Solution, access, unlocking potential, discovery",
        "keywords": ["solution", "access", "potential", "discovery"],
        "category": "objects"
    },
    {
        "symbol": "mirror",
        "meaning": "Self-reflection, truth, seeing oneself clearly",
        "keywords": ["reflection", "truth", "self", "clarity"],
        "category": "objects"
    },
    {
        "symbol": "book",
        "meaning": "Knowledge, wisdom, learning, life story",
        "keywords": ["knowledge", "wisdom", "learning", "story"],
        "category": "objects"
    },
    {
        "symbol": "crown",
        "meaning": "Authority, achievement, recognition, higher self",
        "keywords": ["authority", "achievement", "recognition", "power"],
        "category": "objects"
    },
    {
        "symbol": "sword",
        "meaning": "Power, conflict, decision, cutting through illusion",
        "keywords": ["power", "conflict", "decision", "clarity"],
        "category": "objects"
    },
    {
        "symbol": "flower",
        "meaning": "Beauty, growth, unfolding potential, love",
        "keywords": ["beauty", "growth", "potential", "love"],
        "category": "objects"
    },
    {
        "symbol": "ring",
        "meaning": "Commitment, unity, eternity, wholeness",
        "keywords": ["commitment", "unity", "eternity", "wholeness"],
        "category": "objects"
    },
    
    # People
    {
        "symbol": "child",
        "meaning": "Innocence, new beginnings, inner child, potential",
        "keywords": ["innocence", "beginning", "inner child", "potential"],
        "category": "people"
    },
    {
        "symbol": "elder",
        "meaning": "Wisdom, guidance, experience, ancestral knowledge",
        "keywords": ["wisdom", "guidance", "experience", "knowledge"],
        "category": "people"
    },
    {
        "symbol": "stranger",
        "meaning": "Unknown aspects of self, new opportunities, shadow self",
        "keywords": ["unknown", "opportunity", "shadow", "mystery"],
        "category": "people"
    },
    {
        "symbol": "guide",
        "meaning": "Higher self, spiritual guidance, mentor, inner wisdom",
        "keywords": ["guidance", "spirit", "mentor", "wisdom"],
        "category": "people"
    },
    
    # Colors
    {
        "symbol": "white",
        "meaning": "Purity, clarity, new beginnings, spiritual light",
        "keywords": ["purity", "clarity", "beginning", "light"],
        "category": "colors"
    },
    {
        "symbol": "black",
        "meaning": "Mystery, the unknown, potential, shadow work",
        "keywords": ["mystery", "unknown", "potential", "shadow"],
        "category": "colors"
    },
    {
        "symbol": "red",
        "meaning": "Passion, energy, life force, anger, love",
        "keywords": ["passion", "energy", "life", "emotion"],
        "category": "colors"
    },
    {
        "symbol": "blue",
        "meaning": "Peace, communication, truth, spirituality",
        "keywords": ["peace", "communication", "truth", "spirit"],
        "category": "colors"
    },
    {
        "symbol": "green",
        "meaning": "Growth, healing, nature, abundance",
        "keywords": ["growth", "healing", "nature", "abundance"],
        "category": "colors"
    },
    {
        "symbol": "gold",
        "meaning": "Divine light, spiritual wealth, enlightenment, value",
        "keywords": ["divine", "wealth", "enlightenment", "value"],
        "category": "colors"
    },
    {
        "symbol": "purple",
        "meaning": "Spirituality, intuition, mysticism, transformation",
        "keywords": ["spirituality", "intuition", "mysticism", "transformation"],
        "category": "colors"
    }
]


def get_all_symbols() -> List[Dict]:
    """Get all dream symbols"""
    return DREAM_SYMBOLS


def get_symbol_by_name(symbol_name: str) -> Optional[Dict]:
    """Get a specific symbol by name"""
    symbol_name_lower = symbol_name.lower()
    for symbol in DREAM_SYMBOLS:
        if symbol["symbol"].lower() == symbol_name_lower:
            return symbol
    return None


def get_symbols_by_category(category: str) -> List[Dict]:
    """Get all symbols in a category"""
    return [s for s in DREAM_SYMBOLS if s["category"] == category]


def search_symbols(query: str) -> List[Dict]:
    """Search symbols by name or keywords"""
    query_lower = query.lower()
    results = []
    for symbol in DREAM_SYMBOLS:
        if (query_lower in symbol["symbol"].lower() or
            query_lower in symbol["meaning"].lower() or
            any(query_lower in keyword.lower() for keyword in symbol["keywords"])):
            results.append(symbol)
    return results
