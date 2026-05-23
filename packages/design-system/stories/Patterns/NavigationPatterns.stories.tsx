import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from '../../src/components/Tabs';
import { Accordion } from '../../src/components/Accordion';
import { Breadcrumb } from '../../src/components/Breadcrumb';
import { Pagination } from '../../src/components/Pagination';
import { Container } from '../../src/components/Container';
import { Card } from '../../src/components/Card';
import { Navbar } from '../../src/components/Navbar';

const meta = {
  title: 'Patterns/Navigation Patterns',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsNavigation: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('services');

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
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Services</h1>

          <Tabs
            tabs={[
              {
                id: 'services',
                label: 'All Services',
                content: (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Tarot Reading</h3>
                      <p className="text-gray-400">Get insights into your future with tarot cards.</p>
                    </Card>
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Astrology</h3>
                      <p className="text-gray-400">Explore your birth chart and planetary influences.</p>
                    </Card>
                  </div>
                ),
              },
              {
                id: 'popular',
                label: 'Popular',
                content: (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Daily Horoscope</h3>
                      <p className="text-gray-400">Your daily cosmic guidance.</p>
                    </Card>
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Love Compatibility</h3>
                      <p className="text-gray-400">Discover your cosmic connection.</p>
                    </Card>
                  </div>
                ),
              },
              {
                id: 'new',
                label: 'New',
                content: (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Numerology Analysis</h3>
                      <p className="text-gray-400">Unlock the power of numbers.</p>
                    </Card>
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Crystal Healing</h3>
                      <p className="text-gray-400">Harness the energy of crystals.</p>
                    </Card>
                  </div>
                ),
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Container>
      </div>
    );
  },
};

export const AccordionNavigation: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'FAQ', href: '#' },
        ]}
      />

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Frequently Asked Questions</h1>

        <Accordion
          items={[
            {
              id: 'q1',
              title: 'What is Tarot Reading?',
              content: (
                <p className="text-gray-300">
                  Tarot reading is a divination practice that uses a deck of 78 cards to gain insights into past, present, and future events. Each card has symbolic meaning and can be interpreted in various ways depending on the context and the reader's intuition.
                </p>
              ),
            },
            {
              id: 'q2',
              title: 'How accurate is Astrology?',
              content: (
                <p className="text-gray-300">
                  Astrology is a belief system that interprets the positions and movements of celestial bodies. While many people find value in astrological insights, it's important to approach it as a tool for self-reflection rather than a scientific prediction method.
                </p>
              ),
            },
            {
              id: 'q3',
              title: 'What are the benefits of Numerology?',
              content: (
                <p className="text-gray-300">
                  Numerology explores the mystical significance of numbers and their influence on human life. It can provide insights into personality traits, life path, and potential opportunities for personal growth and self-discovery.
                </p>
              ),
            },
            {
              id: 'q4',
              title: 'How do I choose the right crystal?',
              content: (
                <p className="text-gray-300">
                  Choosing a crystal is often an intuitive process. You can select based on the crystal's properties, your current needs, or simply by being drawn to a particular stone. Trust your instincts and explore different crystals to find what resonates with you.
                </p>
              ),
            },
            {
              id: 'q5',
              title: 'What is a birth chart reading?',
              content: (
                <p className="text-gray-300">
                  A birth chart reading analyzes the positions of planets at the time of your birth. It provides insights into your personality, strengths, challenges, and life purpose based on astrological principles.
                </p>
              ),
            },
          ]}
        />
      </Container>
    </div>
  ),
};

export const BreadcrumbNavigation: Story = {
  render: () => (
    <div className="min-h-screen bg-cosmic">
      <Navbar
        logo="Mirastros"
        items={[
          { label: 'Home', href: '#' },
          { label: 'Services', href: '#' },
        ]}
      />

      <Container className="py-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '#' },
            { label: 'Services', href: '#' },
            { label: 'Tarot', href: '#' },
            { label: 'Daily Reading', href: '#' },
          ]}
        />
      </Container>

      <Container className="py-12">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Daily Tarot Reading</h1>

        <Card padding="md">
          <p className="text-gray-300 mb-4">
            Get your daily tarot reading to guide you through the day ahead.
          </p>
          <button className="px-6 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 transition-colors">
            Get Reading
          </button>
        </Card>
      </Container>
    </div>
  ),
};

export const PaginationNavigation: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    return (
      <div className="min-h-screen bg-cosmic">
        <Navbar
          logo="Mirastros"
          items={[
            { label: 'Home', href: '#' },
            { label: 'Blog', href: '#' },
          ]}
        />

        <Container className="py-12">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Blog Posts</h1>

          <div className="space-y-6 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} padding="md">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Blog Post {(currentPage - 1) * 5 + i}
                </h3>
                <p className="text-gray-400 mb-4">
                  This is a blog post excerpt. Click to read the full article.
                </p>
                <a href="#" className="text-gold-500 hover:text-gold-600">
                  Read More →
                </a>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Container>
      </div>
    );
  },
};

export const MultiLevelNavigation: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('readings');

    return (
      <div className="min-h-screen bg-cosmic">
        <Navbar
          logo="Mirastros"
          items={[
            { label: 'Home', href: '#' },
            { label: 'Services', href: '#' },
            { label: 'Blog', href: '#' },
          ]}
        />

        <Container className="py-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '#' },
              { label: 'Services', href: '#' },
            ]}
          />
        </Container>

        <Container className="py-12">
          <h1 className="text-3xl font-bold text-gold-500 mb-8">Services</h1>

          <Tabs
            tabs={[
              {
                id: 'readings',
                label: 'Readings',
                content: (
                  <Accordion
                    items={[
                      {
                        id: 'tarot',
                        title: 'Tarot Readings',
                        content: (
                          <div className="space-y-4">
                            <p className="text-gray-300">
                              Explore our tarot reading services.
                            </p>
                            <div className="flex gap-2">
                              <button className="px-4 py-2 bg-gold-500 text-cosmic rounded hover:bg-gold-600">
                                Daily Reading
                              </button>
                              <button className="px-4 py-2 bg-gold-500 text-cosmic rounded hover:bg-gold-600">
                                Full Spread
                              </button>
                            </div>
                          </div>
                        ),
                      },
                      {
                        id: 'astro',
                        title: 'Astrology',
                        content: (
                          <div className="space-y-4">
                            <p className="text-gray-300">
                              Discover your astrological profile.
                            </p>
                            <div className="flex gap-2">
                              <button className="px-4 py-2 bg-turquoise-500 text-cosmic rounded hover:bg-turquoise-600">
                                Birth Chart
                              </button>
                              <button className="px-4 py-2 bg-turquoise-500 text-cosmic rounded hover:bg-turquoise-600">
                                Horoscope
                              </button>
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />
                ),
              },
              {
                id: 'products',
                label: 'Products',
                content: (
                  <div className="space-y-4">
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Tarot Decks</h3>
                      <p className="text-gray-400">Premium tarot decks for your practice.</p>
                    </Card>
                    <Card padding="md">
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Crystals</h3>
                      <p className="text-gray-400">Authentic crystals and gemstones.</p>
                    </Card>
                  </div>
                ),
              },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Container>
      </div>
    );
  },
};

export const StepByStepNavigation: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
      { number: 1, title: 'Select Service', description: 'Choose the service you want' },
      { number: 2, title: 'Provide Details', description: 'Share your information' },
      { number: 3, title: 'Review', description: 'Confirm your selection' },
      { number: 4, title: 'Complete', description: 'Finish and receive results' },
    ];

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
          <h1 className="text-3xl font-bold text-gold-500 mb-12">Service Wizard</h1>

          <div className="mb-12">
            <div className="flex justify-between mb-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                      step.number <= currentStep
                        ? 'bg-gold-500 text-cosmic'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step.number}
                  </div>
                  <p className="text-sm font-semibold text-gray-100">{step.title}</p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <Card padding="md" className="mb-8">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">{steps[currentStep - 1].title}</h2>
            <p className="text-gray-300 mb-6">
              {steps[currentStep - 1].description}
            </p>
          </Card>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
              className="px-6 py-2 bg-gold-500 text-cosmic rounded font-semibold hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </Container>
      </div>
    );
  },
};
