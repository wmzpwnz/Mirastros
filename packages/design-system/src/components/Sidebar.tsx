'use client';

/**
 * Sidebar Component
 * A collapsible side navigation with menu items and icons
 */

import React, { forwardRef, useState } from 'react';
import type { SidebarProps, SidebarMenuItem } from '../types/sidebar';

const variantStyles = {
  dark: 'bg-cosmic border-r border-gray-800',
  light: 'bg-white border-r border-gray-200',
};

const textVariantStyles = {
  dark: 'text-gray-100',
  light: 'text-gray-900',
};

const hoverVariantStyles = {
  dark: 'hover:bg-gray-800',
  light: 'hover:bg-gray-100',
};

const renderMenuItem = (
  item: SidebarMenuItem,
  collapsed: boolean,
  variant: 'dark' | 'light',
  depth = 0,
) => {
  return (
    <div key={item.id}>
      <a
        href={item.href}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          }
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
          item.active
            ? `bg-gold-500 text-cosmic font-semibold`
            : `${textVariantStyles[variant]} ${hoverVariantStyles[variant]}`
        } ${collapsed ? 'justify-center' : ''}`}
        aria-current={item.active ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
      >
        {item.icon && <span className="flex-shrink-0 flex items-center">{item.icon}</span>}
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gold-500 text-cosmic rounded-full flex-shrink-0">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </a>

      {/* Submenu */}
      {item.submenu && item.submenu.length > 0 && !collapsed && (
        <div className="pl-4">
          {item.submenu.map((subitem) => renderMenuItem(subitem, collapsed, variant, depth + 1))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      menuItems,
      open: controlledOpen,
      onOpenChange,
      collapsible = true,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      width = 'w-64',
      collapsedWidth = 'w-20',
      showOverlay = true,
      variant = 'dark',
      header,
      footer,
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(true);
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    const handleOpenChange = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const handleCollapsedChange = (newCollapsed: boolean) => {
      setInternalCollapsed(newCollapsed);
      onCollapsedChange?.(newCollapsed);
    };

    const sidebarWidth = isCollapsed ? collapsedWidth : width;
    const baseStyles = `fixed left-0 top-0 h-screen ${sidebarWidth} transition-all duration-300 ${variantStyles[variant]} flex flex-col z-40`;
    const combinedClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <>
        {/* Overlay for mobile */}
        {showOverlay && isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
            onClick={() => handleOpenChange(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          ref={ref}
          className={combinedClassName}
          style={style}
          data-testid={testId}
          aria-label={ariaLabel || 'Sidebar navigation'}
          aria-describedby={ariaDescribedBy}
        >
          {/* Header */}
          {header && (
            <div className="flex-shrink-0 px-4 py-4 border-b border-gray-800">
              {header}
            </div>
          )}

          {/* Collapse Toggle */}
          {collapsible && (
            <button
              onClick={() => handleCollapsedChange(!isCollapsed)}
              className={`flex items-center justify-center p-3 ${hoverVariantStyles[variant]} transition-colors`}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </button>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {(menuItems ?? []).map((item) => renderMenuItem(item, isCollapsed, variant))}
          </nav>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800">
              {footer}
            </div>
          )}

          {children}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => handleOpenChange(!isOpen)}
          className="fixed bottom-4 right-4 md:hidden p-3 bg-gold-500 text-cosmic rounded-full shadow-lg hover:bg-gold-600 transition-colors z-50"
          aria-label="Toggle sidebar"
          aria-expanded={isOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </>
    );
  },
);

Sidebar.displayName = 'Sidebar';
