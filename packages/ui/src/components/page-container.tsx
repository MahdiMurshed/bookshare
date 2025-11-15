import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'page';
  className?: string;
  noPadding?: boolean;
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1536px]',
  page: 'max-w-[1280px]',
};

/**
 * PageContainer component for consistent page layout and max-width
 * Centers content and applies consistent padding
 */
export function PageContainer({
  children,
  maxWidth = 'page',
  className = '',
  noPadding = false,
}: PageContainerProps) {
  const paddingClasses = noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-6';

  return (
    <div className={`${MAX_WIDTH_CLASSES[maxWidth]} mx-auto ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}
