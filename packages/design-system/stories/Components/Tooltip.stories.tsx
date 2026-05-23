import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../../src/components/Tooltip';
import { Button } from '../../src/components/Button';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus'],
    },
    delay: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: 'This is a tooltip on top',
    position: 'top',
    children: <Button>Hover me</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'This is a tooltip on bottom',
    position: 'bottom',
    children: <Button>Hover me</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'This is a tooltip on left',
    position: 'left',
    children: <Button>Hover me</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'This is a tooltip on right',
    position: 'right',
    children: <Button>Hover me</Button>,
  },
};

export const WithDelay: Story = {
  args: {
    content: 'This tooltip appears after 500ms',
    position: 'top',
    delay: 500,
    children: <Button>Hover me</Button>,
  },
};

export const LongContent: Story = {
  args: {
    content: 'This is a longer tooltip content that will wrap to multiple lines when it exceeds the maximum width.',
    position: 'top',
    maxWidth: 150,
    children: <Button>Hover me</Button>,
  },
};

export const ClickTrigger: Story = {
  args: {
    content: 'Click to toggle this tooltip',
    position: 'top',
    trigger: 'click',
    children: <Button>Click me</Button>,
  },
};

export const FocusTrigger: Story = {
  args: {
    content: 'This tooltip appears on focus',
    position: 'top',
    trigger: 'focus',
    children: <Button>Focus me</Button>,
  },
};

export const AllPositions: Story = {
  render: () => (
    <div className="flex gap-12 p-12 justify-center items-center">
      <Tooltip content="Top" position="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button>Left</Button>
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  ),
};
