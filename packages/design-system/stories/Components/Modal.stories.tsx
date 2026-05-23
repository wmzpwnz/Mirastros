import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from '../../src/components/Modal';
import { Button } from '../../src/components/Button';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          size="md"
        >
          <p className="text-gray-300">
            This is a modal dialog. You can close it by clicking the X button, pressing ESC, or clicking outside.
          </p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Footer</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p className="text-gray-300">
            Are you sure you want to proceed with this action?
          </p>
        </Modal>
      </>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Small Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Small Modal"
          size="sm"
        >
          <p className="text-gray-300">This is a small modal.</p>
        </Modal>
      </>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Large Modal"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is a large modal with more content space.
            </p>
            <p className="text-gray-300">
              You can add multiple paragraphs and other content here.
            </p>
            <p className="text-gray-300">
              The modal will scroll if the content exceeds the available space.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const ExtraLarge: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Extra Large Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Extra Large Modal"
          size="xl"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is an extra large modal with maximum content space.
            </p>
            <p className="text-gray-300">
              Perfect for forms, detailed information, or complex layouts.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal without Close Button"
          size="md"
          showCloseButton={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            This modal doesn't have a close button in the header. You must use the footer button or press ESC.
          </p>
        </Modal>
      </>
    );
  },
};

export const NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal - Click Backdrop to Close Disabled"
          size="md"
          closeOnBackdropClick={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            Clicking outside this modal won't close it. You must use the close button or press ESC.
          </p>
        </Modal>
      </>
    );
  },
};

export const NoEscClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal - ESC to Close Disabled"
          size="md"
          closeOnEsc={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            Pressing ESC won't close this modal. You must use the close button or click outside.
          </p>
        </Modal>
      </>
    );
  },
};
