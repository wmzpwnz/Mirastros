/**
 * Design System Types
 * Central export for all component prop interfaces and utility types
 */

// Base types
export type { BaseComponentProps } from './base';

// Component types
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';
export type { InputProps, InputType } from './input';
export type { CardProps, CardVariant } from './card';
export type { LabelProps } from './label';
export type { IconProps, IconSize } from './icon';
export type { BadgeProps, BadgeVariant, BadgeSize } from './badge';
export type { AvatarProps, AvatarSize } from './avatar';
export type { SelectProps, SelectOption } from './select';
export type { CheckboxProps } from './checkbox';
export type { RadioProps, RadioGroupProps, RadioOption } from './radio';
export type { TextareaProps } from './textarea';
export type { DatePickerProps } from './datepicker';
export type { ModalProps, ModalSize } from './modal';
export type { AlertDialogProps } from './alertdialog';
export type { DrawerProps, DrawerPosition } from './drawer';
export type { ToastProps, ToastContainerProps, ToastType } from './toast';
export type { TooltipProps, TooltipPosition } from './tooltip';
export type { PopoverProps, PopoverPosition } from './popover';
export type { SpinnerProps, SpinnerSize } from './spinner';
export type { SkeletonProps, SkeletonShape } from './skeleton';
export type { TabsProps, TabItem } from './tabs';
export type { AccordionProps, AccordionItem } from './accordion';
export type { BreadcrumbProps, BreadcrumbItem } from './breadcrumb';
export type { PaginationProps } from './pagination';
export type { TableProps, TableColumn, SortDirection } from './table';
export type { ChartProps, ChartType, ChartDataPoint } from './chart';
export type { ProgressBarProps, ProgressBarVariant } from './progressbar';

// Layout Components
export type { ContainerProps, ContainerSize } from './container';
export type { GridProps, GridColumns, GapSize } from './grid';
export type { StackProps, StackDirection, StackAlignment, StackJustification } from './stack';
export type { NavbarProps, NavbarMenuItem, NavbarUserProfile } from './navbar';
export type { SidebarProps, SidebarMenuItem } from './sidebar';

// Content Components
export type { ServiceCardProps } from './servicecard';
export type { HeroProps } from './hero';
export type { SectionProps } from './section';

// Utility types
export type {
  VariantType,
  SizeType,
  CommonSize,
  CommonVariant,
  StateVariant,
  BreakpointKey,
  SpacingKey,
  PolymorphicProps,
  PolymorphicComponent,
} from './utilities';

export {
  COMMON_SIZES,
  COMMON_VARIANTS,
  STATE_VARIANTS,
  BREAKPOINT_KEYS,
  SPACING_KEYS,
} from './utilities';
