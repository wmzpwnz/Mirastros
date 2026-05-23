import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from '../../src/components/Grid';

const meta = {
  title: 'Components/Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4, 6, 12],
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const GridItem = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
    {children}
  </div>
);

export const TwoColumns: Story = {
  args: {
    columns: 2,
    gap: 'md',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: 'md',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    columns: 4,
    gap: 'md',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
        <GridItem>Item 7</GridItem>
        <GridItem>Item 8</GridItem>
      </>
    ),
  },
};

export const TwelveColumns: Story = {
  args: {
    columns: 12,
    gap: 'md',
    children: (
      <>
        <div className="col-span-6 bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
          6 Columns
        </div>
        <div className="col-span-6 bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
          6 Columns
        </div>
        <div className="col-span-4 bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
          4 Columns
        </div>
        <div className="col-span-4 bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
          4 Columns
        </div>
        <div className="col-span-4 bg-gold-500 text-cosmic p-8 rounded font-semibold text-center">
          4 Columns
        </div>
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    columns: 3,
    gap: 'sm',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    columns: 3,
    gap: 'lg',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
      </>
    ),
  },
};

export const Responsive: Story = {
  args: {
    columns: 1,
    responsiveColumns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    },
    gap: 'md',
    children: (
      <>
        <GridItem>Item 1</GridItem>
        <GridItem>Item 2</GridItem>
        <GridItem>Item 3</GridItem>
        <GridItem>Item 4</GridItem>
        <GridItem>Item 5</GridItem>
        <GridItem>Item 6</GridItem>
        <GridItem>Item 7</GridItem>
        <GridItem>Item 8</GridItem>
      </>
    ),
  },
};

export const AllGaps: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-8 bg-cosmic p-8">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((gap) => (
        <div key={gap}>
          <p className="text-gray-400 text-sm mb-2">Gap: {gap}</p>
          <Grid columns={3} gap={gap}>
            <GridItem>Item 1</GridItem>
            <GridItem>Item 2</GridItem>
            <GridItem>Item 3</GridItem>
            <GridItem>Item 4</GridItem>
            <GridItem>Item 5</GridItem>
            <GridItem>Item 6</GridItem>
          </Grid>
        </div>
      ))}
    </div>
  ),
};
