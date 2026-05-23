import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../../src/components/Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isVisible: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const WithText: Story = {
  args: {
    size: 'md',
    text: 'Loading...',
  },
};

export const WithCustomColor: Story = {
  args: {
    size: 'md',
    color: '#00BCD4',
    text: 'Loading with custom color',
  },
};

export const Hidden: Story = {
  args: {
    size: 'md',
    isVisible: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-8 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <p className="text-sm text-gray-400">Small</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <p className="text-sm text-gray-400">Medium</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Large</p>
      </div>
    </div>
  ),
};

export const WithTextVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <Spinner size="md" text="Loading..." />
      <Spinner size="md" text="Processing..." />
      <Spinner size="md" text="Saving..." />
    </div>
  ),
};
