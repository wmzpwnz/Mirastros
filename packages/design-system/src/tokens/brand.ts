/** Approved Mirastros board, shared by browser and native implementations.
 * Semantic keys also define the browser's --mira-* properties. Keep these
 * values independent of CSS, window, or a particular rendering framework. */
export const mirastrosBrand = {
  canvas: '#080b1a',
  surface: '#1a123d',
  raised: '#2b1848',
  violet: '#6e3bae',
  luminous: '#b66cff',
  ivory: '#f0e6ff',
  muted: '#b8abc5',
  gold: '#ffd9a6',
  metal: '#c7a575',
  line: '#c7a57560',
  'line-faint': '#c7a57524',
  focus: '#d8b8ff',
} as const;
