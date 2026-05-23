/**
 * Avatar Component Props
 */

import type React from 'react';
import { BaseComponentProps } from './base';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends BaseComponentProps {
  /**
   * Image source URL
   */
  src?: string;

  /**
   * Alt text for the image
   */
  alt?: string;

  /**
   * User initials (fallback when no image)
   */
  initials?: string;

  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Status indicator (online, offline, pending)
   */
  status?: 'online' | 'offline' | 'pending';

  /**
   * Whether to show status indicator
   * @default false
   */
  showStatus?: boolean;
}
