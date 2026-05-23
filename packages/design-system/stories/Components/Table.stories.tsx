import type { Meta, StoryObj } from '@storybook/react';
import { Table } from '../../src/components/Table';
import type { TableProps } from '../../src/types';

const meta: Meta<typeof Table> = {
  title: 'Data/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Active', joinDate: '2024-02-20' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', status: 'Inactive', joinDate: '2024-03-10' },
  { id: 4, name: 'David Brown', email: 'david@example.com', status: 'Active', joinDate: '2024-01-25' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', status: 'Active', joinDate: '2024-04-05' },
];

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'joinDate', label: 'Join Date', sortable: true },
];

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
};

export const WithSorting: Story = {
  args: {
    columns,
    data: sampleData,
    sortBy: 'name',
    sortDirection: 'asc',
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: sampleData,
    paginated: true,
    pageSize: 2,
  },
};

export const WithCustomRender: Story = {
  args: {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              value === 'Active'
                ? 'bg-success text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {value}
          </span>
        ),
      },
      { key: 'joinDate', label: 'Join Date', sortable: true },
    ],
    data: sampleData,
  },
};

export const Striped: Story = {
  args: {
    columns,
    data: sampleData,
    striped: true,
  },
};

export const NonHoverable: Story = {
  args: {
    columns,
    data: sampleData,
    hoverable: false,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
};
