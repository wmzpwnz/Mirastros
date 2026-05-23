import type { Meta, StoryObj } from '@storybook/react';
import { Toast, ToastContainer } from '../../src/components/Toast';
import { useState } from 'react';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    autoDismiss: {
      control: 'boolean',
    },
    duration: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Operation completed successfully!',
    autoDismiss: false,
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'An error occurred. Please try again.',
    autoDismiss: false,
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Please review this warning message.',
    autoDismiss: false,
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    message: 'This is an informational message.',
    autoDismiss: false,
  },
};

export const WithAction: Story = {
  args: {
    type: 'info',
    message: 'You have a new message.',
    actionText: 'View',
    autoDismiss: false,
  },
};

export const AutoDismiss: Story = {
  args: {
    type: 'success',
    message: 'This will auto-dismiss in 5 seconds.',
    autoDismiss: true,
    duration: 5000,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Toast type="success" message="Success message" autoDismiss={false} />
      <Toast type="error" message="Error message" autoDismiss={false} />
      <Toast type="warning" message="Warning message" autoDismiss={false} />
      <Toast type="info" message="Info message" autoDismiss={false} />
    </div>
  ),
};

export const Container: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

    const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => addToast('success', 'Success notification')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Success
          </button>
          <button
            onClick={() => addToast('error', 'Error notification')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Add Error
          </button>
          <button
            onClick={() => addToast('warning', 'Warning notification')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Add Warning
          </button>
          <button
            onClick={() => addToast('info', 'Info notification')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Info
          </button>
        </div>

        <ToastContainer position="bottom-right">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              autoDismiss={true}
              duration={5000}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </ToastContainer>
      </div>
    );
  },
};
