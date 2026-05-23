import type { Meta, StoryObj } from '@storybook/react';
import { Section } from '../../src/components/Section';
import { Card } from '../../src/components/Card';

const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Our Services',
    subtitle: 'Explore our cosmic offerings',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" padding="md">
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Service 1</h3>
          <p className="text-gray-400">Description of service one</p>
        </Card>
        <Card variant="default" padding="md">
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Service 2</h3>
          <p className="text-gray-400">Description of service two</p>
        </Card>
        <Card variant="default" padding="md">
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Service 3</h3>
          <p className="text-gray-400">Description of service three</p>
        </Card>
      </div>
    ),
  },
};

export const WithBackground: Story = {
  args: {
    title: 'Featured Collection',
    subtitle: 'Handpicked cosmic experiences',
    backgroundColor: '#1a1a2e',
    padding: 'lg',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card variant="elevated" padding="lg">
          <h3 className="text-2xl font-semibold text-gray-100 mb-4">Premium Reading</h3>
          <p className="text-gray-400 mb-4">Get a comprehensive reading from our expert practitioners.</p>
          <button className="px-4 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600">
            Book Now
          </button>
        </Card>
        <Card variant="elevated" padding="lg">
          <h3 className="text-2xl font-semibold text-gray-100 mb-4">Spiritual Guidance</h3>
          <p className="text-gray-400 mb-4">Connect with your spiritual guides and find clarity.</p>
          <button className="px-4 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600">
            Learn More
          </button>
        </Card>
      </div>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Testimonials',
    subtitle: 'What our users say about us',
    padding: 'xl',
    spacing: 'lg',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="outlined" padding="md">
            <p className="text-gray-300 mb-4 italic">
              "This service has transformed my spiritual journey in ways I never expected."
            </p>
            <p className="text-gold-500 font-semibold">User {i}</p>
          </Card>
        ))}
      </div>
    ),
  },
};

export const NoTitle: Story = {
  args: {
    padding: 'md',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="default" padding="md">
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <h4 className="text-lg font-semibold text-gray-100">Feature {i}</h4>
            </div>
          </Card>
        ))}
      </div>
    ),
  },
};

export const DarkBackground: Story = {
  args: {
    title: 'Premium Features',
    subtitle: 'Unlock exclusive cosmic experiences',
    backgroundColor: '#0a0a0a',
    padding: 'lg',
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Tarot', 'Astrology', 'Numerology', 'Crystals', 'Rituals', 'Guidance'].map((feature) => (
          <Card key={feature} variant="elevated" padding="md">
            <h4 className="text-lg font-semibold text-gray-100 mb-2">{feature}</h4>
            <p className="text-gray-400 text-sm">Explore the depths of {feature.toLowerCase()}</p>
          </Card>
        ))}
      </div>
    ),
  },
};
