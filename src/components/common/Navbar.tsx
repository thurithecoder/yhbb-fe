// import * as React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { User, LogOut, LayoutDashboard, ShieldCheck, Heart, ChevronDown, Store, Globe, Ticket } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import AuthModal from './AuthModal';
// import { useAuth } from '@/hooks/useAuth';
// import { getHomeRouteForRole, isTokenExpired } from '@/lib/auth';
// import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
// import { logout } from '@/features/auth/services';

// export default function Navbar() {
//   const navigate = useNavigate();
//   const { t, i18n } = useTranslation();
//   const { user, token, isHydrated, clearSession } = useAuth();
//   const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

//   React.useEffect(() => {
//     if (isHydrated && token && isTokenExpired(token)) {
//       clearSession();
//     }
//   }, [clearSession, isHydrated, token]);

//   const toggleLanguage = () => {
//     const newLang = i18n.language === 'en' ? 'ar' : 'en';
//     i18n.changeLanguage(newLang);
//   };

//   const handleLogout = async () => {
//     const confirmed = await confirmAction({
//       title: 'Log out?',
//       text: 'Your current session will be ended.',
//       confirmButtonText: 'Log out',
//     });

//     if (!confirmed) return;

//     try {
//       const result = await logout();
//       await showSuccessAlert(result?.msg || 'Logged out successfully.');
//       navigate('/');
//     } catch (error) {
//       await showErrorAlert(error, 'Unable to log out');
//     }
//   };

//   const dashboardRoute = getHomeRouteForRole(user?.role);

//   return (
//     <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
//       <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
//         <Link to="/" className="flex items-center gap-2 group shrink-0">
//           <div className="bg-[#6EA15C] w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform shadow-lg shadow-green-100">
//             ✦
//           </div>
//           <span className="text-xl font-black tracking-tighter text-neutral-900">Yalla Habibi</span>
//         </Link>

//         <div className="hidden lg:flex items-center gap-8">
//           {[
//             { label: t('nav.home'), path: '/' },
//             { label: t('nav.listing'), path: '/restaurants' },
//             { label: t('nav.blog'), path: '/blog' },
//             { label: t('nav.contact'), path: '/contact' },
//           ].map((link) => (
//             <Link
//               key={link.label}
//               to={link.path}
//               className="text-sm font-bold text-neutral-500 hover:text-[#6EA15C] transition-colors flex items-center gap-1"
//             >
//               {link.label}
//               {link.path !== '/blog' && link.path !== '/contact' && <ChevronDown className="w-3 h-3" />}
//             </Link>
//           ))}
//         </div>

//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={toggleLanguage}
//               className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-500 hover:border-[#6EA15C] hover:text-[#6EA15C] transition-all"
//             >
//               <Globe className="w-4 h-4" />
//               {i18n.language === 'en' ? 'العربية' : 'English'}
//             </button>
//             <Link to="/favorites" className="p-2 text-neutral-400 hover:text-[#6EA15C] transition-colors">
//               <Heart className="w-5 h-5" />
//             </Link>
//           </div>

//           <div className="flex items-center gap-4 border-l pl-6 border-neutral-200 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
//             {user ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger>
//                   <div className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-[#6EA15C]/20 transition-all cursor-pointer">
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage src={user.photoURL} alt={user.displayName} />
//                       <AvatarFallback className="bg-green-50 text-[#6EA15C] font-bold">{user.displayName?.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                   </div>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-neutral-100 bg-white">
//                   <div className="flex items-center gap-3 p-3 mb-2 bg-green-50 rounded-xl">
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage src={user.photoURL} />
//                       <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                     <div className="flex flex-col space-y-0.5 leading-none">
//                       <p className="font-bold text-[#333]">{user.displayName}</p>
//                       <p className="text-xs text-neutral-500 truncate">{user.email}</p>
//                     </div>
//                   </div>

//                   <DropdownMenuItem className="p-0">
//                     <Link to="/profile" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
//                       <User className="w-4 h-4" /> {t('nav.profile')}
//                     </Link>
//                   </DropdownMenuItem>

//                   <DropdownMenuItem className="p-0">
//                     <Link to={dashboardRoute} className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
//                       <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
//                     </Link>
//                   </DropdownMenuItem>

//                   {user.role === 'user' && (
//                     <DropdownMenuItem className="p-0">
//                       <Link to="/vouchers" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
//                         <Ticket className="w-4 h-4" /> {t('nav.vouchers', 'Vouchers')}
//                       </Link>
//                     </DropdownMenuItem>
//                   )}

//                   {user.role === 'admin' && (
//                     <DropdownMenuItem className="p-0">
//                       <Link to="/admin" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
//                         <ShieldCheck className="w-4 h-4" /> {t('nav.admin')}
//                       </Link>
//                     </DropdownMenuItem>
//                   )}

//                   {user.role === 'restaurant' && (
//                     <DropdownMenuItem className="p-0">
//                       <Link to="/restaurant-panel" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
//                         <Store className="w-4 h-4" /> {t('nav.restaurant_panel')}
//                       </Link>
//                     </DropdownMenuItem>
//                   )}

//                   <hr className="my-2 border-neutral-100" />
//                   <DropdownMenuItem
//                     className="text-red-600 cursor-pointer flex items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-red-50"
//                     onClick={handleLogout}
//                   >
//                     <LogOut className="w-4 h-4" /> {t('nav.logout')}
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <Button
//                 onClick={() => setIsAuthModalOpen(true)}
//                 className="bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-xl font-black uppercase tracking-wide transition-all"
//               >
//                 {t('nav.login', 'Login')}
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>

//       <AuthModal
//         isOpen={isAuthModalOpen}
//         onClose={() => setIsAuthModalOpen(false)}
//       />
//     </nav>
//   );
// }
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, LayoutDashboard, ShieldCheck, Heart, ChevronDown, Store, Globe, Ticket } from 'lucide-react';
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

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, token, isHydrated, clearSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (isHydrated && token && isTokenExpired(token)) {
      clearSession();
    }
  }, [clearSession, isHydrated, token]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-[#6EA15C] w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform shadow-lg shadow-green-100">
            ✦
          </div>
          <span className="text-xl font-black tracking-tighter text-neutral-900">Yalla Habibi</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {[
            { label: t('nav.home'), path: '/' },
            { label: t('nav.listing'), path: '/restaurants' },
            { label: t('nav.blog'), path: '/blog' },
            { label: t('nav.contact'), path: '/contact' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-sm font-bold text-neutral-500 hover:text-[#6EA15C] transition-colors flex items-center gap-1"
            >
              {link.label}
              {link.path !== '/blog' && link.path !== '/contact' && <ChevronDown className="w-3 h-3" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-bold text-neutral-500 hover:border-[#6EA15C] hover:text-[#6EA15C] transition-all"
            >
              <Globe className="w-4 h-4" />
              {i18n.language === 'en' ? 'العربية' : 'English'}
            </button>
            <Link to="/favorites" className="p-2 text-neutral-400 hover:text-[#6EA15C] transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center gap-4 border-l pl-6 border-neutral-200 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-[#6EA15C]/20 transition-all cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="bg-green-50 text-[#6EA15C] font-bold">{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-neutral-100 bg-white">
                  <div className="flex items-center gap-3 p-3 mb-2 bg-green-50 rounded-xl">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-bold text-[#333]">{user.displayName}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* My Profile – always visible */}
                  <DropdownMenuItem className="p-0">
                    <Link to="/profile" className="flex w-full items-center gap-3 p-2.5 font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                      <User className="w-4 h-4" /> {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>

                  {/* Role‑specific links */}
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
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-xl font-black uppercase tracking-wide transition-all"
              >
                {t('nav.login', 'Login')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}