import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../src/components/Label';
import { Input } from '../../src/components/Input';

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const Required: Story = {
  args: {
    children: 'Required Field',
    required: true,
  },
};

export const Error: Story = {
  args: {
    children: 'Field with Error',
    error: true,
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="email" required>
        Email Address
      </Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithErrorInput: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <Label htmlFor="password" error>
        Password
      </Label>
      <Input
        id="password"
        type="password"
        placeholder="Enter password"
        error="Password is too weak"
      />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <Label>Default Label</Label>
        <Input type="text" placeholder="Input" />
      </div>
      <div className="space-y-2">
        <Label required>Required Label</Label>
        <Input type="text" placeholder="Input" />
      </div>
      <div className="space-y-2">
        <Label error>Error Label</Label>
        <Input type="text" placeholder="Input" error="Error message" />
      </div>
    </div>
  ),
};
