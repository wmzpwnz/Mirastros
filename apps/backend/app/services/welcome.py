"""Deterministic welcome readings: no provider calls, invented chart or birth time."""
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from math import isfinite

import swisseph as swe
from tzfpy import get_tz

from app.data.numerology import calculate_life_path_number
from app.data.welcome import ALIASES, ELEMENTS, NAMES, NUMBERS, SIGNS, SOLAR_THEMES


def name_reading(full_name: str) -> dict:
    first = (full_name.strip().split() or ["Искатель"])[0]
    key = first.casefold()
    key = ALIASES.get(key, key)
    entry = NAMES.get(key)
    return {
        "name": first,
        "origin": entry[0] if entry else "В нашем справочнике пока нет проверенного происхождения этого имени.",
        "message": entry[1] if entry else "Ваше имя хранит вашу собственную историю. Какой смысл оно имеет для вас?",
        "verified": entry is not None,
    }


def number_reading(birth_date: date | None) -> dict | None:
    if birth_date is None:
        return None
    value = calculate_life_path_number(birth_date.isoformat())
    title, message = NUMBERS[value]
    digits = [int(n) for n in birth_date.isoformat() if n.isdigit()]
    total = sum(digits)
    terms = [" + ".join(map(str, digits)), str(total)]
    while total > 9 and total not in (11, 22, 33):
        total = sum(map(int, str(total)))
        terms.append(str(total))
    return {"value": value, "title": title, "message": message, "formula": " = ".join(terms)}


def _utc(local: datetime, zone: ZoneInfo) -> datetime:
    """Reject nonexistent or ambiguous wall times instead of silently choosing DST."""
    candidates = []
    for fold in (0, 1):
        candidate = local.replace(tzinfo=zone, fold=fold).astimezone(timezone.utc)
        if candidate.astimezone(zone).replace(tzinfo=None) == local and candidate not in candidates:
            candidates.append(candidate)
    if len(candidates) != 1:
        raise ValueError("Время совпадает с переводом часов. Для точной карты потребуется уточнение.")
    return candidates[0]


def _positions(moment: datetime) -> tuple[float, float, float]:
    jd = swe.julday(moment.year, moment.month, moment.day, moment.hour + moment.minute / 60 + moment.second / 3600)
    sun = swe.calc_ut(jd, swe.SUN, swe.FLG_MOSEPH)[0][0]
    moon = swe.calc_ut(jd, swe.MOON, swe.FLG_MOSEPH)[0][0]
    return jd, sun, moon


def sky_reading(birth_date: date | None, birth_time: time | None, location: dict | None) -> dict | None:
    if birth_date is None or not location:
        return None
    lat, lon = location.get("latitude"), location.get("longitude")
    if lat is None or lon is None:
        return None
    try:
        lat, lon = float(lat), float(lon)
        if not isfinite(lat) or not isfinite(lon) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
            raise ValueError("Invalid coordinates")
    except (ValueError, TypeError):
        return {"available": False, "note": "Уточните координаты места рождения в профиле."}
    tz = get_tz(lon, lat)
    if not tz:
        return {"available": False, "note": "Не удалось определить часовой пояс места рождения. Уточните город в профиле."}
    zone = ZoneInfo(tz)
    try:
        if birth_time is not None:
            moment = _utc(datetime.combine(birth_date, birth_time), zone)
            jd, sun, moon = _positions(moment)
            # Equal houses gives the same astronomical ascendant and stays usable
            # at latitudes where Placidus houses are undefined. No houses are shown.
            asc = swe.houses_ex(jd, lat, lon, b'E')[1][0]
            sun_indices, moon_indices = [int(sun // 30)], [int(moon // 30)]
            ascendant = SIGNS[int(asc // 30)]
        else:
            # Endpoints bound sign changes for these slowly moving bodies in one
            # civil day. No noon chart is presented as an actual birth chart.
            start = datetime.combine(birth_date, time.min).replace(tzinfo=zone).astimezone(timezone.utc)
            end = (datetime.combine(birth_date + timedelta(days=1), time.min).replace(tzinfo=zone) - timedelta(seconds=1)).astimezone(timezone.utc)
            _, sun1, moon1 = _positions(start)
            _, sun2, moon2 = _positions(end)
            sun_indices = list(dict.fromkeys([int(sun1 // 30), int(sun2 // 30)]))
            moon_indices = list(dict.fromkeys([int(moon1 // 30), int(moon2 // 30)]))
            ascendant = None
        solar_theme = SOLAR_THEMES[sun_indices[0]] if len(sun_indices) == 1 else "Для уточнения солнечного знака нужно время рождения."
        return {
            "available": True, "timezone": tz, "time_known": birth_time is not None,
            "sun": [SIGNS[i] for i in sun_indices], "moon": [SIGNS[i] for i in moon_indices],
            "ascendant": ascendant,
            "element": ELEMENTS[sun_indices[0] % 4] if len(sun_indices) == 1 else None,
            "message": f"В символике вашей солнечной карты центральная тема — {solar_theme}." if len(sun_indices) == 1 else solar_theme,
            "note": "Тропический зодиак. Солнце и Луна рассчитаны по моменту рождения." if birth_time else "Время неизвестно: указаны возможные знаки за сутки. Асцендент и дома не определены.",
        }
    except (ValueError, swe.Error):
        return {"available": False, "note": "Момент рождения требует уточнения: возможна смена часового пояса или перевод часов. Данные сохранены; их можно уточнить позже."}


def build_portrait(full_name: str, birth_date: date | None, birth_time: time | None, location: dict | None) -> dict:
    name = name_reading(full_name)
    number = number_reading(birth_date)
    sky = sky_reading(birth_date, birth_time, location)
    if number and sky and sky.get("available") and len(sky["sun"]) == 1:
        summary = f"В вашем портрете соединяются число {number['value']} — «{number['title'].lower()}» — и солнечная тема: {SOLAR_THEMES[SIGNS.index(sky['sun'][0])]}."
    elif number:
        summary = f"Ваш первый числовой ключ — {number['value']}. Его символическая тема — «{number['title'].lower()}»."
    else:
        summary = "Первый символ вашего пути открыт. Остальные координаты можно добавить в своём ритме."
    return {"name": name, "number": number, "sky": sky, "summary": summary}
