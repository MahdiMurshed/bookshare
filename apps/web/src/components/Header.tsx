import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@repo/ui/components/button';
import {
  BookOpen,
  LogOut,
  User,
  Shield,
  Library,
  MessageCircle,
  FileCheck,
  Home,
  Search,
  Bell,
  Menu,
} from '@repo/ui/components/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@repo/ui/components/sheet';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '@repo/api-client';
import { useTotalUnreadCount } from '../hooks/useUnreadMessages';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import { useIsAdmin } from '../hooks/useAdminUser';
import { cn } from '@repo/ui/lib/utils';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: number;
  requiresAuth?: boolean;
}

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: unreadCount = 0 } = useTotalUnreadCount();
  const { data: unreadNotificationCount = 0 } = useUnreadNotificationCount();
  const { isAdmin } = useIsAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse', href: '/browse', icon: Search },
    ...(user
      ? [
          { label: 'My Library', href: '/my-library', icon: Library, requiresAuth: true },
          { label: 'Requests', href: '/requests', icon: FileCheck, requiresAuth: true },
          {
            label: 'Chats',
            href: '/chats',
            icon: MessageCircle,
            badge: unreadCount,
            requiresAuth: true,
          },
        ]
      : []),
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background transition-shadow duration-200',
        'border-b-2 border-border',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            <BookOpen className="w-6 h-6 text-primary transition-transform group-hover:scale-105" />
            <span className="text-xl font-semibold text-foreground">
              BookShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications Bell */}
            {user && (
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Admin Button */}
            {user && isAdmin && (
              <Link to="/admin" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                    <Avatar className="w-8 h-8 border-2 border-border transition-colors hover:border-primary">
                      <AvatarImage src="" alt={user.email} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md border-l-2">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between gap-2.5 pb-6 border-b-2 border-border">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-6 h-6 text-primary" />
                      <span className="text-xl font-semibold text-foreground">
                        BookShare
                      </span>
                    </div>
                    <ThemeToggle />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-1 py-6 flex-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                            isActive
                              ? 'text-primary font-semibold bg-muted'
                              : 'text-muted-foreground hover:text-primary hover:bg-muted'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-primary-foreground bg-primary rounded-full">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {/* Mobile Notifications Link */}
                    {user && (
                      <Link
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-2',
                          isActiveRoute('/notifications')
                            ? 'text-primary font-semibold bg-muted'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        )}
                      >
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                        {unreadNotificationCount > 0 && (
                          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-primary-foreground bg-primary rounded-full">
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Mobile Profile Link */}
                    {user && (
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mt-2',
                          isActiveRoute('/profile')
                            ? 'text-primary font-semibold bg-muted'
                            : 'text-muted-foreground hover:text-primary hover:bg-muted'
                        )}
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                    )}

                    {/* Mobile Admin Link */}
                    {user && isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="mt-2"
                      >
                        <Button variant="outline" className="w-full justify-start gap-3">
                          <Shield className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Button>
                      </Link>
                    )}
                  </nav>

                  {/* Mobile User Section */}
                  {user ? (
                    <div className="pt-6 border-t-2 border-border">
                      <div className="flex items-center gap-3 px-3 py-3 bg-muted rounded-md mb-3">
                        <Avatar className="w-9 h-9 border-2 border-border">
                          <AvatarImage src="" alt={user.email} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">My Account</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-6 border-t-2 border-border flex flex-col gap-2">
                      <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3">
                          <User className="w-5 h-5" />
                          <span>Sign In</span>
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full justify-start gap-3">
                          <User className="w-5 h-5" />
                          <span>Sign Up</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
