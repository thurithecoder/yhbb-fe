import * as React from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, ClipboardList, Megaphone, ShieldCheck, ShieldOff, Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminRestaurants } from '@/features/admin/services';
import { showErrorAlert } from '@/lib/alerts';
import { parseCuisines } from '@/utils';
import type { Restaurant } from '@/types';

type AdminRestaurant = Restaurant & {
  pending_menu_requests: number;
  pending_campaign_requests: number;
};

const verificationBadge = (status: string) => {
  if (status === 'approved') return <Badge className="bg-[#FFF9DC] text-[#070605] border-none text-[11px]"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>;
  if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-none text-[11px]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  if (status === 'step2') return <Badge className="bg-blue-100 text-blue-700 border-none text-[11px]"><Clock className="w-3 h-3 mr-1" />Step 2</Badge>;
  return <Badge className="bg-neutral-100 text-neutral-500 border-none text-[11px]"><ShieldOff className="w-3 h-3 mr-1" />Not Verified</Badge>;
};

export default function AdminRestaurantsPage() {
  const [loading, setLoading] = React.useState(true);
  const [restaurants, setRestaurants] = React.useState<AdminRestaurant[]>([]);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminRestaurants();
        setRestaurants(data as AdminRestaurant[]);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurants');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = restaurants.filter((restaurant) => {
    const text = query.trim().toLowerCase();
    const cuisines = parseCuisines(restaurant.cuisine).map((c) => c.toLowerCase());
    const matchesQuery = !text
      || restaurant.name.toLowerCase().includes(text)
      || (restaurant.address || '').toLowerCase().includes(text)
      || cuisines.some((cuisine) => cuisine.includes(text));

    const matchesFilter =
      !filter
      || (filter === 'verified' && restaurant.verificationStatus === 'approved')
      || (filter === 'pending' && (restaurant.verificationStatus === 'pending' || restaurant.verificationStatus === 'step2'))
      || (filter === 'unverified' && restaurant.verificationStatus === 'not_verified')
      || (filter === 'has_pending' && (restaurant.pending_menu_requests > 0 || restaurant.pending_campaign_requests > 0));

    return matchesQuery && matchesFilter;
  });

  const totalPending = restaurants.reduce((sum, restaurant) => sum + restaurant.pending_menu_requests + restaurant.pending_campaign_requests, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Admin Panel</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Restaurants</h1>
          <p className="text-neutral-500 font-medium">Open any restaurant and review all details in one clean profile page.</p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-black text-amber-700">{totalPending} pending action{totalPending !== 1 ? 's' : ''} across all restaurants</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, address, cuisine..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 outline-none focus:border-[#ffcf1c] placeholder:text-neutral-400"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-600 outline-none focus:border-[#ffcf1c] min-w-[180px]"
        >
          <option value="">All restaurants</option>
          <option value="verified">Verified only</option>
          <option value="pending">Awaiting verification</option>
          <option value="unverified">Not verified</option>
          <option value="has_pending">Has pending requests</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: restaurants.length, color: 'text-neutral-900' },
          { label: 'Verified', value: restaurants.filter((r) => r.verificationStatus === 'approved').length, color: 'text-[#070605]' },
          { label: 'Pending Verification', value: restaurants.filter((r) => r.verificationStatus === 'pending' || r.verificationStatus === 'step2').length, color: 'text-amber-700' },
          { label: 'Pending Requests', value: totalPending, color: 'text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-[24px] border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{loading ? '...' : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[28px] bg-white h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <Store className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="font-black text-neutral-500">No restaurants found</p>
            <p className="text-sm text-neutral-400 mt-1">Try adjusting your search or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((restaurant) => {
            const hasPending = restaurant.pending_menu_requests > 0 || restaurant.pending_campaign_requests > 0;
            const cuisines = parseCuisines(restaurant.cuisine);

            return (
              <Card key={restaurant.id} className={`rounded-[28px] border-none shadow-sm bg-white hover:shadow-md transition-all hover:-translate-y-0.5 ${hasPending ? 'ring-2 ring-amber-200' : ''}`}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {restaurant.profilepic ? (
                      <img src={restaurant.profilepic} alt={restaurant.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-neutral-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#FFF9DC] flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-[#ffcf1c]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-neutral-900 truncate text-lg leading-tight">{restaurant.name}</p>
                      <p className="text-sm text-neutral-500 truncate mt-0.5">{restaurant.address || 'No address'}</p>
                      <div className="mt-2">{verificationBadge(restaurant.verificationStatus || 'not_verified')}</div>
                    </div>
                  </div>

                  {(cuisines.length > 0 || restaurant.phone) && (
                    <div className="text-xs text-neutral-400 flex gap-3">
                      {cuisines.length > 0 ? <span className="font-medium">{cuisines.join(' · ')}</span> : null}
                      {restaurant.phone ? <span>{restaurant.phone}</span> : null}
                    </div>
                  )}

                  {hasPending && (
                    <div className="flex gap-2 pt-1">
                      {restaurant.pending_menu_requests > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-3 py-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-black text-amber-700">{restaurant.pending_menu_requests} menu</span>
                        </div>
                      )}
                      {restaurant.pending_campaign_requests > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-3 py-1.5">
                          <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-black text-amber-700">{restaurant.pending_campaign_requests} campaign</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-100 flex justify-end">
                    <Link
                      to={`/admin/restaurants/${restaurant.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#ffcf1c] px-4 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-[#070605] transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
