import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from '../../src/components/Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    vertical: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const TabsWrapper = (props: any) => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs
      {...props}
      activeTab={activeTab}
      onChange={setActiveTab}
      items={[
        { label: 'Tab 1', value: 'tab1' },
        { label: 'Tab 2', value: 'tab2' },
        { label: 'Tab 3', value: 'tab3' },
      ]}
      children={{
        tab1: <div className="p-4">Content for Tab 1</div>,
        tab2: <div className="p-4">Content for Tab 2</div>,
        tab3: <div className="p-4">Content for Tab 3</div>,
      }}
    />
  );
};

export const Default: Story = {
  render: () => <TabsWrapper />,
};

export const Vertical: Story = {
  render: () => <TabsWrapper vertical />,
};

export const Disabled: Story = {
  render: () => <TabsWrapper disabled />,
};

export const WithDisabledTab: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        items={[
          { label: 'Tab 1', value: 'tab1' },
          { label: 'Tab 2 (Disabled)', value: 'tab2', disabled: true },
          { label: 'Tab 3', value: 'tab3' },
        ]}
        children={{
          tab1: <div className="p-4">Content for Tab 1</div>,
          tab2: <div className="p-4">Content for Tab 2</div>,
          tab3: <div className="p-4">Content for Tab 3</div>,
        }}
      />
    );
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Use arrow keys to navigate between tabs, Home/End to jump to first/last tab
      </p>
      <TabsWrapper />
    </div>
  ),
};
