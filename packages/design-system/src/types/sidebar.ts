/**
 * Sidebar Component Props
 */

import type { BaseComponentProps } from './base';

export interface SidebarMenuItem {
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
  submenu?: SidebarMenuItem[];

  /**
   * Badge text or number
   */
  badge?: string | number;
}

export interface SidebarProps extends BaseComponentProps {
  /**
   * Menu items
   */
  menuItems: SidebarMenuItem[];

  /**
   * Whether the sidebar is open
   */
  open?: boolean;

  /**
   * Sidebar open state handler
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the sidebar is collapsible
   * @default true
   */
  collapsible?: boolean;

  /**
   * Whether the sidebar is collapsed
   */
  collapsed?: boolean;

  /**
   * Sidebar collapse handler
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Width of the sidebar when expanded
   * @default 'w-64'
   */
  width?: string;

  /**
   * Width of the sidebar when collapsed
   * @default 'w-20'
   */
  collapsedWidth?: string;

  /**
   * Whether to show overlay on mobile
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Background color variant
   * @default 'dark'
   */
  variant?: 'dark' | 'light';

  /**
   * Header content
   */
  header?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Child elements
   */
  children?: React.ReactNode;
}
