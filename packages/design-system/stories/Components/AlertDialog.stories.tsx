import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AlertDialog } from '../../src/components/AlertDialog';
import { Button } from '../../src/components/Button';

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Alert Dialog</Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
          actionText="Confirm"
          onAction={() => alert('Action confirmed!')}
        />
      </>
    );
  },
};

export const WithDangerState: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete Item"
          description="This action cannot be undone. Are you sure you want to delete this item?"
          actionText="Delete"
          onAction={() => alert('Item deleted!')}
          isDangerous={true}
        />
      </>
    );
  },
};

export const WithCustomCancelText: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Alert Dialog</Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Save Changes"
          description="You have unsaved changes. Do you want to save them before leaving?"
          actionText="Save"
          cancelText="Discard"
          onAction={() => alert('Changes saved!')}
        />
      </>
    );
  },
};

export const WithLongDescription: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Alert Dialog</Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Important Notice"
          description="This is a longer description that explains the action in more detail. It can contain multiple sentences and provide context about what will happen when you confirm this action. Please read carefully before proceeding."
          actionText="I Understand"
          onAction={() => alert('Acknowledged!')}
        />
      </>
    );
  },
};

export const WarningState: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          Show Warning
        </Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Warning"
          description="This action may have unintended consequences. Please review before proceeding."
          actionText="Proceed"
          onAction={() => alert('Proceeding...')}
          isDangerous={false}
        />
      </>
    );
  },
};

export const NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Alert Dialog</Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Critical Action"
          description="This is a critical action that requires your explicit confirmation."
          actionText="Confirm"
          onAction={() => alert('Confirmed!')}
          closeOnBackdropClick={false}
        />
      </>
    );
  },
};

export const NoEscClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Alert Dialog</Button>
        <AlertDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Submission"
          description="Please confirm that you want to submit this form."
          actionText="Submit"
          onAction={() => alert('Form submitted!')}
          closeOnEsc={false}
        />
      </>
    );
  },
};
