/**
 * Status color constants for consistent styling across the application
 * These map to CSS variables defined in globals.css
 */

export const STATUS_STYLES = {
  pending: {
    badge: 'bg-status-pending text-status-pending-foreground',
    bg: 'bg-status-pending-bg',
    text: 'text-status-pending',
    border: 'border-status-pending',
  },
  approved: {
    badge: 'bg-status-approved text-status-approved-foreground',
    bg: 'bg-status-approved-bg',
    text: 'text-status-approved',
    border: 'border-status-approved',
  },
  denied: {
    badge: 'bg-status-denied text-status-denied-foreground',
    bg: 'bg-status-denied-bg',
    text: 'text-status-denied',
    border: 'border-status-denied',
  },
  borrowed: {
    badge: 'bg-status-borrowed text-status-borrowed-foreground',
    bg: 'bg-status-borrowed-bg',
    text: 'text-status-borrowed',
    border: 'border-status-borrowed',
  },
  completed: {
    badge: 'bg-status-completed text-status-completed-foreground',
    bg: 'bg-status-completed-bg',
    text: 'text-status-completed',
    border: 'border-status-completed',
  },
} as const;

export type StatusType = keyof typeof STATUS_STYLES;

/**
 * Get badge classes for a given status
 */
export function getStatusBadgeClasses(status: StatusType): string {
  return STATUS_STYLES[status]?.badge || STATUS_STYLES.pending.badge;
}

/**
 * Get background classes for a given status
 */
export function getStatusBgClasses(status: StatusType): string {
  return STATUS_STYLES[status]?.bg || STATUS_STYLES.pending.bg;
}

/**
 * Get text color classes for a given status
 */
export function getStatusTextClasses(status: StatusType): string {
  return STATUS_STYLES[status]?.text || STATUS_STYLES.pending.text;
}

/**
 * Get border color classes for a given status
 */
export function getStatusBorderClasses(status: StatusType): string {
  return STATUS_STYLES[status]?.border || STATUS_STYLES.pending.border;
}

/**
 * Status display labels
 */
export const STATUS_LABELS: Record<StatusType, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  borrowed: 'Borrowed',
  completed: 'Completed',
} as const;

/**
 * Get display label for a given status
 */
export function getStatusLabel(status: StatusType): string {
  return STATUS_LABELS[status] || status;
}
