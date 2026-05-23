import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '../../src/components/Navbar';

const meta = {
  title: 'Components/Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dark', 'light'],
    },
    sticky: {
      control: 'boolean',
    },
    showMobileMenu: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultMenuItems = [
  {
    id: 'home',
    label: 'Home',
    href: '#',
    active: true,
  },
  {
    id: 'about',
    label: 'About',
    href: '#',
  },
  {
    id: 'services',
    label: 'Services',
    href: '#',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '#',
  },
];

const defaultUserProfile = {
  name: 'John Doe',
  initials: 'JD',
  email: 'john@example.com',
  menuItems: [
    {
      label: 'Profile',
      onClick: () => console.log('Profile clicked'),
    },
    {
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
    },
  ],
  onLogout: () => console.log('Logout clicked'),
};

export const Default: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
    sticky: true,
    showMobileMenu: true,
  },
};

export const DarkVariant: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
    variant: 'dark',
  },
};

export const LightVariant: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
    variant: 'light',
  },
};

export const WithoutUserProfile: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    showMobileMenu: true,
  },
};

export const WithoutMobileMenu: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
    showMobileMenu: false,
  },
};

export const NotSticky: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
    sticky: false,
  },
};

export const WithManyMenuItems: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: [
      ...defaultMenuItems,
      {
        id: 'blog',
        label: 'Blog',
        href: '#',
      },
      {
        id: 'docs',
        label: 'Documentation',
        href: '#',
      },
      {
        id: 'community',
        label: 'Community',
        href: '#',
      },
    ],
    userProfile: defaultUserProfile,
  },
};

export const WithCustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gold-500 rounded-full" />
        <span className="text-gold-500 font-bold">Mirastros</span>
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: defaultUserProfile,
  },
};

export const WithUserAvatar: Story = {
  args: {
    logo: (
      <div className="text-gold-500 font-bold text-xl">
        Mirastros
      </div>
    ),
    menuItems: defaultMenuItems,
    userProfile: {
      ...defaultUserProfile,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  },
};
