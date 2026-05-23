# Mirastros UI Rules

## React Bits First

When creating or redesigning Mirastros UI, check React Bits first:

- Source: https://reactbits.dev/
- Use React Bits components and effects as the preferred starting point for rich interactive UI.
- Adapt each effect to the Mirastros visual language: cosmic depth, gold accents, dark premium surfaces, tunnel/portal motion, and restrained production UX.
- Do not paste effects blindly. Keep bundle cost, accessibility, keyboard support, reduced motion, mobile behavior, and SSR compatibility under control.
- If a React Bits effect conflicts with an existing Mirastros pattern, wrap it behind a local component and expose a stable Mirastros API.
- Document copied/adapted React Bits components near their local implementation.

## Hero Panel Direction

The dashboard Hero Panel should feel like a personalized astrological cockpit, not a generic card dashboard:

- Prioritize one strong visual focus.
- Keep secondary data scannable and dense.
- Avoid nested cards and decorative clutter.
- Motion should clarify hierarchy, not compete with the data.
