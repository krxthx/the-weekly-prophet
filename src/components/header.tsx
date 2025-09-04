'use client';

interface HeaderProps {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
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
                </nav>
                <div className="w-px h-4 bg-border"></div>
              </>
            )}
            
            <button className="btn btn-outline text-sm">
              Sign out
            </button>
          </div>
          
        </div>
      </div>
    </header>
  );
}
