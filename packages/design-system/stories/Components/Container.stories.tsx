import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '../../src/components/Container';

const meta = {
  title: 'Components/Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    padded: {
      control: 'boolean',
    },
    centered: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'lg',
    padded: true,
    centered: true,
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Container Content</h2>
        <p>This content is wrapped in a Container component with max-width and padding.</p>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Small Container</h2>
        <p>This is a small container with limited max-width.</p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Large Container</h2>
        <p>This is a large container with more max-width.</p>
      </div>
    ),
  },
};

export const Full: Story = {
  args: {
    size: 'full',
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Full Width Container</h2>
        <p>This container takes up the full available width.</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    size: 'lg',
    padded: false,
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">No Padding</h2>
        <p>This container has no padding applied.</p>
      </div>
    ),
  },
};

export const NotCentered: Story = {
  args: {
    size: 'lg',
    centered: false,
    children: (
      <div className="bg-gray-800 p-8 rounded text-gray-100">
        <h2 className="text-2xl font-bold mb-4">Not Centered</h2>
        <p>This container is aligned to the left.</p>
      </div>
    ),
  },
};

export const AllSizes: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-8 bg-cosmic p-8">
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((size) => (
        <div key={size}>
          <p className="text-gray-400 text-sm mb-2">Size: {size}</p>
          <Container size={size}>
            <div className="bg-gray-800 p-4 rounded text-gray-100">
              Container with size: {size}
            </div>
          </Container>
        </div>
      ))}
    </div>
  ),
};
