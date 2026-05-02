import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Settings, LogOut, Store, BadgePercent, Megaphone, ShieldCheck, ScanLine, BarChart2, Image } from 'lucide-react';
import { cn } from '@/utils';
import { useRequireRole } from '@/hooks/useRequireRole';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { logout } from '@/features/auth/services';

export default function RestaurantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess, isReady } = useRequireRole(['restaurant']);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/restaurant-panel' },
    { icon: Settings, label: 'Edit Profile', path: '/restaurant-panel/profile' },
    { icon: BadgePercent, label: 'Promotions', path: '/restaurant-panel/promotions' },
    { icon: ScanLine, label: 'Scan Coupon', path: '/restaurant-panel/promotions/scanner' },
    { icon: Image, label: 'Gallery', path: '/restaurant-panel/images' },
    { icon: BarChart2, label: 'Coupon Tracking', path: '/restaurant-panel/promotions/tracking' },
    { icon: Utensils, label: 'Menu Items', path: '/restaurant-panel/menu-requests' },
    { icon: Megaphone, label: 'Campaign', path: '/restaurant-panel/campaign-requests' },
    { icon: ShieldCheck, label: 'Verification', path: '/restaurant-panel/verification' },
  ];

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Log out?',
      text: 'Your restaurant session will be ended.',
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
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading restaurant panel...</div>;
  }

  if (!canAccess) {
    return null;
  }

  return (
    <>
      <aside className="w-72 h-screen fixed top-0 left-0 bg-white border-r flex flex-col z-20">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-[#6EA15C] p-2 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-400">Yalla Habibi</p>
              <span className="text-xl font-bold tracking-tight text-[#6EA15C]">Restaurant Hub</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                location.pathname === item.path
                  ? "bg-[#6EA15C] text-white shadow-lg shadow-green-100"
                  : "text-[#6EA15C] hover:bg-green-50"
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

      <main className="ml-72 p-8 min-h-screen bg-[#f7f7f2] overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
}
