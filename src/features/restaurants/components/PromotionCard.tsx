import * as React from 'react';
import { Calendar, Hash, Loader2, LockKeyhole, Ticket, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Promotion } from '@/types';
import { formatDate, formatPromotionDiscount } from '@/utils';
import { showToast } from '@/lib/alerts';
import { useAppStore } from '@/app/store';
import { claimPromotion } from '@/features/restaurants/services';

interface PromotionCardProps {
  promotion: Promotion;
  showClaimButton?: boolean;
}

export default function PromotionCard({ promotion, showClaimButton = false }: PromotionCardProps) {
  const [claiming, setClaiming] = React.useState(false);
  const user = useAppStore((s) => s.user);

  const isPreview = promotion.id === 'preview';
  const totalClaimed = promotion.claim_stats?.total ?? 0;
  const isFull =
    promotion.max_uses_total != null &&
    totalClaimed >= promotion.max_uses_total;
  const discountLabel = formatPromotionDiscount(promotion.discount_type, promotion.discount_percent, { includeOff: false });

  const handleClaim = async () => {
    if (!user || isPreview) return;
    setClaiming(true);
    try {
      await claimPromotion(promotion.id);
      showToast('Voucher claimed. You can view the code in your profile.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to claim promotion.';
      showToast(message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden group">
      <div className="bg-[#ffcf1c] p-8 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="space-y-1">
            <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest">
              {isFull ? 'Fully Claimed' : 'Limited Time Offer'}
            </Badge>
            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">
              {discountLabel ?? 'SPECIAL'}{' '}
              <span className="text-[#FFF9DC]">OFFER</span>
            </h3>
          </div>
          <div className="bg-white/15 rounded-3xl px-4 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFF9DC]">Voucher</p>
            <p className="mt-1 text-sm font-bold text-white">Revealed after claim</p>
          </div>
        </div>

        <div className="mt-6 relative z-10">
          <p className="text-[#FFF9DC] font-bold text-lg">{promotion.title}</p>
          <p className="text-[#FFF9DC]/70 text-sm font-medium line-clamp-2">{promotion.description}</p>
        </div>

        {promotion.max_uses_total != null && (
          <div className="mt-4 relative z-10">
            <div className="flex items-center justify-between text-[#FFF9DC]/80 text-xs font-bold mb-1">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {totalClaimed} / {promotion.max_uses_total} vouchers claimed
              </span>
              {isFull && <span className="text-red-200">FULL</span>}
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (totalClaimed / promotion.max_uses_total) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-8 space-y-4">
        <div className="rounded-2xl border border-dashed border-[#FFF9DC] bg-[#FFF9DC]/60 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <LockKeyhole className="w-5 h-5 text-[#ffcf1c]" />
            </div>
            <div>
              <p className="font-black text-neutral-900">Voucher code stays hidden until claimed</p>
              <p className="text-sm text-neutral-500">Claim this offer first, then find the voucher code in your profile.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-bold text-neutral-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Expires: {formatDate(promotion.end_date)}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {promotion.max_uses_per_user != null && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Users className="w-3 h-3" />
                {promotion.max_uses_per_user}x per user
              </span>
            )}
            <Badge variant="outline" className="rounded-full border-[#FFF9DC] text-[#ffcf1c] bg-[#FFF9DC]">
              {isFull ? 'Fully Claimed' : promotion.end_date ? 'Scheduled' : 'Active now'}
            </Badge>
          </div>
        </div>

        {showClaimButton && !isPreview && (
          <div className="flex gap-2">
            {user ? (
              <Button
                onClick={handleClaim}
                disabled={claiming || isFull}
                className="flex-1 h-12 bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 disabled:opacity-50"
              >
                {claiming ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Claiming...</>
                ) : isFull ? 'Fully Claimed' : 'Claim Voucher'}
              </Button>
            ) : (
              <Button
                className="flex-1 h-12 bg-[#070605] hover:bg-[#ffcf1c] hover:text-[#070605] text-white rounded-2xl font-black uppercase tracking-tight"
                onClick={() => showToast('Sign in to claim this promotion.')}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Sign in to Claim
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
