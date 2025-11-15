import type { ComponentProps } from 'react';
import { Badge } from './badge';

export type StatusVariant = 'pending' | 'approved' | 'denied' | 'borrowed' | 'completed' | 'success' | 'warning' | 'info' | 'danger';

export interface StatusBadgeProps extends Omit<ComponentProps<typeof Badge>, 'variant'> {
  status: StatusVariant;
  label?: string;
}

const STATUS_CLASSES: Record<StatusVariant, string> = {
  pending: 'bg-status-pending text-status-pending-foreground',
  approved: 'bg-status-approved text-status-approved-foreground',
  denied: 'bg-status-denied text-status-denied-foreground',
  borrowed: 'bg-status-borrowed text-status-borrowed-foreground',
  completed: 'bg-status-completed text-status-completed-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
  danger: 'bg-danger text-danger-foreground',
};

const STATUS_LABELS: Record<StatusVariant, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  borrowed: 'Borrowed',
  completed: 'Completed',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
  danger: 'Danger',
};

/**
 * StatusBadge component for displaying status with consistent styling
 * Uses design tokens from globals.css for automatic dark mode support
 */
export function StatusBadge({ status, label, className = '', ...props }: StatusBadgeProps) {
  const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.pending;
  const displayLabel = label || STATUS_LABELS[status];

  return (
    <Badge className={`${statusClasses} ${className}`} {...props}>
      {displayLabel}
    </Badge>
  );
}
