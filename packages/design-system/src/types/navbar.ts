/**
 * Navbar Component Props
 */

import type { BaseComponentProps } from './base';

export interface NavbarMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;

  /**
   * Display label for the menu item
   */
  label: string;

  /**
   * URL or path for the menu item
   */
  href?: string;

  /**
   * Whether the menu item is active
   */
  active?: boolean;

  /**
   * Click handler for the menu item
   */
  onClick?: () => void;

  /**
   * Icon element for the menu item
   */
  icon?: React.ReactNode;

  /**
   * Submenu items
   */
  submenu?: NavbarMenuItem[];
}

export interface NavbarUserProfile {
  /**
   * User name
   */
  name: string;

  /**
   * User avatar URL
   */
  avatar?: string;

  /**
   * User initials (fallback if no avatar)
   */
  initials?: string;

  /**
   * User email
   */
  email?: string;

  /**
   * Dropdown menu items for user profile
   */
  menuItems?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;

  /**
   * Logout handler
   */
  onLogout?: () => void;
}

export interface NavbarProps extends BaseComponentProps {
  /**
   * Logo element or text
   */
  logo?: React.ReactNode;

  /**
   * Logo click handler
   */
  onLogoClick?: () => void;

  /**
   * Menu items
   */
  menuItems?: NavbarMenuItem[];

  /**
   * User profile configuration
   */
  userProfile?: NavbarUserProfile;

  /**
   * Whether to show mobile menu toggle
   * @default true
   */
  showMobileMenu?: boolean;

  /**
   * Mobile menu open state
   */
  mobileMenuOpen?: boolean;

  /**
   * Mobile menu toggle handler
   */
  onMobileMenuToggle?: (open: boolean) => void;

  /**
   * Whether navbar is sticky
   * @default true
   */
  sticky?: boolean;

  /**
   * Background color variant
   * @default 'dark'
   */
  variant?: 'dark' | 'light';

  /**
   * Child elements (for custom content)
   */
  children?: React.ReactNode;
}
