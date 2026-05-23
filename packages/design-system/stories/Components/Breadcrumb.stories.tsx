import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from '../../src/components/Breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops' },
    ],
    currentIndex: 3,
  },
};

export const WithButtons: Story = {
  args: {
    items: [
      { label: 'Home', onClick: () => console.log('Home clicked') },
      { label: 'Products', onClick: () => console.log('Products clicked') },
      { label: 'Electronics', onClick: () => console.log('Electronics clicked') },
      { label: 'Laptops' },
    ],
    currentIndex: 3,
  },
};

export const Disabled: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops' },
    ],
    currentIndex: 3,
    disabled: true,
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops' },
    ],
    currentIndex: 3,
    separator: '→',
  },
};

export const LongPath: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Computers', href: '/products/electronics/computers' },
      { label: 'Laptops', href: '/products/electronics/computers/laptops' },
      { label: 'Gaming Laptops' },
    ],
    currentIndex: 5,
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products', disabled: true },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Laptops' },
    ],
    currentIndex: 3,
  },
};
