import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Accordion } from '../../src/components/Accordion';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    exclusive: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const AccordionWrapper = (props: any) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <Accordion
      {...props}
      openItems={openItems}
      onChange={setOpenItems}
      items={[
        {
          id: 'item1',
          title: 'Section 1',
          content: 'This is the content for section 1. You can add any content here.',
        },
        {
          id: 'item2',
          title: 'Section 2',
          content: 'This is the content for section 2. You can add any content here.',
        },
        {
          id: 'item3',
          title: 'Section 3',
          content: 'This is the content for section 3. You can add any content here.',
        },
      ]}
    />
  );
};

export const Default: Story = {
  render: () => <AccordionWrapper />,
};

export const Exclusive: Story = {
  render: () => <AccordionWrapper exclusive />,
};

export const Disabled: Story = {
  render: () => <AccordionWrapper disabled />,
};

export const WithDisabledItem: Story = {
  render: () => {
    const [openItems, setOpenItems] = useState<string[]>([]);

    return (
      <Accordion
        openItems={openItems}
        onChange={setOpenItems}
        items={[
          {
            id: 'item1',
            title: 'Section 1',
            content: 'This is the content for section 1.',
          },
          {
            id: 'item2',
            title: 'Section 2 (Disabled)',
            content: 'This is the content for section 2.',
            disabled: true,
          },
          {
            id: 'item3',
            title: 'Section 3',
            content: 'This is the content for section 3.',
          },
        ]}
      />
    );
  },
};

export const MultipleOpen: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Multiple sections can be open at the same time</p>
      <AccordionWrapper />
    </div>
  ),
};

export const SingleOpen: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Only one section can be open at a time</p>
      <AccordionWrapper exclusive />
    </div>
  ),
};
