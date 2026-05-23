import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from '../../src/components/Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rows: {
      control: 'number',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
    autoResize: {
      control: 'boolean',
    },
    showCharCount: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
    rows: 4,
  },
};

export const WithValue: Story = {
  args: {
    value: 'This is a textarea with some text.',
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your message...',
    error: 'This field is required',
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea...',
    disabled: true,
    rows: 4,
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Required field...',
    required: true,
    rows: 4,
  },
};

export const WithCharCount: Story = {
  args: {
    placeholder: 'Enter your message...',
    maxLength: 100,
    showCharCount: true,
    rows: 4,
  },
};

export const AutoResize: Story = {
  args: {
    placeholder: 'This textarea will auto-resize as you type...',
    autoResize: true,
    rows: 2,
  },
};

export const SmallRows: Story = {
  args: {
    placeholder: 'Small textarea...',
    rows: 2,
  },
};

export const LargeRows: Story = {
  args: {
    placeholder: 'Large textarea...',
    rows: 8,
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4 w-96">
        <Textarea
          value={value}
          onChange={setValue}
          placeholder="Type something..."
          rows={4}
        />
        <p className="text-sm text-gray-400">
          Characters: {value.length}
        </p>
      </div>
    );
  },
};

export const InteractiveWithCharCount: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 200;
    return (
      <div className="space-y-4 w-96">
        <Textarea
          value={value}
          onChange={setValue}
          placeholder="Type something (max 200 characters)..."
          maxLength={maxLength}
          showCharCount
          rows={4}
        />
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <p className="text-sm text-gray-400 mb-2">Default</p>
        <Textarea placeholder="Default textarea..." rows={3} />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">With Error</p>
        <Textarea
          placeholder="With error..."
          error="This field is required"
          rows={3}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Disabled</p>
        <Textarea placeholder="Disabled..." disabled rows={3} />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">With Character Count</p>
        <Textarea
          placeholder="With char count..."
          maxLength={100}
          showCharCount
          rows={3}
        />
      </div>
    </div>
  ),
};
