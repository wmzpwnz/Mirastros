"""Tarot Card Database - 78 Cards (22 Major Arcana + 56 Minor Arcana)"""

# Major Arcana (0-21)
MAJOR_ARCANA = [
    {
        "id": 0,
        "name": "The Fool",
        "suit": "major",
        "number": 0,
        "keywords": ["new beginnings", "innocence", "spontaneity", "free spirit"],
        "upright": "The Fool represents new beginnings, innocence, and unlimited potential. It's time to take a leap of faith and embrace the unknown. Trust in the journey ahead and remain open to new experiences.",
        "reversed": "Reversed, The Fool warns of recklessness, poor judgment, or fear of commitment. You may be taking unnecessary risks or avoiding responsibility. Consider the consequences before acting."
    },
    {
        "id": 1,
        "name": "The Magician",
        "suit": "major",
        "number": 1,
        "keywords": ["manifestation", "power", "skill", "concentration"],
        "upright": "The Magician signifies manifestation, power, and skill. You have all the tools you need to succeed. Focus your will and take action to bring your desires into reality.",
        "reversed": "Reversed, The Magician indicates manipulation, poor planning, or untapped potential. You may be using your skills for selfish purposes or lacking the confidence to act."
    },
    {
        "id": 2,
        "name": "The High Priestess",
        "suit": "major",
        "number": 2,
        "keywords": ["intuition", "mystery", "subconscious", "divine feminine"],
        "upright": "The High Priestess represents intuition, mystery, and inner wisdom. Trust your instincts and look beyond the surface. The answers you seek lie within.",
        "reversed": "Reversed, The High Priestess suggests blocked intuition, secrets, or repressed feelings. You may be ignoring your inner voice or keeping important information hidden."
    },
    {
        "id": 3,
        "name": "The Empress",
        "suit": "major",
        "number": 3,
        "keywords": ["abundance", "nurturing", "fertility", "nature"],
        "upright": "The Empress embodies abundance, nurturing, and fertility. This is a time of growth, creativity, and material comfort. Connect with nature and embrace your sensual side.",
        "reversed": "Reversed, The Empress indicates creative blocks, dependence, or neglect. You may be smothering others or neglecting self-care. Find balance in giving and receiving."
    },
    {
        "id": 4,
        "name": "The Emperor",
        "suit": "major",
        "number": 4,
        "keywords": ["authority", "structure", "control", "father figure"],
        "upright": "The Emperor represents authority, structure, and control. Take charge of your situation with confidence and establish clear boundaries. Leadership and discipline are required.",
        "reversed": "Reversed, The Emperor warns of tyranny, rigidity, or lack of discipline. You may be too controlling or avoiding responsibility. Flexibility is needed."
    },
    {
        "id": 5,
        "name": "The Hierophant",
        "suit": "major",
        "number": 5,
        "keywords": ["tradition", "conformity", "education", "belief systems"],
        "upright": "The Hierophant signifies tradition, conformity, and spiritual wisdom. Seek guidance from established institutions or mentors. Honor your beliefs and values.",
        "reversed": "Reversed, The Hierophant suggests rebellion, unconventional beliefs, or restriction. You may be challenging tradition or feeling constrained by dogma."
    },
    {
        "id": 6,
        "name": "The Lovers",
        "suit": "major",
        "number": 6,
        "keywords": ["love", "harmony", "relationships", "choices"],
        "upright": "The Lovers represent love, harmony, and important choices. A significant relationship or decision is at hand. Follow your heart and align your actions with your values.",
        "reversed": "Reversed, The Lovers indicate disharmony, imbalance, or poor choices. You may be facing relationship problems or struggling with a difficult decision."
    },
    {
        "id": 7,
        "name": "The Chariot",
        "suit": "major",
        "number": 7,
        "keywords": ["willpower", "determination", "victory", "control"],
        "upright": "The Chariot signifies willpower, determination, and victory. Stay focused on your goals and maintain control. Success comes through discipline and perseverance.",
        "reversed": "Reversed, The Chariot warns of lack of direction, aggression, or loss of control. You may be forcing things or lacking focus. Reassess your path."
    },
    {
        "id": 8,
        "name": "Strength",
        "suit": "major",
        "number": 8,
        "keywords": ["courage", "patience", "compassion", "inner strength"],
        "upright": "Strength represents courage, patience, and inner power. Face challenges with compassion and self-control. True strength comes from within, not force.",
        "reversed": "Reversed, Strength indicates self-doubt, weakness, or lack of confidence. You may be being too hard on yourself or others. Practice self-compassion."
    },
    {
        "id": 9,
        "name": "The Hermit",
        "suit": "major",
        "number": 9,
        "keywords": ["introspection", "solitude", "wisdom", "guidance"],
        "upright": "The Hermit signifies introspection, solitude, and inner wisdom. Take time for self-reflection and seek answers within. A period of withdrawal is beneficial.",
        "reversed": "Reversed, The Hermit suggests isolation, loneliness, or withdrawal. You may be avoiding others or refusing guidance. Balance solitude with connection."
    },
    {
        "id": 10,
        "name": "Wheel of Fortune",
        "suit": "major",
        "number": 10,
        "keywords": ["destiny", "cycles", "change", "luck"],
        "upright": "The Wheel of Fortune represents destiny, cycles, and change. Life is moving in a new direction. Embrace the changes and trust in the natural flow of events.",
        "reversed": "Reversed, the Wheel warns of bad luck, resistance to change, or external forces. You may be experiencing setbacks. Accept what you cannot control."
    },
    {
        "id": 11,
        "name": "Justice",
        "suit": "major",
        "number": 11,
        "keywords": ["fairness", "truth", "law", "accountability"],
        "upright": "Justice represents fairness, truth, and accountability. Decisions will be made based on facts and fairness. Take responsibility for your actions and seek balance.",
        "reversed": "Reversed, Justice indicates unfairness, dishonesty, or lack of accountability. You may be avoiding consequences or experiencing injustice. Seek truth."
    },
    {
        "id": 12,
        "name": "The Hanged Man",
        "suit": "major",
        "number": 12,
        "keywords": ["surrender", "letting go", "new perspective", "sacrifice"],
        "upright": "The Hanged Man signifies surrender, letting go, and gaining new perspective. Sometimes you must pause and see things differently. Sacrifice may be necessary.",
        "reversed": "Reversed, The Hanged Man warns of stalling, resistance, or martyrdom. You may be stuck in old patterns or making unnecessary sacrifices. Let go."
    },
    {
        "id": 13,
        "name": "Death",
        "suit": "major",
        "number": 13,
        "keywords": ["transformation", "endings", "transition", "rebirth"],
        "upright": "Death represents transformation, endings, and new beginnings. Something must end for something new to begin. Embrace change and let go of the past.",
        "reversed": "Reversed, Death indicates resistance to change, fear of endings, or stagnation. You may be clinging to what no longer serves you. Accept transformation."
    },
    {
        "id": 14,
        "name": "Temperance",
        "suit": "major",
        "number": 14,
        "keywords": ["balance", "moderation", "patience", "harmony"],
        "upright": "Temperance signifies balance, moderation, and patience. Find the middle path and blend opposing forces. Healing and harmony come through balance.",
        "reversed": "Reversed, Temperance warns of imbalance, excess, or lack of harmony. You may be going to extremes or lacking patience. Seek moderation."
    },
    {
        "id": 15,
        "name": "The Devil",
        "suit": "major",
        "number": 15,
        "keywords": ["bondage", "materialism", "addiction", "shadow self"],
        "upright": "The Devil represents bondage, materialism, and unhealthy attachments. You may be trapped by your own desires or limiting beliefs. Recognize your chains.",
        "reversed": "Reversed, The Devil indicates breaking free, release, or overcoming addiction. You're ready to break free from what binds you. Liberation is possible."
    },
    {
        "id": 16,
        "name": "The Tower",
        "suit": "major",
        "number": 16,
        "keywords": ["upheaval", "chaos", "revelation", "awakening"],
        "upright": "The Tower signifies sudden upheaval, chaos, and revelation. Structures built on false foundations will crumble. Though painful, this destruction leads to awakening.",
        "reversed": "Reversed, The Tower indicates avoiding disaster, fear of change, or delayed upheaval. You may be resisting necessary change. Accept the transformation."
    },
    {
        "id": 17,
        "name": "The Star",
        "suit": "major",
        "number": 17,
        "keywords": ["hope", "inspiration", "serenity", "renewal"],
        "upright": "The Star represents hope, inspiration, and renewal. After the storm comes peace. Have faith in the future and trust in the universe's guidance.",
        "reversed": "Reversed, The Star indicates hopelessness, lack of faith, or disconnection. You may be feeling discouraged. Reconnect with your inner light and hope."
    },
    {
        "id": 18,
        "name": "The Moon",
        "suit": "major",
        "number": 18,
        "keywords": ["illusion", "intuition", "subconscious", "mystery"],
        "upright": "The Moon signifies illusion, intuition, and the subconscious. Things are not as they seem. Trust your intuition and explore your dreams and fears.",
        "reversed": "Reversed, The Moon indicates clarity, release of fear, or unveiling illusions. Confusion is lifting. Truth is being revealed."
    },
    {
        "id": 19,
        "name": "The Sun",
        "suit": "major",
        "number": 19,
        "keywords": ["joy", "success", "vitality", "positivity"],
        "upright": "The Sun represents joy, success, and vitality. Everything is illuminated and clear. This is a time of happiness, achievement, and positive energy.",
        "reversed": "Reversed, The Sun indicates temporary setbacks, lack of enthusiasm, or dimmed joy. Your light is temporarily obscured. Stay positive."
    },
    {
        "id": 20,
        "name": "Judgement",
        "suit": "major",
        "number": 20,
        "keywords": ["reflection", "reckoning", "awakening", "rebirth"],
        "upright": "Judgement signifies reflection, reckoning, and spiritual awakening. It's time to evaluate your life and make important decisions. Forgiveness and renewal are possible.",
        "reversed": "Reversed, Judgement warns of self-doubt, harsh judgment, or avoiding accountability. You may be too critical of yourself or others. Practice forgiveness."
    },
    {
        "id": 21,
        "name": "The World",
        "suit": "major",
        "number": 21,
        "keywords": ["completion", "achievement", "fulfillment", "wholeness"],
        "upright": "The World represents completion, achievement, and fulfillment. You've reached the end of a cycle and accomplished your goals. Celebrate your success.",
        "reversed": "Reversed, The World indicates incomplete goals, lack of closure, or seeking external validation. You may be close to completion. Finish what you started."
    }
]

# Minor Arcana - Wands (Fire element - passion, energy, creativity)
WANDS = [
    {
        "id": 22,
        "name": "Ace of Wands",
        "suit": "wands",
        "number": 1,
        "keywords": ["inspiration", "new opportunities", "growth", "potential"],
        "upright": "The Ace of Wands brings inspiration, new opportunities, and creative potential. A spark of passion ignites new beginnings. Take action on your ideas.",
        "reversed": "Reversed, the Ace of Wands indicates delays, lack of direction, or missed opportunities. Your creative energy may be blocked. Reignite your passion."
    },
    {
        "id": 23,
        "name": "Two of Wands",
        "suit": "wands",
        "number": 2,
        "keywords": ["planning", "decisions", "discovery", "personal power"],
        "upright": "The Two of Wands represents planning, decisions, and future possibilities. You're at a crossroads. Make bold choices and expand your horizons.",
        "reversed": "Reversed, the Two of Wands warns of fear of change, poor planning, or lack of vision. You may be playing it too safe. Take calculated risks."
    },
    {
        "id": 24,
        "name": "Three of Wands",
        "suit": "wands",
        "number": 3,
        "keywords": ["expansion", "foresight", "progress", "overseas opportunities"],
        "upright": "The Three of Wands signifies expansion, foresight, and progress. Your efforts are paying off. Look to the future with confidence and optimism.",
        "reversed": "Reversed, the Three of Wands indicates obstacles, delays, or lack of foresight. Plans may not unfold as expected. Stay flexible and patient."
    },
    {
        "id": 25,
        "name": "Four of Wands",
        "suit": "wands",
        "number": 4,
        "keywords": ["celebration", "harmony", "homecoming", "community"],
        "upright": "The Four of Wands represents celebration, harmony, and joyful gatherings. A milestone has been reached. Celebrate with loved ones and enjoy stability.",
        "reversed": "Reversed, the Four of Wands indicates lack of harmony, cancelled celebrations, or instability. Home or family issues may arise. Seek peace."
    },
    {
        "id": 26,
        "name": "Five of Wands",
        "suit": "wands",
        "number": 5,
        "keywords": ["conflict", "competition", "tension", "diversity"],
        "upright": "The Five of Wands signifies conflict, competition, and tension. Disagreements and challenges arise. Stay focused and don't let chaos distract you.",
        "reversed": "Reversed, the Five of Wands indicates avoiding conflict, inner turmoil, or resolution. Conflicts are easing. Find common ground and cooperation."
    },
    {
        "id": 27,
        "name": "Six of Wands",
        "suit": "wands",
        "number": 6,
        "keywords": ["victory", "success", "recognition", "confidence"],
        "upright": "The Six of Wands represents victory, success, and public recognition. Your hard work is acknowledged. Enjoy your moment of triumph with grace.",
        "reversed": "Reversed, the Six of Wands indicates lack of recognition, ego, or private achievement. Success may be delayed or unacknowledged. Stay humble."
    },
    {
        "id": 28,
        "name": "Seven of Wands",
        "suit": "wands",
        "number": 7,
        "keywords": ["challenge", "perseverance", "defense", "courage"],
        "upright": "The Seven of Wands signifies challenge, perseverance, and standing your ground. Defend your position with courage. You have the strength to overcome opposition.",
        "reversed": "Reversed, the Seven of Wands warns of giving up, feeling overwhelmed, or lack of confidence. You may be exhausted from fighting. Choose your battles."
    },
    {
        "id": 29,
        "name": "Eight of Wands",
        "suit": "wands",
        "number": 8,
        "keywords": ["speed", "action", "movement", "swift change"],
        "upright": "The Eight of Wands represents speed, action, and rapid movement. Things are happening quickly. Expect swift developments and exciting news.",
        "reversed": "Reversed, the Eight of Wands indicates delays, frustration, or lack of momentum. Things are moving slower than expected. Practice patience."
    },
    {
        "id": 30,
        "name": "Nine of Wands",
        "suit": "wands",
        "number": 9,
        "keywords": ["resilience", "persistence", "boundaries", "courage"],
        "upright": "The Nine of Wands signifies resilience, persistence, and maintaining boundaries. You're battle-worn but not defeated. Keep going, you're almost there.",
        "reversed": "Reversed, the Nine of Wands indicates exhaustion, paranoia, or giving up. You may be too defensive or ready to quit. Rest and regroup."
    },
    {
        "id": 31,
        "name": "Ten of Wands",
        "suit": "wands",
        "number": 10,
        "keywords": ["burden", "responsibility", "hard work", "stress"],
        "upright": "The Ten of Wands represents burden, responsibility, and feeling overwhelmed. You're carrying too much. Delegate tasks and prioritize what matters.",
        "reversed": "Reversed, the Ten of Wands indicates releasing burdens, delegation, or avoiding responsibility. You're learning to let go. Lighten your load."
    },
    {
        "id": 32,
        "name": "Page of Wands",
        "suit": "wands",
        "number": 11,
        "keywords": ["enthusiasm", "exploration", "discovery", "free spirit"],
        "upright": "The Page of Wands brings enthusiasm, exploration, and new ideas. Embrace your adventurous spirit and be open to learning. Follow your passions.",
        "reversed": "Reversed, the Page of Wands indicates lack of direction, procrastination, or immaturity. You may be all talk and no action. Focus your energy."
    },
    {
        "id": 33,
        "name": "Knight of Wands",
        "suit": "wands",
        "number": 12,
        "keywords": ["action", "adventure", "impulsiveness", "energy"],
        "upright": "The Knight of Wands represents action, adventure, and passionate pursuit. Charge forward with confidence and enthusiasm. Take bold action now.",
        "reversed": "Reversed, the Knight of Wands warns of recklessness, impatience, or scattered energy. You may be acting without thinking. Slow down and plan."
    },
    {
        "id": 34,
        "name": "Queen of Wands",
        "suit": "wands",
        "number": 13,
        "keywords": ["confidence", "independence", "determination", "charisma"],
        "upright": "The Queen of Wands embodies confidence, independence, and charisma. Lead with passion and inspire others. You have the power to manifest your vision.",
        "reversed": "Reversed, the Queen of Wands indicates insecurity, jealousy, or domineering behavior. You may be lacking confidence or being too controlling. Find balance."
    },
    {
        "id": 35,
        "name": "King of Wands",
        "suit": "wands",
        "number": 14,
        "keywords": ["leadership", "vision", "entrepreneurship", "honor"],
        "upright": "The King of Wands represents leadership, vision, and entrepreneurial spirit. Take charge with confidence and integrity. Your bold vision inspires others.",
        "reversed": "Reversed, the King of Wands warns of arrogance, impulsiveness, or abuse of power. You may be too forceful or lacking direction. Lead with wisdom."
    }
]

# Minor Arcana - Cups (Water element - emotions, relationships, intuition)
CUPS = [
    {
        "id": 36,
        "name": "Ace of Cups",
        "suit": "cups",
        "number": 1,
        "keywords": ["love", "new relationships", "emotional awakening", "intuition"],
        "upright": "The Ace of Cups brings love, new relationships, and emotional awakening. Your heart is open to give and receive love. Embrace new emotional beginnings.",
        "reversed": "Reversed, the Ace of Cups indicates emotional blockage, repressed feelings, or emptiness. You may be closing your heart. Allow yourself to feel."
    },
    {
        "id": 37,
        "name": "Two of Cups",
        "suit": "cups",
        "number": 2,
        "keywords": ["partnership", "unity", "attraction", "connection"],
        "upright": "The Two of Cups represents partnership, unity, and mutual attraction. A harmonious relationship is forming. Balance and respect create strong bonds.",
        "reversed": "Reversed, the Two of Cups indicates imbalance, broken relationships, or miscommunication. Harmony is disrupted. Address issues with honesty."
    },
    {
        "id": 38,
        "name": "Three of Cups",
        "suit": "cups",
        "number": 3,
        "keywords": ["celebration", "friendship", "community", "joy"],
        "upright": "The Three of Cups signifies celebration, friendship, and joyful gatherings. Connect with loved ones and celebrate life's blessings. Community brings happiness.",
        "reversed": "Reversed, the Three of Cups indicates overindulgence, gossip, or isolation. Social connections may be strained. Seek authentic friendships."
    },
    {
        "id": 39,
        "name": "Four of Cups",
        "suit": "cups",
        "number": 4,
        "keywords": ["apathy", "contemplation", "reevaluation", "meditation"],
        "upright": "The Four of Cups represents apathy, contemplation, and missed opportunities. You may be taking things for granted. Look around and appreciate what you have.",
        "reversed": "Reversed, the Four of Cups indicates renewed interest, awareness, or seizing opportunities. You're ready to engage with life again. Open your eyes."
    },
    {
        "id": 40,
        "name": "Five of Cups",
        "suit": "cups",
        "number": 5,
        "keywords": ["loss", "grief", "disappointment", "regret"],
        "upright": "The Five of Cups signifies loss, grief, and disappointment. Focus on what remains rather than what's lost. Healing comes through acceptance and moving forward.",
        "reversed": "Reversed, the Five of Cups indicates acceptance, moving on, or finding peace. You're ready to release the past. Forgiveness brings healing."
    },
    {
        "id": 41,
        "name": "Six of Cups",
        "suit": "cups",
        "number": 6,
        "keywords": ["nostalgia", "childhood", "innocence", "reunion"],
        "upright": "The Six of Cups represents nostalgia, childhood memories, and innocence. The past influences the present. Reconnect with your inner child or old friends.",
        "reversed": "Reversed, the Six of Cups indicates living in the past, unrealistic expectations, or letting go. Release old patterns that no longer serve you."
    },
    {
        "id": 42,
        "name": "Seven of Cups",
        "suit": "cups",
        "number": 7,
        "keywords": ["choices", "illusion", "fantasy", "wishful thinking"],
        "upright": "The Seven of Cups signifies choices, illusions, and fantasy. Many options are available but not all are real. Discern between fantasy and reality.",
        "reversed": "Reversed, the Seven of Cups indicates clarity, determination, or avoiding temptation. You're seeing through illusions. Make grounded decisions."
    },
    {
        "id": 43,
        "name": "Eight of Cups",
        "suit": "cups",
        "number": 8,
        "keywords": ["walking away", "seeking truth", "disappointment", "withdrawal"],
        "upright": "The Eight of Cups represents walking away, seeking deeper meaning, and spiritual journey. Leave behind what no longer fulfills you. Seek your truth.",
        "reversed": "Reversed, the Eight of Cups indicates fear of change, staying in comfort zone, or return. You may be avoiding necessary departure. Trust the journey."
    },
    {
        "id": 44,
        "name": "Nine of Cups",
        "suit": "cups",
        "number": 9,
        "keywords": ["contentment", "satisfaction", "wishes fulfilled", "happiness"],
        "upright": "The Nine of Cups is the wish card, bringing contentment and satisfaction. Your desires are fulfilled. Enjoy this moment of happiness and gratitude.",
        "reversed": "Reversed, the Nine of Cups indicates dissatisfaction, greed, or unfulfilled wishes. Material success doesn't bring happiness. Seek inner contentment."
    },
    {
        "id": 45,
        "name": "Ten of Cups",
        "suit": "cups",
        "number": 10,
        "keywords": ["harmony", "family", "happiness", "alignment"],
        "upright": "The Ten of Cups represents harmony, family bliss, and emotional fulfillment. You've achieved emotional and relational happiness. Cherish your blessings.",
        "reversed": "Reversed, the Ten of Cups indicates family discord, broken relationships, or misalignment. Harmony is disrupted. Work on healing relationships."
    },
    {
        "id": 46,
        "name": "Page of Cups",
        "suit": "cups",
        "number": 11,
        "keywords": ["creativity", "intuition", "curiosity", "sensitivity"],
        "upright": "The Page of Cups brings creativity, intuition, and emotional messages. Be open to your feelings and creative impulses. A message of love may arrive.",
        "reversed": "Reversed, the Page of Cups indicates emotional immaturity, blocked creativity, or bad news. You may be overly sensitive. Ground your emotions."
    },
    {
        "id": 47,
        "name": "Knight of Cups",
        "suit": "cups",
        "number": 12,
        "keywords": ["romance", "charm", "idealism", "following the heart"],
        "upright": "The Knight of Cups represents romance, charm, and following your heart. A romantic proposal or creative opportunity arrives. Follow your dreams with passion.",
        "reversed": "Reversed, the Knight of Cups warns of moodiness, unrealistic expectations, or disappointment. You may be overly idealistic. Stay grounded in reality."
    },
    {
        "id": 48,
        "name": "Queen of Cups",
        "suit": "cups",
        "number": 13,
        "keywords": ["compassion", "intuition", "emotional security", "nurturing"],
        "upright": "The Queen of Cups embodies compassion, intuition, and emotional maturity. Trust your intuition and nurture yourself and others. Emotional wisdom guides you.",
        "reversed": "Reversed, the Queen of Cups indicates emotional insecurity, codependency, or martyrdom. You may be giving too much. Practice self-care and boundaries."
    },
    {
        "id": 49,
        "name": "King of Cups",
        "suit": "cups",
        "number": 14,
        "keywords": ["emotional balance", "diplomacy", "compassion", "wisdom"],
        "upright": "The King of Cups represents emotional balance, diplomacy, and compassionate leadership. Master your emotions and lead with wisdom. Balance heart and mind.",
        "reversed": "Reversed, the King of Cups warns of emotional manipulation, moodiness, or volatility. You may be suppressing emotions or being controlling. Seek balance."
    }
]

# Minor Arcana - Swords (Air element - intellect, conflict, truth)
SWORDS = [
    {
        "id": 50,
        "name": "Ace of Swords",
        "suit": "swords",
        "number": 1,
        "keywords": ["clarity", "breakthrough", "truth", "mental power"],
        "upright": "The Ace of Swords brings clarity, breakthrough, and mental power. A new idea or truth is revealed. Cut through confusion with clear thinking.",
        "reversed": "Reversed, the Ace of Swords indicates confusion, chaos, or miscommunication. Your thinking may be clouded. Seek clarity before acting."
    },
    {
        "id": 51,
        "name": "Two of Swords",
        "suit": "swords",
        "number": 2,
        "keywords": ["difficult choices", "stalemate", "avoidance", "indecision"],
        "upright": "The Two of Swords represents difficult choices, stalemate, and avoidance. You're at an impasse. Remove the blindfold and face the truth.",
        "reversed": "Reversed, the Two of Swords indicates decision made, information revealed, or overwhelming choices. Clarity is emerging. Trust your judgment."
    },
    {
        "id": 52,
        "name": "Three of Swords",
        "suit": "swords",
        "number": 3,
        "keywords": ["heartbreak", "sorrow", "grief", "painful truth"],
        "upright": "The Three of Swords signifies heartbreak, sorrow, and painful truth. Emotional pain is present. Allow yourself to grieve and heal through acceptance.",
        "reversed": "Reversed, the Three of Swords indicates healing, forgiveness, or releasing pain. You're recovering from heartbreak. Time heals all wounds."
    },
    {
        "id": 53,
        "name": "Four of Swords",
        "suit": "swords",
        "number": 4,
        "keywords": ["rest", "recovery", "contemplation", "peace"],
        "upright": "The Four of Swords represents rest, recovery, and contemplation. Take a break and recharge. Meditation and stillness bring clarity and healing.",
        "reversed": "Reversed, the Four of Swords indicates restlessness, burnout, or avoiding rest. You may be pushing too hard. Rest is necessary for recovery."
    },
    {
        "id": 54,
        "name": "Five of Swords",
        "suit": "swords",
        "number": 5,
        "keywords": ["conflict", "defeat", "betrayal", "winning at all costs"],
        "upright": "The Five of Swords signifies conflict, defeat, and hollow victory. Winning at all costs damages relationships. Choose your battles wisely.",
        "reversed": "Reversed, the Five of Swords indicates reconciliation, making amends, or moving on. Conflicts are resolving. Forgiveness brings peace."
    },
    {
        "id": 55,
        "name": "Six of Swords",
        "suit": "swords",
        "number": 6,
        "keywords": ["transition", "moving on", "healing", "travel"],
        "upright": "The Six of Swords represents transition, moving on, and healing journey. Leave troubled waters behind. Better times lie ahead.",
        "reversed": "Reversed, the Six of Swords indicates resistance to change, unfinished business, or rough transition. You may be stuck in the past. Let go and move forward."
    },
    {
        "id": 56,
        "name": "Seven of Swords",
        "suit": "swords",
        "number": 7,
        "keywords": ["deception", "strategy", "betrayal", "cunning"],
        "upright": "The Seven of Swords signifies deception, strategy, and cunning. Someone may be dishonest or you're being strategic. Be cautious and protect yourself.",
        "reversed": "Reversed, the Seven of Swords indicates coming clean, confession, or being caught. Deception is revealed. Honesty is the best policy."
    },
    {
        "id": 57,
        "name": "Eight of Swords",
        "suit": "swords",
        "number": 8,
        "keywords": ["restriction", "imprisonment", "victim mentality", "powerlessness"],
        "upright": "The Eight of Swords represents restriction, feeling trapped, and self-imposed limitations. You have more power than you think. Remove the blindfold.",
        "reversed": "Reversed, the Eight of Swords indicates freedom, release, or new perspective. You're breaking free from limitations. Empowerment is yours."
    },
    {
        "id": 58,
        "name": "Nine of Swords",
        "suit": "swords",
        "number": 9,
        "keywords": ["anxiety", "worry", "nightmares", "fear"],
        "upright": "The Nine of Swords signifies anxiety, worry, and mental anguish. Your fears may be worse than reality. Seek support and challenge negative thoughts.",
        "reversed": "Reversed, the Nine of Swords indicates hope, recovery, or facing fears. Anxiety is easing. You're finding peace of mind."
    },
    {
        "id": 59,
        "name": "Ten of Swords",
        "suit": "swords",
        "number": 10,
        "keywords": ["rock bottom", "endings", "betrayal", "crisis"],
        "upright": "The Ten of Swords represents rock bottom, painful endings, and crisis. You've hit the lowest point. The only way is up. Accept the ending and begin anew.",
        "reversed": "Reversed, the Ten of Swords indicates recovery, regeneration, or avoiding disaster. The worst is over. You're rising from the ashes."
    },
    {
        "id": 60,
        "name": "Page of Swords",
        "suit": "swords",
        "number": 11,
        "keywords": ["curiosity", "vigilance", "mental energy", "communication"],
        "upright": "The Page of Swords brings curiosity, vigilance, and new ideas. Stay alert and gather information. Communication and learning are highlighted.",
        "reversed": "Reversed, the Page of Swords indicates gossip, haste, or lack of planning. You may be all talk and no action. Think before you speak."
    },
    {
        "id": 61,
        "name": "Knight of Swords",
        "suit": "swords",
        "number": 12,
        "keywords": ["action", "ambition", "driven", "assertive"],
        "upright": "The Knight of Swords represents action, ambition, and assertiveness. Charge forward with determination. Swift action brings results.",
        "reversed": "Reversed, the Knight of Swords warns of impulsiveness, aggression, or lack of direction. You may be rushing without thinking. Slow down and plan."
    },
    {
        "id": 62,
        "name": "Queen of Swords",
        "suit": "swords",
        "number": 13,
        "keywords": ["independence", "clear thinking", "direct communication", "boundaries"],
        "upright": "The Queen of Swords embodies independence, clear thinking, and direct communication. Speak your truth with clarity and maintain strong boundaries.",
        "reversed": "Reversed, the Queen of Swords indicates coldness, bitterness, or harsh judgment. You may be too critical or emotionally detached. Soften your approach."
    },
    {
        "id": 63,
        "name": "King of Swords",
        "suit": "swords",
        "number": 14,
        "keywords": ["authority", "truth", "intellectual power", "clear judgment"],
        "upright": "The King of Swords represents authority, truth, and intellectual power. Make decisions based on logic and fairness. Lead with wisdom and integrity.",
        "reversed": "Reversed, the King of Swords warns of manipulation, abuse of power, or poor judgment. You may be too harsh or using intellect without compassion."
    }
]

# Minor Arcana - Pentacles (Earth element - material, practical, physical)
PENTACLES = [
    {
        "id": 64,
        "name": "Ace of Pentacles",
        "suit": "pentacles",
        "number": 1,
        "keywords": ["opportunity", "prosperity", "new venture", "manifestation"],
        "upright": "The Ace of Pentacles brings opportunity, prosperity, and new ventures. A seed of abundance is planted. Practical action leads to material success.",
        "reversed": "Reversed, the Ace of Pentacles indicates missed opportunities, lack of planning, or financial setbacks. You may be too focused on material gain."
    },
    {
        "id": 65,
        "name": "Two of Pentacles",
        "suit": "pentacles",
        "number": 2,
        "keywords": ["balance", "adaptability", "time management", "priorities"],
        "upright": "The Two of Pentacles represents balance, adaptability, and juggling priorities. Manage your resources wisely. Flexibility is key to maintaining balance.",
        "reversed": "Reversed, the Two of Pentacles indicates imbalance, overwhelm, or poor time management. You're dropping balls. Simplify and prioritize."
    },
    {
        "id": 66,
        "name": "Three of Pentacles",
        "suit": "pentacles",
        "number": 3,
        "keywords": ["teamwork", "collaboration", "skill", "quality"],
        "upright": "The Three of Pentacles signifies teamwork, collaboration, and skilled work. Your expertise is recognized. Work with others to achieve excellence.",
        "reversed": "Reversed, the Three of Pentacles indicates lack of teamwork, poor quality, or disorganization. Collaboration is failing. Improve communication."
    },
    {
        "id": 67,
        "name": "Four of Pentacles",
        "suit": "pentacles",
        "number": 4,
        "keywords": ["security", "control", "conservation", "possessiveness"],
        "upright": "The Four of Pentacles represents security, control, and conservation. You're holding on tightly to what you have. Balance security with generosity.",
        "reversed": "Reversed, the Four of Pentacles indicates greed, materialism, or letting go. You may be too controlling or ready to release. Find balance."
    },
    {
        "id": 68,
        "name": "Five of Pentacles",
        "suit": "pentacles",
        "number": 5,
        "keywords": ["hardship", "poverty", "isolation", "insecurity"],
        "upright": "The Five of Pentacles signifies hardship, financial struggle, and feeling left out. Times are tough but help is available. Reach out for support.",
        "reversed": "Reversed, the Five of Pentacles indicates recovery, improvement, or finding help. The worst is over. Financial situation is improving."
    },
    {
        "id": 69,
        "name": "Six of Pentacles",
        "suit": "pentacles",
        "number": 6,
        "keywords": ["generosity", "charity", "sharing", "fairness"],
        "upright": "The Six of Pentacles represents generosity, charity, and balanced giving. Share your abundance with others. What goes around comes around.",
        "reversed": "Reversed, the Six of Pentacles indicates strings attached, debt, or inequality. Giving or receiving may be imbalanced. Ensure fairness."
    },
    {
        "id": 70,
        "name": "Seven of Pentacles",
        "suit": "pentacles",
        "number": 7,
        "keywords": ["patience", "investment", "long-term view", "perseverance"],
        "upright": "The Seven of Pentacles signifies patience, investment, and long-term planning. Your efforts will pay off in time. Keep nurturing your goals.",
        "reversed": "Reversed, the Seven of Pentacles indicates impatience, lack of results, or poor investment. You may be giving up too soon. Reassess your strategy."
    },
    {
        "id": 71,
        "name": "Eight of Pentacles",
        "suit": "pentacles",
        "number": 8,
        "keywords": ["skill development", "dedication", "craftsmanship", "detail"],
        "upright": "The Eight of Pentacles represents skill development, dedication, and mastery. Focus on honing your craft. Hard work and attention to detail pay off.",
        "reversed": "Reversed, the Eight of Pentacles indicates lack of focus, mediocrity, or perfectionism. You may be cutting corners or being too critical. Find balance."
    },
    {
        "id": 72,
        "name": "Nine of Pentacles",
        "suit": "pentacles",
        "number": 9,
        "keywords": ["abundance", "luxury", "self-sufficiency", "success"],
        "upright": "The Nine of Pentacles represents abundance, luxury, and self-sufficiency. You've achieved material success through your own efforts. Enjoy the fruits of your labor.",
        "reversed": "Reversed, the Nine of Pentacles indicates financial dependence, setbacks, or overworking. You may be sacrificing too much for success. Find balance."
    },
    {
        "id": 73,
        "name": "Ten of Pentacles",
        "suit": "pentacles",
        "number": 10,
        "keywords": ["wealth", "legacy", "family", "long-term success"],
        "upright": "The Ten of Pentacles represents wealth, legacy, and long-term success. You've achieved lasting prosperity and security. Family and tradition are important.",
        "reversed": "Reversed, the Ten of Pentacles indicates financial failure, family disputes, or lack of stability. Long-term plans may be disrupted. Reassess priorities."
    },
    {
        "id": 74,
        "name": "Page of Pentacles",
        "suit": "pentacles",
        "number": 11,
        "keywords": ["opportunity", "study", "manifestation", "ambition"],
        "upright": "The Page of Pentacles brings opportunity, study, and new ventures. A practical opportunity arises. Focus on learning and building foundations.",
        "reversed": "Reversed, the Page of Pentacles indicates lack of progress, procrastination, or unrealistic goals. You may be all planning and no action. Take practical steps."
    },
    {
        "id": 75,
        "name": "Knight of Pentacles",
        "suit": "pentacles",
        "number": 12,
        "keywords": ["efficiency", "routine", "conservatism", "hard work"],
        "upright": "The Knight of Pentacles represents efficiency, routine, and methodical progress. Slow and steady wins the race. Be patient and persistent.",
        "reversed": "Reversed, the Knight of Pentacles indicates boredom, stagnation, or perfectionism. You may be stuck in a rut or being too cautious. Take calculated risks."
    },
    {
        "id": 76,
        "name": "Queen of Pentacles",
        "suit": "pentacles",
        "number": 13,
        "keywords": ["nurturing", "practical", "abundance", "security"],
        "upright": "The Queen of Pentacles embodies nurturing, practicality, and abundance. Create a comfortable home and care for others. Balance work and family.",
        "reversed": "Reversed, the Queen of Pentacles indicates financial insecurity, neglect, or materialism. You may be out of balance. Prioritize self-care and practical matters."
    },
    {
        "id": 77,
        "name": "King of Pentacles",
        "suit": "pentacles",
        "number": 14,
        "keywords": ["wealth", "business", "leadership", "security"],
        "upright": "The King of Pentacles represents wealth, business success, and practical leadership. You've achieved material mastery. Lead with wisdom and generosity.",
        "reversed": "Reversed, the King of Pentacles warns of greed, materialism, or financial failure. You may be too focused on money or poor at managing resources."
    }
]

# Combine all cards
ALL_TAROT_CARDS = MAJOR_ARCANA + WANDS + CUPS + SWORDS + PENTACLES


def get_all_cards():
    """Get all 78 Tarot cards"""
    return ALL_TAROT_CARDS


def get_card_by_id(card_id: int):
    """Get a specific card by ID"""
    for card in ALL_TAROT_CARDS:
        if card["id"] == card_id:
            return card
    return None


def get_card_by_name(name: str):
    """Get a specific card by name"""
    for card in ALL_TAROT_CARDS:
        if card["name"].lower() == name.lower():
            return card
    return None


def get_cards_by_suit(suit: str):
    """Get all cards of a specific suit"""
    return [card for card in ALL_TAROT_CARDS if card["suit"] == suit]


def get_major_arcana():
    """Get all Major Arcana cards"""
    return MAJOR_ARCANA


def get_minor_arcana():
    """Get all Minor Arcana cards"""
    return WANDS + CUPS + SWORDS + PENTACLES
