import * as React from 'react';
import type { Category, RestaurantImage } from '@/types';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, MapPin, ChevronLeft, Phone, BadgeCheck, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRestaurantById, getRestaurantImages } from '@/features/restaurants/services';
import { formatDate, formatCurrency } from '@/utils';
import { showErrorAlert } from '@/lib/alerts';
import PromotionCard from '@/features/restaurants/components/PromotionCard';
import FoodCard from '@/features/restaurants/components/FoodCard';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import ImageCarousel from '@/features/restaurants/components/ImageCarousel';
import type { RestaurantPublicDetails } from '@/types';

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = React.useState('menu');
  const [activeMenuCategory, setActiveMenuCategory] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [details, setDetails] = React.useState<RestaurantPublicDetails | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<RestaurantImage[]>([]);
  const { isFavorited, setFavoriteStatus } = useFavoriteIds();

  const safeString = (value: any, defaultValue: string = ''): string => {
    if (typeof value === 'string') return value.trim();
    if (value === null || value === undefined) return defaultValue;
    return String(value).trim();
  };

  // Extract unique categories from menu items
  const menuCategories = React.useMemo(() => {
    if (!details) return [];
    const cats: Category[] = [];
    details.menuItems.forEach(item => {
      if (item.tblcategory?.id && !cats.find(c => c.id === item.tblcategory!.id)) {
        cats.push(item.tblcategory!);
      }
    });
    return cats;
  }, [details]);

  // Set default menu category tab from search param if present
  React.useEffect(() => {
    if (!details) return;
    const urlCategoryId = searchParams.get('categoryId');
    if (urlCategoryId && menuCategories.find(cat => cat.id === urlCategoryId)) {
      setActiveMenuCategory(urlCategoryId);
    } else {
      setActiveMenuCategory('all');
    }
    // eslint-disable-next-line
  }, [searchParams, menuCategories.length, details]);

  React.useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [restaurantDetails, images] = await Promise.all([
          getRestaurantById(id),
          getRestaurantImages(id)
        ]);
        setDetails(restaurantDetails);
        setGalleryImages(images);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Loading restaurant details...</div>;
  }

  if (!details) {
    return <div className="min-h-screen grid place-items-center text-sm font-bold text-neutral-500">Restaurant not found.</div>;
  }

  const { restaurant, promotions, menuItems } = details;

  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="relative h-[450px] w-full overflow-hidden">
        <img
          src={restaurant.profilepic || `https://picsum.photos/seed/${restaurant.id}/1920/600`}
          className="w-full h-full object-cover"
          alt={restaurant.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white border-none rounded-2xl h-12 px-6 font-bold uppercase tracking-tight transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="flex gap-3">
            <FavoriteButton
              entityType="restaurant"
              entityId={restaurant.id}
              initiallyFavorited={isFavorited('restaurant', restaurant.id)}
              onChanged={(favorited) => setFavoriteStatus('restaurant', restaurant.id, favorited)}
              mode="explicit"
              requireRemoveConfirmation
              className="h-12 w-12 rounded-2xl"
            />
          </div>
        </div>

        <div className="absolute bottom-12 left-0 w-full">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>
                  {safeString(restaurant.cuisine, 'Restaurant')}
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                  {typeof restaurant.name === 'string' ? restaurant.name : String(restaurant.name || 'Restaurant')}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-widest text-neutral-200">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-[#6EA15C]" />
                    <span>{restaurant.is_verified ? 'Verified' : 'Awaiting review'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#6EA15C]" />
                    <span>{restaurant.menu_item_count || menuItems.length} MENU ITEMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#6EA15C]" />
                    <span>{restaurant.address || 'Address not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 mx-auto mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
              <TabsList className="bg-white p-1.5 rounded-[24px] h-16 w-full md:w-fit grid grid-cols-4 md:flex border border-neutral-100 shadow-sm">
                <TabsTrigger value="menu" className="rounded-[18px] px-10 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
                  Menu
                </TabsTrigger>
                <TabsTrigger value="promotions" className="rounded-[18px] px-10 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
                  Promotions
                </TabsTrigger>
                <TabsTrigger value="images" className="rounded-[18px] px-10 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
                  Images
                </TabsTrigger>
                <TabsTrigger value="about" className="rounded-[18px] px-10 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="mt-0 space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      className={`px-4 py-2 rounded-full font-bold uppercase text-xs border ${activeMenuCategory === 'all' ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-[#6EA15C] border-[#6EA15C]'}`}
                      onClick={() => setActiveMenuCategory('all')}
                    >
                      All
                    </button>
                    {menuCategories.map(cat => (
                      <button
                        key={cat.id}
                        className={`px-4 py-2 rounded-full font-bold uppercase text-xs border ${activeMenuCategory === cat.id ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-[#6EA15C] border-[#6EA15C]'}`}
                        onClick={() => setActiveMenuCategory(cat.id)}
                      >
                        {cat.name_en}
                      </button>
                    ))}
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Approved Menu Items</h2>
                </div>
                {(menuItems.length && (activeMenuCategory === 'all' ? menuItems.length : menuItems.some(item => item.tblcategory?.id === activeMenuCategory))) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {menuItems
                      .filter(item => activeMenuCategory === 'all' || item.tblcategory?.id === activeMenuCategory)
                      .map((item) => (
                        <FoodCard
                          key={item.id}
                          item={item}
                          entityType="menu_item"
                          initiallyFavorited={isFavorited('menu_item', item.id)}
                          onFavoriteChanged={(favorited) => setFavoriteStatus('menu_item', item.id, favorited)}
                          onTagClick={(tag) => navigate(`/restaurants?mode=food&tag=${encodeURIComponent(tag)}`)}
                        />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No approved menu items are available for this category yet.</p>
                )}
              </TabsContent>

              <TabsContent value="promotions" className="mt-0">
                {promotions.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {promotions.map((promotion) => (
                      <PromotionCard key={promotion.id} promotion={promotion} showClaimButton />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No promotions have been published for this restaurant yet.</p>
                )}
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                {galleryImages.length ? (
                  <div className="space-y-4">
                    <ImageCarousel images={galleryImages} autoPlayInterval={5000} />
                    <p className="text-sm text-neutral-500 text-center">
                      {galleryImages.length} beautiful image(s) of this restaurant
                    </p>
                  </div>
                ) : (
                  <div className="bg-neutral-50 rounded-2xl p-12 text-center">
                    <p className="text-neutral-400">No images uploaded yet.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
                  <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoTile
                      label="Cuisine"
                      value={safeString(restaurant.cuisine, 'Not set')}
                    />
                    <InfoTile label="Working Hours" value={restaurant.working_hours || 'Not set'} />
                    <InfoTile label="Phone" value={restaurant.phone || 'Not set'} />
                    <InfoTile label="Promotions" value={`${promotions.length} active`} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:block space-y-8">
            <Card className="border-none shadow-sm rounded-[32px] bg-neutral-900 p-8 text-white space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight">Restaurant Info</h3>
              <div className="space-y-4">
                <SidebarRow icon={MapPin} value={restaurant.address || 'Address not set'} />
                <SidebarRow icon={Clock} value={restaurant.working_hours || 'Working hours not set'} />
                <SidebarRow icon={Phone} value={restaurant.phone || 'Phone not set'} />
                <SidebarRow icon={Sparkles} value={`${promotions.length} promotion(s) live`} />
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8 space-y-6 border border-neutral-100">
              <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Restaurant Summary</h3>
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f7f7f2] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Menu Count</p>
                  <p className="text-2xl font-black text-[#6EA15C]">{menuItems.length}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f2] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Latest Promotion End</p>
                  <p className="text-lg font-black text-neutral-900">{promotions[0]?.end_date ? formatDate(promotions[0].end_date) : 'Not set'}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f2] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Sample Item Price</p>
                  <p className="text-lg font-black text-neutral-900">{menuItems[0]?.price ? formatCurrency(menuItems[0].price) : 'Not set'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarRow({ icon: Icon, value }: { icon: React.ComponentType<{ className?: string }>; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="w-5 h-5 text-[#6EA15C] shrink-0" />
      <p className="text-neutral-400 font-medium">{value}</p>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f7f2] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-black text-neutral-900">{value}</p>
    </div>
  );
}
