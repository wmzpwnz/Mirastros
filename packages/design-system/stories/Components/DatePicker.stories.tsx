import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from '../../src/components/DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    range: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select a date',
  },
};

export const WithValue: Story = {
  args: {
    value: new Date(2024, 0, 15),
    placeholder: 'Select a date',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled date picker',
    disabled: true,
  },
};

export const WithMinMax: Story = {
  args: {
    placeholder: 'Select a date',
    minDate: new Date(2024, 0, 1),
    maxDate: new Date(2024, 11, 31),
  },
};

export const RangeSelection: Story = {
  args: {
    placeholder: 'Select date range',
    range: true,
  },
};

export const RangeWithValues: Story = {
  args: {
    placeholder: 'Select date range',
    range: true,
    startDate: new Date(2024, 0, 10),
    endDate: new Date(2024, 0, 20),
  },
};

export const CustomFormat: Story = {
  args: {
    placeholder: 'Select a date',
    format: 'DD/MM/YYYY',
  },
};

export const Interactive: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <div className="space-y-4 w-80">
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select a date"
        />
        <p className="text-sm text-gray-400">
          Selected: {date ? date.toLocaleDateString() : 'None'}
        </p>
      </div>
    );
  },
};

export const InteractiveRange: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    return (
      <div className="space-y-4 w-80">
        <DatePicker
          placeholder="Select date range"
          range
          startDate={startDate}
          endDate={endDate}
          onChange={(date) => {
            if (!startDate || (startDate && endDate)) {
              setStartDate(date);
              setEndDate(undefined);
            } else if (date < startDate) {
              setStartDate(date);
            } else {
              setEndDate(date);
            }
          }}
        />
        <p className="text-sm text-gray-400">
          Start: {startDate ? startDate.toLocaleDateString() : 'None'}
        </p>
        <p className="text-sm text-gray-400">
          End: {endDate ? endDate.toLocaleDateString() : 'None'}
        </p>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <p className="text-sm text-gray-400 mb-2">Default</p>
        <DatePicker placeholder="Select a date" />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">With Value</p>
        <DatePicker
          value={new Date(2024, 0, 15)}
          placeholder="Select a date"
        />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Range Selection</p>
        <DatePicker
          placeholder="Select date range"
          range
        />
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-2">Disabled</p>
        <DatePicker
          placeholder="Disabled"
          disabled
        />
      </div>
    </div>
  ),
};
