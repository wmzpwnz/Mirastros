import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number...',
  },
};

export const WithError: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    error: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input...',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    type: 'text',
    placeholder: 'Required field...',
    required: true,
  },
};

export const WithPrefixIcon: Story = {
  args: {
    type: 'text',
    placeholder: 'Search...',
    icon: <Icon name="search" size="sm" />,
  },
};

export const WithSuffixIcon: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    suffixIcon: <Icon name="check" size="sm" />,
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4 w-80">
        <Input
          type="text"
          placeholder="Type something..."
          value={value}
          onChange={setValue}
        />
        <p className="text-sm text-gray-400">Value: {value}</p>
      </div>
    );
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="tel" placeholder="Phone input" />
      <Input type="url" placeholder="URL input" />
      <Input type="search" placeholder="Search input" />
    </div>
  ),
};
