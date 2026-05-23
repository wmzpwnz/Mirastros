import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from '../../src/components/Sidebar';

const meta = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dark', 'light'],
    },
    collapsible: {
      control: 'boolean',
    },
    showOverlay: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '#',
    active: true,
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
        <path d="M3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
        <path d="M14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '#',
    badge: '5',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export const Default: Story = {
  args: {
    menuItems: defaultMenuItems,
    collapsible: true,
    showOverlay: true,
    variant: 'dark',
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
    footer: (
      <div className="text-gray-400 text-sm">
        v1.0.0
      </div>
    ),
  },
};

export const DarkVariant: Story = {
  args: {
    menuItems: defaultMenuItems,
    variant: 'dark',
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};

export const LightVariant: Story = {
  args: {
    menuItems: defaultMenuItems,
    variant: 'light',
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};

export const NotCollapsible: Story = {
  args: {
    menuItems: defaultMenuItems,
    collapsible: false,
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};

export const WithoutOverlay: Story = {
  args: {
    menuItems: defaultMenuItems,
    showOverlay: false,
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};

export const WithSubmenu: Story = {
  args: {
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '#',
        active: true,
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
          </svg>
        ),
      },
      {
        id: 'content',
        label: 'Content',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
          </svg>
        ),
        submenu: [
          {
            id: 'pages',
            label: 'Pages',
            href: '#',
          },
          {
            id: 'posts',
            label: 'Posts',
            href: '#',
          },
          {
            id: 'media',
            label: 'Media',
            href: '#',
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '#',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
    ],
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};

export const WithBadges: Story = {
  args: {
    menuItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '#',
        active: true,
        badge: '3',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
          </svg>
        ),
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '#',
        badge: '12',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        ),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '#',
        badge: '5',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
          </svg>
        ),
      },
    ],
    header: (
      <div className="text-gold-500 font-bold text-lg">
        Admin
      </div>
    ),
  },
};
