import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from '../../src/components/Icon';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    interactive: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconNames = [
  'chevron-right',
  'chevron-left',
  'chevron-down',
  'chevron-up',
  'check',
  'x',
  'search',
  'menu',
  'home',
  'user',
  'settings',
  'bell',
  'heart',
  'star',
  'alert',
  'info',
  'trash',
  'edit',
  'download',
  'upload',
  'eye',
  'eye-off',
];

export const ChevronRight: Story = {
  args: {
    name: 'chevron-right',
    size: 'md',
  },
};

export const Check: Story = {
  args: {
    name: 'check',
    size: 'md',
  },
};

export const Search: Story = {
  args: {
    name: 'search',
    size: 'md',
  },
};

export const ExtraSmall: Story = {
  args: {
    name: 'check',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    name: 'check',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    name: 'check',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    name: 'check',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'check',
    size: 'xl',
  },
};

export const Interactive: Story = {
  args: {
    name: 'heart',
    size: 'md',
    interactive: true,
  },
};

export const WithColor: Story = {
  args: {
    name: 'star',
    size: 'md',
    color: '#FFC107',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Icon name="check" size="xs" />
      <Icon name="check" size="sm" />
      <Icon name="check" size="md" />
      <Icon name="check" size="lg" />
      <Icon name="check" size="xl" />
    </div>
  ),
};

export const IconGallery: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {iconNames.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} size="md" />
          <span className="text-xs text-gray-400">{name}</span>
        </div>
      ))}
    </div>
  ),
};
