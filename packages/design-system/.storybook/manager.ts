import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'Mirastros Design System',
  brandUrl: 'https://mirastros.com',
  brandImage: undefined,
  brandTarget: '_self',

  // UI
  appBg: '#050505',
  appContentBg: '#0a0a0a',
  appBorderColor: '#1f2937',
  appBorderRadius: 4,

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: '"Fira Code", monospace',

  // Text colors
  textColor: '#f3f4f6',
  textInverseColor: '#050505',

  // Toolbar default and active colors
  barTextColor: '#d1d5db',
  barSelectedColor: '#ffc107',
  barBg: '#1f2937',

  // Form colors
  inputBg: '#111827',
  inputBorder: '#374151',
  inputTextColor: '#f3f4f6',
  inputBorderRadius: 4,

  // Brand colors
  colorPrimary: '#ffc107',
  colorSecondary: '#00bcd4',
});

addons.setConfig({
  theme,
  isFullscreen: false,
  showNav: true,
  showPanel: true,
  panelPosition: 'bottom',
  enableShortcuts: true,
  showToolbar: true,
  selectedPanel: undefined,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: false,
    collapsedRoots: [],
  },
});
