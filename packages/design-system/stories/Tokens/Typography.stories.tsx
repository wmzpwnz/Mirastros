import type { Meta, StoryObj } from '@storybook/react';
import { typography } from '../../src/tokens/typography';

const meta = {
  title: 'Tokens/Typography',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FontFamilies: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Font Families</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Heading Font</h2>
        <p className="text-lg text-gray-400 mb-2">Cinzel (Serif)</p>
        <p
          className="text-4xl text-gray-100"
          style={{ fontFamily: typography.fontFamily.heading }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Body Font</h2>
        <p className="text-lg text-gray-400 mb-2">Inter (Sans-serif)</p>
        <p
          className="text-lg text-gray-100"
          style={{ fontFamily: typography.fontFamily.body }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Monospace Font</h2>
        <p className="text-lg text-gray-400 mb-2">Fira Code (Monospace)</p>
        <p
          className="text-lg text-gray-100"
          style={{ fontFamily: typography.fontFamily.mono }}
        >
          const greeting = 'Hello, World!';
        </p>
      </section>
    </div>
  ),
};

export const FontSizes: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Font Sizes</h1>

      <div className="space-y-4">
        {Object.entries(typography.fontSize).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-gray-400 w-16">{key}</span>
            <span className="text-gray-500 w-20">{value}</span>
            <p style={{ fontSize: value as string }} className="text-gray-100">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Font Weights</h1>

      <div className="space-y-4">
        {Object.entries(typography.fontWeight).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-gray-400 w-24">{key}</span>
            <span className="text-gray-500 w-12">{value}</span>
            <p style={{ fontWeight: value as number }} className="text-lg text-gray-100">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Line Heights</h1>

      <div className="space-y-8">
        {Object.entries(typography.lineHeight).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-gray-400 w-24">{key}</span>
              <span className="text-gray-500 w-12">{value}</span>
            </div>
            <p style={{ lineHeight: value as number }} className="text-gray-100 max-w-2xl">
              The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy
              dog. The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
};
