import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../src/components/Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: (
      <>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Card Title</h3>
        <p className="text-gray-400">This is a default card with padding and border.</p>
      </>
    ),
  },
  render: (args) => <Card {...args} className="w-80" />,
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: (
      <>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Elevated Card</h3>
        <p className="text-gray-400">This card has an elevated shadow effect.</p>
      </>
    ),
  },
  render: (args) => <Card {...args} className="w-80" />,
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: (
      <>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Outlined Card</h3>
        <p className="text-gray-400">This card has a prominent gold outline.</p>
      </>
    ),
  },
  render: (args) => <Card {...args} className="w-80" />,
};

export const Interactive: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    interactive: true,
    onClick: () => alert('Card clicked!'),
    children: (
      <>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Interactive Card</h3>
        <p className="text-gray-400">Hover over this card to see the interactive effect.</p>
      </>
    ),
  },
  render: (args) => <Card {...args} className="w-80" />,
};

export const WithImage: Story = {
  render: () => (
    <Card variant="default" padding="md" className="w-80 overflow-hidden">
      <div className="w-full h-40 bg-gradient-to-r from-gold-500 to-turquoise-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-100 mb-2">Card with Image</h3>
      <p className="text-gray-400">This card includes an image header.</p>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card variant="default" padding="md" className="w-80">
      <h3 className="text-xl font-semibold text-gray-100 mb-2">Card with Action</h3>
      <p className="text-gray-400 mb-4">This card includes an action button.</p>
      <button className="px-4 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 transition-colors">
        Learn More
      </button>
    </Card>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} variant="default" padding="md">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Card {i}</h3>
          <p className="text-gray-400 text-sm">Card content goes here.</p>
        </Card>
      ))}
    </div>
  ),
};
