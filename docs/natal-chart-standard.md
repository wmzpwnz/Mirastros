# Mirastros Natal Chart Standard

## Purpose and claim

The first release is a **reproducible implementation of Western tropical natal astrology**, not a claim that one interpretive school is universally accepted or scientifically validated. A reader can inspect the exact birth inputs and calculation convention and reproduce the same chart with a compatible engine.

## Calculation contract, edition 2

- Input is the civil date and **local wall-clock time** recorded at the birthplace, plus the selected place's latitude and longitude.
- Birth time is accepted at minute precision, matching the calculation engine's input precision; seconds are rejected rather than recorded but ignored.
- Place search returns an explicit choice; the client must never silently substitute default coordinates.
- `tzfpy` maps coordinates to an IANA time-zone identifier. Python `ZoneInfo` applies the time-zone rules for the birth date. Nonexistent and ambiguous local times at a clock transition are rejected with an explanation; the service must not silently choose an offset.
- Kerykeion is pinned at `5.1.12`; its Swiss Ephemeris binding (`pyswisseph`) is pinned at `2.10.3.2`. The engine receives the resolved IANA time zone, tropical zodiac, apparent geocentric perspective, and Placidus house code (`P`). The engine and ephemeris versions, time-zone database edition, resolved time zone, UTC instant, and coordinates are persisted with the chart.
- The north node is the mean lunar node; the south node is calculated as its opposite point.
- A change to calculation semantics increments `calculation_version`. Stored charts with an earlier or missing version are recomputed from the user's saved birth inputs when the user requests their chart.
- A calculation error must remain visible as an error. Never replace a missing house with House 1, invent a noon birth time, or fall back to a different city or house system without telling the user.

## Reading contract

- Geometry and positions are calculated data. Interpretive text is a separate editorial/AI layer and cannot modify positions, houses, or aspects.
- Every interpretive statement is framed as a symbolic lens for reflection, not a fixed trait, diagnosis, or guaranteed prediction.
- The first reading explains Sun, Moon, and Ascendant, then planets by sign and house, then major aspects. Each item states what the symbol represents, how the sign modifies its expression, and which life area the house describes.
- An unknown birth time must not produce a full wheel with invented angles or houses. A future date-only mode may show only positions that are stable for the civil day and label any sign that changes during that day as uncertain.
- Method disclosure stays available from the result: local birth input, chosen place/coordinates, resolved time zone, UTC conversion, zodiac, house system, calculation engine/version, and chart edition.

## Naming and responsible reference

Use the user-facing label **«Натальная карта · тропическая система, дома Плацидуса»**. Do not call the reading “the universal method” or “scientifically proven”. A professional reference requires the edition, calculation engine/version, input time convention, time zone, coordinates, and house system; citing only “Mirastros” is not enough to reproduce a chart.

## Known implementation boundary

This release currently requires a known birth time for a full chart. Public entry points that allow an unknown time must continue to describe only the limited Sun/Moon/day-level result they actually calculate; they must not imply that houses or Ascendant are available. A separately designed date-only chart remains future work.

## Commercial dependency gate

The repository pins Kerykeion `5.1.12`; its published package metadata identifies its license as **AGPL-3.0**. It depends on Swiss Ephemeris through `pyswisseph`, which also has licensing terms that require review for commercial use. Before presenting this implementation as a closed-source commercial product, have the deployment/licensing model reviewed and either comply with the applicable licenses or select an appropriately licensed calculation engine. This technical specification does not grant a commercial license.
