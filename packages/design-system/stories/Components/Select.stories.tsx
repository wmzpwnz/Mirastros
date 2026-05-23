import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from '../../src/components/Select';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    searchable: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
  { label: 'Option 4', value: '4' },
  { label: 'Option 5', value: '5' },
];

export const Default: Story = {
  args: {
    options,
    placeholder: 'Select an option',
  },
};

export const WithValue: Story = {
  args: {
    options,
    value: '2',
    placeholder: 'Select an option',
  },
};

export const Searchable: Story = {
  args: {
    options,
    placeholder: 'Search options...',
    searchable: true,
  },
};

export const MultiSelect: Story = {
  args: {
    options,
    multiple: true,
    placeholder: 'Select multiple options',
  },
};

export const WithError: Story = {
  args: {
    options,
    placeholder: 'Select an option',
    error: 'This field is required',
  },
};

export const Disabled: Story = {
  args: {
    options,
    placeholder: 'Disabled select',
    disabled: true,
  },
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2 (Disabled)', value: '2', disabled: true },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4 (Disabled)', value: '4', disabled: true },
      { label: 'Option 5', value: '5' },
    ],
    placeholder: 'Select an option',
  },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('');
    return (
      <div className="space-y-4 w-80">
        <Select
          options={options}
          value={value}
          onChange={setValue}
          placeholder="Select an option"
        />
        <p className="text-sm text-gray-400">Selected: {value || 'None'}</p>
      </div>
    );
  },
};

export const InteractiveMulti: Story = {
  render: () => {
    const [values, setValues] = useState<(string | number)[]>([]);
    return (
      <div className="space-y-4 w-80">
        <Select
          options={options}
          value={values}
          onChange={(val) => setValues(Array.isArray(val) ? val : [val])}
          placeholder="Select multiple options"
          multiple
        />
        <p className="text-sm text-gray-400">
          Selected: {values.length > 0 ? values.join(', ') : 'None'}
        </p>
      </div>
    );
  },
};
