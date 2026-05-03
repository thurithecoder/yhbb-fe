import * as React from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, KeyRound, ShieldCheck, Store, Compass, Ticket, CheckCircle2, Clock3, CircleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { changePassword } from '@/features/auth/services';
import { getFavorites } from '@/features/favorites/services';
import { getAllMyPromotionClaims } from '@/features/restaurants/services';
import ProfileIdentityCard from '@/features/auth/components/ProfileIdentityCard';
import { getHomeRouteForRole } from '@/lib/auth';
import { showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { PromotionClaim } from '@/types';
import { formatPromotionDiscount } from '@/utils';

const emptyPasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { canAccess, isReady } = useRequireRole();
  const [favoriteCounts, setFavoriteCounts] = React.useState({ restaurants: 0, menuItems: 0 });
  const [loadingFavorites, setLoadingFavorites] = React.useState(false);
  const [couponClaims, setCouponClaims] = React.useState<PromotionClaim[]>([]);
  const [loadingCoupons, setLoadingCoupons] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState(emptyPasswordForm);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || user.role !== 'user') return;

      try {
        setLoadingFavorites(true);
        setLoadingCoupons(true);
        const [data, claims] = await Promise.all([
          getFavorites(),
          getAllMyPromotionClaims(),
        ]);
        const mergedMenuItems = data.menuItems?.length ? data.menuItems : [...(data.meals || []), ...(data.drinks || [])];
        setFavoriteCounts({
          restaurants: data.restaurants.length,
          menuItems: mergedMenuItems.length,
        });
        setCouponClaims(claims);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load dashboard data');
      } finally {
        setLoadingFavorites(false);
        setLoadingCoupons(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await changePassword(passwordForm);
      await showSuccessAlert(result.msg || 'Password updated successfully.');
      setPasswordForm(emptyPasswordForm);
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading dashboard...</div>;
  }

  if (!canAccess || !user) {
    return null;
  }

  const actionCards = [
    {
      label: 'Explore Restaurants',
      description: 'Browse the public restaurant pages backed by the API.',
      href: '/restaurants',
      icon: Compass,
    },
    {
      label: 'Favorites',
      description: user.role === 'user' ? 'Review your saved restaurants and menu items.' : 'Favorites are available from user accounts.',
      href: '/favorites',
      icon: Heart,
    },
    {
      label: user.role === 'admin' ? 'Admin Panel' : user.role === 'restaurant' ? 'Restaurant Panel' : 'My Panel',
      description: 'Open the dashboard that matches your backend role.',
      href: getHomeRouteForRole(user.role),
      icon: user.role === 'admin' ? ShieldCheck : user.role === 'restaurant' ? Store : User,
    },
  ];

  const validCoupons = couponClaims.filter((claim) => claim.status === 'valid').length;
  const usedCoupons = couponClaims.filter((claim) => claim.status === 'used').length;
  const expiredCoupons = couponClaims.filter((claim) => claim.status === 'expired').length;

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container px-4 mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="space-y-8">
            <ProfileIdentityCard user={user} />

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Quick Links</p>
                <h3 className="text-xl font-black tracking-tight text-neutral-900">Go Further</h3>
              </div>
              <div className="space-y-3">
                {actionCards.map((card) => (
                  <Link key={card.label} to={card.href} className="block rounded-2xl border border-neutral-100 p-4 hover:border-[#ffcf1c] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF9DC] text-[#ffcf1c] flex items-center justify-center">
                        <card.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-neutral-900">{card.label}</p>
                        <p className="text-sm text-neutral-500">{card.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="First Name" value={user.firstname || 'Not set'} icon={User} />
              <StatCard label="Last Name" value={user.lastname || 'Not set'} icon={User} />
              <StatCard label="Role" value={user.role} icon={user.role === 'admin' ? ShieldCheck : user.role === 'restaurant' ? Store : Heart} />
            </div>

            {user.role === 'user' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard label="Favorite Restaurants" value={loadingFavorites ? '...' : favoriteCounts.restaurants} icon={Heart} />
                  <StatCard label="Favorite Menu Items" value={loadingFavorites ? '...' : favoriteCounts.menuItems} icon={Heart} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="My Coupons" value={loadingCoupons ? '...' : couponClaims.length} icon={Ticket} />
                  <StatCard label="Valid" value={loadingCoupons ? '...' : validCoupons} icon={CheckCircle2} />
                  <StatCard label="Used" value={loadingCoupons ? '...' : usedCoupons} icon={Clock3} />
                  <StatCard label="Expired" value={loadingCoupons ? '...' : expiredCoupons} icon={CircleAlert} />
                </div>

                <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
                  <CardContent className="p-0 space-y-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">My Coupons</p>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Claimed Vouchers</h3>
                    </div>

                    {loadingCoupons ? (
                      <p className="text-sm font-medium text-neutral-400">Loading your vouchers...</p>
                    ) : couponClaims.length === 0 ? (
                      <p className="text-sm font-medium text-neutral-400">Claim a restaurant promotion and the voucher code will appear here.</p>
                    ) : (
                      <div className="space-y-4">
                        {couponClaims.map((claim) => (
                          <CouponRow key={claim.id} claim={claim} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
              <CardContent className="p-0 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Security</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Change Password</h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <FormInput label="Old Password" type="password" value={passwordForm.oldPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, oldPassword: value }))} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="New Password" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} />
                    <FormInput label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-xl font-black uppercase tracking-wide">
                    <KeyRound className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-none shadow-sm rounded-[32px] bg-white p-8 flex items-center gap-6">
      <div className="bg-[#FFF9DC] p-4 rounded-2xl">
        <Icon className="w-8 h-8 text-[#ffcf1c]" />
      </div>
      <div>
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-[#ffcf1c]">{value}</p>
      </div>
    </Card>
  );
}

function FormInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Input type={type} placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function CouponRow({ claim }: { claim: PromotionClaim }) {
  const restaurantName = claim.tblpromotion?.tblrestaurant?.name || 'Restaurant';
  const promotionTitle = claim.tblpromotion?.title || 'Promotion';
  const discountLabel = formatPromotionDiscount(claim.tblpromotion?.discount_type, claim.tblpromotion?.discount_percent);

  return (
    <div className="rounded-[28px] border border-neutral-100 p-5 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{restaurantName}</p>
          <h4 className="text-lg font-black text-neutral-900">{promotionTitle}</h4>
        </div>
        <CouponStatusBadge status={claim.status} />
      </div>

      <div className="rounded-2xl bg-[#f7f7f2] p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Voucher Code</p>
        <p className="mt-2 font-mono text-lg font-black text-[#ffcf1c] break-all">{claim.voucher_code}</p>
      </div>

      {discountLabel && (
        <InfoLine label="Discount" value={discountLabel} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <InfoLine label="Claimed" value={claim.createdAt ? formatShortDate(claim.createdAt) : 'N/A'} />
        <InfoLine label="Redeemed" value={claim.used_at ? formatShortDate(claim.used_at) : 'N/A'} />
      </div>
    </div>
  );
}

function CouponStatusBadge({ status }: { status: PromotionClaim['status'] }) {
  if (status === 'used') {
    return <Badge className="bg-neutral-900 text-white border-none px-3 py-1 rounded-full font-black uppercase">Used</Badge>;
  }

  if (status === 'expired') {
    return <Badge className="bg-red-100 text-red-700 border-none px-3 py-1 rounded-full font-black uppercase">Expired</Badge>;
  }

  return <Badge className="bg-[#FFF9DC] text-[#070605] border-none px-3 py-1 rounded-full font-black uppercase">Valid</Badge>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-100 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
      <p className="mt-1 font-bold text-neutral-800">{value}</p>
    </div>
  );
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
