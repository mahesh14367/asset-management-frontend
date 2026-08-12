'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ThemeSwitcher } from '../../components/ui/theme-switcher';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { ErrorBoundary } from '../../components/ui/error-boundary';
import { ProtectedRoute } from '../../components/auth/protected-route';
import { authApi } from '../../api';
import { setAccessToken } from '../../lib/axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Handle responsive sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    // Initial check
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    setSidebarOpen(!mobile);

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('userData');
      router.push('/login');
    }
  };

  // Generate breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length <= 1) return [];
    
    return pathSegments.slice(1).map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 2).join('/');
      const isLast = index === pathSegments.length - 2;
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : href,
      };
    });
  }, [pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assets', href: '/dashboard/assets', icon: Package },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <h1 className="text-xl font-bold">Asset Manager</h1>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-border p-4">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="size-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen && !isMobile ? 'ml-64' : ''}`}>
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-accent rounded-lg px-2 py-1 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    JD
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground hidden sm:block" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-50">
                      <div className="p-2 space-y-1">
                        <Link
                          href="/dashboard/profile"
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Settings
                        </Link>
                        <hr className="border-border my-1" />
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <ErrorBoundary>
              <ProtectedRoute>
                <Breadcrumb items={breadcrumbs} />
                {children}
              </ProtectedRoute>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
