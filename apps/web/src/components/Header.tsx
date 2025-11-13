import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@repo/ui/components/button';
import { BookOpen, LogOut, User } from '@repo/ui/components/icons';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '@repo/api-client';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">BookShare</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/my-library"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  My Library
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
