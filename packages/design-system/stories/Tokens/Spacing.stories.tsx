import type { Meta, StoryObj } from '@storybook/react';
import { spacing } from '../../src/tokens/spacing';

const meta = {
  title: 'Tokens/Spacing',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingScale: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Spacing Scale (8px Base Unit)</h1>

      <div className="space-y-8">
        {Object.entries(spacing).map(([key, value]) => {
          const pxValue = parseFloat(value) * 16; // Convert rem to px
          return (
            <div key={key} className="flex items-center gap-4">
              <div className="w-24">
                <p className="text-gray-400 font-mono">{key}</p>
                <p className="text-gray-500 text-sm">{value}</p>
                <p className="text-gray-500 text-sm">{pxValue}px</p>
              </div>
              <div
                className="bg-gold-500 rounded"
                style={{ width: `${pxValue}px`, height: '24px' }}
              />
            </div>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Spacing in Layout</h2>
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400 text-sm mb-2">p-4 (1rem / 16px)</p>
            <p className="text-gray-100">Content with padding</p>
          </div>
          <div className="bg-gray-800 p-6 rounded">
            <p className="text-gray-400 text-sm mb-2">p-6 (1.5rem / 24px)</p>
            <p className="text-gray-100">Content with padding</p>
          </div>
          <div className="bg-gray-800 p-8 rounded">
            <p className="text-gray-400 text-sm mb-2">p-8 (2rem / 32px)</p>
            <p className="text-gray-100">Content with padding</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Gap Examples</h2>
        <div className="flex gap-2 mb-4">
          <div className="w-12 h-12 bg-gold-500 rounded" />
          <div className="w-12 h-12 bg-gold-500 rounded" />
          <div className="w-12 h-12 bg-gold-500 rounded" />
          <p className="text-gray-400 text-sm ml-4">gap-2 (0.5rem / 8px)</p>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-turquoise-500 rounded" />
          <div className="w-12 h-12 bg-turquoise-500 rounded" />
          <div className="w-12 h-12 bg-turquoise-500 rounded" />
          <p className="text-gray-400 text-sm ml-4">gap-4 (1rem / 16px)</p>
        </div>
        <div className="flex gap-6">
          <div className="w-12 h-12 bg-green-500 rounded" />
          <div className="w-12 h-12 bg-green-500 rounded" />
          <div className="w-12 h-12 bg-green-500 rounded" />
          <p className="text-gray-400 text-sm ml-4">gap-6 (1.5rem / 24px)</p>
        </div>
      </section>
    </div>
  ),
};
