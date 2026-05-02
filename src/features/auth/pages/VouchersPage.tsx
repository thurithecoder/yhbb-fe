import * as React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle2, Clock3, CircleAlert, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getAllMyPromotionClaims } from '@/features/restaurants/services';
import { getFavorites } from '@/features/favorites/services';
import { formatPromotionDiscount, formatShortDate } from '@/utils';
import type { PromotionClaim } from '@/types';
import { showErrorAlert } from '@/lib/alerts';

export default function VouchersPage() {
  const { user } = useAuth();
  const { canAccess, isReady } = useRequireRole();
  const [couponClaims, setCouponClaims] = React.useState<PromotionClaim[]>([]);
  const [loadingCoupons, setLoadingCoupons] = React.useState(false);

  React.useEffect(() => {
    const loadVouchers = async () => {
      if (!user || user.role !== 'user') return;

      try {
        setLoadingCoupons(true);
        const claims = await getAllMyPromotionClaims();
        setCouponClaims(claims);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load vouchers');
      } finally {
        setLoadingCoupons(false);
      }
    };

    loadVouchers();
  }, [user]);

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading vouchers...</div>;
  }

  if (!canAccess || !user) {
    return null;
  }

  const validCoupons = couponClaims.filter((claim) => claim.status === 'valid').length;
  const usedCoupons = couponClaims.filter((claim) => claim.status === 'used').length;
  const expiredCoupons = couponClaims.filter((claim) => claim.status === 'expired').length;

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container px-4 mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="space-y-8">
            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8 text-center space-y-6">
              <Avatar className="h-32 w-32 mx-auto ring-4 ring-green-50 ring-offset-4">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback className="text-4xl font-black bg-green-50 text-[#6EA15C]">{user.displayName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight uppercase text-[#6EA15C]">{user.displayName}</h2>
                <p className="text-neutral-400 font-medium text-sm">{user.email}</p>
              </div>
              <Badge className="bg-green-50 text-[#6EA15C] border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                {user.role}
              </Badge>
            </Card>

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Quick Links</p>
                <h3 className="text-xl font-black tracking-tight text-neutral-900">Go Further</h3>
              </div>
              <div className="space-y-3">
                <Link to="/profile" className="block rounded-2xl border border-neutral-100 p-4 hover:border-[#6EA15C] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#6EA15C] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900">My Profile</p>
                      <p className="text-sm text-neutral-500">View and edit your account</p>
                    </div>
                  </div>
                </Link>
                <Link to="/dashboard" className="block rounded-2xl border border-neutral-100 p-4 hover:border-[#6EA15C] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-[#6EA15C] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-neutral-900">Dashboard</p>
                      <p className="text-sm text-neutral-500">View your favorites and stats</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard label="My Vouchers" value={loadingCoupons ? '...' : couponClaims.length} icon={Ticket} />
              <StatCard label="Valid" value={loadingCoupons ? '...' : validCoupons} icon={CheckCircle2} />
              <StatCard label="Used" value={loadingCoupons ? '...' : usedCoupons} icon={Clock3} />
              <StatCard label="Expired" value={loadingCoupons ? '...' : expiredCoupons} icon={CircleAlert} />
            </div>

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
              <CardContent className="p-0 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">My Coupons</p>
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
      <div className="bg-green-50 p-4 rounded-2xl">
        <Icon className="w-8 h-8 text-[#6EA15C]" />
      </div>
      <div>
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-[#6EA15C]">{value}</p>
      </div>
    </Card>
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
        <p className="mt-2 font-mono text-lg font-black text-[#6EA15C] break-all">{claim.voucher_code}</p>
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

  return <Badge className="bg-green-100 text-[#6EA15C] border-none px-3 py-1 rounded-full font-black uppercase">Valid</Badge>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium text-neutral-600">{label}:</span>
      <span className="font-black text-neutral-900">{value}</span>
    </div>
  );
}
