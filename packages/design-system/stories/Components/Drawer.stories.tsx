import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from '../../src/components/Drawer';
import { Button } from '../../src/components/Button';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Left Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Left Drawer"
          position="left"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is a drawer that slides in from the left side.
            </p>
            <p className="text-gray-300">
              You can use it for navigation, filters, or additional options.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const RightDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Right Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Right Drawer"
          position="right"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is a drawer that slides in from the right side.
            </p>
            <p className="text-gray-300">
              Perfect for sidebars, settings, or additional information.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const TopDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Top Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Top Drawer"
          position="top"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is a drawer that slides in from the top.
            </p>
            <p className="text-gray-300">
              Great for notifications or important messages.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const BottomDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Bottom Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Bottom Drawer"
          position="bottom"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This is a drawer that slides in from the bottom.
            </p>
            <p className="text-gray-300">
              Commonly used for mobile menus or action sheets.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer with Footer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer with Actions"
          position="right"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Apply
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              This drawer has action buttons in the footer.
            </p>
            <p className="text-gray-300">
              Use this for forms or settings that need confirmation.
            </p>
          </div>
        </Drawer>
      </>
    );
  },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer without Close Button"
          position="left"
          showCloseButton={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            This drawer doesn't have a close button in the header.
          </p>
        </Drawer>
      </>
    );
  },
};

export const NoBackdropClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer - Backdrop Click Disabled"
          position="right"
          closeOnBackdropClick={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            Clicking outside this drawer won't close it.
          </p>
        </Drawer>
      </>
    );
  },
};

export const NoEscClose: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer - ESC to Close Disabled"
          position="left"
          closeOnEsc={false}
          footer={
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          }
        >
          <p className="text-gray-300">
            Pressing ESC won't close this drawer.
          </p>
        </Drawer>
      </>
    );
  },
};

export const WithContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Navigation Menu"
          position="left"
        >
          <nav className="space-y-2">
            <a href="#" className="block px-4 py-2 text-gold-500 hover:bg-gray-700 rounded">
              Home
            </a>
            <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Services
            </a>
            <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              About
            </a>
            <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Contact
            </a>
          </nav>
        </Drawer>
      </>
    );
  },
};
