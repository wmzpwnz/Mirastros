import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pagination } from '../../src/components/Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxButtons: {
      control: 'number',
    },
    showFirstLast: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const PaginationWrapper = (props: any) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-4">
      <Pagination
        {...props}
        currentPage={currentPage}
        totalPages={10}
        onChange={setCurrentPage}
      />
      <p className="text-center text-sm text-gray-400">Current page: {currentPage}</p>
    </div>
  );
};

export const Default: Story = {
  render: () => <PaginationWrapper />,
};

export const WithoutFirstLast: Story = {
  render: () => <PaginationWrapper showFirstLast={false} />,
};

export const Disabled: Story = {
  render: () => <PaginationWrapper disabled />,
};

export const FewPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={3}
          onChange={setCurrentPage}
        />
        <p className="text-center text-sm text-gray-400">Current page: {currentPage}</p>
      </div>
    );
  },
};

export const ManyPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={100}
          onChange={setCurrentPage}
          maxButtons={7}
        />
        <p className="text-center text-sm text-gray-400">Current page: {currentPage}</p>
      </div>
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onChange={setCurrentPage}
          labels={{
            previous: '← Back',
            next: 'Next →',
            first: '⏮ Start',
            last: 'End ⏭',
          }}
        />
        <p className="text-center text-sm text-gray-400">Current page: {currentPage}</p>
      </div>
    );
  },
};

export const SmallMaxButtons: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <div className="space-y-4">
        <Pagination
          currentPage={currentPage}
          totalPages={20}
          onChange={setCurrentPage}
          maxButtons={3}
        />
        <p className="text-center text-sm text-gray-400">Current page: {currentPage}</p>
      </div>
    );
  },
};
