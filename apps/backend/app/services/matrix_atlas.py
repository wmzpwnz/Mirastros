"""Versioned, deterministic matrix calculation with an auditable arithmetic trace."""
import json
from datetime import date
from pathlib import Path

POSITIONS = json.loads(Path(__file__).with_name("matrix_positions.json").read_text())
VERSION = "matrix-reference-1"


def calculate_atlas(birth_date: str) -> dict:
    parsed = date.fromisoformat(birth_date)
    if parsed.isoformat() != birth_date or parsed > date.today():
        raise ValueError("Укажите существующую дату рождения в прошлом.")
    values = {
        "day": [parsed.day],
        "month": [parsed.month],
        "yearDigits": list(map(int, str(parsed.year))),
    }
    result = []
    for position in POSITIONS:
        operands = [n for key in position["inputs"] for n in values[key]]
        number = sum(operands)
        trace = [" + ".join(map(str, operands)) + " = " + str(number)]
        while number > 22:
            digits = list(map(int, str(number)))
            number = sum(digits)
            trace.append(" + ".join(map(str, digits)) + " = " + str(number))
        values[position["key"]] = [number]
        result.append({**position, "value": number, "formula": " → ".join(trace)})
    return {
        "birth_date": birth_date,
        "methodology_version": VERSION,
        "source": "https://ladinimatrix.ru/calculate-matrix-yourself/",
        "positions": result,
    }
