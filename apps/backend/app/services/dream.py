"""Dream Interpretation Service"""

import re
from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from collections import Counter

from app.data.dream_dictionary import get_all_symbols, search_symbols
from app.services.llm import UnifiedLLMService
from app.services.rag import RAGService
from app.models.dream_interpretation import DreamInterpretation


class DreamService:
    """Service for dream interpretation"""
    
    def __init__(self, llm_service: UnifiedLLMService, rag_service: RAGService):
        self.llm_service = llm_service
        self.rag_service = rag_service
        self.symbols = get_all_symbols()
    
    async def interpret_dream(
        self,
        db: AsyncSession,
        dream_description: str,
        user_context: Optional[Dict] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Interpret a dream
        
        Args:
            db: Database session
            dream_description: User's description of their dream
            user_context: Optional user context (natal chart, zodiac sign, etc.)
            user_id: Optional user ID to store in dream journal
        
        Returns:
            Dream interpretation with symbols, themes, and insights
        """
        # Identify symbols in the dream
        identified_symbols = self._identify_symbols(dream_description)
        
        # Generate AI interpretation with RAG context
        interpretation_data = await self._generate_interpretation(
            db=db,
            dream_description=dream_description,
            identified_symbols=identified_symbols,
            user_context=user_context
        )
        
        # Store in database if user_id is provided
        if user_id:
            dream_record = DreamInterpretation(
                user_id=user_id,
                dream_description=dream_description,
                symbols=identified_symbols,
                interpretation=interpretation_data["interpretation"],
                themes=interpretation_data["themes"],
                emotions=interpretation_data["emotions"]
            )
            db.add(dream_record)
            await db.commit()
        
        return {
            "dream_description": dream_description,
            "symbols": identified_symbols,
            "interpretation": interpretation_data["interpretation"],
            "themes": interpretation_data["themes"],
            "emotions": interpretation_data["emotions"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _identify_symbols(self, dream_description: str) -> List[Dict]:
        """Identify dream symbols in the description"""
        identified = []
        dream_lower = dream_description.lower()
        
        # Check each symbol in the dictionary
        for symbol_data in self.symbols:
            symbol = symbol_data["symbol"]
            # Use word boundaries to match whole words
            pattern = r'\b' + re.escape(symbol) + r'\b'
            if re.search(pattern, dream_lower):
                identified.append({
                    "symbol": symbol,
                    "meaning": symbol_data["meaning"]
                })
        
        return identified
    
    async def _generate_interpretation(
        self,
        db: AsyncSession,
        dream_description: str,
        identified_symbols: List[Dict],
        user_context: Optional[Dict]
    ) -> Dict:
        """Generate AI interpretation of the dream"""
        
        # Build context from RAG
        rag_query = f"dream interpretation symbols {' '.join([s['symbol'] for s in identified_symbols])}"
        rag_context = await self.rag_service.get_context(
            db=db,
            query=rag_query,
            category="dreams"
        )
        
        # Build prompt for AI
        prompt = self._build_interpretation_prompt(
            dream_description=dream_description,
            identified_symbols=identified_symbols,
            user_context=user_context,
            rag_context=rag_context
        )
        
        # Generate interpretation
        interpretation = await self.llm_service.generate(
            prompt=prompt,
            context=rag_context,
            max_tokens=1200,
            temperature=0.7
        )
        
        # Extract themes and emotions from interpretation
        themes = self._extract_themes(interpretation, identified_symbols)
        emotions = self._extract_emotions(interpretation)
        
        return {
            "interpretation": interpretation,
            "themes": themes,
            "emotions": emotions
        }
    
    def _build_interpretation_prompt(
        self,
        dream_description: str,
        identified_symbols: List[Dict],
        user_context: Optional[Dict],
        rag_context: str
    ) -> str:
        """Build the prompt for AI interpretation"""
        
        prompt = "You are Mirastros, a mystical oracle and master dream interpreter. "
        prompt += "Interpret this dream with deep insight, connecting symbols to the dreamer's life and spiritual journey.\n\n"
        
        prompt += f"Dream Description:\n{dream_description}\n\n"
        
        if identified_symbols:
            prompt += "Identified Symbols:\n"
            for symbol in identified_symbols:
                prompt += f"- {symbol['symbol'].title()}: {symbol['meaning']}\n"
            prompt += "\n"
        
        if user_context:
            if "zodiac_sign" in user_context:
                prompt += f"Dreamer's Zodiac Sign: {user_context['zodiac_sign']}\n"
            if "birth_date" in user_context:
                prompt += f"Dreamer's Birth Date: {user_context['birth_date']}\n"
            prompt += "\n"
        
        prompt += "Provide a comprehensive dream interpretation that:\n"
        prompt += "1. Explains the overall message and meaning of the dream\n"
        prompt += "2. Connects the symbols to each other and to the dreamer's life\n"
        prompt += "3. Identifies the main themes (e.g., transformation, fear, love, growth)\n"
        prompt += "4. Recognizes the emotions present in the dream\n"
        prompt += "5. Offers practical guidance and actionable insights\n"
        prompt += "6. Maintains a mystical yet compassionate and grounded tone\n"
        prompt += "7. Considers both the conscious and unconscious messages\n\n"
        prompt += "Interpretation:"
        
        return prompt
    
    def _extract_themes(self, interpretation: str, symbols: List[Dict]) -> List[str]:
        """Extract main themes from interpretation and symbols"""
        themes = set()
        
        # Common dream themes
        theme_keywords = {
            "transformation": ["transform", "change", "evolve", "metamorphosis", "rebirth"],
            "freedom": ["free", "liberate", "escape", "release", "independence"],
            "fear": ["fear", "anxiety", "worry", "threat", "danger"],
            "love": ["love", "romance", "affection", "heart", "relationship"],
            "growth": ["grow", "develop", "progress", "advance", "mature"],
            "spiritual journey": ["spiritual", "soul", "divine", "sacred", "enlighten"],
            "healing": ["heal", "recovery", "restore", "mend", "cure"],
            "guidance": ["guide", "direction", "path", "way", "mentor"],
            "power": ["power", "strength", "control", "authority", "dominance"],
            "wisdom": ["wisdom", "knowledge", "insight", "understanding", "learn"]
        }
        
        interpretation_lower = interpretation.lower()
        
        # Check for themes in interpretation
        for theme, keywords in theme_keywords.items():
            if any(keyword in interpretation_lower for keyword in keywords):
                themes.add(theme)
        
        # Add themes from symbol keywords
        for symbol in symbols:
            symbol_keywords = symbol.get("meaning", "").lower().split(", ")
            for theme, keywords in theme_keywords.items():
                if any(keyword in " ".join(symbol_keywords) for keyword in keywords):
                    themes.add(theme)
        
        return list(themes)[:5]  # Return top 5 themes
    
    def _extract_emotions(self, interpretation: str) -> List[str]:
        """Extract emotions from interpretation"""
        emotions = set()
        
        # Common emotions in dreams
        emotion_keywords = {
            "joy": ["joy", "happy", "delight", "pleasure", "bliss"],
            "fear": ["fear", "afraid", "scared", "terror", "dread"],
            "peace": ["peace", "calm", "serene", "tranquil", "harmony"],
            "anxiety": ["anxiety", "anxious", "nervous", "worried", "stress"],
            "wonder": ["wonder", "awe", "amazement", "marvel", "fascination"],
            "sadness": ["sad", "sorrow", "grief", "melancholy", "despair"],
            "excitement": ["excite", "thrill", "enthusiasm", "eager", "anticipation"],
            "confusion": ["confuse", "perplex", "bewilder", "puzzle", "uncertain"],
            "anger": ["anger", "rage", "fury", "wrath", "irritation"],
            "love": ["love", "affection", "tenderness", "warmth", "compassion"]
        }
        
        interpretation_lower = interpretation.lower()
        
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in interpretation_lower for keyword in keywords):
                emotions.add(emotion)
        
        return list(emotions)[:5]  # Return top 5 emotions
    
    def get_dream_dictionary(self) -> List[Dict]:
        """Get all dream symbols"""
        return self.symbols
    
    def search_dream_symbols(self, query: str) -> List[Dict]:
        """Search dream symbols"""
        return search_symbols(query)
    
    async def get_dream_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """Get user's dream journal history"""
        result = await db.execute(
            select(DreamInterpretation)
            .where(DreamInterpretation.user_id == user_id)
            .order_by(DreamInterpretation.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        dreams = result.scalars().all()
        
        return [
            {
                "id": str(dream.id),
                "dream_description": dream.dream_description,
                "symbols": dream.symbols,
                "interpretation": dream.interpretation,
                "themes": dream.themes,
                "emotions": dream.emotions,
                "created_at": dream.created_at.isoformat()
            }
            for dream in dreams
        ]
    
    async def analyze_dream_patterns(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict:
        """Analyze recurring patterns in user's dreams"""
        # Get all user's dreams
        result = await db.execute(
            select(DreamInterpretation)
            .where(DreamInterpretation.user_id == user_id)
            .order_by(DreamInterpretation.created_at.desc())
        )
        dreams = result.scalars().all()
        
        if not dreams:
            return {
                "recurring_symbols": [],
                "recurring_themes": [],
                "recurring_emotions": [],
                "insights": "No dreams recorded yet. Start recording your dreams to discover patterns."
            }
        
        # Count symbols, themes, and emotions
        all_symbols = []
        all_themes = []
        all_emotions = []
        
        for dream in dreams:
            if dream.symbols:
                all_symbols.extend([s["symbol"] for s in dream.symbols])
            if dream.themes:
                all_themes.extend(dream.themes)
            if dream.emotions:
                all_emotions.extend(dream.emotions)
        
        # Get most common
        symbol_counts = Counter(all_symbols).most_common(5)
        theme_counts = Counter(all_themes).most_common(5)
        emotion_counts = Counter(all_emotions).most_common(5)
        
        # Generate insights
        insights = await self._generate_pattern_insights(
            db=db,
            symbol_counts=symbol_counts,
            theme_counts=theme_counts,
            emotion_counts=emotion_counts,
            total_dreams=len(dreams)
        )
        
        return {
            "recurring_symbols": [{"symbol": s, "count": c} for s, c in symbol_counts],
            "recurring_themes": [{"theme": t, "count": c} for t, c in theme_counts],
            "recurring_emotions": [{"emotion": e, "count": c} for e, c in emotion_counts],
            "insights": insights
        }
    
    async def _generate_pattern_insights(
        self,
        db: AsyncSession,
        symbol_counts: List,
        theme_counts: List,
        emotion_counts: List,
        total_dreams: int
    ) -> str:
        """Generate AI insights about dream patterns"""
        
        prompt = "You are Mirastros, analyzing recurring patterns in a dreamer's journal. "
        prompt += "Provide deep insights about what these patterns reveal.\n\n"
        
        prompt += f"Total Dreams Recorded: {total_dreams}\n\n"
        
        if symbol_counts:
            prompt += "Most Recurring Symbols:\n"
            for symbol, count in symbol_counts:
                prompt += f"- {symbol.title()}: {count} times\n"
            prompt += "\n"
        
        if theme_counts:
            prompt += "Most Recurring Themes:\n"
            for theme, count in theme_counts:
                prompt += f"- {theme.title()}: {count} times\n"
            prompt += "\n"
        
        if emotion_counts:
            prompt += "Most Recurring Emotions:\n"
            for emotion, count in emotion_counts:
                prompt += f"- {emotion.title()}: {count} times\n"
            prompt += "\n"
        
        prompt += "Provide insights that:\n"
        prompt += "1. Explain what these recurring patterns reveal about the dreamer's inner world\n"
        prompt += "2. Identify the main psychological or spiritual themes\n"
        prompt += "3. Offer guidance for working with these patterns\n"
        prompt += "4. Suggest what the unconscious mind is trying to communicate\n\n"
        prompt += "Insights:"
        
        insights = await self.llm_service.generate(
            prompt=prompt,
            context="",
            max_tokens=800,
            temperature=0.7
        )
        
        return insights
