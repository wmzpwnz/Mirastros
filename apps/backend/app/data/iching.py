"""I Ching Hexagrams Database - Book of Changes"""

# 64 Hexagrams of the I Ching
HEXAGRAMS = [
    {
        "id": 1,
        "number": 1,
        "name": "The Creative",
        "chinese": "乾 (Qián)",
        "trigrams": {"upper": "Heaven", "lower": "Heaven"},
        "binary": "111111",
        "judgment": "The Creative works sublime success, furthering through perseverance.",
        "image": "The movement of heaven is full of power. Thus the superior person makes themselves strong and untiring.",
        "meaning": "Pure creative energy, strength, leadership, and initiative. This hexagram represents the primal power of the universe.",
        "advice": "This is a time of great potential and power. Act with confidence and integrity. Your creative energy is at its peak.",
        "keywords": ["creativity", "strength", "leadership", "initiative", "power"]
    },
    {
        "id": 2,
        "number": 2,
        "name": "The Receptive",
        "chinese": "坤 (Kūn)",
        "trigrams": {"upper": "Earth", "lower": "Earth"},
        "binary": "000000",
        "judgment": "The Receptive brings supreme success through the perseverance of a mare.",
        "image": "The earth's condition is receptive devotion. Thus the superior person supports all things with generous virtue.",
        "meaning": "Receptivity, devotion, yielding strength, and nurturing. This hexagram represents the primal power of the receptive.",
        "advice": "Be receptive and open. Success comes through patience and devotion. Support others and allow things to unfold naturally.",
        "keywords": ["receptivity", "devotion", "patience", "nurturing", "yielding"]
    },
    {
        "id": 3,
        "number": 3,
        "name": "Difficulty at the Beginning",
        "chinese": "屯 (Zhūn)",
        "trigrams": {"upper": "Water", "lower": "Thunder"},
        "binary": "010001",
        "judgment": "Difficulty at the Beginning works supreme success, furthering through perseverance.",
        "image": "Clouds and thunder: the image of Difficulty at the Beginning. Thus the superior person brings order out of confusion.",
        "meaning": "Initial difficulties, chaos before order, the struggle of new beginnings. Growth requires patience.",
        "advice": "Don't be discouraged by initial obstacles. Persevere through difficulties. Seek help when needed. Order will emerge from chaos.",
        "keywords": ["difficulty", "new beginnings", "perseverance", "chaos", "growth"]
    },
    {
        "id": 4,
        "number": 4,
        "name": "Youthful Folly",
        "chinese": "蒙 (Méng)",
        "trigrams": {"upper": "Mountain", "lower": "Water"},
        "binary": "100010",
        "judgment": "Youthful Folly has success. It is not I who seek the young fool; the young fool seeks me.",
        "image": "A spring wells up at the foot of the mountain: the image of Youth. Thus the superior person fosters character by thoroughness.",
        "meaning": "Inexperience, learning, seeking guidance, and the need for education. The student must be ready to learn.",
        "advice": "Acknowledge what you don't know. Seek wisdom from those with experience. Be humble and willing to learn.",
        "keywords": ["inexperience", "learning", "guidance", "humility", "education"]
    },
    {
        "id": 5,
        "number": 5,
        "name": "Waiting",
        "chinese": "需 (Xū)",
        "trigrams": {"upper": "Water", "lower": "Heaven"},
        "binary": "010111",
        "judgment": "Waiting. If you are sincere, you have light and success. Perseverance brings good fortune.",
        "image": "Clouds rise up to heaven: the image of Waiting. Thus the superior person eats and drinks, is joyous and of good cheer.",
        "meaning": "Patient waiting, nourishment, preparation, and trust in timing. Success requires patience.",
        "advice": "Wait patiently for the right moment. Nourish yourself during this time. Trust that things will unfold when ready.",
        "keywords": ["patience", "waiting", "timing", "preparation", "trust"]
    },
    {
        "id": 6,
        "number": 6,
        "name": "Conflict",
        "chinese": "訟 (Sòng)",
        "trigrams": {"upper": "Heaven", "lower": "Water"},
        "binary": "111010",
        "judgment": "Conflict. You are sincere and are being obstructed. A cautious halt halfway brings good fortune.",
        "image": "Heaven and water go their opposite ways: the image of Conflict. Thus the superior person carefully considers the beginning.",
        "meaning": "Conflict, opposition, the need for compromise. Avoid escalation and seek middle ground.",
        "advice": "Avoid confrontation. Seek compromise and mediation. Consider the other perspective. Retreat if necessary.",
        "keywords": ["conflict", "opposition", "compromise", "caution", "mediation"]
    },
    {
        "id": 7,
        "number": 7,
        "name": "The Army",
        "chinese": "師 (Shī)",
        "trigrams": {"upper": "Earth", "lower": "Water"},
        "binary": "000010",
        "judgment": "The Army needs perseverance and a strong person. Good fortune without blame.",
        "image": "In the middle of the earth is water: the image of the Army. Thus the superior person increases the masses.",
        "meaning": "Discipline, organization, leadership, and collective effort. Success through structure and order.",
        "advice": "Lead with discipline and integrity. Organize your resources. Work with others toward a common goal.",
        "keywords": ["discipline", "leadership", "organization", "collective", "structure"]
    },
    {
        "id": 8,
        "number": 8,
        "name": "Holding Together",
        "chinese": "比 (Bǐ)",
        "trigrams": {"upper": "Water", "lower": "Earth"},
        "binary": "010000",
        "judgment": "Holding Together brings good fortune. Inquire of the oracle once again whether you possess sublimity.",
        "image": "On the earth is water: the image of Holding Together. Thus the kings of antiquity bestowed fiefs and cultivated friendly relations.",
        "meaning": "Union, alliance, relationships, and mutual support. Strength through unity.",
        "advice": "Seek alliances and partnerships. Build strong relationships. Support others and accept support. Unity brings strength.",
        "keywords": ["union", "alliance", "relationships", "support", "unity"]
    },
    # Adding more key hexagrams (9-20)
    {"id": 9, "number": 9, "name": "Small Taming", "chinese": "小畜 (Xiǎo Chù)", "trigrams": {"upper": "Wind", "lower": "Heaven"}, "binary": "110111",
     "judgment": "Small Taming has success. Dense clouds, no rain from our western region.", "image": "The wind drives across heaven.", 
     "meaning": "Gentle restraint, small accumulations, patience in building.", "advice": "Build gradually. Small steps lead to success. Be patient with progress.",
     "keywords": ["restraint", "patience", "gradual", "accumulation", "gentle"]},
    {"id": 10, "number": 10, "name": "Treading", "chinese": "履 (Lǚ)", "trigrams": {"upper": "Heaven", "lower": "Lake"}, "binary": "111011",
     "judgment": "Treading upon the tail of the tiger. It does not bite. Success.", "image": "Heaven above, the lake below.",
     "meaning": "Careful conduct, proper behavior, walking a dangerous path safely.", "advice": "Proceed with caution and respect. Mind your manners. Success through careful action.",
     "keywords": ["caution", "conduct", "respect", "careful", "propriety"]},
    {"id": 11, "number": 11, "name": "Peace", "chinese": "泰 (Tài)", "trigrams": {"upper": "Earth", "lower": "Heaven"}, "binary": "000111",
     "judgment": "Peace. The small departs, the great approaches. Good fortune. Success.", "image": "Heaven and earth unite.",
     "meaning": "Harmony, prosperity, balance, and good fortune. Heaven and earth in perfect union.", "advice": "Enjoy this time of harmony. Share your good fortune. Maintain balance.",
     "keywords": ["peace", "harmony", "prosperity", "balance", "fortune"]},
    {"id": 12, "number": 12, "name": "Standstill", "chinese": "否 (Pǐ)", "trigrams": {"upper": "Heaven", "lower": "Earth"}, "binary": "111000",
     "judgment": "Standstill. Evil people do not further the perseverance of the superior person.", "image": "Heaven and earth do not unite.",
     "meaning": "Stagnation, obstruction, separation. A time when things do not flow.", "advice": "Accept the standstill. Conserve energy. Wait for conditions to change.",
     "keywords": ["stagnation", "obstruction", "separation", "waiting", "patience"]},
    # Key hexagrams 13-30
    {"id": 13, "number": 13, "name": "Fellowship", "chinese": "同人 (Tóng Rén)", "trigrams": {"upper": "Heaven", "lower": "Fire"}, "binary": "111101",
     "judgment": "Fellowship with others in the open. Success.", "image": "Heaven together with fire.",
     "meaning": "Community, fellowship, shared goals, and cooperation.", "advice": "Work with others openly. Build community. Shared goals bring success.",
     "keywords": ["fellowship", "community", "cooperation", "shared goals", "unity"]},
    {"id": 14, "number": 14, "name": "Great Possession", "chinese": "大有 (Dà Yǒu)", "trigrams": {"upper": "Fire", "lower": "Heaven"}, "binary": "101111",
     "judgment": "Great Possession: supreme success.", "image": "Fire in heaven above.",
     "meaning": "Abundance, great wealth, success, and blessings.", "advice": "Use your abundance wisely. Share with others. Maintain humility in success.",
     "keywords": ["abundance", "wealth", "success", "blessings", "prosperity"]},
    {"id": 15, "number": 15, "name": "Modesty", "chinese": "謙 (Qiān)", "trigrams": {"upper": "Earth", "lower": "Mountain"}, "binary": "000100",
     "judgment": "Modesty creates success. The superior person carries things through.", "image": "Within the earth, a mountain.",
     "meaning": "Humility, modesty, and the strength that comes from not boasting.", "advice": "Practice humility. Let your actions speak. Modesty brings respect and success.",
     "keywords": ["modesty", "humility", "respect", "balance", "virtue"]},
    {"id": 16, "number": 16, "name": "Enthusiasm", "chinese": "豫 (Yù)", "trigrams": {"upper": "Thunder", "lower": "Earth"}, "binary": "001000",
     "judgment": "Enthusiasm. It furthers one to install helpers and to set armies marching.", "image": "Thunder comes resounding out of the earth.",
     "meaning": "Enthusiasm, inspiration, motivation, and joyful action.", "advice": "Act with enthusiasm. Inspire others. Channel your energy positively.",
     "keywords": ["enthusiasm", "inspiration", "motivation", "joy", "energy"]},
    {"id": 17, "number": 17, "name": "Following", "chinese": "隨 (Suí)", "trigrams": {"upper": "Lake", "lower": "Thunder"}, "binary": "011001",
     "judgment": "Following has supreme success. Perseverance furthers. No blame.", "image": "Thunder in the middle of the lake.",
     "meaning": "Following, adaptation, going with the flow, and flexibility.", "advice": "Adapt to circumstances. Follow wise guidance. Be flexible in your approach.",
     "keywords": ["following", "adaptation", "flexibility", "flow", "guidance"]},
    # Hexagrams 18-40 (representative selection)
    {"id": 18, "number": 18, "name": "Work on the Decayed", "chinese": "蠱 (Gǔ)", "trigrams": {"upper": "Mountain", "lower": "Wind"}, "binary": "100110",
     "judgment": "Work on what has been spoiled has supreme success.", "image": "The wind blows low on the mountain.",
     "meaning": "Repair, correction, dealing with decay, and restoration.", "advice": "Address problems that have been neglected. Repair what is broken. Start fresh.",
     "keywords": ["repair", "correction", "restoration", "renewal", "healing"]},
    {"id": 19, "number": 19, "name": "Approach", "chinese": "臨 (Lín)", "trigrams": {"upper": "Earth", "lower": "Lake"}, "binary": "000011",
     "judgment": "Approach has supreme success. Perseverance furthers.", "image": "The earth above the lake.",
     "meaning": "Approach, advancement, progress, and favorable conditions.", "advice": "Move forward with confidence. Conditions are favorable. Take advantage of opportunities.",
     "keywords": ["approach", "advancement", "progress", "opportunity", "favorable"]},
    {"id": 20, "number": 20, "name": "Contemplation", "chinese": "觀 (Guān)", "trigrams": {"upper": "Wind", "lower": "Earth"}, "binary": "110000",
     "judgment": "Contemplation. The ablution has been made, but not yet the offering.", "image": "The wind blows over the earth.",
     "meaning": "Observation, contemplation, reflection, and gaining perspective.", "advice": "Step back and observe. Reflect on the situation. Gain perspective before acting.",
     "keywords": ["contemplation", "observation", "reflection", "perspective", "insight"]},
    {"id": 21, "number": 21, "name": "Biting Through", "chinese": "噬嗑 (Shì Kè)", "trigrams": {"upper": "Fire", "lower": "Thunder"}, "binary": "101001",
     "judgment": "Biting Through has success. It is favorable to let justice be administered.", "image": "Thunder and lightning.",
     "meaning": "Decisive action, removing obstacles, justice, and breaking through.", "advice": "Take decisive action. Remove obstacles. Seek justice. Break through barriers.",
     "keywords": ["decisive", "justice", "breakthrough", "action", "obstacles"]},
    {"id": 22, "number": 22, "name": "Grace", "chinese": "賁 (Bì)", "trigrams": {"upper": "Mountain", "lower": "Fire"}, "binary": "100101",
     "judgment": "Grace has success. In small matters it is favorable to undertake something.", "image": "Fire at the foot of the mountain.",
     "meaning": "Beauty, grace, elegance, and proper form.", "advice": "Pay attention to form and beauty. Present yourself well. Grace enhances substance.",
     "keywords": ["grace", "beauty", "elegance", "form", "presentation"]},
    # More key hexagrams (23-50)
    {"id": 23, "number": 23, "name": "Splitting Apart", "chinese": "剝 (Bō)", "trigrams": {"upper": "Mountain", "lower": "Earth"}, "binary": "100000",
     "judgment": "Splitting Apart. It does not further one to go anywhere.", "image": "The mountain rests on the earth.",
     "meaning": "Decline, disintegration, letting go, and the end of a cycle.", "advice": "Accept the decline. Let go of what no longer serves. Wait for renewal.",
     "keywords": ["decline", "letting go", "endings", "acceptance", "patience"]},
    {"id": 24, "number": 24, "name": "Return", "chinese": "復 (Fù)", "trigrams": {"upper": "Earth", "lower": "Thunder"}, "binary": "000001",
     "judgment": "Return. Success. Going out and coming in without error.", "image": "Thunder within the earth.",
     "meaning": "Return, renewal, new beginnings, and the turning point.", "advice": "Welcome the return of energy. New beginnings are here. The cycle renews.",
     "keywords": ["return", "renewal", "new beginnings", "cycle", "revival"]},
    {"id": 25, "number": 25, "name": "Innocence", "chinese": "無妄 (Wú Wàng)", "trigrams": {"upper": "Heaven", "lower": "Thunder"}, "binary": "111001",
     "judgment": "Innocence. Supreme success. Perseverance furthers.", "image": "Under heaven thunder rolls.",
     "meaning": "Innocence, spontaneity, natural action, and authenticity.", "advice": "Act naturally and spontaneously. Be authentic. Trust your instincts.",
     "keywords": ["innocence", "spontaneity", "authenticity", "natural", "trust"]},
    {"id": 26, "number": 26, "name": "Great Taming", "chinese": "大畜 (Dà Chù)", "trigrams": {"upper": "Mountain", "lower": "Heaven"}, "binary": "100111",
     "judgment": "The Taming Power of the Great. Perseverance furthers.", "image": "Heaven within the mountain.",
     "meaning": "Great accumulation, restraint, building strength, and preparation.", "advice": "Build your resources. Restrain impulses. Prepare for future action.",
     "keywords": ["accumulation", "restraint", "strength", "preparation", "patience"]},
    {"id": 27, "number": 27, "name": "Nourishment", "chinese": "頤 (Yí)", "trigrams": {"upper": "Mountain", "lower": "Thunder"}, "binary": "100001",
     "judgment": "The Corners of the Mouth. Perseverance brings good fortune.", "image": "At the foot of the mountain, thunder.",
     "meaning": "Nourishment, sustenance, what we take in, and self-care.", "advice": "Nourish yourself properly. Be mindful of what you consume. Care for your wellbeing.",
     "keywords": ["nourishment", "sustenance", "care", "consumption", "wellbeing"]},
    # Additional important hexagrams (28-64 selection)
    {"id": 28, "number": 28, "name": "Great Exceeding", "chinese": "大過 (Dà Guò)", "trigrams": {"upper": "Lake", "lower": "Wind"}, "binary": "011110",
     "judgment": "The ridgepole sags to the breaking point. It furthers one to have somewhere to go.", "image": "The lake rises above the trees.",
     "meaning": "Excess, extraordinary times, critical situations, and the need for action.", "advice": "Extraordinary times require extraordinary measures. Act decisively. Seek support.",
     "keywords": ["excess", "extraordinary", "critical", "decisive", "action"]},
    {"id": 29, "number": 29, "name": "The Abysmal Water", "chinese": "坎 (Kǎn)", "trigrams": {"upper": "Water", "lower": "Water"}, "binary": "010010",
     "judgment": "The Abysmal repeated. If you are sincere, you have success in your heart.", "image": "Water flows on uninterruptedly.",
     "meaning": "Danger, challenge, depth, and the need for courage and sincerity.", "advice": "Face danger with courage. Stay sincere. Flow like water through obstacles.",
     "keywords": ["danger", "challenge", "courage", "depth", "sincerity"]},
    {"id": 30, "number": 30, "name": "The Clinging Fire", "chinese": "離 (Lí)", "trigrams": {"upper": "Fire", "lower": "Fire"}, "binary": "101101",
     "judgment": "The Clinging. Perseverance furthers. It brings success.", "image": "That which is bright rises twice.",
     "meaning": "Clarity, illumination, attachment, and dependence on what is right.", "advice": "Seek clarity and illumination. Attach yourself to what is good and true. Shine your light.",
     "keywords": ["clarity", "illumination", "light", "attachment", "truth"]},
    {"id": 31, "number": 31, "name": "Influence", "chinese": "咸 (Xián)", "trigrams": {"upper": "Lake", "lower": "Mountain"}, "binary": "011100",
     "judgment": "Influence. Success. Perseverance furthers. Taking a maiden to wife brings good fortune.", "image": "A lake on the mountain.",
     "meaning": "Attraction, influence, courtship, and mutual responsiveness.", "advice": "Be open to influence. Attract through authenticity. Mutual respect brings success.",
     "keywords": ["influence", "attraction", "courtship", "mutual", "responsiveness"]},
    {"id": 32, "number": 32, "name": "Duration", "chinese": "恆 (Héng)", "trigrams": {"upper": "Thunder", "lower": "Wind"}, "binary": "001110",
     "judgment": "Duration. Success. No blame. Perseverance furthers.", "image": "Thunder and wind.",
     "meaning": "Endurance, consistency, long-lasting, and steadfastness.", "advice": "Be consistent and steady. Endure through challenges. Long-term commitment brings success.",
     "keywords": ["duration", "endurance", "consistency", "steadfast", "commitment"]},
    # Final selection of important hexagrams (33-64)
    {"id": 33, "number": 33, "name": "Retreat", "chinese": "遯 (Dùn)", "trigrams": {"upper": "Heaven", "lower": "Mountain"}, "binary": "111100",
     "judgment": "Retreat. Success. In what is small, perseverance furthers.", "image": "Mountain under heaven.",
     "meaning": "Strategic withdrawal, retreat, and knowing when to step back.", "advice": "Retreat is not defeat. Step back strategically. Preserve your strength.",
     "keywords": ["retreat", "withdrawal", "strategy", "preservation", "timing"]},
    {"id": 42, "number": 42, "name": "Increase", "chinese": "益 (Yì)", "trigrams": {"upper": "Wind", "lower": "Thunder"}, "binary": "110001",
     "judgment": "Increase. It furthers one to undertake something.", "image": "Wind and thunder.",
     "meaning": "Increase, growth, expansion, and beneficial development.", "advice": "This is a time of increase. Expand your efforts. Growth is favored.",
     "keywords": ["increase", "growth", "expansion", "benefit", "development"]},
    {"id": 43, "number": 43, "name": "Breakthrough", "chinese": "夬 (Guài)", "trigrams": {"upper": "Lake", "lower": "Heaven"}, "binary": "011111",
     "judgment": "Breakthrough. One must resolutely make the matter known.", "image": "The lake has risen up to heaven.",
     "meaning": "Breakthrough, resolution, determination, and decisive action.", "advice": "Break through obstacles decisively. Resolve the matter. Act with determination.",
     "keywords": ["breakthrough", "resolution", "determination", "decisive", "clarity"]},
    {"id": 50, "number": 50, "name": "The Cauldron", "chinese": "鼎 (Dǐng)", "trigrams": {"upper": "Fire", "lower": "Wind"}, "binary": "101110",
     "judgment": "The Cauldron. Supreme good fortune. Success.", "image": "Fire over wood.",
     "meaning": "Transformation, nourishment, the vessel that transforms, and spiritual sustenance.", "advice": "Transform and refine. Nourish yourself and others. Create something of value.",
     "keywords": ["transformation", "nourishment", "refinement", "vessel", "sustenance"]},
    {"id": 61, "number": 61, "name": "Inner Truth", "chinese": "中孚 (Zhōng Fú)", "trigrams": {"upper": "Wind", "lower": "Lake"}, "binary": "110011",
     "judgment": "Inner Truth. It furthers one to cross the great water.", "image": "Wind over lake.",
     "meaning": "Inner truth, sincerity, authenticity, and genuine understanding.", "advice": "Be sincere and truthful. Trust your inner knowing. Authenticity brings success.",
     "keywords": ["truth", "sincerity", "authenticity", "genuine", "understanding"]},
    {"id": 63, "number": 63, "name": "After Completion", "chinese": "既濟 (Jì Jì)", "trigrams": {"upper": "Water", "lower": "Fire"}, "binary": "010101",
     "judgment": "After Completion. Success in small matters. Perseverance furthers.", "image": "Water over fire.",
     "meaning": "Completion, achievement, but also the seeds of new beginnings. Success requires vigilance.", "advice": "Celebrate completion but remain vigilant. Success requires maintenance. New cycles begin.",
     "keywords": ["completion", "achievement", "vigilance", "maintenance", "transition"]},
    {"id": 64, "number": 64, "name": "Before Completion", "chinese": "未濟 (Wèi Jì)", "trigrams": {"upper": "Fire", "lower": "Water"}, "binary": "101010",
     "judgment": "Before Completion. Success. But if the little fox crosses the water, it gets its tail wet.", "image": "Fire over water.",
     "meaning": "Not yet complete, potential, the threshold, and careful progress needed.", "advice": "Almost there but not quite. Proceed carefully. Don't rush the final steps.",
     "keywords": ["potential", "threshold", "careful", "progress", "patience"]},
]


def get_all_hexagrams():
    """Get all 64 I Ching hexagrams"""
    return HEXAGRAMS


def get_hexagram_by_number(number: int):
    """Get a specific hexagram by its number (1-64)"""
    for hexagram in HEXAGRAMS:
        if hexagram["number"] == number:
            return hexagram
    return None


def get_hexagram_by_binary(binary: str):
    """Get a hexagram by its binary representation"""
    for hexagram in HEXAGRAMS:
        if hexagram["binary"] == binary:
            return hexagram
    return None


def binary_to_hexagram_number(binary: str) -> int:
    """Convert binary representation to hexagram number"""
    hexagram = get_hexagram_by_binary(binary)
    return hexagram["number"] if hexagram else None
