import type { Meta, StoryObj } from '@storybook/react';
import { animations, transitions, easings } from '../../src/tokens/animations';

const meta = {
  title: 'Tokens/Animations',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnimationPresets: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Animation Presets</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Pulse Slow</h2>
        <div className="flex items-center gap-8">
          <div
            className="w-16 h-16 bg-gold-500 rounded-full"
            style={{
              animation: `pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            }}
          />
          <div className="space-y-2">
            <p className="text-gray-400">
              <span className="font-mono text-gold-500">pulse-slow</span>
            </p>
            <p className="text-gray-500 text-sm">Duration: 4s</p>
            <p className="text-gray-500 text-sm">Timing: cubic-bezier(0.4, 0, 0.6, 1)</p>
            <p className="text-gray-500 text-sm">Iteration: infinite</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Float</h2>
        <div className="flex items-center gap-8">
          <div
            className="w-16 h-16 bg-turquoise-500 rounded-full"
            style={{
              animation: `float 6s ease-in-out infinite`,
            }}
          />
          <div className="space-y-2">
            <p className="text-gray-400">
              <span className="font-mono text-turquoise-500">float</span>
            </p>
            <p className="text-gray-500 text-sm">Duration: 6s</p>
            <p className="text-gray-500 text-sm">Timing: ease-in-out</p>
            <p className="text-gray-500 text-sm">Iteration: infinite</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Bounce Slow</h2>
        <div className="flex items-center gap-8">
          <div
            className="w-16 h-16 bg-green-500 rounded-full"
            style={{
              animation: `bounce 3s ease-in-out infinite`,
            }}
          />
          <div className="space-y-2">
            <p className="text-gray-400">
              <span className="font-mono text-green-500">bounce-slow</span>
            </p>
            <p className="text-gray-500 text-sm">Duration: 3s</p>
            <p className="text-gray-500 text-sm">Timing: ease-in-out</p>
            <p className="text-gray-500 text-sm">Iteration: infinite</p>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Transitions: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Transition Durations</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Fast (150ms)</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-gold-500 rounded cursor-pointer hover:bg-gold-600"
              style={{ transition: '150ms ease-in-out' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">150ms ease-in-out</p>
              <p className="text-gray-500 text-sm">Quick transitions for interactive elements</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Base (300ms)</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-turquoise-500 rounded cursor-pointer hover:bg-turquoise-600"
              style={{ transition: '300ms ease-in-out' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">300ms ease-in-out</p>
              <p className="text-gray-500 text-sm">Standard transitions for most interactions</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Slow (500ms)</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-green-500 rounded cursor-pointer hover:bg-green-600"
              style={{ transition: '500ms ease-in-out' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">500ms ease-in-out</p>
              <p className="text-gray-500 text-sm">Slower transitions for emphasis and modals</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};

export const EasingFunctions: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Easing Functions</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Ease In</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-gold-500 rounded cursor-pointer hover:translate-x-8"
              style={{ transition: '300ms cubic-bezier(0.4, 0, 1, 1)' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">cubic-bezier(0.4, 0, 1, 1)</p>
              <p className="text-gray-500 text-sm">Starts slow, accelerates at the end</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Ease Out</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-turquoise-500 rounded cursor-pointer hover:translate-x-8"
              style={{ transition: '300ms cubic-bezier(0, 0, 0.2, 1)' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">cubic-bezier(0, 0, 0.2, 1)</p>
              <p className="text-gray-500 text-sm">Starts fast, decelerates at the end</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Ease In Out</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-green-500 rounded cursor-pointer hover:translate-x-8"
              style={{ transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">cubic-bezier(0.4, 0, 0.2, 1)</p>
              <p className="text-gray-500 text-sm">Slow start and end, fast in the middle</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Linear</h2>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 bg-red-500 rounded cursor-pointer hover:translate-x-8"
              style={{ transition: '300ms linear' }}
            />
            <div className="flex flex-col justify-center">
              <p className="text-gray-400 font-mono">linear</p>
              <p className="text-gray-500 text-sm">Constant speed throughout</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Usage Guide</h2>
        <div className="bg-gray-800 p-6 rounded space-y-4">
          <div>
            <p className="text-gold-500 font-semibold mb-2">Ease In</p>
            <p className="text-gray-400 text-sm">Use for elements entering the screen or appearing</p>
          </div>
          <div>
            <p className="text-turquoise-500 font-semibold mb-2">Ease Out</p>
            <p className="text-gray-400 text-sm">Use for elements leaving the screen or disappearing</p>
          </div>
          <div>
            <p className="text-green-500 font-semibold mb-2">Ease In Out</p>
            <p className="text-gray-400 text-sm">Use for general interactions and state changes</p>
          </div>
          <div>
            <p className="text-red-500 font-semibold mb-2">Linear</p>
            <p className="text-gray-400 text-sm">Use for progress bars and continuous animations</p>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const AnimationComparison: Story = {
  render: () => (
    <div className="p-8 bg-cosmic">
      <h1 className="text-4xl font-bold text-gold-500 mb-8">Animation Comparison</h1>

      <div className="grid grid-cols-2 gap-8">
        <section>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Pulse Slow (4s)</h3>
          <div
            className="w-full h-32 bg-gold-500 rounded"
            style={{
              animation: `pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            }}
          />
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Float (6s)</h3>
          <div
            className="w-full h-32 bg-turquoise-500 rounded"
            style={{
              animation: `float 6s ease-in-out infinite`,
            }}
          />
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Bounce Slow (3s)</h3>
          <div
            className="w-full h-32 bg-green-500 rounded"
            style={{
              animation: `bounce 3s ease-in-out infinite`,
            }}
          />
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-100 mb-4">Fade In (300ms)</h3>
          <div
            className="w-full h-32 bg-red-500 rounded"
            style={{
              animation: `fadeIn 300ms ease-in-out`,
            }}
          />
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Performance Tips</h2>
        <ul className="space-y-2 text-gray-400">
          <li className="flex gap-2">
            <span className="text-gold-500">•</span>
            <span>Use GPU-accelerated properties: transform, opacity</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">•</span>
            <span>Avoid animating: width, height, left, top, margin, padding</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">•</span>
            <span>Keep animations under 500ms for UI interactions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">•</span>
            <span>Use will-change sparingly for complex animations</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500">•</span>
            <span>Respect prefers-reduced-motion for accessibility</span>
          </li>
        </ul>
      </section>
    </div>
  ),
};
