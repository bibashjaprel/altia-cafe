import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Utensils,
  Users,
  ShoppingCart,
  CreditCard,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tables', label: 'Tables', icon: Utensils },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/payments', label: 'Payments', icon: CreditCard },
    { href: '/menu', label: 'Menu', icon: Utensils },
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all font-medium ${active
                        ? 'bg-blue-600 text-white shadow-lg border-b-4 border-blue-800'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                <Users size={16} />
                {user.full_name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 flex items-center gap-2 font-semibold shadow-lg transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
