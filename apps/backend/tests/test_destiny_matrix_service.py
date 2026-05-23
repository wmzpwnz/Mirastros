from app.services.destiny_matrix import (
    build_personalized_matrix,
    calculate_basic_lines,
    calculate_extended_lines,
    calculate_positions,
    normalize_lines_payload,
    reduce_to_arcana,
)


def test_reduce_to_arcana_zero_and_large_numbers():
    assert reduce_to_arcana(0) == 22
    assert reduce_to_arcana(1999) == 1
    assert reduce_to_arcana(58) == 13


def test_basic_and_extended_lines_are_deterministic():
    lines_basic = calculate_basic_lines(day=15, month=5, year=1990)
    assert lines_basic == {
        "destiny": 20,
        "character": 16,
        "purpose": 6,
        "health": 15,
    }

    lines_extended = calculate_extended_lines(lines_basic)
    assert lines_extended["line_of_heaven"] == [20, 8, 6]
    assert lines_extended["line_of_earth"] == [16, 4, 15]
    assert lines_extended["line_of_man"] == [20, 9, 16]
    assert lines_extended["line_of_woman"] == [6, 21, 15]


def test_personalized_matrix_shape_and_range():
    lines_basic = calculate_basic_lines(day=15, month=5, year=1990)
    lines_extended = calculate_extended_lines(lines_basic)
    positions = calculate_positions(lines_basic)
    matrix = build_personalized_matrix(lines_basic, lines_extended, positions)

    assert len(matrix) == 4
    assert all(len(row) == 4 for row in matrix)
    assert all(1 <= value <= 22 for row in matrix for value in row)


def test_normalize_lines_payload_v1_and_v2():
    legacy_payload = {
        "destiny": 20,
        "character": 16,
        "purpose": 6,
        "health": 15,
    }
    v1, basic_v1, extended_v1, positions_v1, _ = normalize_lines_payload(legacy_payload)
    assert v1 == "v1"
    assert basic_v1["destiny"] == 20
    assert "line_of_heaven" in extended_v1
    assert "core" in positions_v1

    v2_payload = {
        "calculation_version": "v2",
        "basic": legacy_payload,
        "extended": {
            "line_of_heaven": [20, 8, 6],
            "line_of_earth": [16, 4, 15],
            "line_of_man": [20, 9, 16],
            "line_of_woman": [6, 21, 15],
        },
        "positions": {
            "core": 13,
            "soul": 14,
            "realization": 21,
            "talent": 22,
            "karmic": 13,
            "shadow": 8,
        },
        "layout_meta": {"shape": "4x4"},
    }
    v2, basic_v2, extended_v2, positions_v2, layout_v2 = normalize_lines_payload(v2_payload)
    assert v2 == "v2"
    assert basic_v2["health"] == 15
    assert extended_v2["line_of_woman"] == [6, 21, 15]
    assert positions_v2["core"] == 13
    assert layout_v2["shape"] == "4x4"
