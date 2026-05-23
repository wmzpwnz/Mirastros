import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '../../src/components/Stack';

const meta = {
  title: 'Components/Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    wrap: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const StackItem = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gold-500 text-cosmic p-4 rounded font-semibold text-center min-w-max">
    {children}
  </div>
);

export const ColumnDirection: Story = {
  args: {
    direction: 'column',
    gap: 'md',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const RowDirection: Story = {
  args: {
    direction: 'row',
    gap: 'md',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const CenterAlignment: Story = {
  args: {
    direction: 'row',
    align: 'center',
    gap: 'md',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const CenterJustification: Story = {
  args: {
    direction: 'row',
    justify: 'center',
    gap: 'md',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'between',
    gap: 'md',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const WithWrap: Story = {
  args: {
    direction: 'row',
    gap: 'md',
    wrap: true,
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
        <StackItem>Item 4</StackItem>
        <StackItem>Item 5</StackItem>
        <StackItem>Item 6</StackItem>
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    direction: 'row',
    gap: 'sm',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    direction: 'row',
    gap: 'lg',
    children: (
      <>
        <StackItem>Item 1</StackItem>
        <StackItem>Item 2</StackItem>
        <StackItem>Item 3</StackItem>
      </>
    ),
  },
};

export const AllAlignments: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-8 bg-cosmic p-8">
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((align) => (
        <div key={align}>
          <p className="text-gray-400 text-sm mb-2">Align: {align}</p>
          <Stack direction="row" align={align} gap="md" className="min-h-24 bg-gray-800 p-4 rounded">
            <StackItem>Item 1</StackItem>
            <StackItem>Item 2</StackItem>
            <StackItem>Item 3</StackItem>
          </Stack>
        </div>
      ))}
    </div>
  ),
};

export const AllJustifications: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-8 bg-cosmic p-8">
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((justify) => (
        <div key={justify}>
          <p className="text-gray-400 text-sm mb-2">Justify: {justify}</p>
          <Stack direction="row" justify={justify} gap="md" className="bg-gray-800 p-4 rounded">
            <StackItem>Item 1</StackItem>
            <StackItem>Item 2</StackItem>
            <StackItem>Item 3</StackItem>
          </Stack>
        </div>
      ))}
    </div>
  ),
};
