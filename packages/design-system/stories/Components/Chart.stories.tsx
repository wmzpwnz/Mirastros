import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from '../../src/components/Chart';
import type { ChartProps } from '../../src/types';

const meta: Meta<typeof Chart> = {
  title: 'Data/Chart',
  component: Chart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const barChartData = [
  { label: 'Jan', value: 65, color: '#FFC107' },
  { label: 'Feb', value: 59, color: '#00BCD4' },
  { label: 'Mar', value: 80, color: '#FFC107' },
  { label: 'Apr', value: 81, color: '#00BCD4' },
  { label: 'May', value: 56, color: '#FFC107' },
];

const lineChartData = [
  { label: 'Week 1', value: 30, color: '#FFC107' },
  { label: 'Week 2', value: 45, color: '#FFC107' },
  { label: 'Week 3', value: 35, color: '#FFC107' },
  { label: 'Week 4', value: 60, color: '#FFC107' },
  { label: 'Week 5', value: 50, color: '#FFC107' },
];

const pieChartData = [
  { label: 'Product A', value: 30, color: '#FFC107' },
  { label: 'Product B', value: 25, color: '#00BCD4' },
  { label: 'Product C', value: 20, color: '#10B981' },
  { label: 'Product D', value: 25, color: '#EF4444' },
];

export const BarChart: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    title: 'Monthly Sales',
    xAxisLabel: 'Month',
    yAxisLabel: 'Sales ($)',
    height: 300,
    width: '100%',
  },
};

export const LineChart: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    title: 'Weekly Trends',
    xAxisLabel: 'Week',
    yAxisLabel: 'Value',
    height: 300,
    width: '100%',
  },
};

export const PieChart: Story = {
  args: {
    type: 'pie',
    data: pieChartData,
    title: 'Market Share',
    height: 300,
    width: '100%',
  },
};

export const AreaChart: Story = {
  args: {
    type: 'area',
    data: lineChartData,
    title: 'Area Chart',
    xAxisLabel: 'Week',
    yAxisLabel: 'Value',
    height: 300,
    width: '100%',
  },
};

export const WithoutLegend: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    title: 'Sales Without Legend',
    showLegend: false,
    height: 300,
    width: '100%',
  },
};

export const WithoutTooltips: Story = {
  args: {
    type: 'bar',
    data: barChartData,
    title: 'Sales Without Tooltips',
    showTooltips: false,
    height: 300,
    width: '100%',
  },
};

export const NoAnimation: Story = {
  args: {
    type: 'line',
    data: lineChartData,
    title: 'Static Chart',
    animated: false,
    height: 300,
    width: '100%',
  },
};
