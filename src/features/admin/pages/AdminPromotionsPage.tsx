import * as React from 'react';
import { BadgePercent, Hash, Users, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminPromotions } from '@/features/admin/services';
import { showErrorAlert } from '@/lib/alerts';
import type { Promotion, PromotionClaim } from '@/types';
import { formatDate, formatPromotionDiscount } from '@/utils';

export default function AdminPromotionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [claims, setClaims] = React.useState<PromotionClaim[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminPromotions();
        setPromotions(data.promotions);
        setClaims(data.claims);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load promotions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizedSearch = search.toLowerCase();
  const filteredPromotions = React.useMemo(() => {
    if (!normalizedSearch) return promotions;
    return promotions.filter(
      (p) =>
        p.title.toLowerCase().includes(normalizedSearch) ||
        (p.tblrestaurant?.name ?? '').toLowerCase().includes(normalizedSearch)
    );
  }, [promotions, normalizedSearch]);

  const filteredClaims = React.useMemo(() => {
    if (!normalizedSearch) return claims;
    return claims.filter((claim) => {
      const customerName = claim.claimed_by_name || `${claim.tbllogin?.firstname || ''} ${claim.tbllogin?.lastname || ''}`.trim();
      return [
        claim.voucher_code,
        claim.tblpromotion?.title,
        claim.tblpromotion?.tblrestaurant?.name,
        customerName,
        claim.tbllogin?.username,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [claims, normalizedSearch]);

  const totalClaims = promotions.reduce((sum, p) => sum + (p.claim_stats?.total ?? 0), 0);
  const totalUsed = promotions.reduce((sum, p) => sum + (p.claim_stats?.used ?? 0), 0);
  const totalValid = promotions.reduce((sum, p) => sum + (p.claim_stats?.valid ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Admin Panel</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Promotions</h1>
        <p className="text-neutral-500 font-medium">System-wide view of all restaurant promotions and voucher usage.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard icon={<BadgePercent className="w-5 h-5 text-[#ffcf1c]" />} label="Total Promotions" value={promotions.length} />
        <AdminStatCard icon={<Hash className="w-5 h-5 text-blue-500" />} label="Total Claims" value={totalClaims} />
        <AdminStatCard icon={<CheckCircle2 className="w-5 h-5 text-[#FFF9DC]0" />} label="Used" value={totalUsed} />
        <AdminStatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Valid" value={totalValid} />
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by promotion, restaurant, customer, or voucher code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-lg h-11 px-4 text-sm font-medium border border-neutral-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#ffcf1c]"
        />
      </div>

      {loading && (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#ffcf1c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filteredPromotions.length === 0 && (
        <p className="text-sm text-neutral-400">No promotions found.</p>
      )}

      {!loading && filteredPromotions.length > 0 && (
        <div className="space-y-3">
          {filteredPromotions.map((p) => (
            <PromotionRow key={p.id} promotion={p} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Voucher Tracking</h2>

        {!loading && filteredClaims.length === 0 ? (
          <p className="text-sm text-neutral-400">No voucher records found.</p>
        ) : (
          !loading && (
            <Card className="rounded-[20px] border-none shadow-sm bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-left">
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Voucher Code</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Promotion</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Restaurant</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Customer</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Status</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Claimed</th>
                      <th className="px-6 py-4 font-black text-xs uppercase tracking-wide text-neutral-400">Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-neutral-500">{claim.voucher_code}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-neutral-800">{claim.tblpromotion?.title || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{claim.tblpromotion?.tblrestaurant?.name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-neutral-800">
                            {claim.claimed_by_name || `${claim.tbllogin?.firstname || ''} ${claim.tbllogin?.lastname || ''}`.trim() || 'N/A'}
                          </p>
                          <p className="text-xs text-neutral-400">{claim.tbllogin?.username || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="px-6 py-4 text-neutral-500 text-xs">{claim.createdAt ? formatDate(claim.createdAt) : 'N/A'}</td>
                        <td className="px-6 py-4 text-neutral-500 text-xs">{claim.used_at ? formatDate(claim.used_at) : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function PromotionRow({ promotion: p }: { promotion: Promotion }) {
  const stats = p.claim_stats ?? { total: 0, valid: 0, used: 0, expired: 0 };
  const fillPct = p.max_uses_total
    ? Math.min(100, ((p.claim_stats?.total ?? 0) / p.max_uses_total) * 100)
    : null;

  const isExpired = p.end_date ? new Date(p.end_date) < new Date() : false;
  const isFull = p.max_uses_total != null && (p.claim_stats?.total ?? 0) >= p.max_uses_total;

  return (
    <Card className="rounded-[20px] border-none shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-neutral-900 text-lg leading-tight truncate">{p.title}</p>
              {isExpired && <Badge className="bg-red-100 text-red-600 border-none text-xs font-bold">Expired</Badge>}
              {isFull && <Badge className="bg-orange-100 text-orange-600 border-none text-xs font-bold">Full</Badge>}
              {!isExpired && !isFull && <Badge className="bg-[#FFF9DC] text-[#ffcf1c] border-none text-xs font-bold">Live</Badge>}
            </div>
            <div className="flex items-center gap-1 text-neutral-400 text-sm mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span className="font-medium">{p.tblrestaurant?.name ?? 'Unknown Restaurant'}</span>
            </div>
            {p.description && (
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{p.description}</p>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm flex-wrap">
            {p.discount_percent && (
              <div className="text-center">
                <p className="text-2xl font-black text-[#ffcf1c]">
                  {formatPromotionDiscount(p.discount_type, p.discount_percent, { includeOff: false })}
                </p>
                <p className="text-xs font-bold text-neutral-400 uppercase">Discount</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-600">{formatDate(p.start_date) ?? 'N/A'}</p>
              <p className="text-xs font-bold text-neutral-400 uppercase">Start</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-600">{formatDate(p.end_date) ?? 'N/A'}</p>
              <p className="text-xs font-bold text-neutral-400 uppercase">End</p>
            </div>
            {p.max_uses_total != null && (
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-600">{p.max_uses_total}</p>
                <p className="text-xs font-bold text-neutral-400 uppercase flex items-center gap-1"><Hash className="w-3 h-3" />Quota</p>
              </div>
            )}
            {p.max_uses_per_user != null && (
              <div className="text-center">
                <p className="text-sm font-bold text-neutral-600">{p.max_uses_per_user}</p>
                <p className="text-xs font-bold text-neutral-400 uppercase flex items-center gap-1"><Users className="w-3 h-3" />Per User</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="bg-neutral-50 rounded-2xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-lg font-black text-neutral-800">{stats.total}</p>
              <p className="text-[10px] font-black text-neutral-400 uppercase">Claims</p>
            </div>
            <div className="bg-[#FFF9DC] rounded-2xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-lg font-black text-[#ffcf1c]">{stats.used}</p>
              <p className="text-[10px] font-black text-[#ffcf1c] uppercase">Used</p>
            </div>
            <div className="bg-amber-50 rounded-2xl px-4 py-3 text-center min-w-[64px]">
              <p className="text-lg font-black text-amber-600">{stats.valid}</p>
              <p className="text-[10px] font-black text-amber-400 uppercase">Valid</p>
            </div>
          </div>
        </div>

        {fillPct !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
              <span>{p.claim_stats?.total ?? 0} claimed</span>
              <span>{p.max_uses_total} total</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffcf1c] rounded-full transition-all"
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: PromotionClaim['status'] }) {
  if (status === 'used') {
    return <Badge className="bg-[#FFF9DC] text-[#070605] border-none text-xs font-bold">Used</Badge>;
  }
  if (status === 'expired') {
    return <Badge className="bg-red-100 text-red-700 border-none text-xs font-bold">Expired</Badge>;
  }
  return <Badge className="bg-amber-100 text-amber-700 border-none text-xs font-bold">Valid</Badge>;
}

function AdminStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="rounded-[20px] border-none shadow-sm bg-white">
      <CardContent className="p-5 flex items-center gap-3">
        <div className="p-2.5 bg-neutral-50 rounded-xl">{icon}</div>
        <div>
          <p className="text-2xl font-black text-neutral-900">{value}</p>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
