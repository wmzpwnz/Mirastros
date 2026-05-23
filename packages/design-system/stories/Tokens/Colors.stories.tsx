import type { Meta, StoryObj } from '@storybook/react';
import { colors } from '../../src/tokens/colors';

const meta = {
  title: 'Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Color Palette</h1>

      {/* Cosmic Theme */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Cosmic Theme</h2>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.cosmic }}
            />
            <p className="text-sm text-gray-400 mt-2">Cosmic</p>
            <p className="text-xs text-gray-500">#050505</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.void }}
            />
            <p className="text-sm text-gray-400 mt-2">Void</p>
            <p className="text-xs text-gray-500">#0a0a0a</p>
          </div>
        </div>
      </section>

      {/* Gold Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Gold Accent</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(colors.gold).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded border border-gray-700"
                style={{ backgroundColor: value as string }}
              />
              <p className="text-xs text-gray-400 mt-2">gold-{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Turquoise Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Turquoise Accent</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(colors.turquoise).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded border border-gray-700"
                style={{ backgroundColor: value as string }}
              />
              <p className="text-xs text-gray-400 mt-2">turquoise-{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Semantic Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.success }}
            />
            <p className="text-sm text-gray-400 mt-2">Success</p>
            <p className="text-xs text-gray-500">{colors.success}</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.warning }}
            />
            <p className="text-sm text-gray-400 mt-2">Warning</p>
            <p className="text-xs text-gray-500">{colors.warning}</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.error }}
            />
            <p className="text-sm text-gray-400 mt-2">Error</p>
            <p className="text-xs text-gray-500">{colors.error}</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded border border-gray-700"
              style={{ backgroundColor: colors.info }}
            />
            <p className="text-sm text-gray-400 mt-2">Info</p>
            <p className="text-xs text-gray-500">{colors.info}</p>
          </div>
        </div>
      </section>

      {/* Grayscale */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Grayscale</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(colors.gray).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded border border-gray-700"
                style={{ backgroundColor: value as string }}
              />
              <p className="text-xs text-gray-400 mt-2">gray-{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
