import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Store, BadgePercent, UtensilsCrossed, Megaphone } from 'lucide-react';
import { getRestaurantMarketingRequests, getRestaurantMenuItems, getRestaurantProfile, getRestaurantPromotions } from '@/features/restaurants/services';
import { formatDateTime } from '@/utils';
import { showErrorAlert } from '@/lib/alerts';

export default function RestaurantOverviewPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    profile: Awaited<ReturnType<typeof getRestaurantProfile>> | null;
    promotions: Awaited<ReturnType<typeof getRestaurantPromotions>>;
    menuItems: Awaited<ReturnType<typeof getRestaurantMenuItems>>;
    marketingRequests: Awaited<ReturnType<typeof getRestaurantMarketingRequests>>;
  }>({
    profile: null,
    promotions: [],
    menuItems: [],
    marketingRequests: [],
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profile, promotions, menuItems, marketingRequests] = await Promise.all([
          getRestaurantProfile(),
          getRestaurantPromotions(),
          getRestaurantMenuItems(),
          getRestaurantMarketingRequests(),
        ]);

        setData({ profile, promotions, menuItems, marketingRequests });
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurant overview');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    { label: 'Profile', value: data.profile?.name || 'Restaurant', helper: 'Current backend profile', icon: Store },
    { label: 'Promotions', value: data.promotions.length, helper: 'Created promotions', icon: BadgePercent },
    { label: 'Menu Items', value: data.menuItems.length, helper: 'Directly managed by restaurant', icon: UtensilsCrossed },
    { label: 'Campaign Requests', value: data.marketingRequests.length, helper: 'Marketing queue', icon: Megaphone },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Restaurant Backend</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Restaurant Overview</h1>
          <p className="text-neutral-500 font-medium">Everything here is coming from the restaurant endpoints in the backend.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/restaurant-panel/profile" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#ffcf1c] px-4 text-sm font-black uppercase tracking-wide text-white hover:bg-[#070605]">
            Edit Profile
          </Link>
          <Link to="/restaurant-panel/menu-requests" className="inline-flex h-10 items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-sm font-black uppercase tracking-wide text-neutral-900 hover:bg-neutral-50">
            Manage Menu
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
                <p className="text-2xl font-black text-neutral-900">{loading ? '...' : card.value}</p>
                <p className="text-sm text-neutral-500 font-medium">{card.helper}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Profile Snapshot</p>
              <h2 className="text-2xl font-black tracking-tight text-neutral-900">{data.profile?.name || 'Restaurant profile'}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoBlock label="Address" value={data.profile?.address || 'Not set'} />
              <InfoBlock label="Working Hours" value={data.profile?.working_hours || 'Not set'} />
              <InfoBlock label="Phone" value={data.profile?.phone || 'Not set'} />
              <InfoBlock
                label="Verification Status"
                value={
                  data.profile?.verificationStatus === 'approved'
                    ? 'Approved'
                    : data.profile?.verificationStatus === 'step2'
                      ? 'Step 2 (admin contact)'
                      : data.profile?.verificationStatus === 'pending'
                        ? 'Pending (under review)'
                        : 'Not Verified'
                }
              />
              {/* <InfoBlock
                label="Verification Step"
                value={typeof data.profile?.verificationStatus === 'number' ? String(data.profile.verificationStatus) : 'N/A'}
              /> */}
            </div>
          </CardContent>
        </Card>


        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Recent Menu Items</p>
              <h2 className="text-2xl font-black tracking-tight text-neutral-900">Latest Additions</h2>
            </div>
            <div className="space-y-4">
              {data.menuItems.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-neutral-100 p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-black text-neutral-900">{item.name_en}</p>
                    <p className="text-sm text-neutral-500">{item.tblcategory?.name_en || 'Uncategorized'}</p>
                    <p className="text-xs font-medium text-neutral-400">Updated {formatDateTime(item.updatedAt)}</p>
                  </div>
                  <Badge className={item.is_available ? 'bg-[#FFF9DC] text-[#070605] border-none' : 'bg-neutral-200 text-neutral-700 border-none'}>
                    {item.is_available ? 'Available' : 'Hidden'}
                  </Badge>
                </div>
              ))}
              {!loading && !data.menuItems.length && <p className="text-sm text-neutral-500">No menu items yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f7f2] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-black text-neutral-900">{value}</p>
    </div>
  );
}
