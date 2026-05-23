import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../../src/components/Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: ['rect', 'circle', 'text'],
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
    animated: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangle: Story = {
  args: {
    shape: 'rect',
    width: 300,
    height: 200,
  },
};

export const Circle: Story = {
  args: {
    shape: 'circle',
    width: 100,
    height: 100,
  },
};

export const Text: Story = {
  args: {
    shape: 'text',
    lines: 3,
  },
};

export const TextSingleLine: Story = {
  args: {
    shape: 'text',
    lines: 1,
  },
};

export const NotAnimated: Story = {
  args: {
    shape: 'rect',
    width: 300,
    height: 200,
    animated: false,
  },
};

export const RoundedCorners: Story = {
  args: {
    shape: 'rect',
    width: 300,
    height: 200,
    borderRadius: 'lg',
  },
};

export const CardSkeleton: Story = {
  render: () => (
    <div className="w-80 p-4 bg-gray-800 rounded-lg space-y-4">
      <Skeleton shape="rect" width="100%" height={200} borderRadius="md" />
      <div className="space-y-2">
        <Skeleton shape="text" lines={1} />
        <Skeleton shape="text" lines={2} />
      </div>
      <div className="flex gap-2">
        <Skeleton shape="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" lines={1} />
          <Skeleton shape="text" lines={1} width="80%" />
        </div>
      </div>
    </div>
  ),
};

export const ListSkeleton: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 bg-gray-800 rounded-lg">
          <Skeleton shape="circle" width={50} height={50} />
          <div className="flex-1 space-y-2">
            <Skeleton shape="text" lines={1} />
            <Skeleton shape="text" lines={1} width="80%" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllShapes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-400 mb-2">Rectangle</p>
        <Skeleton shape="rect" width={300} height={100} />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Circle</p>
        <Skeleton shape="circle" width={100} height={100} />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Text (3 lines)</p>
        <Skeleton shape="text" lines={3} />
      </div>
    </div>
  ),
};
