"""Rituals and meditation data"""
from typing import Dict, List

# Meditation goals and their associated themes
MEDITATION_GOALS = {
    "money": {
        "name": "Prosperity and Abundance",
        "themes": ["wealth", "success", "opportunities", "manifestation"],
        "chakra": "solar_plexus",
        "element": "earth",
        "planets": ["Jupiter", "Venus"],
        "affirmations": [
            "I am a magnet for prosperity and abundance",
            "Money flows to me easily and effortlessly",
            "I am worthy of financial success",
            "The universe provides for all my needs",
            "I attract opportunities for wealth and growth"
        ]
    },
    "love": {
        "name": "Love and Relationships",
        "themes": ["romance", "connection", "self-love", "harmony"],
        "chakra": "heart",
        "element": "water",
        "planets": ["Venus", "Moon"],
        "affirmations": [
            "I am worthy of deep and meaningful love",
            "Love flows to me naturally and abundantly",
            "I attract healthy and loving relationships",
            "My heart is open to giving and receiving love",
            "I radiate love and attract love in return"
        ]
    },
    "health": {
        "name": "Health and Vitality",
        "themes": ["healing", "energy", "balance", "wellness"],
        "chakra": "root",
        "element": "earth",
        "planets": ["Sun", "Mars"],
        "affirmations": [
            "My body is healthy, strong, and vibrant",
            "I am filled with healing energy",
            "Every cell in my body radiates health",
            "I honor and care for my physical body",
            "I am grateful for my body's natural healing abilities"
        ]
    },
    "peace": {
        "name": "Inner Peace and Calm",
        "themes": ["tranquility", "serenity", "balance", "mindfulness"],
        "chakra": "crown",
        "element": "air",
        "planets": ["Moon", "Neptune"],
        "affirmations": [
            "I am at peace with myself and the world",
            "Calmness washes over me with every breath",
            "I release all tension and embrace tranquility",
            "My mind is clear and peaceful",
            "I am centered and grounded in this moment"
        ]
    },
    "success": {
        "name": "Success and Achievement",
        "themes": ["goals", "ambition", "confidence", "victory"],
        "chakra": "solar_plexus",
        "element": "fire",
        "planets": ["Sun", "Mars", "Jupiter"],
        "affirmations": [
            "I am capable of achieving my goals",
            "Success comes naturally to me",
            "I am confident in my abilities",
            "Every day I move closer to my dreams",
            "I celebrate my achievements and progress"
        ]
    },
    "protection": {
        "name": "Protection and Safety",
        "themes": ["security", "boundaries", "shielding", "strength"],
        "chakra": "root",
        "element": "earth",
        "planets": ["Saturn", "Mars"],
        "affirmations": [
            "I am safe and protected at all times",
            "I create healthy boundaries in my life",
            "Divine protection surrounds me",
            "I am strong and resilient",
            "I trust in my ability to protect myself"
        ]
    },
    "creativity": {
        "name": "Creativity and Inspiration",
        "themes": ["expression", "imagination", "innovation", "flow"],
        "chakra": "sacral",
        "element": "water",
        "planets": ["Venus", "Neptune"],
        "affirmations": [
            "I am a channel for creative energy",
            "Inspiration flows through me effortlessly",
            "I express myself freely and authentically",
            "My creativity knows no bounds",
            "I trust my creative instincts"
        ]
    },
    "wisdom": {
        "name": "Wisdom and Clarity",
        "themes": ["insight", "understanding", "intuition", "knowledge"],
        "chakra": "third_eye",
        "element": "air",
        "planets": ["Mercury", "Jupiter"],
        "affirmations": [
            "I trust my inner wisdom",
            "Clarity comes to me easily",
            "I see the truth in all situations",
            "My intuition guides me perfectly",
            "I am open to divine wisdom"
        ]
    }
}

# Lunar phase rituals
LUNAR_RITUALS = {
    "new_moon": {
        "name": "New Moon Ritual - New Beginnings",
        "purpose": "Setting intentions and planting seeds for the lunar cycle",
        "duration": "20-30 minutes",
        "best_time": "Within 48 hours of New Moon",
        "items_needed": [
            "White or silver candle",
            "Journal and pen",
            "Crystals: Clear Quartz, Moonstone, or Labradorite",
            "Incense: Sage or Sandalwood"
        ],
        "steps": [
            {
                "step": 1,
                "title": "Cleanse Your Space",
                "description": "Light sage or incense and cleanse your ritual space. Move clockwise around the room, setting the intention to clear old energy.",
                "duration": "3-5 minutes"
            },
            {
                "step": 2,
                "title": "Create Sacred Space",
                "description": "Light your candle and arrange your crystals. Sit comfortably and take three deep breaths, centering yourself in the present moment.",
                "duration": "2-3 minutes"
            },
            {
                "step": 3,
                "title": "Meditation",
                "description": "Close your eyes and visualize the dark New Moon sky. Feel the potential of new beginnings. Ask yourself: What do I want to create in this lunar cycle?",
                "duration": "5-7 minutes"
            },
            {
                "step": 4,
                "title": "Set Intentions",
                "description": "Write down 3-5 intentions for the coming month. Be specific and write in present tense as if they're already happening. Example: 'I am attracting abundance' rather than 'I want abundance.'",
                "duration": "5-10 minutes"
            },
            {
                "step": 5,
                "title": "Charge Your Intentions",
                "description": "Hold your written intentions over the candle flame (safely) and visualize them manifesting. Feel the emotions of having achieved them.",
                "duration": "3-5 minutes"
            },
            {
                "step": 6,
                "title": "Close the Ritual",
                "description": "Thank the universe, your guides, or whatever higher power you believe in. Blow out the candle and keep your intentions somewhere visible.",
                "duration": "2 minutes"
            }
        ],
        "affirmations": [
            "I embrace new beginnings with an open heart",
            "I plant seeds of intention that will bloom beautifully",
            "The universe supports my dreams and desires",
            "I am ready to manifest my highest good"
        ]
    },
    "full_moon": {
        "name": "Full Moon Ritual - Release and Gratitude",
        "purpose": "Releasing what no longer serves and celebrating manifestations",
        "duration": "20-30 minutes",
        "best_time": "On the night of Full Moon or within 24 hours",
        "items_needed": [
            "White or silver candle",
            "Journal and pen",
            "Crystals: Selenite, Clear Quartz, or Amethyst",
            "Bowl of water (to represent emotions)",
            "Paper for burning (fireproof container)"
        ],
        "steps": [
            {
                "step": 1,
                "title": "Prepare Your Space",
                "description": "If possible, perform this ritual where you can see the Full Moon. Light your candle and place your crystals around you.",
                "duration": "3 minutes"
            },
            {
                "step": 2,
                "title": "Moon Bathing",
                "description": "Stand or sit in the moonlight (or visualize it). Feel the Moon's energy washing over you, illuminating everything in your life.",
                "duration": "5 minutes"
            },
            {
                "step": 3,
                "title": "Gratitude Practice",
                "description": "Write down everything you're grateful for from the past month. Acknowledge your growth, achievements, and blessings, no matter how small.",
                "duration": "5-7 minutes"
            },
            {
                "step": 4,
                "title": "Release Ceremony",
                "description": "On separate paper, write what you want to release: fears, limiting beliefs, toxic patterns, or relationships. Be honest and specific.",
                "duration": "5 minutes"
            },
            {
                "step": 5,
                "title": "Burning Ritual",
                "description": "Safely burn the release paper in your fireproof container. As it burns, visualize these things leaving your life. Say: 'I release you with love and gratitude for the lessons learned.'",
                "duration": "3-5 minutes"
            },
            {
                "step": 6,
                "title": "Cleansing",
                "description": "Dip your fingers in the water bowl and touch your third eye, heart, and palms. Visualize the Full Moon's light cleansing and renewing you.",
                "duration": "2-3 minutes"
            },
            {
                "step": 7,
                "title": "Close the Ritual",
                "description": "Thank the Moon and the universe. Blow out the candle. Dispose of the ashes in the earth or running water.",
                "duration": "2 minutes"
            }
        ],
        "affirmations": [
            "I release what no longer serves my highest good",
            "I am grateful for all the blessings in my life",
            "I trust the universe's timing and wisdom",
            "I am cleansed and renewed by the Full Moon's light"
        ]
    },
    "waxing_moon": {
        "name": "Waxing Moon Ritual - Growth and Action",
        "purpose": "Taking action on intentions and building momentum",
        "duration": "15-20 minutes",
        "best_time": "During Waxing Crescent or Waxing Gibbous phase",
        "items_needed": [
            "Green or gold candle",
            "Journal and pen",
            "Crystals: Citrine, Green Aventurine, or Tiger's Eye",
            "Action plan or to-do list"
        ],
        "steps": [
            {
                "step": 1,
                "title": "Set Up",
                "description": "Light your candle and place your crystals nearby. Review your New Moon intentions.",
                "duration": "2 minutes"
            },
            {
                "step": 2,
                "title": "Progress Check",
                "description": "Reflect on what actions you've taken toward your intentions. Celebrate any progress, no matter how small.",
                "duration": "5 minutes"
            },
            {
                "step": 3,
                "title": "Action Planning",
                "description": "Write down 3-5 specific actions you'll take before the Full Moon to move your intentions forward. Make them concrete and achievable.",
                "duration": "5-7 minutes"
            },
            {
                "step": 4,
                "title": "Energy Boost Meditation",
                "description": "Hold your crystals and visualize the growing Moon filling you with energy and motivation. See yourself taking action and succeeding.",
                "duration": "5 minutes"
            },
            {
                "step": 5,
                "title": "Commitment",
                "description": "Read your action plan aloud as a commitment to yourself. Place it somewhere you'll see daily.",
                "duration": "2 minutes"
            }
        ],
        "affirmations": [
            "I take inspired action toward my goals",
            "My efforts are supported by the universe",
            "I am building momentum with each step",
            "Success flows to me as I take action"
        ]
    },
    "waning_moon": {
        "name": "Waning Moon Ritual - Rest and Reflection",
        "purpose": "Releasing, resting, and preparing for the next cycle",
        "duration": "15-20 minutes",
        "best_time": "During Waning Gibbous or Waning Crescent phase",
        "items_needed": [
            "Black or dark blue candle",
            "Journal and pen",
            "Crystals: Black Tourmaline, Obsidian, or Smoky Quartz",
            "Comfortable space for rest"
        ],
        "steps": [
            {
                "step": 1,
                "title": "Create Restful Space",
                "description": "Dim the lights, light your candle, and create a cozy, peaceful environment. This is a time for gentleness.",
                "duration": "2 minutes"
            },
            {
                "step": 2,
                "title": "Reflection",
                "description": "Journal about the past lunar cycle. What worked? What didn't? What patterns do you notice? Be honest but compassionate with yourself.",
                "duration": "7-10 minutes"
            },
            {
                "step": 3,
                "title": "Release Meditation",
                "description": "Close your eyes and visualize the waning Moon. With each exhale, release stress, disappointment, or anything heavy you're carrying.",
                "duration": "5 minutes"
            },
            {
                "step": 4,
                "title": "Rest and Restore",
                "description": "Lie down with your crystals on your body. Simply rest and allow yourself to be still. You don't need to do anything.",
                "duration": "5 minutes"
            },
            {
                "step": 5,
                "title": "Gentle Close",
                "description": "When ready, thank yourself for taking this time. Blow out the candle and commit to rest before the next New Moon.",
                "duration": "1 minute"
            }
        ],
        "affirmations": [
            "I honor my need for rest and restoration",
            "I release what is complete and make space for new",
            "I trust the natural cycles of growth and rest",
            "I am gentle with myself during this reflective time"
        ]
    }
}

# Daily affirmation categories by zodiac sign
ZODIAC_AFFIRMATIONS = {
    "Aries": [
        "I channel my energy into positive action",
        "I am a courageous leader and pioneer",
        "My enthusiasm inspires others",
        "I trust my instincts and take bold steps"
    ],
    "Taurus": [
        "I am grounded and secure in my being",
        "Abundance flows to me naturally",
        "I appreciate the beauty in life",
        "I am patient and persistent in my goals"
    ],
    "Gemini": [
        "I communicate my truth with clarity",
        "My curiosity leads me to wonderful discoveries",
        "I adapt easily to change",
        "I connect meaningfully with others"
    ],
    "Cancer": [
        "I honor my emotions and intuition",
        "I create a nurturing space for myself and others",
        "My sensitivity is my strength",
        "I am protected and safe"
    ],
    "Leo": [
        "I shine my light brightly and authentically",
        "I am worthy of love and admiration",
        "My creativity flows freely",
        "I lead with my heart"
    ],
    "Virgo": [
        "I am organized and efficient",
        "I serve others with love and wisdom",
        "My attention to detail creates excellence",
        "I am healthy in body, mind, and spirit"
    ],
    "Libra": [
        "I create harmony in all my relationships",
        "I am balanced and fair",
        "Beauty surrounds me",
        "I make decisions with grace and wisdom"
    ],
    "Scorpio": [
        "I embrace transformation and growth",
        "My depth and intensity are gifts",
        "I trust the process of life",
        "I am powerful and resilient"
    ],
    "Sagittarius": [
        "I am free to explore and expand",
        "Wisdom comes to me through experience",
        "I am optimistic about the future",
        "Adventure and growth are my birthright"
    ],
    "Capricorn": [
        "I achieve my goals through dedication",
        "I am building a solid foundation",
        "Success comes to me through persistence",
        "I am responsible and capable"
    ],
    "Aquarius": [
        "I am unique and authentic",
        "I contribute to the greater good",
        "Innovation flows through me",
        "I am connected to humanity"
    ],
    "Pisces": [
        "I trust my intuition and dreams",
        "I am compassionate and understanding",
        "My imagination creates my reality",
        "I am one with the universe"
    ]
}

# Meditation script templates
MEDITATION_TEMPLATES = {
    "basic": """
Welcome to this {duration}-minute meditation for {goal}.

Find a comfortable seated position. Close your eyes gently. Take a deep breath in through your nose... and out through your mouth. Again, breathe in deeply... and release.

{opening}

Now, bring your attention to your {chakra} chakra, located at your {chakra_location}. Visualize a {color} light glowing at this center, growing brighter with each breath.

{body}

As you continue to breathe, repeat these affirmations silently or aloud:
{affirmations}

{visualization}

Take a few more deep breaths, feeling gratitude for this time you've given yourself. When you're ready, gently open your eyes, carrying this {goal} energy with you throughout your day.
""",
    "guided_visualization": """
{opening}

Imagine yourself in a beautiful, sacred space. This is your personal sanctuary. Look around and notice the details - the colors, the sounds, the feeling of peace.

{specific_visualization}

In this space, you are completely safe and supported. The universe is conspiring in your favor.

{affirmations}

Take a moment to feel gratitude for this experience. Know that you can return to this sacred space whenever you need.

{closing}
""",
    "breath_work": """
{opening}

We'll begin with a breathing technique to {purpose}.

Breathe in for a count of 4... Hold for 4... Exhale for 6... Hold for 2.

Continue this rhythm: In 2, 3, 4... Hold 2, 3, 4... Out 2, 3, 4, 5, 6... Hold 2.

{body}

As you breathe, feel {feeling} flowing through your entire being.

{affirmations}

{closing}
"""
}

# Chakra information for meditations
CHAKRAS = {
    "root": {
        "location": "the base of your spine",
        "color": "red",
        "element": "earth",
        "qualities": ["grounding", "security", "stability"]
    },
    "sacral": {
        "location": "below your navel",
        "color": "orange",
        "element": "water",
        "qualities": ["creativity", "pleasure", "flow"]
    },
    "solar_plexus": {
        "location": "your upper abdomen",
        "color": "yellow",
        "element": "fire",
        "qualities": ["power", "confidence", "will"]
    },
    "heart": {
        "location": "the center of your chest",
        "color": "green",
        "element": "air",
        "qualities": ["love", "compassion", "connection"]
    },
    "throat": {
        "location": "your throat",
        "color": "blue",
        "element": "sound",
        "qualities": ["communication", "truth", "expression"]
    },
    "third_eye": {
        "location": "between your eyebrows",
        "color": "indigo",
        "element": "light",
        "qualities": ["intuition", "wisdom", "insight"]
    },
    "crown": {
        "location": "the top of your head",
        "color": "violet or white",
        "element": "thought",
        "qualities": ["spirituality", "connection", "enlightenment"]
    }
}
