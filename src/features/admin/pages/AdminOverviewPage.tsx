import * as React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, UtensilsCrossed, ClipboardList, Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStats } from '@/features/admin/services';
import { formatCurrency, formatDateTime, toNumber } from '@/utils';
import { showErrorAlert } from '@/lib/alerts';

export default function AdminOverviewPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStats>> | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setData(await getStats());
      } catch (error) {
        await showErrorAlert(error, 'Unable to load admin overview');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    {
      label: 'Categories',
      value: data?.categories.length || 0,
      helper: 'Admin-managed groups',
      icon: FolderKanban,
    },
    {
      label: 'Menu Items',
      value: data?.menuItems.length || 0,
      helper: 'Restaurant-created items',
      icon: UtensilsCrossed,
    },
    {
      label: 'Pending Menu Requests',
      value: data?.menuRequests.filter((request) => request.status === 'pending').length || 0,
      helper: 'Legacy approval queue',
      icon: ClipboardList,
    },
    {
      label: 'Pending Campaign Requests',
      value: data?.campaignRequests.filter((request) => request.status === 'pending').length || 0,
      helper: 'Marketing approvals',
      icon: Megaphone,
    },
  ];

  const minPrice = data?.menuItems.length ? Math.min(...data.menuItems.map((item) => toNumber(item.price))) : null;
  const maxPrice = data?.menuItems.length ? Math.max(...data.menuItems.map((item) => toNumber(item.price))) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Backend Sync</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Admin Overview</h1>
          <p className="text-neutral-500 font-medium">This panel reads live category and menu data from the backend.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/catalog" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#ffcf1c] px-4 text-sm font-black uppercase tracking-wide text-white hover:bg-[#070605]">
            Manage Categories
          </Link>
          <Link to="/admin/menu-requests" className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-black uppercase tracking-wide text-neutral-900 hover:bg-neutral-50">
            Review Queue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="rounded-[28px] border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9DC] text-[#ffcf1c] flex items-center justify-center">
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{card.label}</p>
                <p className="text-3xl font-black text-neutral-900">{loading ? '...' : card.value}</p>
                <p className="text-sm text-neutral-500 font-medium">{card.helper}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Latest Queue</p>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">Menu Change Requests</h2>
              </div>
              <Link to="/admin/menu-requests" className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-black uppercase tracking-wide text-neutral-900 hover:bg-neutral-50">
                Open Queue
              </Link>
            </div>
            <div className="space-y-4">
              {(data?.menuRequests || []).slice(0, 4).map((request) => (
                <div key={request.id} className="rounded-2xl border border-neutral-100 p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-black text-neutral-900">{request.tblrestaurant?.name || 'Restaurant submission'}</p>
                    <p className="text-sm text-neutral-500">{request.requested_name_en || request.item_id}</p>
                    <p className="text-xs font-medium text-neutral-400">Updated {formatDateTime(request.updatedAt)}</p>
                  </div>
                  <Badge className={request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-none' : request.status === 'approved' ? 'bg-[#FFF9DC] text-[#070605] border-none' : 'bg-red-100 text-red-700 border-none'}>
                    {request.status}
                  </Badge>
                </div>
              ))}
              {!loading && !(data?.menuRequests.length) && (
                <p className="text-sm text-neutral-500">No menu change requests have been submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Catalog Snapshot</p>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">Restaurant Price Range</h2>
              </div>
            </div>
            <div className="rounded-2xl bg-[#f7f7f2] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">All Menu Items</p>
              <p className="text-2xl font-black text-neutral-900">
                {loading || minPrice === null || maxPrice === null ? '...' : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
              </p>
            </div>
            <p className="text-sm text-neutral-500">
              Prices are set by restaurants on their own menu items. Admin manages categories and approval queues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
