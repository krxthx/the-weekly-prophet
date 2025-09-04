'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/lib/auth';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await logout();
    
    if (!error) {
      router.push('/');
    } else {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-app bg-app/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">📰</span>
            <h1 className="text-lg sm:text-xl font-medium text-app">The Weekly Prophet</h1>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-muted hover:text-app"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {showNavigation && (
              <>
                <nav className="flex items-center gap-6">
                  <a 
                    href="/dashboard" 
                    className="text-sm text-muted hover:text-app transition-colors"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/calendar" 
                    className="text-sm text-muted hover:text-app transition-colors"
                  >
                    Calendar
                  </a>
                </nav>
                <div className="w-px h-4 bg-border"></div>
              </>
            )}
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm text-muted hidden sm:inline">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="btn btn-outline text-sm"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation & Actions */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-app border-b border-app py-4 px-6 md:hidden shadow-lg">
              {showNavigation && (
                <nav className="flex flex-col gap-4 mb-4">
                  <a 
                    href="/dashboard" 
                    className="text-sm text-muted hover:text-app transition-colors"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/calendar" 
                    className="text-sm text-muted hover:text-app transition-colors"
                  >
                    Calendar
                  </a>
                </nav>
              )}
              
              {user && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {user.photoURL && (
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-muted">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="btn btn-outline text-sm w-full"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
