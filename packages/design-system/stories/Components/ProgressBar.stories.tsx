import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '../../src/components/ProgressBar';
import type { ProgressBarProps } from '../../src/types';

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const WithLabel: Story = {
  args: {
    value: 65,
    showLabel: true,
  },
};

export const Small: Story = {
  args: {
    value: 50,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    value: 50,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    value: 50,
    size: 'lg',
  },
};

export const Success: Story = {
  args: {
    value: 100,
    variant: 'success',
    showLabel: true,
  },
};

export const Warning: Story = {
  args: {
    value: 75,
    variant: 'warning',
    showLabel: true,
  },
};

export const Error: Story = {
  args: {
    value: 25,
    variant: 'error',
    showLabel: true,
  },
};

export const Info: Story = {
  args: {
    value: 50,
    variant: 'info',
    showLabel: true,
  },
};

export const NoAnimation: Story = {
  args: {
    value: 50,
    animated: false,
  },
};

export const CustomRange: Story = {
  args: {
    value: 50,
    min: 0,
    max: 200,
    showLabel: true,
  },
};
