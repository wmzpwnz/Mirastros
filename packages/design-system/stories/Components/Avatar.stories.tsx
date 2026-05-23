import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../../src/components/Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'pending'],
    },
    showStatus: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    alt: 'User Avatar',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    initials: 'JD',
    size: 'md',
  },
};

export const Fallback: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    initials: 'AB',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    initials: 'CD',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    initials: 'EF',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    initials: 'GH',
    size: 'xl',
  },
};

export const Online: Story = {
  args: {
    initials: 'JD',
    size: 'md',
    status: 'online',
    showStatus: true,
  },
};

export const Offline: Story = {
  args: {
    initials: 'JD',
    size: 'md',
    status: 'offline',
    showStatus: true,
  },
};

export const Pending: Story = {
  args: {
    initials: 'JD',
    size: 'md',
    status: 'pending',
    showStatus: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar initials="SM" size="sm" />
      <Avatar initials="MD" size="md" />
      <Avatar initials="LG" size="lg" />
      <Avatar initials="XL" size="xl" />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar initials="JD" size="md" status="online" showStatus />
      <Avatar initials="AB" size="md" status="offline" showStatus />
      <Avatar initials="CD" size="md" status="pending" showStatus />
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar initials="A1" size="sm" />
        <Avatar initials="A2" size="sm" />
        <Avatar initials="A3" size="sm" />
        <Avatar initials="A4" size="sm" />
      </div>
      <div className="flex gap-4">
        <Avatar initials="B1" size="md" status="online" showStatus />
        <Avatar initials="B2" size="md" status="offline" showStatus />
        <Avatar initials="B3" size="md" status="pending" showStatus />
        <Avatar initials="B4" size="md" />
      </div>
      <div className="flex gap-4">
        <Avatar initials="C1" size="lg" />
        <Avatar initials="C2" size="lg" />
        <Avatar initials="C3" size="lg" />
        <Avatar initials="C4" size="lg" />
      </div>
    </div>
  ),
};
