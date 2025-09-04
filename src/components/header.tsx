'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/lib/auth';

interface HeaderProps {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">📰</span>
            <h1 className="text-xl font-medium text-app">The Weekly Prophet</h1>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-4">
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
                    href="/weekly" 
                    className="text-sm text-muted hover:text-app transition-colors"
                  >
                    Weekly
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
                  <span className="text-sm text-muted">
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
          
        </div>
      </div>
    </header>
  );
}
