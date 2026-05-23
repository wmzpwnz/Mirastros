import v8 from 'node:v8';
import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => v8.deserialize(v8.serialize(value));
}

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*'],
  },
];
