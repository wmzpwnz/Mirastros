import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from '../../src/components/Hero';

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Welcome to Mirastros',
    subtitle: 'Discover your cosmic destiny through ancient wisdom',
    ctaText: 'Get Started',
    height: 'md',
  },
};

export const Large: Story = {
  args: {
    title: 'Unlock Your Spiritual Journey',
    subtitle: 'Connect with the universe and discover your true path',
    ctaText: 'Explore Now',
    height: 'lg',
  },
};

export const WithBackground: Story = {
  args: {
    title: 'Cosmic Wisdom',
    subtitle: 'Ancient knowledge for modern seekers',
    ctaText: 'Begin',
    backgroundColor: '#1a1a2e',
    height: 'md',
  },
};

export const LeftAligned: Story = {
  args: {
    title: 'Your Journey Starts Here',
    subtitle: 'Explore the mysteries of the universe',
    ctaText: 'Discover',
    textAlign: 'left',
    height: 'md',
  },
};

export const RightAligned: Story = {
  args: {
    title: 'Find Your Path',
    subtitle: 'Guided by cosmic forces',
    ctaText: 'Learn More',
    textAlign: 'right',
    height: 'md',
  },
};

export const NoButton: Story = {
  args: {
    title: 'Embrace the Cosmic Energy',
    subtitle: 'Let the universe guide your way',
    height: 'md',
  },
};

export const CustomOverlay: Story = {
  args: {
    title: 'Mystical Experiences',
    subtitle: 'Transform your life with spiritual guidance',
    ctaText: 'Start Now',
    overlayOpacity: 60,
    height: 'md',
  },
};

export const Small: Story = {
  args: {
    title: 'Quick Insight',
    subtitle: 'Get a quick reading',
    ctaText: 'Try Now',
    height: 'sm',
  },
};
