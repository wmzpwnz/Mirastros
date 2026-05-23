'use client';

/**
 * Navbar Component
 * A responsive navigation bar with logo, menu items, and user profile dropdown
 */

import React, { forwardRef, useState } from 'react';
import type { NavbarProps } from '../types/navbar';

const variantStyles = {
  dark: 'bg-cosmic border-b border-gray-800',
  light: 'bg-white border-b border-gray-200',
};

const textVariantStyles = {
  dark: 'text-gray-100',
  light: 'text-gray-900',
};

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      logo,
      onLogoClick,
      menuItems = [],
      userProfile,
      showMobileMenu = true,
      mobileMenuOpen: controlledMobileMenuOpen,
      onMobileMenuToggle,
      sticky = true,
      variant = 'dark',
      children,
      className,
      style,
      testId,
      ariaLabel,
      ariaDescribedBy,
    },
    ref,
  ) => {
    const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
    const mobileMenuOpen = controlledMobileMenuOpen !== undefined ? controlledMobileMenuOpen : internalMobileMenuOpen;

    const handleMobileMenuToggle = () => {
      const newState = !mobileMenuOpen;
      setInternalMobileMenuOpen(newState);
      onMobileMenuToggle?.(newState);
    };

    const baseStyles = `w-full ${sticky ? 'sticky top-0 z-50' : ''} ${variantStyles[variant]}`;
    const combinedClassName = `${baseStyles} ${className || ''}`.trim();

    return (
      <nav
        ref={ref}
        className={combinedClassName}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || 'Main navigation'}
        aria-describedby={ariaDescribedBy}
      >
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={onLogoClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onLogoClick?.();
                }
              }}
            >
              {logo}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={`flex items-center gap-2 transition-colors ${
                    item.active
                      ? `text-gold-500 font-semibold`
                      : `${textVariantStyles[variant]} hover:text-gold-500`
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </div>

            {/* User Profile & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              {userProfile && (
                <div className="flex items-center gap-2">
                  {userProfile.avatar && (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  {!userProfile.avatar && userProfile.initials && (
                    <div className="w-8 h-8 rounded-full bg-gold-500 text-cosmic flex items-center justify-center text-sm font-semibold">
                      {userProfile.initials}
                    </div>
                  )}
                  <span className={`hidden sm:inline text-sm ${textVariantStyles[variant]}`}>
                    {userProfile.name}
                  </span>
                </div>
              )}

              {showMobileMenu && (
                <button
                  className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors"
                  onClick={handleMobileMenuToggle}
                  aria-label="Toggle mobile menu"
                  aria-expanded={mobileMenuOpen}
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
                      d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                    handleMobileMenuToggle();
                  }}
                  className={`block py-2 px-2 rounded transition-colors ${
                    item.active
                      ? `text-gold-500 font-semibold bg-gray-800`
                      : `${textVariantStyles[variant]} hover:bg-gray-800`
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="flex items-center">{item.icon}</span>}
                    {item.label}
                  </div>
                </a>
              ))}
            </div>
          )}

          {children}
        </div>
      </nav>
    );
  },
);

Navbar.displayName = 'Navbar';
