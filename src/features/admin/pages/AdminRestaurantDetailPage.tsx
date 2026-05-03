import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Images,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldOff,
  Store,
  TicketPercent,
  UtensilsCrossed,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAdminRestaurantDetails, type AdminRestaurantDetailsResponse } from '@/features/admin/services';
import { showErrorAlert } from '@/lib/alerts';
import { formatCurrency, formatDate, parseCuisines } from '@/utils';
import type { CatalogItem } from '@/types';
import ImageCarousel from '@/features/restaurants/components/ImageCarousel';

function getVerificationBadge(status: string | undefined) {
  if (status === 'approved') {
    return <Badge className="bg-[#FFF9DC] text-[#070605] border-none"><ShieldCheck className="w-3.5 h-3.5 mr-1" />Verified</Badge>;
  }

  if (status === 'pending') {
    return <Badge className="bg-amber-100 text-amber-700 border-none">Pending Verification</Badge>;
  }

  if (status === 'step2') {
    return <Badge className="bg-blue-100 text-blue-700 border-none">Step 2 Review</Badge>;
  }

  return <Badge className="bg-neutral-100 text-neutral-600 border-none"><ShieldOff className="w-3.5 h-3.5 mr-1" />Not Verified</Badge>;
}

function getMenuItemName(item: CatalogItem) {
  return item.name_en || item.name_ms || item.name_ar || 'Unnamed item';
}

function getMenuItemCategory(item: CatalogItem) {
  return item.tblcategory?.name_en || item.tblcategory?.name_ms || item.tblcategory?.name_ar || 'No category';
}

export default function AdminRestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<AdminRestaurantDetailsResponse | null>(null);
  const [menuFilter, setMenuFilter] = React.useState<'all' | 'approved' | 'rejected'>('all');
  const [showAllMenuItems, setShowAllMenuItems] = React.useState(false);
  const [showAllPromotions, setShowAllPromotions] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const result = await getAdminRestaurantDetails(id);
        setData(result);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurant details');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-40 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-52 rounded-[32px] bg-neutral-100 animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="h-80 rounded-[32px] bg-neutral-100 animate-pulse" />
          <div className="xl:col-span-2 h-80 rounded-[32px] bg-neutral-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#ffcf1c] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          All Restaurants
        </Link>
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-12 text-center space-y-3">
            <Store className="w-10 h-10 text-neutral-300 mx-auto" />
            <h1 className="text-xl font-black text-neutral-800">Restaurant not found</h1>
            <p className="text-sm text-neutral-500">The selected restaurant could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const restaurant = data.restaurant;
  const owner = restaurant.owner || null;
  const cuisines = parseCuisines(restaurant.cuisine);
  const heroImage = restaurant.profilepic || data.images[0]?.image_base64 || '';
  const pendingRequests = Number(restaurant.pending_menu_requests || 0) + Number(restaurant.pending_campaign_requests || 0);
  const filteredMenuItems = data.menuItems.filter((item) => {
    if (menuFilter === 'approved') return item.verification_status === 'approved';
    if (menuFilter === 'rejected') return item.verification_status === 'rejected';
    return true;
  });
  const visibleMenuItems = showAllMenuItems ? filteredMenuItems : filteredMenuItems.slice(0, 3);
  const visiblePromotions = showAllPromotions ? data.promotions : data.promotions.slice(0, 3);

  return (
    <div className="space-y-8">
      <Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#ffcf1c] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        All Restaurants
      </Link>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <div className="h-56 bg-gradient-to-r from-[#ffcf1c] via-[#7fb36d] to-[#9fce90]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_40%)]" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="rounded-[28px] bg-white/95 backdrop-blur p-5 md:p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                    {heroImage ? (
                      <img src={heroImage} alt={restaurant.name} className="w-full h-full object-contain bg-white" />
                    ) : (
                      <Store className="w-8 h-8 text-[#ffcf1c]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ffcf1c]">Restaurant Profile</p>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mt-1">{restaurant.name}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {getVerificationBadge(restaurant.verificationStatus ?? undefined)}
                      <Badge className={`${restaurant.is_active ? 'bg-[#FFF9DC] text-[#070605]' : 'bg-neutral-100 text-neutral-600'} border-none`}>
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {pendingRequests > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 border-none">
                          {pendingRequests} pending request{pendingRequests > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2 text-sm">
                    {owner?.email && (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                        <Mail className="w-4 h-4 text-[#ffcf1c]" />
                        {owner.email}
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                        <Phone className="w-4 h-4 text-[#ffcf1c]" />
                        {restaurant.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Menu Items', value: data.menuItems.length, icon: UtensilsCrossed },
          { label: 'Gallery Images', value: data.images.length, icon: Images },
          { label: 'Promotions', value: data.promotions.length, icon: TicketPercent },
          { label: 'Cuisines', value: cuisines.length, icon: Store },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-[24px] border-none shadow-sm bg-white">
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9DC] text-[#ffcf1c] flex items-center justify-center">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">{stat.label}</p>
                <p className="text-3xl font-black text-neutral-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-xl font-black text-neutral-900">Contact & Location</h2>

            <InfoLine icon={Mail} label="Email" value={owner?.email || 'Not set'} />
            <InfoLine icon={Phone} label="Phone" value={restaurant.phone || 'Not set'} />
            <InfoLine icon={MapPin} label="Address" value={restaurant.address || 'Not set'} />
            <InfoLine icon={Clock3} label="Working Hours" value={restaurant.working_hours || 'Not set'} />

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400 mb-2">Cuisine</p>
              <div className="flex flex-wrap gap-2">
                {cuisines.length > 0 ? cuisines.map((cuisine) => (
                  <span key={cuisine} className="inline-flex items-center rounded-full bg-[#ecf5e9] px-3 py-1 text-xs font-bold text-[#4f7d3f]">
                    {cuisine}
                  </span>
                )) : <span className="text-sm text-neutral-500">No cuisine listed</span>}
              </div>
            </div>

            {restaurant.latitude && restaurant.longitude && (
              <a
                href={`https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#ffcf1c] hover:text-[#070605]"
              >
                <ExternalLink className="w-4 h-4" />
                Open coordinates in maps
              </a>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            {heroImage ? (
              <img src={heroImage} alt={restaurant.name} className="w-full h-[340px] object-contain bg-neutral-50 p-3" />
            ) : (
              <div className="h-[340px] bg-[#f7f7f2] grid place-items-center text-neutral-400">
                <div className="text-center">
                  <Store className="w-9 h-9 mx-auto mb-2" />
                  <p className="font-semibold">No profile image</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-neutral-900">Restaurant Gallery</h2>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">{data.images.length} images</span>
          </div>

          {data.images.length === 0 ? (
            <p className="text-sm text-neutral-500">No gallery images uploaded yet.</p>
          ) : (
            <ImageCarousel images={data.images} autoPlayInterval={5000} />
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-neutral-900">Menu Items</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">{filteredMenuItems.length} items</span>
              <select
                value={menuFilter}
                onChange={(event) => {
                  setMenuFilter(event.target.value as 'all' | 'approved' | 'rejected');
                  setShowAllMenuItems(false);
                }}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-black uppercase tracking-[0.08em] text-neutral-600 outline-none focus:border-[#ffcf1c]"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredMenuItems.length === 0 ? (
            <p className="text-sm text-neutral-500">This restaurant has no items yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleMenuItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
                    <div className="h-40 bg-[#f7f7f2]">
                      {item.image_base64 ? (
                        <img src={item.image_base64} alt={getMenuItemName(item)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full grid place-items-center text-neutral-400">
                          <UtensilsCrossed className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="font-black text-neutral-900 line-clamp-1">{getMenuItemName(item)}</p>
                      <p className="text-sm text-neutral-500 line-clamp-1">{getMenuItemCategory(item)}</p>
                      <p className="text-base font-black text-[#ffcf1c]">{formatCurrency(item.price)}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge className={`${item.is_available ? 'bg-[#FFF9DC] text-[#070605]' : 'bg-neutral-100 text-neutral-600'} border-none`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Badge className={`${item.verification_status === 'approved' ? 'bg-[#FFF9DC] text-[#070605]' : item.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' : item.verification_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'} border-none`}>
                          {item.verification_status || 'unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredMenuItems.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAllMenuItems((current) => !current)}
                    className="rounded-xl font-black text-xs uppercase tracking-wide border-neutral-200"
                  >
                    {showAllMenuItems ? 'Show less' : `Show more (${filteredMenuItems.length - 3})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-neutral-900">Promotions</h2>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">{data.promotions.length} offers</span>
          </div>

          {data.promotions.length === 0 ? (
            <p className="text-sm text-neutral-500">No promotions published yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visiblePromotions.map((promotion) => (
                  <div key={promotion.id} className="rounded-2xl border border-neutral-100 p-4 bg-white space-y-2">
                    <p className="font-black text-neutral-900">{promotion.title}</p>
                    <p className="text-sm text-neutral-500 line-clamp-2">{promotion.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-2">
                      {promotion.discount_percent ? (
                        <Badge className="bg-[#FFF9DC] text-[#070605] border-none">
                          {promotion.discount_type === 'cash' ? formatCurrency(promotion.discount_percent) : `${promotion.discount_percent}%`} off
                        </Badge>
                      ) : null}
                      {promotion.min_spend ? (
                        <Badge className="bg-neutral-100 text-neutral-600 border-none">Min spend {formatCurrency(promotion.min_spend)}</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {promotion.start_date ? formatDate(promotion.start_date) : 'N/A'} - {promotion.end_date ? formatDate(promotion.end_date) : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
              {data.promotions.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAllPromotions((current) => !current)}
                    className="rounded-xl font-black text-xs uppercase tracking-wide border-neutral-200"
                  >
                    {showAllPromotions ? 'Show less' : `Show more (${data.promotions.length - 3})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">{label}</p>
      <p className="mt-1 flex items-start gap-2 text-sm font-semibold text-neutral-800">
        <Icon className="w-4 h-4 mt-0.5 text-[#ffcf1c]" />
        <span>{value}</span>
      </p>
    </div>
  );
}
