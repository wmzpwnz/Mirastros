import pytest
from app.services.matrix_atlas import calculate_atlas


@pytest.mark.parametrize("birth_date,expected", [
    ("1984-10-31", [4,10,22,9,9,14,5,4,13,9,18,19,8,9,18,18,9,18,9]),
    ("2000-01-01", [1,1,2,4,8,2,3,6,5,16,6,5,3,8,8,8,16,6,22]),
])
def test_published_vectors(birth_date, expected):
    result = calculate_atlas(birth_date)
    assert [p["value"] for p in result["positions"]] == expected
    assert all(p["formula"] for p in result["positions"])


@pytest.mark.parametrize("birth_date", ["1900-02-29", "2000-04-31", "2999-01-01", ""])
def test_invalid_date(birth_date):
    with pytest.raises(ValueError):
        calculate_atlas(birth_date)


def test_leap_day():
    assert calculate_atlas("2000-02-29")["birth_date"] == "2000-02-29"
