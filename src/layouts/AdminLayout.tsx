import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Utensils, Megaphone, ShieldCheck, LogOut, BadgePercent, Settings, Store } from 'lucide-react';
import { cn } from '@/utils';
import { useRequireRole } from '@/hooks/useRequireRole';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { logout } from '@/features/auth/services';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess, isReady } = useRequireRole(['admin']);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Settings, label: 'Profile', path: '/admin/profile' },
    { icon: Store, label: 'Restaurants', path: '/admin/restaurants' },
    { icon: Utensils, label: 'Catalog', path: '/admin/catalog' },
    { icon: ClipboardList, label: 'Menu Requests', path: '/admin/menu-requests' },
    { icon: Megaphone, label: 'Campaign Requests', path: '/admin/campaign-requests' },
    { icon: BadgePercent, label: 'Promotions', path: '/admin/promotions' },
    { icon: ShieldCheck, label: 'Verification', path: '/admin/verification-applications' },
  ];

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Log out?',
      text: 'Your admin session will be ended.',
      confirmButtonText: 'Log out',
    });

    if (!confirmed) return;

    try {
      const result = await logout();
      await showSuccessAlert(result?.msg || 'Logged out successfully.');
      navigate('/');
    } catch (error) {
      await showErrorAlert(error, 'Unable to log out');
    }
  };

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading admin panel...</div>;
  }

  if (!canAccess) {
    return null;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="bg-[#ffcf1c] p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-400">Yalla Habibi</p>
              <span className="block truncate text-lg md:text-xl font-bold tracking-tight text-[#ffcf1c]">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-xl text-sm md:text-base font-bold transition-all",
                (item.path === '/admin' ? location.pathname === item.path : location.pathname.startsWith(item.path))
                  ? "bg-[#ffcf1c] text-white shadow-lg shadow-yellow-100"
                  : "text-[#ffcf1c] hover:bg-[#FFF9DC]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
