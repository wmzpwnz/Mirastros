import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from '../../src/components/Radio';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Radio label',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Checked radio',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled radio',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled checked radio',
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="space-y-4">
        <Radio
          checked={checked}
          onChange={setChecked}
          label="Toggle me"
        />
        <p className="text-sm text-gray-400">
          Checked: {checked ? 'Yes' : 'No'}
        </p>
      </div>
    );
  },
};

const radioOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

export const RadioGroupDefault: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('');
    return (
      <div className="space-y-4">
        <RadioGroup
          options={radioOptions}
          value={value}
          onChange={setValue}
          name="radio-group"
        />
        <p className="text-sm text-gray-400">
          Selected: {value || 'None'}
        </p>
      </div>
    );
  },
};

export const RadioGroupWithValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('2');
    return (
      <div className="space-y-4">
        <RadioGroup
          options={radioOptions}
          value={value}
          onChange={setValue}
          name="radio-group"
        />
        <p className="text-sm text-gray-400">
          Selected: {value}
        </p>
      </div>
    );
  },
};

export const RadioGroupDisabled: Story = {
  render: () => (
    <RadioGroup
      options={radioOptions}
      value="1"
      disabled
      name="radio-group"
    />
  ),
};

export const RadioGroupDisabledOptions: Story = {
  render: () => (
    <RadioGroup
      options={[
        { label: 'Option 1', value: '1' },
        { label: 'Option 2 (Disabled)', value: '2', disabled: true },
        { label: 'Option 3', value: '3' },
      ]}
      value="1"
      name="radio-group"
    />
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Radio label="Default" />
      <Radio checked label="Checked" />
      <Radio disabled label="Disabled" />
      <Radio checked disabled label="Disabled Checked" />
    </div>
  ),
};
