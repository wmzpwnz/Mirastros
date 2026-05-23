import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../../src/components/Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
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
    indeterminate: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Checkbox label',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Checked checkbox',
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    label: 'Indeterminate checkbox',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled checkbox',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled checked checkbox',
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
        <Checkbox
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

export const CheckboxGroup: Story = {
  render: () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({
      option1: false,
      option2: false,
      option3: false,
    });

    return (
      <div className="space-y-3">
        {['option1', 'option2', 'option3'].map((option) => (
          <Checkbox
            key={option}
            checked={checked[option]}
            onChange={(val) => setChecked({ ...checked, [option]: val })}
            label={`Option ${option.slice(-1)}`}
          />
        ))}
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox label="Default" />
      <Checkbox checked label="Checked" />
      <Checkbox indeterminate label="Indeterminate" />
      <Checkbox disabled label="Disabled" />
      <Checkbox checked disabled label="Disabled Checked" />
    </div>
  ),
};
