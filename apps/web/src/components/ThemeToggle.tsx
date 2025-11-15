import { Moon, Sun } from '@repo/ui/components/icons';
import { Button } from '@repo/ui/components/button';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@repo/ui/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full p-0 hover:bg-muted transition-colors duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative h-5 w-5">
        {/* Sun Icon - Visible in Light Mode */}
        <Sun
          className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
        />

        {/* Moon Icon - Visible in Dark Mode */}
        <Moon
          className={cn(
            'absolute inset-0 h-5 w-5 transition-all duration-300',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </Button>
  );
}
