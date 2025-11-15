import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader component for consistent page titles and descriptions
 * Supports optional icon and action buttons
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          {description && (
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
