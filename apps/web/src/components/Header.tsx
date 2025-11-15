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
import { useIsAdmin } from '../hooks/useAdminUser';
import { cn } from '@repo/ui/lib/utils';

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
        'sticky top-0 z-50 w-full transition-all duration-300',
        'backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60',
        scrolled
          ? 'border-b border-amber-500/20 shadow-lg shadow-amber-500/5'
          : 'border-b border-border/40'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
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
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                    'hover:bg-amber-50 dark:hover:bg-amber-950/20',
                    isActive
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-lg animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Button */}
            {user && isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium transition-all hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 active:scale-95"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex items-center gap-3 p-1 rounded-full hover:ring-2 hover:ring-amber-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur opacity-50" />
                      <Avatar className="relative w-9 h-9 border-2 border-white dark:border-gray-900 shadow-lg">
                        <AvatarImage src="" alt={user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 backdrop-blur-xl bg-background/95 border-amber-500/20 shadow-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-amber-500/10" />
                  <DropdownMenuItem className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20 focus:bg-amber-50 dark:focus:bg-amber-950/20">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20 focus:bg-amber-50 dark:focus:bg-amber-950/20">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-amber-500/10" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20"
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
                  <Button variant="ghost" size="sm" className="hover:bg-amber-50 dark:hover:bg-amber-950/20">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-xl hover:shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md backdrop-blur-xl bg-background/95 border-l border-amber-500/20"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-amber-500/20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg blur opacity-50" />
                      <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">
                      BookShare
                    </span>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2 py-6 flex-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                            'hover:bg-amber-50 dark:hover:bg-amber-950/20',
                            isActive
                              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-lg">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                          {isActive && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-600 rounded-r-full" />
                          )}
                        </Link>
                      );
                    })}

                    {/* Mobile Admin Link */}
                    {user && isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium transition-all hover:shadow-xl hover:shadow-amber-500/25"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-lg">Admin Dashboard</span>
                      </Link>
                    )}
                  </nav>

                  {/* Mobile User Section */}
                  {user ? (
                    <div className="pt-6 border-t border-amber-500/20">
                      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg mb-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur opacity-50" />
                          <Avatar className="relative w-10 h-10 border-2 border-white dark:border-gray-900 shadow-lg">
                            <AvatarImage src="" alt={user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">My Account</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-lg">Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-amber-500/20 flex flex-col gap-3">
                      <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3 hover:bg-amber-50 dark:hover:bg-amber-950/20">
                          <User className="w-5 h-5" />
                          <span className="text-lg">Sign In</span>
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full justify-start gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-xl hover:shadow-amber-500/25">
                          <User className="w-5 h-5" />
                          <span className="text-lg">Sign Up</span>
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

      {/* Gradient Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
    </header>
  );
}
