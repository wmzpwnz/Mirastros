# Z-Scroll Mini-Apps Contract

## Scope
This contract defines the minimum consistent tunnel behavior for `vk-mini` and `telegram-mini`.

## Shared Behavior
1. Progress is normalized per section in range `0..1`.
2. Active section must be visually dominant (`scale` and `opacity` peak near center).
3. Neighbor sections must reduce emphasis gradually (no hard show/hide jump).
4. Tunnel never blocks native vertical scroll.

## Recommended Motion Ranges
1. `scale`: `0.86 -> 1.0 -> 0.86`
2. `opacity`: `0.35 -> 1.0 -> 0.35`
3. optional `translateX` zig-zag:
   - even: `-24 -> 0 -> 24`
   - odd: `24 -> 0 -> -24`

## Performance/Lite Rules
1. Respect `prefers-reduced-motion`: reduce transform amplitude and transition durations.
2. Do not use blur filters in mini-apps.
3. Keep one active animation loop per viewport; avoid per-item heavy timers.

## Interaction Rules
1. Section navigation should scroll to `index * scrollPerSlide` equivalent in current app model.
2. Progress indicators should use section-local progress, not global document percent.

## Compatibility Notes
1. `vk-mini` and `telegram-mini` may use different primitives (`scroll events` vs `IntersectionObserver`), but visual output must stay within ranges above.
2. Any deviation from ranges should be documented in app-specific README with reason.
