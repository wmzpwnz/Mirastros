from datetime import date

from app.schemas.horoscope import HoroscopeResponse
from app.services.horoscope import horoscope_service


def test_aquarius_colors_are_list_and_ru():
    colors = horoscope_service.generate_lucky_colors("aquarius")
    assert isinstance(colors, list)
    assert all(isinstance(color, str) for color in colors)


def test_period_range_label_for_weekly():
    label = horoscope_service.get_period_range_label("weekly", date(2026, 2, 2))
    assert "2" in label
    assert "2026" in label


def test_content_normalization_returns_ru_plain_text():
    normalized = horoscope_service.validate_and_normalize_horoscope_content(
        sign="aries",
        period="daily",
        target_date=date(2026, 2, 8),
        prediction="**Cosmic Whisper** for Aries",
        advice="Trust your intuition today.",
        lucky_colors=["Red", "Orange", "White"],
    )
    assert normalized["language"] == "ru"
    assert "Cosmic Whisper" not in normalized["prediction"]
    assert all(any(ch.isalpha() for ch in color) for color in normalized["lucky_colors"])


def test_horoscope_response_schema_supports_new_fields():
    payload = {
        "sign": "aries",
        "period": "daily",
        "date": "2026-02-08",
        "prediction": "Сегодня хороший день для спокойных решений.",
        "plain_text": "Сегодня хороший день для спокойных решений.",
        "rich_text": "Сегодня хороший день для спокойных решений.",
        "lucky_numbers": [11, 36, 45, 49],
        "lucky_colors": ["Красный", "Оранжевый", "Белый"],
        "compatibility_signs": ["leo"],
        "advice": "Действуйте последовательно.",
        "ratings": {"finance": 4, "love": 4, "career": 4, "health": 3},
        "explanations": {
            "finance_reason": "ok",
            "love_reason": "ok",
            "career_reason": "ok",
            "health_reason": "ok",
        },
        "best_time_windows": ["09:00-11:00", "14:00-16:00"],
        "period_range_label": "8 февраля 2026",
        "language": "ru",
        "clarify_available": True,
    }
    model = HoroscopeResponse(**payload)
    assert model.language == "ru"
    assert model.period_range_label == "8 февраля 2026"
