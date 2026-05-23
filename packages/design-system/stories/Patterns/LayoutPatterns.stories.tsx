import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '../../src/components/Container';
import { Grid } from '../../src/components/Grid';
import { Stack } from '../../src/components/Stack';
import { Card } from '../../src/components/Card';
import { Navbar } from '../../src/components/Navbar';
import { Sidebar } from '../../src/components/Sidebar';
import { Icon } from '../../src/components/Icon';

const meta = {
  title: 'Patterns/Layout Patterns',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoColumnLayout: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
          { label: 'About', href: '#' },
        ]}
      />

      <Container className="py-12">
        <Grid columns={2} gap={6}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gold-500">Main Content</h2>
            <Card padding="md">
              <p className="text-gray-300">
                This is the main content area. It takes up 2/3 of the width on desktop and full width on mobile.
              </p>
            </Card>
            <Card padding="md">
              <p className="text-gray-300">
                Multiple cards can be stacked vertically in the main content area.
              </p>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-turquoise-500">Sidebar</h2>
            <Card padding="md" variant="outlined">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Links</h3>
              <Stack direction="vertical" gap={2}>
                <a href="#" className="text-gold-500 hover:text-gold-600">
                  Link 1
                </a>
                <a href="#" className="text-gold-500 hover:text-gold-600">
                  Link 2
                </a>
                <a href="#" className="text-gold-500 hover:text-gold-600">
                  Link 3
                </a>
              </Stack>
            </Card>
          </div>
        </Grid>
      </Container>
    </div>
  ),
};

export const ThreeColumnLayout: Story = {
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
        <Grid columns={3} gap={6}>
          <Card padding="md" variant="outlined">
            <h3 className="text-lg font-semibold text-gold-500 mb-4">Left Sidebar</h3>
            <p className="text-gray-400 text-sm">Navigation or filters go here.</p>
          </Card>

          <div className="col-span-1 space-y-4">
            <h2 className="text-2xl font-bold text-gray-100">Main Content</h2>
            <Card padding="md">
              <p className="text-gray-300">
                This is the main content area in the center.
              </p>
            </Card>
          </div>

          <Card padding="md" variant="outlined">
            <h3 className="text-lg font-semibold text-turquoise-500 mb-4">Right Sidebar</h3>
            <p className="text-gray-400 text-sm">Related content or ads go here.</p>
          </Card>
        </Grid>
      </Container>
    </div>
  ),
};

export const HeroWithContent: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <div className="bg-gradient-to-r from-gold-500/20 to-turquoise-500/20 py-20">
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gold-500">Welcome to Mirastros</h1>
            <p className="text-xl text-gray-300">Discover your cosmic destiny</p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <Grid columns={3} gap={6}>
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md">
              <div className="flex items-center gap-4 mb-4">
                <Icon name="star" size="lg" color="#FFC107" />
                <h3 className="text-lg font-semibold text-gray-100">Service {i}</h3>
              </div>
              <p className="text-gray-400">
                Description of service {i} goes here.
              </p>
            </Card>
          ))}
        </Grid>
      </Container>
    </div>
  ),
};

export const SidebarLayout: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic flex">
      <Sidebar
        items={[
          { label: 'Dashboard', icon: 'home', href: '#' },
          { label: 'Services', icon: 'star', href: '#' },
          { label: 'Readings', icon: 'book', href: '#' },
          { label: 'Settings', icon: 'settings', href: '#' },
        ]}
      />

      <div className="flex-1">
        <Navbar
          logo="Admin"
          items={[
            { label: 'Profile', href: '#' },
            { label: 'Logout', href: '#' },
          ]}
        />

        <Container className="py-12">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Dashboard</h1>

          <Grid columns={2} gap={6}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} padding="md">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Metric {i}</h3>
                <p className="text-3xl font-bold text-gold-500 mb-2">1,234</p>
                <p className="text-gray-400 text-sm">+12% from last month</p>
              </Card>
            ))}
          </Grid>
        </Container>
      </div>
    </div>
  ),
};

export const CardGrid: Story = {
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
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Our Services</h1>

        <Grid columns={4} gap={6}>
          {[
            { title: 'Tarot', icon: 'star' },
            { title: 'Astrology', icon: 'moon' },
            { title: 'Numerology', icon: 'hash' },
            { title: 'Crystals', icon: 'gem' },
            { title: 'Dream Analysis', icon: 'cloud' },
            { title: 'Chakra Healing', icon: 'heart' },
            { title: 'Rituals', icon: 'flame' },
            { title: 'Synastry', icon: 'users' },
          ].map((service, i) => (
            <Card key={i} padding="md" interactive>
              <div className="flex flex-col items-center text-center gap-4">
                <Icon name={service.icon} size="lg" color="#FFC107" />
                <h3 className="text-lg font-semibold text-gray-100">{service.title}</h3>
                <p className="text-gray-400 text-sm">Explore {service.title.toLowerCase()}</p>
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </div>
  ),
};

export const StackedLayout: Story = {
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
        <Stack direction="vertical" gap={6}>
          <Card padding="md" variant="elevated">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">Featured Service</h2>
            <p className="text-gray-300">
              This is a featured service card that spans the full width.
            </p>
          </Card>

          <Grid columns={2} gap={6}>
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Card 1</h3>
              <p className="text-gray-400">Content for card 1</p>
            </Card>
            <Card padding="md">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Card 2</h3>
              <p className="text-gray-400">Content for card 2</p>
            </Card>
          </Grid>

          <Card padding="md" variant="outlined">
            <h3 className="text-lg font-semibold text-turquoise-500 mb-4">Call to Action</h3>
            <p className="text-gray-300 mb-4">
              Ready to explore your cosmic destiny?
            </p>
            <button className="px-6 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 transition-colors">
              Get Started
            </button>
          </Card>
        </Stack>
      </Container>
    </div>
  ),
};

export const ResponsiveGrid: Story = {
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
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Responsive Grid</h1>
        <p className="text-gray-400 mb-8">
          This grid adapts to different screen sizes: 4 columns on desktop, 2 on tablet, 1 on mobile
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} padding="md">
              <div className="aspect-square bg-gradient-to-br from-gold-500 to-turquoise-500 rounded mb-4" />
              <h3 className="text-lg font-semibold text-gray-100">Item {i}</h3>
              <p className="text-gray-400 text-sm">Responsive item</p>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  ),
};
