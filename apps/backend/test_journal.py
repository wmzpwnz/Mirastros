"""Test Journal Service"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.journal import JournalService
from app.services.llm import UnifiedLLMService
from app.models.journal_entry import JournalEntry, EntryType


async def test_journal_service():
    """Test journal service functionality"""
    
    print("🧪 Testing Journal Service\n")
    
    # Initialize services
    llm_service = UnifiedLLMService()
    journal_service = JournalService(llm_service=llm_service)
    
    # Test theme extraction (keyword-based)
    print("1. Testing keyword-based theme extraction...")
    test_text = """
    Today I had a profound meditation experience. I felt deep spiritual growth
    and connection to my higher self. The healing energy was overwhelming.
    I'm experiencing a career transformation and seeking my true calling.
    My relationships are improving and I feel more authentic.
    """
    
    themes = journal_service._extract_themes_keyword(test_text)
    print(f"   Extracted themes: {themes}")
    assert len(themes) > 0, "Should extract at least one theme"
    assert "spiritual growth" in themes, "Should detect spiritual growth theme"
    assert "emotional healing" in themes, "Should detect healing theme"
    print("   ✅ Keyword-based theme extraction works\n")
    
    # Test entry type validation
    print("2. Testing entry type validation...")
    valid_types = ["dream", "meditation", "reading", "ritual", "reflection", "other"]
    print(f"   Valid entry types: {valid_types}")
    print("   ✅ Entry types defined\n")
    
    # Test visualization data creation
    print("3. Testing progress visualization creation...")
    
    # Create mock entries
    mock_entries = []
    base_date = datetime.utcnow()
    
    for i in range(15):
        entry = JournalEntry(
            user_id="test-user",
            title=f"Entry {i+1}",
            content=f"Today I felt happy and grateful. This is entry {i+1} with positive energy and clarity.",
            entry_type=EntryType.MEDITATION,
            tags=["meditation", "clarity"],
            metadata={}
        )
        entry.created_at = base_date - timedelta(days=14-i)
        mock_entries.append(entry)
    
    visualizations = journal_service._create_visualizations(mock_entries)
    
    print(f"   Entries over time data points: {len(visualizations['entries_over_time'])}")
    assert len(visualizations['entries_over_time']) == 60, "Should have 60 days of data"
    
    print(f"   Sentiment trend data points: {len(visualizations['sentiment_trend'])}")
    assert len(visualizations['sentiment_trend']) > 0, "Should have sentiment data"
    
    print(f"   Theme evolution data points: {len(visualizations['theme_evolution'])}")
    assert len(visualizations['theme_evolution']) > 0, "Should have theme evolution data"
    
    # Check sentiment calculation
    first_sentiment = visualizations['sentiment_trend'][0]
    print(f"   Sample sentiment: {first_sentiment['sentiment']} (should be positive)")
    assert 'date' in first_sentiment, "Sentiment should have date"
    assert 'sentiment' in first_sentiment, "Sentiment should have score"
    assert 'title' in first_sentiment, "Sentiment should have title"
    assert 'entry_type' in first_sentiment, "Sentiment should have entry_type"
    
    # Check activity heatmap
    assert 'activity_heatmap' in visualizations, "Should have activity heatmap"
    heatmap = visualizations['activity_heatmap']
    print(f"   Activity heatmap days: {len(heatmap['by_day_of_week'])}")
    assert len(heatmap['by_day_of_week']) == 7, "Should have 7 days of week"
    
    # Check growth indicators
    assert 'growth_indicators' in visualizations, "Should have growth indicators"
    growth = visualizations['growth_indicators']
    print(f"   Growth indicators: diversity_score={growth['diversity_score']}, length_trend={growth['length_trend']}")
    assert 'diversity_score' in growth, "Should have diversity score"
    assert 'length_trend' in growth, "Should have length trend"
    
    print("   ✅ Enhanced visualization creation works\n")
    
    # Test historical trends analysis
    print("4. Testing historical trends analysis...")
    trends = journal_service._analyze_historical_trends(mock_entries)
    
    print(f"   Frequency trend: {trends['frequency_trend']}")
    print(f"   Sentiment progression: {trends['sentiment_progression']}")
    print(f"   Most active period: {trends['most_active_period']}")
    print(f"   Consistency score: {trends['consistency_score']}%")
    print(f"   Average entries per week: {trends['average_entries_per_week']}")
    
    assert 'frequency_trend' in trends, "Should have frequency trend"
    assert 'sentiment_progression' in trends, "Should have sentiment progression"
    assert 'consistency_score' in trends, "Should have consistency score"
    assert trends['consistency_score'] >= 0 and trends['consistency_score'] <= 100, "Consistency should be 0-100"
    
    print("   ✅ Historical trends analysis works\n")
    
    # Test progress summary generation
    print("5. Testing progress summary generation...")
    stats = {
        'streak_days': 7,
        'entries_by_type': {'meditation': 10, 'dream': 5},
        'most_used_tags': [{'tag': 'clarity', 'count': 8}]
    }
    
    summary = journal_service._generate_progress_summary(stats, trends, len(mock_entries))
    print(f"   Generated summary: {summary[:100]}...")
    assert len(summary) > 0, "Should generate a summary"
    assert 'streak' in summary.lower() or 'dedication' in summary.lower(), "Should mention progress"
    
    print("   ✅ Progress summary generation works\n")
    
    print("✅ All journal service tests passed!")


if __name__ == "__main__":
    asyncio.run(test_journal_service())
