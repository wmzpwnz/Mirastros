"""Journal Service"""

from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, extract
from datetime import datetime, timedelta, timezone
from collections import Counter

from app.models.journal_entry import JournalEntry, EntryType
from app.services.llm import UnifiedLLMService


class JournalService:
    """Service for managing practice journal"""
    
    def __init__(self, llm_service: UnifiedLLMService):
        self.llm_service = llm_service
    
    async def create_entry(
        self,
        db: AsyncSession,
        user_id: str,
        title: str,
        content: str,
        entry_type: str,
        tags: Optional[List[str]] = None,
        metadata: Optional[dict] = None
    ) -> Dict:
        """Create a new journal entry"""
        
        # Validate entry type
        try:
            entry_type_enum = EntryType(entry_type)
        except ValueError:
            raise ValueError(f"Invalid entry type: {entry_type}. Must be one of: {', '.join([e.value for e in EntryType])}")
        
        # Create entry
        entry = JournalEntry(
            user_id=user_id,
            title=title,
            content=content,
            entry_type=entry_type_enum,
            tags=tags or [],
            metadata=metadata or {}
        )
        
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        
        return {
            "id": str(entry.id),
            "title": entry.title,
            "content": entry.content,
            "entry_type": entry.entry_type.value,
            "tags": entry.tags,
            "metadata": entry.metadata,
            "created_at": entry.created_at.isoformat(),
            "updated_at": entry.updated_at.isoformat()
        }
    
    async def get_entries(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        entry_type: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dict]:
        """Get user's journal entries with pagination and filtering"""
        
        # Build query
        query = select(JournalEntry).where(JournalEntry.user_id == user_id)
        
        # Filter by entry type
        if entry_type:
            try:
                entry_type_enum = EntryType(entry_type)
                query = query.where(JournalEntry.entry_type == entry_type_enum)
            except ValueError:
                pass  # Ignore invalid entry type
        
        # Filter by tags (entries that have ANY of the specified tags)
        if tags:
            query = query.where(
                func.jsonb_exists_any(JournalEntry.tags, tags)
            )
        
        # Order by most recent first
        query = query.order_by(desc(JournalEntry.created_at))
        
        # Apply pagination
        query = query.limit(limit).offset(offset)
        
        # Execute query
        result = await db.execute(query)
        entries = result.scalars().all()
        
        return [
            {
                "id": str(entry.id),
                "title": entry.title,
                "content": entry.content,
                "entry_type": entry.entry_type.value,
                "tags": entry.tags,
                "metadata": entry.metadata,
                "created_at": entry.created_at.isoformat(),
                "updated_at": entry.updated_at.isoformat()
            }
            for entry in entries
        ]
    
    async def get_entry_by_id(
        self,
        db: AsyncSession,
        entry_id: str,
        user_id: str
    ) -> Optional[Dict]:
        """Get a specific journal entry"""
        
        query = select(JournalEntry).where(
            and_(
                JournalEntry.id == entry_id,
                JournalEntry.user_id == user_id
            )
        )
        
        result = await db.execute(query)
        entry = result.scalar_one_or_none()
        
        if not entry:
            return None
        
        return {
            "id": str(entry.id),
            "title": entry.title,
            "content": entry.content,
            "entry_type": entry.entry_type.value,
            "tags": entry.tags,
            "metadata": entry.metadata,
            "created_at": entry.created_at.isoformat(),
            "updated_at": entry.updated_at.isoformat()
        }
    
    async def update_entry(
        self,
        db: AsyncSession,
        entry_id: str,
        user_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[dict] = None
    ) -> Optional[Dict]:
        """Update a journal entry"""
        
        query = select(JournalEntry).where(
            and_(
                JournalEntry.id == entry_id,
                JournalEntry.user_id == user_id
            )
        )
        
        result = await db.execute(query)
        entry = result.scalar_one_or_none()
        
        if not entry:
            return None
        
        # Update fields
        if title is not None:
            entry.title = title
        if content is not None:
            entry.content = content
        if tags is not None:
            entry.tags = tags
        if metadata is not None:
            entry.metadata = metadata
        
        entry.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(entry)
        
        return {
            "id": str(entry.id),
            "title": entry.title,
            "content": entry.content,
            "entry_type": entry.entry_type.value,
            "tags": entry.tags,
            "metadata": entry.metadata,
            "created_at": entry.created_at.isoformat(),
            "updated_at": entry.updated_at.isoformat()
        }
    
    async def delete_entry(
        self,
        db: AsyncSession,
        entry_id: str,
        user_id: str
    ) -> bool:
        """Delete a journal entry"""
        
        query = select(JournalEntry).where(
            and_(
                JournalEntry.id == entry_id,
                JournalEntry.user_id == user_id
            )
        )
        
        result = await db.execute(query)
        entry = result.scalar_one_or_none()
        
        if not entry:
            return False
        
        await db.delete(entry)
        await db.commit()
        
        return True
    
    async def get_statistics(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict:
        """Get journal statistics"""
        
        # Get all entries
        query = select(JournalEntry).where(JournalEntry.user_id == user_id)
        result = await db.execute(query)
        entries = result.scalars().all()
        
        if not entries:
            return {
                "total_entries": 0,
                "entries_by_type": {},
                "entries_by_month": {},
                "most_used_tags": [],
                "streak_days": 0
            }
        
        # Count by type
        entries_by_type = {}
        for entry_type in EntryType:
            count = sum(1 for e in entries if e.entry_type == entry_type)
            if count > 0:
                entries_by_type[entry_type.value] = count
        
        # Count by month
        entries_by_month = {}
        for entry in entries:
            month_key = entry.created_at.strftime("%Y-%m")
            entries_by_month[month_key] = entries_by_month.get(month_key, 0) + 1
        
        # Most used tags
        all_tags = []
        for entry in entries:
            if entry.tags:
                all_tags.extend(entry.tags)
        
        tag_counts = Counter(all_tags)
        most_used_tags = [
            {"tag": tag, "count": count}
            for tag, count in tag_counts.most_common(10)
        ]
        
        # Calculate streak
        streak_days = await self._calculate_streak(entries)
        
        return {
            "total_entries": len(entries),
            "entries_by_type": entries_by_type,
            "entries_by_month": entries_by_month,
            "most_used_tags": most_used_tags,
            "streak_days": streak_days
        }
    
    async def _calculate_streak(self, entries: List[JournalEntry]) -> int:
        """Calculate current streak of consecutive days with entries"""
        
        if not entries:
            return 0
        
        # Get unique dates
        dates = sorted(set(e.created_at.date() for e in entries), reverse=True)
        
        if not dates:
            return 0
        
        # Check if today or yesterday has an entry
        today = datetime.now(timezone.utc).date()
        if dates[0] != today and dates[0] != today - timedelta(days=1):
            return 0
        
        # Count consecutive days
        streak = 1
        for i in range(len(dates) - 1):
            if dates[i] - dates[i + 1] == timedelta(days=1):
                streak += 1
            else:
                break
        
        return streak
    
    async def analyze_patterns(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict:
        """Analyze patterns in journal entries using AI"""
        
        # Get all entries
        query = select(JournalEntry).where(JournalEntry.user_id == user_id)
        result = await db.execute(query)
        entries = result.scalars().all()
        
        if not entries:
            return {
                "total_entries": 0,
                "entry_types_distribution": {},
                "common_tags": [],
                "recurring_themes": [],
                "insights": "No journal entries yet. Start writing to receive insights!",
                "progress_summary": "",
                "progress_visualizations": {
                    "entries_over_time": [],
                    "sentiment_trend": [],
                    "theme_evolution": [],
                    "activity_heatmap": [],
                    "growth_indicators": {}
                }
            }
        
        # Get statistics
        stats = await self.get_statistics(db, user_id)
        
        # Create progress visualizations
        visualizations = self._create_visualizations(entries)
        
        # Extract themes using AI for better accuracy
        themes = await self._extract_themes_with_ai(entries)
        
        # Analyze historical trends
        historical_analysis = self._analyze_historical_trends(entries)
        
        # Prepare context for AI insights
        recent_entries = sorted(entries, key=lambda e: e.created_at, reverse=True)[:15]
        entries_text = "\n\n".join([
            f"[{e.created_at.strftime('%Y-%m-%d')}] {e.title} ({e.entry_type.value})\n{e.content[:300]}..."
            for e in recent_entries
        ])
        
        # Generate comprehensive AI insights
        prompt = f"""As Mirastros, the mystical AI oracle, analyze this spiritual journal and provide deep insights:

📊 JOURNAL OVERVIEW:
- Total entries: {len(entries)}
- Entry types: {stats['entries_by_type']}
- Most used tags: {[t['tag'] for t in stats['most_used_tags'][:5]]}
- Current streak: {stats['streak_days']} days
- Time span: {entries[0].created_at.strftime('%Y-%m-%d')} to {entries[-1].created_at.strftime('%Y-%m-%d')}

🔮 IDENTIFIED THEMES:
{', '.join(themes[:5])}

📈 HISTORICAL TRENDS:
- Entry frequency trend: {historical_analysis['frequency_trend']}
- Sentiment progression: {historical_analysis['sentiment_progression']}
- Most active period: {historical_analysis['most_active_period']}

📝 RECENT ENTRIES:
{entries_text}

Please provide a mystical yet insightful analysis covering:

1. **Recurring Patterns**: What themes, emotions, or situations appear repeatedly?
2. **Spiritual Evolution**: How has their journey progressed over time?
3. **Hidden Insights**: What deeper meanings or connections do you perceive?
4. **Guidance**: What cosmic wisdom can you offer for their continued growth?
5. **Encouragement**: Acknowledge their dedication and progress

Speak as Mirastros - mystical, wise, and encouraging. Use cosmic metaphors and astrological wisdom."""
        
        insights_text = await self.llm_service.generate(
            prompt=prompt,
            max_tokens=800,
            temperature=0.75
        )
        
        # Generate progress summary
        progress_summary = self._generate_progress_summary(stats, historical_analysis, len(entries))
        
        return {
            "total_entries": len(entries),
            "entry_types_distribution": stats['entries_by_type'],
            "common_tags": stats['most_used_tags'],
            "recurring_themes": themes,
            "insights": insights_text,
            "progress_summary": progress_summary,
            "progress_visualizations": visualizations,
            "historical_trends": historical_analysis
        }
    
    async def _extract_themes_with_ai(self, entries: List[JournalEntry]) -> List[str]:
        """Extract recurring themes using AI for better accuracy"""
        
        # First, use keyword-based extraction as fallback
        all_content = " ".join([e.content for e in entries])
        keyword_themes = self._extract_themes_keyword(all_content)
        
        # If we have enough entries, use AI for deeper analysis
        if len(entries) >= 5:
            # Sample entries for AI analysis
            sample_entries = sorted(entries, key=lambda e: e.created_at, reverse=True)[:20]
            entries_summary = "\n".join([
                f"- {e.title}: {e.content[:150]}..."
                for e in sample_entries
            ])
            
            prompt = f"""Analyze these journal entries and identify the top 5 recurring themes or patterns:

{entries_summary}

List only the theme names, one per line, focusing on spiritual, emotional, and life areas.
Examples: "spiritual awakening", "career transition", "relationship healing", "self-discovery"

Themes:"""
            
            try:
                ai_response = await self.llm_service.generate(
                    prompt=prompt,
                    max_tokens=100,
                    temperature=0.5
                )
                
                # Parse AI response
                ai_themes = [
                    line.strip().strip('-').strip()
                    for line in ai_response.split('\n')
                    if line.strip() and len(line.strip()) > 3
                ][:5]
                
                # Combine AI themes with keyword themes
                combined_themes = ai_themes + [t for t in keyword_themes if t not in ai_themes]
                return combined_themes[:7]
            
            except Exception:
                # Fallback to keyword themes if AI fails
                return keyword_themes
        
        return keyword_themes
    
    def _extract_themes_keyword(self, text: str) -> List[str]:
        """Extract recurring themes from text (keyword-based)"""
        
        # Common spiritual/esoteric themes
        theme_keywords = {
            "spiritual growth": ["spiritual", "growth", "awakening", "enlightenment", "consciousness"],
            "emotional healing": ["healing", "emotional", "release", "forgiveness", "trauma"],
            "career transformation": ["career", "work", "job", "profession", "calling", "purpose"],
            "relationships": ["relationship", "love", "partner", "connection", "intimacy"],
            "self-discovery": ["self", "identity", "authentic", "true self", "inner"],
            "abundance": ["abundance", "prosperity", "wealth", "money", "financial"],
            "creativity": ["creative", "art", "expression", "inspiration", "artistic"],
            "inner peace": ["peace", "calm", "serenity", "balance", "tranquility"],
            "shadow work": ["shadow", "dark", "fear", "anxiety", "doubt", "struggle"],
            "manifestation": ["manifest", "attract", "intention", "desire", "goal"],
            "intuition": ["intuition", "psychic", "guidance", "inner voice", "knowing"],
            "transformation": ["transform", "change", "shift", "evolution", "rebirth"]
        }
        
        text_lower = text.lower()
        theme_scores = {}
        
        for theme, keywords in theme_keywords.items():
            score = sum(text_lower.count(keyword) for keyword in keywords)
            if score > 0:
                theme_scores[theme] = score
        
        # Sort by score and return top themes
        sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
        return [theme for theme, score in sorted_themes[:7]]
    
    def _analyze_historical_trends(self, entries: List[JournalEntry]) -> Dict:
        """Analyze historical trends in journal entries"""
        
        if len(entries) < 2:
            return {
                "frequency_trend": "insufficient data",
                "sentiment_progression": "neutral",
                "most_active_period": "N/A",
                "consistency_score": 0
            }
        
        sorted_entries = sorted(entries, key=lambda e: e.created_at)
        
        # 1. Frequency trend (comparing first half vs second half)
        midpoint = len(entries) // 2
        first_half = sorted_entries[:midpoint]
        second_half = sorted_entries[midpoint:]
        
        first_half_days = (first_half[-1].created_at - first_half[0].created_at).days + 1
        second_half_days = (second_half[-1].created_at - second_half[0].created_at).days + 1
        
        first_freq = len(first_half) / max(first_half_days, 1)
        second_freq = len(second_half) / max(second_half_days, 1)
        
        if second_freq > first_freq * 1.2:
            frequency_trend = "increasing"
        elif second_freq < first_freq * 0.8:
            frequency_trend = "decreasing"
        else:
            frequency_trend = "stable"
        
        # 2. Sentiment progression
        positive_words = ["happy", "joy", "peace", "love", "grateful", "blessed", "clarity", "insight", "wonderful", "amazing"]
        negative_words = ["sad", "angry", "confused", "lost", "fear", "worry", "doubt", "struggle", "difficult", "pain"]
        
        first_half_sentiment = self._calculate_sentiment_score(first_half, positive_words, negative_words)
        second_half_sentiment = self._calculate_sentiment_score(second_half, positive_words, negative_words)
        
        if second_half_sentiment > first_half_sentiment + 0.1:
            sentiment_progression = "improving"
        elif second_half_sentiment < first_half_sentiment - 0.1:
            sentiment_progression = "declining"
        else:
            sentiment_progression = "stable"
        
        # 3. Most active period (by month)
        monthly_counts = {}
        for entry in entries:
            month_key = entry.created_at.strftime("%B %Y")
            monthly_counts[month_key] = monthly_counts.get(month_key, 0) + 1
        
        most_active_period = max(monthly_counts.items(), key=lambda x: x[1])[0] if monthly_counts else "N/A"
        
        # 4. Consistency score (0-100)
        total_days = (sorted_entries[-1].created_at - sorted_entries[0].created_at).days + 1
        unique_days = len(set(e.created_at.date() for e in entries))
        consistency_score = min(100, int((unique_days / max(total_days, 1)) * 100))
        
        return {
            "frequency_trend": frequency_trend,
            "sentiment_progression": sentiment_progression,
            "most_active_period": most_active_period,
            "consistency_score": consistency_score,
            "average_entries_per_week": round(len(entries) / max(total_days / 7, 1), 1)
        }
    
    def _calculate_sentiment_score(
        self,
        entries: List[JournalEntry],
        positive_words: List[str],
        negative_words: List[str]
    ) -> float:
        """Calculate average sentiment score for a list of entries"""
        
        if not entries:
            return 0.0
        
        total_sentiment = 0.0
        for entry in entries:
            content_lower = entry.content.lower()
            positive_count = sum(1 for word in positive_words if word in content_lower)
            negative_count = sum(1 for word in negative_words if word in content_lower)
            
            total = positive_count + negative_count
            if total > 0:
                sentiment = (positive_count - negative_count) / total
            else:
                sentiment = 0
            
            total_sentiment += sentiment
        
        return total_sentiment / len(entries)
    
    def _generate_progress_summary(
        self,
        stats: Dict,
        historical_analysis: Dict,
        total_entries: int
    ) -> str:
        """Generate a progress summary based on statistics and trends"""
        
        streak = stats['streak_days']
        frequency_trend = historical_analysis['frequency_trend']
        sentiment_progression = historical_analysis['sentiment_progression']
        consistency = historical_analysis['consistency_score']
        
        summary_parts = []
        
        # Streak acknowledgment
        if streak > 0:
            if streak == 1:
                summary_parts.append("You're building momentum with your practice!")
            elif streak < 7:
                summary_parts.append(f"You've maintained a {streak}-day streak - keep the energy flowing!")
            elif streak < 30:
                summary_parts.append(f"Impressive {streak}-day streak! Your dedication is manifesting results.")
            else:
                summary_parts.append(f"Remarkable {streak}-day streak! You've established a powerful spiritual practice.")
        
        # Frequency trend
        if frequency_trend == "increasing":
            summary_parts.append("Your journaling frequency is growing - a sign of deepening commitment.")
        elif frequency_trend == "decreasing":
            summary_parts.append("Consider reconnecting with your practice more regularly for deeper insights.")
        
        # Sentiment progression
        if sentiment_progression == "improving":
            summary_parts.append("Your emotional tone shows positive evolution - transformation is unfolding.")
        elif sentiment_progression == "declining":
            summary_parts.append("You're processing challenging energies - this is part of the healing journey.")
        
        # Consistency
        if consistency >= 70:
            summary_parts.append(f"Your {consistency}% consistency demonstrates strong spiritual discipline.")
        elif consistency >= 40:
            summary_parts.append(f"With {consistency}% consistency, you're building a solid foundation.")
        else:
            summary_parts.append("More regular practice will amplify your spiritual growth.")
        
        # Total entries milestone
        if total_entries >= 100:
            summary_parts.append(f"🌟 You've created {total_entries} entries - a testament to your journey!")
        elif total_entries >= 50:
            summary_parts.append(f"You've documented {total_entries} moments of your spiritual path.")
        
        return " ".join(summary_parts)
    
    def _create_visualizations(self, entries: List[JournalEntry]) -> Dict:
        """Create data for progress visualizations"""
        
        # Sort entries by date
        sorted_entries = sorted(entries, key=lambda e: e.created_at)
        
        # 1. Entries over time (last 60 days for better trend visibility)
        entries_over_time = []
        today = datetime.now(timezone.utc).date()
        for i in range(60):
            date = today - timedelta(days=59 - i)
            count = sum(1 for e in entries if e.created_at.date() == date)
            entries_over_time.append({
                "date": date.isoformat(),
                "count": count
            })
        
        # 2. Sentiment trend (enhanced with more keywords)
        sentiment_trend = []
        positive_words = ["happy", "joy", "peace", "love", "grateful", "blessed", "clarity", "insight", 
                         "wonderful", "amazing", "beautiful", "inspired", "hopeful", "confident"]
        negative_words = ["sad", "angry", "confused", "lost", "fear", "worry", "doubt", "struggle",
                         "difficult", "pain", "anxious", "frustrated", "overwhelmed", "stuck"]
        
        for entry in sorted_entries[-50:]:  # Last 50 entries
            content_lower = entry.content.lower()
            positive_count = sum(1 for word in positive_words if word in content_lower)
            negative_count = sum(1 for word in negative_words if word in content_lower)
            
            # Simple sentiment score (-1 to 1)
            total = positive_count + negative_count
            sentiment = 0
            if total > 0:
                sentiment = (positive_count - negative_count) / total
            
            sentiment_trend.append({
                "date": entry.created_at.date().isoformat(),
                "sentiment": round(sentiment, 2),
                "title": entry.title,
                "entry_type": entry.entry_type.value
            })
        
        # 3. Theme evolution (track themes over time)
        theme_evolution = []
        
        # Group entries by week
        weeks = {}
        for entry in sorted_entries:
            week_start = entry.created_at.date() - timedelta(days=entry.created_at.weekday())
            week_key = week_start.isoformat()
            
            if week_key not in weeks:
                weeks[week_key] = []
            weeks[week_key].append(entry)
        
        # Extract themes for each week
        for week_key in sorted(weeks.keys())[-16:]:  # Last 16 weeks (4 months)
            week_entries = weeks[week_key]
            week_content = " ".join([e.content for e in week_entries])
            themes = self._extract_themes_keyword(week_content)
            
            theme_evolution.append({
                "week": week_key,
                "themes": themes[:3],  # Top 3 themes per week
                "entry_count": len(week_entries)
            })
        
        # 4. Activity heatmap (day of week and time of day)
        activity_heatmap = self._create_activity_heatmap(entries)
        
        # 5. Growth indicators
        growth_indicators = self._calculate_growth_indicators(sorted_entries)
        
        return {
            "entries_over_time": entries_over_time,
            "sentiment_trend": sentiment_trend,
            "theme_evolution": theme_evolution,
            "activity_heatmap": activity_heatmap,
            "growth_indicators": growth_indicators
        }
    
    def _create_activity_heatmap(self, entries: List[JournalEntry]) -> Dict:
        """Create activity heatmap showing when user journals most"""
        
        day_of_week_counts = {i: 0 for i in range(7)}  # 0=Monday, 6=Sunday
        hour_of_day_counts = {i: 0 for i in range(24)}
        
        for entry in entries:
            day_of_week_counts[entry.created_at.weekday()] += 1
            hour_of_day_counts[entry.created_at.hour] += 1
        
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        return {
            "by_day_of_week": [
                {"day": day_names[i], "count": count}
                for i, count in day_of_week_counts.items()
            ],
            "by_hour_of_day": [
                {"hour": i, "count": count}
                for i, count in hour_of_day_counts.items()
                if count > 0  # Only include hours with activity
            ]
        }
    
    def _calculate_growth_indicators(self, sorted_entries: List[JournalEntry]) -> Dict:
        """Calculate various growth indicators"""
        
        if len(sorted_entries) < 2:
            return {
                "total_days_active": 1,
                "average_entry_length": 0,
                "length_trend": "stable",
                "diversity_score": 0
            }
        
        # Total days active
        total_days = (sorted_entries[-1].created_at - sorted_entries[0].created_at).days + 1
        
        # Average entry length and trend
        first_half = sorted_entries[:len(sorted_entries)//2]
        second_half = sorted_entries[len(sorted_entries)//2:]
        
        first_avg_length = sum(len(e.content) for e in first_half) / len(first_half)
        second_avg_length = sum(len(e.content) for e in second_half) / len(second_half)
        overall_avg_length = sum(len(e.content) for e in sorted_entries) / len(sorted_entries)
        
        if second_avg_length > first_avg_length * 1.2:
            length_trend = "increasing"
        elif second_avg_length < first_avg_length * 0.8:
            length_trend = "decreasing"
        else:
            length_trend = "stable"
        
        # Diversity score (variety of entry types and tags)
        unique_types = len(set(e.entry_type for e in sorted_entries))
        all_tags = set()
        for e in sorted_entries:
            if e.tags:
                all_tags.update(e.tags)
        unique_tags = len(all_tags)
        
        diversity_score = min(100, (unique_types * 10) + (unique_tags * 2))
        
        return {
            "total_days_active": total_days,
            "average_entry_length": int(overall_avg_length),
            "length_trend": length_trend,
            "diversity_score": diversity_score,
            "unique_entry_types": unique_types,
            "unique_tags": unique_tags
        }
