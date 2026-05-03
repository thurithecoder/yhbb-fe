import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, LayoutDashboard, ShieldCheck, Heart, ChevronDown, Store, Globe, Ticket, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthModal from './AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { isTokenExpired } from '@/lib/auth';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { logout } from '@/features/auth/services';

// Import your logo files from assets
import Logo from '@/assets/images/secondarylogo.jpeg';

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, token, isHydrated, clearSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.listing'), path: '/restaurants' },
    { label: t('nav.blog'), path: '/blog' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  React.useEffect(() => {
    if (isHydrated && token && isTokenExpired(token)) {
      clearSession();
    }
  }, [clearSession, isHydrated, token]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const openAuthModal = () => {
    setIsMobileMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Log out?',
      text: 'Your current session will be ended.',
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

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: '#ffcf1c',
        borderBottom: scrolled ? '2px solid #070605' : '2px solid transparent',
        boxShadow: scrolled ? '0 4px 24px rgba(7,6,5,0.10)' : 'none',
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 min-w-0">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          {/* Option A: Use the actual logo image (uncomment when image is in assets) */}
          {<img
            src={Logo}
            alt="Yalla Habibi"
            className="h-9 sm:h-12 w-auto max-w-[132px] sm:max-w-none object-contain group-hover:scale-105 transition-transform duration-200"
          />}

          {/* Option B: Text logo matching brand style
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg group-hover:rotate-6 transition-transform duration-200"
              style={{ background: '#070605', color: '#ffcf1c' }}
            >
              يل
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tight" style={{ color: '#070605' }}>
                YallaHabibi
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#070605', opacity: 0.6 }}>
                .my
              </span>
            </div>
          </div> */}
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-sm font-bold transition-all duration-150 flex items-center gap-1 px-1 py-0.5 rounded hover:opacity-70"
              style={{ color: '#070605' }}
            >
              {link.label}
              {link.path !== '/blog' && link.path !== '/contact' && (
                <ChevronDown className="w-3 h-3" style={{ color: '#070605' }} />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center justify-end gap-1.5 sm:gap-3 lg:gap-4 min-w-0">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 shrink-0"
            style={{
              border: '2px solid #070605',
              color: '#070605',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#070605';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffcf1c';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#070605';
            }}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Favorites */}
          <Link
            to="/favorites"
            className="p-2 rounded-lg transition-all duration-150 shrink-0"
            style={{ color: '#070605' }}
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Auth */}
          <div
            className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 min-w-0"
            style={{ borderLeft: '2px solid rgba(7,6,5,0.2)' }}
          >
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div
                    className="relative h-10 w-10 rounded-full cursor-pointer transition-all"
                    style={{ border: '2px solid #070605' }}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback
                        className="font-black text-sm"
                        style={{ background: '#070605', color: '#ffcf1c' }}
                      >
                        {user.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2 rounded-2xl shadow-2xl border-2 bg-white"
                  style={{ borderColor: '#ffcf1c' }}
                >
                  {/* User info header */}
                  <div
                    className="flex items-center gap-3 p-3 mb-2 rounded-xl"
                    style={{ background: '#ffcf1c' }}
                  >
                    <Avatar className="h-10 w-10" style={{ border: '2px solid #070605' }}>
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback style={{ background: '#070605', color: '#ffcf1c' }}>
                        {user.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-black text-sm" style={{ color: '#070605' }}>{user.displayName}</p>
                      <p className="text-xs truncate" style={{ color: '#070605', opacity: 0.6 }}>{user.email}</p>
                    </div>
                  </div>

                  <DropdownMenuItem className="p-0">
                    <Link to="/profile" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                      <User className="w-4 h-4" /> {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'user' && (
                    <>
                      <DropdownMenuItem className="p-0">
                        <Link to="/dashboard" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard', 'Dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        <Link to="/vouchers" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                          <Ticket className="w-4 h-4" /> {t('nav.vouchers', 'Vouchers')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <DropdownMenuItem className="p-0">
                      <Link to="/admin" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                        <ShieldCheck className="w-4 h-4" /> {t('nav.admin', 'Admin Panel')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.role === 'restaurant' && (
                    <DropdownMenuItem className="p-0">
                      <Link to="/restaurant-panel" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                        <Store className="w-4 h-4" /> {t('nav.restaurant_panel', 'Restaurant Panel')}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <hr className="my-2 border-neutral-100" />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer flex items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={openAuthModal}
                className="h-9 sm:h-10 px-3 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wide sm:tracking-widest rounded-xl transition-all duration-200 border-2 shrink-0"
                style={{
                  background: '#070605',
                  color: '#ffcf1c',
                  borderColor: '#070605',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ffcf1c';
                  (e.currentTarget as HTMLButtonElement).style.color = '#070605';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#070605';
                  (e.currentTarget as HTMLButtonElement).style.color = '#ffcf1c';
                }}
              >
                {t('nav.login', 'Login')}
              </Button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#070605] bg-[#070605] text-[#ffcf1c] transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full z-50 border-t-2 border-[#070605] bg-[#ffcf1c] shadow-2xl">
          <div className="container mx-auto px-3 py-4">
            <div className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl border-2 border-[#070605]/15 bg-white/35 px-4 py-3 text-sm font-black uppercase tracking-wide text-[#070605]"
                >
                  {link.label}
                  {link.path !== '/blog' && link.path !== '/contact' && <ChevronDown className="h-4 w-4" />}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-2 border-t-2 border-[#070605]/15 pt-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center justify-between rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {i18n.language === 'en' ? 'العربية' : 'English'}
                </span>
              </button>

              <Link
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
              >
                <Heart className="h-4 w-4" />
                Favorites
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
                  >
                    <User className="h-4 w-4" />
                    {t('nav.profile')}
                  </Link>

                  {user.role === 'user' && (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.dashboard', 'Dashboard')}
                      </Link>
                      <Link
                        to="/vouchers"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
                      >
                        <Ticket className="h-4 w-4" />
                        {t('nav.vouchers', 'Vouchers')}
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t('nav.admin', 'Admin Panel')}
                    </Link>
                  )}

                  {user.role === 'restaurant' && (
                    <Link
                      to="/restaurant-panel"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#070605] px-4 py-3 text-sm font-black text-[#070605]"
                    >
                      <Store className="h-4 w-4" />
                      {t('nav.restaurant_panel', 'Restaurant Panel')}
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 rounded-xl border-2 border-red-600 px-4 py-3 text-sm font-black text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Button
                  onClick={openAuthModal}
                  className="h-12 rounded-xl border-2 border-[#070605] bg-[#070605] text-sm font-black uppercase tracking-widest text-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605]"
                >
                  {t('nav.login', 'Login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}
