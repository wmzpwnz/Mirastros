import type { Meta, StoryObj } from '@storybook/react';
import { ServiceCard } from '../../src/components/ServiceCard';

const meta = {
  title: 'Components/ServiceCard',
  component: ServiceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: '✨',
    title: 'Tarot Reading',
    description: 'Discover insights through ancient tarot wisdom and guidance.',
  },
};

export const WithBadge: Story = {
  args: {
    icon: '🌙',
    title: 'Lunar Guidance',
    description: 'Align your life with the lunar cycles and moon phases.',
    badge: 'Popular',
  },
};

export const WithCTA: Story = {
  args: {
    icon: '🔮',
    title: 'Crystal Healing',
    description: 'Harness the energy of crystals for spiritual wellness.',
    ctaText: 'Explore',
    onCtaClick: () => alert('CTA clicked!'),
  },
};

export const Interactive: Story = {
  args: {
    icon: '⭐',
    title: 'Astrology',
    description: 'Understand your cosmic destiny through astrology.',
    ctaText: 'Learn More',
    onClick: () => alert('Card clicked!'),
    onCtaClick: () => alert('CTA clicked!'),
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
      <ServiceCard
        icon="✨"
        title="Tarot Reading"
        description="Discover insights through ancient tarot wisdom."
        badge="Popular"
        ctaText="Explore"
      />
      <ServiceCard
        icon="🌙"
        title="Lunar Guidance"
        description="Align your life with the lunar cycles."
        ctaText="Explore"
      />
      <ServiceCard
        icon="🔮"
        title="Crystal Healing"
        description="Harness the energy of crystals for wellness."
        ctaText="Explore"
      />
      <ServiceCard
        icon="⭐"
        title="Astrology"
        description="Understand your cosmic destiny."
        ctaText="Explore"
      />
      <ServiceCard
        icon="🎴"
        title="Lenormand"
        description="Classic divination with Lenormand cards."
        ctaText="Explore"
      />
      <ServiceCard
        icon="📖"
        title="Dream Interpretation"
        description="Unlock the meaning of your dreams."
        ctaText="Explore"
      />
    </div>
  ),
};
