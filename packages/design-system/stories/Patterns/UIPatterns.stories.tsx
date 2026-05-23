import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Icon } from '../../src/components/Icon';
import { Spinner } from '../../src/components/Spinner';
import { Skeleton } from '../../src/components/Skeleton';
import { Toast, ToastContainer } from '../../src/components/Toast';
import { Tooltip } from '../../src/components/Tooltip';
import { Container } from '../../src/components/Container';
import { Navbar } from '../../src/components/Navbar';

const meta = {
  title: 'Patterns/UI Patterns',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingStates: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Loading States</h1>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Spinner</h2>
            <Card padding="md" className="flex items-center justify-center h-40">
              <Spinner size="lg" />
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Skeleton</h2>
            <Card padding="md" className="space-y-4">
              <Skeleton width="100%" height="20px" />
              <Skeleton width="100%" height="20px" />
              <Skeleton width="80%" height="20px" />
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Loading Button</h2>
            <Button loading>Loading...</Button>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Skeleton Card</h2>
            <Card padding="md">
              <Skeleton width="100%" height="200px" className="mb-4" />
              <Skeleton width="100%" height="20px" className="mb-2" />
              <Skeleton width="80%" height="20px" />
            </Card>
          </div>
        </div>
      </Container>
    </div>
  ),
};

export const EmptyStates: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Empty States</h1>

        <div className="grid grid-cols-2 gap-8">
          <Card padding="md" className="text-center py-12">
            <Icon name="inbox" size="xl" color="#6B7280" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No Messages</h3>
            <p className="text-gray-400 mb-4">You don't have any messages yet.</p>
            <Button variant="secondary">Send a Message</Button>
          </Card>

          <Card padding="md" className="text-center py-12">
            <Icon name="search" size="xl" color="#6B7280" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No Results</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search criteria.</p>
            <Button variant="secondary">Clear Filters</Button>
          </Card>

          <Card padding="md" className="text-center py-12">
            <Icon name="heart" size="xl" color="#6B7280" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">No Favorites</h3>
            <p className="text-gray-400 mb-4">Add items to your favorites to see them here.</p>
            <Button variant="secondary">Browse Services</Button>
          </Card>

          <Card padding="md" className="text-center py-12">
            <Icon name="alert" size="xl" color="#6B7280" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Error Occurred</h3>
            <p className="text-gray-400 mb-4">Something went wrong. Please try again.</p>
            <Button variant="secondary">Retry</Button>
          </Card>
        </div>
      </Container>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Status Indicators</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Badges</h2>
            <div className="flex gap-4 flex-wrap">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="error">Inactive</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Status Cards</h2>
            <div className="grid grid-cols-2 gap-6">
              <Card padding="md" className="border-l-4 border-success">
                <div className="flex items-center gap-3">
                  <Icon name="check" size="lg" color="#10B981" />
                  <div>
                    <h3 className="font-semibold text-gray-100">Success</h3>
                    <p className="text-sm text-gray-400">Operation completed successfully</p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-warning">
                <div className="flex items-center gap-3">
                  <Icon name="alert" size="lg" color="#F59E0B" />
                  <div>
                    <h3 className="font-semibold text-gray-100">Warning</h3>
                    <p className="text-sm text-gray-400">Please review this action</p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-error">
                <div className="flex items-center gap-3">
                  <Icon name="x" size="lg" color="#EF4444" />
                  <div>
                    <h3 className="font-semibold text-gray-100">Error</h3>
                    <p className="text-sm text-gray-400">An error occurred</p>
                  </div>
                </div>
              </Card>

              <Card padding="md" className="border-l-4 border-info">
                <div className="flex items-center gap-3">
                  <Icon name="info" size="lg" color="#3B82F6" />
                  <div>
                    <h3 className="font-semibold text-gray-100">Info</h3>
                    <p className="text-sm text-gray-400">Here's some useful information</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  ),
};

export const InteractiveElements: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>>([]);

    const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    return (
      <div className="min-h-screen bg-cosmic">
        <Navbar
          logo="Mirastros"
          items={[
            { label: 'Home', href: '#' },
            { label: 'Services', href: '#' },
          ]}
        />

        <Container className="py-12">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Interactive Elements</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Buttons with Tooltips</h2>
              <div className="flex gap-4 flex-wrap">
                <Tooltip content="Click to save">
                  <Button variant="primary">Save</Button>
                </Tooltip>
                <Tooltip content="Click to delete">
                  <Button variant="danger">Delete</Button>
                </Tooltip>
                <Tooltip content="Click to edit">
                  <Button variant="secondary">Edit</Button>
                </Tooltip>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Toast Notifications</h2>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => addToast('success', 'Operation successful!')}>
                  Success Toast
                </Button>
                <Button onClick={() => addToast('error', 'An error occurred!')}>
                  Error Toast
                </Button>
                <Button onClick={() => addToast('warning', 'Please be careful!')}>
                  Warning Toast
                </Button>
                <Button onClick={() => addToast('info', 'Here is some information')}>
                  Info Toast
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Button States</h2>
              <div className="flex gap-4 flex-wrap">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" loading>
                  Loading
                </Button>
              </div>
            </div>
          </div>
        </Container>

        <ToastContainer>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </ToastContainer>
      </div>
    );
  },
};

export const DataDisplay: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Data Display Patterns</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Metric Cards</h2>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Total Users', value: '12,345', change: '+12%' },
                { label: 'Active Sessions', value: '2,456', change: '+8%' },
                { label: 'Revenue', value: '$45,678', change: '+23%' },
                { label: 'Conversion', value: '3.2%', change: '-2%' },
              ].map((metric, i) => (
                <Card key={i} padding="md">
                  <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold text-gold-500 mb-2">{metric.value}</p>
                  <p className={metric.change.startsWith('+') ? 'text-success text-sm' : 'text-error text-sm'}>
                    {metric.change} from last month
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">List with Status</h2>
            <Card padding="md">
              <div className="space-y-4">
                {[
                  { name: 'Tarot Reading', status: 'active', users: 1234 },
                  { name: 'Astrology', status: 'active', users: 2345 },
                  { name: 'Numerology', status: 'pending', users: 456 },
                  { name: 'Crystals', status: 'inactive', users: 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded">
                    <div>
                      <h3 className="font-semibold text-gray-100">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.users} users</p>
                    </div>
                    <Badge
                      variant={
                        item.status === 'active'
                          ? 'success'
                          : item.status === 'pending'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  ),
};

export const CallToAction: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Call to Action Patterns</h1>

        <div className="space-y-8">
          <Card padding="md" variant="elevated" className="text-center py-12">
            <h2 className="text-3xl font-bold text-gold-500 mb-4">Ready to Explore?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover your cosmic destiny with our mystical services and readings.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary">Get Started</Button>
              <Button variant="secondary">Learn More</Button>
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-r from-gold-500/10 to-turquoise-500/10 border border-gold-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gold-500 mb-2">Premium Membership</h3>
                <p className="text-gray-300">Unlock exclusive readings and features</p>
              </div>
              <Button variant="primary">Upgrade Now</Button>
            </div>
          </Card>

          <Card padding="md" className="text-center">
            <Icon name="star" size="xl" color="#FFC107" className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-100 mb-2">Limited Time Offer</h3>
            <p className="text-gray-400 mb-4">Get 50% off your first reading</p>
            <Button variant="primary">Claim Offer</Button>
          </Card>
        </div>
      </Container>
    </div>
  ),
};
