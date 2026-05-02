import * as React from 'react';
import { BarChart2, Ticket, Users, CheckCircle2, Clock, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPromotionScanHistory } from '@/features/restaurants/services';
import { showErrorAlert } from '@/lib/alerts';
import type { Promotion, PromotionClaim } from '@/types';
import { formatDate, formatPromotionDiscount } from '@/utils';

export default function RestaurantPromotionTrackingPage() {
  const [loading, setLoading] = React.useState(true);
  const [history, setHistory] = React.useState<PromotionClaim[]>([]);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [selectedPromoId, setSelectedPromoId] = React.useState<string>('');

  const load = React.useCallback(async (promotionId?: string) => {
    try {
      setLoading(true);
      const data = await getPromotionScanHistory(promotionId);
      setHistory(data.history || []);
      setPromotions(data.promotions || []);
    } catch (error) {
      await showErrorAlert(error, 'Unable to load tracking data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPromoId(val);
    load(val || undefined);
  };

  const totalClaims = history.length;
  const usedClaims = history.filter((c) => c.status === 'used').length;
  const validClaims = history.filter((c) => c.status === 'valid').length;

  const promotionStats: Record<string, { promotion: Promotion; total: number; used: number; valid: number; expired: number }> = {};
  promotions.forEach((p) => {
    promotionStats[p.id] = { promotion: p, total: 0, used: 0, valid: 0, expired: 0 };
  });
  history.forEach((claim) => {
    if (promotionStats[claim.promotion_id]) {
      promotionStats[claim.promotion_id].total += 1;
      if (claim.status === 'used') promotionStats[claim.promotion_id].used += 1;
      if (claim.status === 'valid') promotionStats[claim.promotion_id].valid += 1;
      if (claim.status === 'expired') promotionStats[claim.promotion_id].expired += 1;
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Portal</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Promotion Tracking</h1>
        <p className="text-neutral-500 font-medium">Monitor voucher claims and redemptions across all your promotions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Ticket className="w-6 h-6 text-[#6EA15C]" />} label="Total Claims" value={totalClaims} />
        <StatCard icon={<CheckCircle2 className="w-6 h-6 text-green-500" />} label="Used" value={usedClaims} />
        <StatCard icon={<Clock className="w-6 h-6 text-amber-500" />} label="Valid" value={validClaims} />
      </div>

      {!loading && promotions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-800">By Promotion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => {
              const stats = promotionStats[p.id];
              const fillPct = p.max_uses_total
                ? Math.min(100, ((p.claim_stats?.total ?? 0) / p.max_uses_total) * 100)
                : null;
              return (
                <Card key={p.id} className="rounded-[24px] border-none shadow-sm bg-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-neutral-900 leading-tight">{p.title}</p>
                        {p.discount_percent && (
                          <p className="text-[#6EA15C] font-bold text-sm">
                            {formatPromotionDiscount(p.discount_type, p.discount_percent)}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="rounded-full text-xs border-green-200 text-green-600 bg-green-50 shrink-0">
                        {p.end_date ? `Ends ${formatDate(p.end_date)}` : 'No expiry'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-neutral-50 rounded-xl p-3">
                        <p className="text-xl font-black text-neutral-800">{stats?.total ?? 0}</p>
                        <p className="text-xs font-bold text-neutral-400 uppercase">Claims</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xl font-black text-green-600">{stats?.used ?? 0}</p>
                        <p className="text-xs font-bold text-green-400 uppercase">Used</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xl font-black text-amber-600">{stats?.valid ?? 0}</p>
                        <p className="text-xs font-bold text-amber-400 uppercase">Valid</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xl font-black text-red-600">{stats?.expired ?? 0}</p>
                        <p className="text-xs font-bold text-red-400 uppercase">Expired</p>
                      </div>
                    </div>

                    {p.max_uses_total != null && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
                          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{p.claim_stats?.total ?? 0} / {p.max_uses_total} claimed</span>
                          {p.max_uses_per_user && (
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.max_uses_per_user}x per user</span>
                          )}
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6EA15C] rounded-full transition-all"
                            style={{ width: `${fillPct ?? 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#6EA15C]" />
            Voucher Log
          </h2>
          {promotions.length > 1 && (
            <select
              value={selectedPromoId}
              onChange={handleFilterChange}
              className="text-sm font-bold border border-neutral-200 rounded-xl px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#6EA15C]"
            >
              <option value="">All Promotions</option>
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>

        {loading && (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#6EA15C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && history.length === 0 && (
          <p className="text-sm text-neutral-400 py-6">No voucher records yet.</p>
        )}

        {!loading && history.length > 0 && (
          <Card className="rounded-[24px] border-none shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 text-left">
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Promotion</th>
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Customer</th>
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Voucher Code</th>
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Status</th>
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Claimed</th>
                    <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {history.map((claim) => (
                    <tr key={claim.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-neutral-800">
                          {claim.tblpromotion?.title ?? 'N/A'}
                        </p>
                        {claim.tblpromotion?.discount_percent && (
                          <p className="text-xs text-[#6EA15C] font-bold">
                            {formatPromotionDiscount(claim.tblpromotion.discount_type, claim.tblpromotion.discount_percent)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {claim.tbllogin ? (
                          <div>
                            <p className="font-bold text-neutral-800">
                              {claim.tbllogin.firstname} {claim.tbllogin.lastname}
                            </p>
                            <p className="text-xs text-neutral-400">{claim.tbllogin.username}</p>
                          </div>
                        ) : (
                          <span className="text-neutral-400">{claim.claimed_by_name || 'N/A'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-500">{claim.voucher_code}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs">
                        {claim.createdAt ? formatDate(claim.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs">
                        {claim.used_at ? formatDate(claim.used_at) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-neutral-50 rounded-2xl">{icon}</div>
        <div>
          <p className="text-3xl font-black text-neutral-900">{value}</p>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'used') {
    return <Badge className="bg-green-100 text-green-700 border-none font-bold">Used</Badge>;
  }
  if (status === 'valid') {
    return <Badge className="bg-amber-100 text-amber-700 border-none font-bold">Valid</Badge>;
  }
  return <Badge className="bg-neutral-100 text-neutral-500 border-none font-bold">Expired</Badge>;
}
