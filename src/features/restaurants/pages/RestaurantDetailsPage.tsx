import * as React from 'react';
import type { Category, RestaurantImage } from '@/types';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, MapPin, ChevronLeft, Phone, BadgeCheck, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const safeString = (value: any, defaultValue = ''): string => {
    if (typeof value === 'string') return value.trim();
    if (value === null || value === undefined) return defaultValue;
    return String(value).trim();
  };

  const menuCategories = React.useMemo(() => {
    if (!details) return [];
    const cats: Category[] = [];
    details.menuItems.forEach((item) => {
      if (item.tblcategory?.id && !cats.find((c) => c.id === item.tblcategory!.id)) {
        cats.push(item.tblcategory!);
      }
    });
    return cats;
  }, [details]);

  React.useEffect(() => {
    if (!details) return;
    const urlCategoryId = searchParams.get('categoryId');
    if (urlCategoryId && menuCategories.find((cat) => cat.id === urlCategoryId)) {
      setActiveMenuCategory(urlCategoryId);
    } else {
      setActiveMenuCategory('all');
    }
  }, [searchParams, menuCategories.length, details]);

  React.useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [restaurantDetails, images] = await Promise.all([
          getRestaurantById(id),
          getRestaurantImages(id),
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
    return (
      <div className="bg-[#111] min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ffcf1c] animate-spin" />
          <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-[#111] min-h-screen grid place-items-center">
        <p className="text-neutral-600 text-sm font-bold">Restaurant not found.</p>
      </div>
    );
  }

  const { restaurant, promotions, menuItems } = details;

  return (
    <div className="bg-[#ffcf1c] min-h-screen pb-20">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ height: 'clamp(280px, 45vw, 500px)' }}>
        <img
          src={restaurant.profilepic || `https://picsum.photos/seed/${restaurant.id}/1920/600`}
          className="w-full h-full object-cover"
          alt={restaurant.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        {/* Top bar */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center">
          <Button
            onClick={() => navigate(-1)}
            className="h-10 sm:h-11 px-4 sm:px-6 bg-[#ffcf1c] hover:opacity-90 text-black rounded-xl font-black uppercase tracking-wide text-xs sm:text-sm border-none transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <FavoriteButton
            entityType="restaurant"
            entityId={restaurant.id}
            initiallyFavorited={isFavorited('restaurant', restaurant.id)}
            onChanged={(favorited) => setFavoriteStatus('restaurant', restaurant.id, favorited)}
            mode="explicit"
            requireRemoveConfirmation
            className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl bg-black/40 border border-white/20 hover:bg-[#ffcf1c] hover:border-[#ffcf1c] transition-colors"
          />
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-10">
          <div className="max-w-4xl">
            <span className="inline-block bg-[#ffcf1c] text-black text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-3">
              {safeString(restaurant.cuisine, 'Restaurant')}
            </span>
            <h1
              className="font-black text-white uppercase tracking-tighter leading-[0.9] mb-3"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.8rem, 6vw, 4.5rem)' }}
            >
              {safeString(restaurant.name, 'Restaurant')}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              {[
                { icon: BadgeCheck, label: restaurant.is_verified ? 'Verified' : 'Awaiting review' },
                { icon: UtensilsCrossed, label: `${restaurant.menu_item_count || menuItems.length} Menu Items` },
                { icon: MapPin, label: restaurant.address || 'Address not set' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5 text-[#ffcf1c] flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Black stripe */}
      <div className="h-[5px] bg-black" />

      {/* ── Main content ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — tabs */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>

                {/* Tab bar */}
                <TabsList className="flex w-full sm:w-auto gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-1.5 mb-8 overflow-x-auto">
                  {['menu', 'promotions', 'images', 'about'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="flex-1 sm:flex-none px-5 sm:px-7 h-9 rounded-xl text-[10px] font-black uppercase tracking-[0.08em] text-neutral-500 data-[state=active]:bg-[#ffcf1c] data-[state=active]:text-black transition-all whitespace-nowrap"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Menu tab */}
                <TabsContent value="menu" className="mt-0 space-y-6">
                  {/* Category pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveMenuCategory('all')}
                      className={`h-8 px-4 rounded-full border-[1.5px] text-[9px] font-black uppercase tracking-[0.08em] transition-all ${activeMenuCategory === 'all'
                          ? 'bg-[#ffcf1c] text-black border-[#ffcf1c]'
                          : 'bg-transparent text-neutral-500 border-[#2a2a2a] hover:border-[#ffcf1c] hover:text-[#ffcf1c]'
                        }`}
                    >
                      All
                    </button>
                    {menuCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveMenuCategory(cat.id)}
                        className={`h-8 px-4 rounded-full border-[1.5px] text-[9px] font-black uppercase tracking-[0.08em] transition-all ${activeMenuCategory === cat.id
                            ? 'bg-[#ffcf1c] text-black border-[#ffcf1c]'
                            : 'bg-transparent text-neutral-500 border-[#2a2a2a] hover:border-[#ffcf1c] hover:text-[#ffcf1c]'
                          }`}
                      >
                        {cat.name_en}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-[0.08em] text-white">
                      Approved Menu Items
                    </h2>
                  </div>

                  {menuItems.filter((item) => activeMenuCategory === 'all' || item.tblcategory?.id === activeMenuCategory).length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {menuItems
                        .filter((item) => activeMenuCategory === 'all' || item.tblcategory?.id === activeMenuCategory)
                        .map((item) => (
                          <FoodCard
                            key={item.id}
                            item={item}
                            entityType="menu_item"
                            initiallyFavorited={isFavorited('menu_item', item.id)}
                            onFavoriteChanged={(f) => setFavoriteStatus('menu_item', item.id, f)}
                            onTagClick={(tag) => navigate(`/restaurants?mode=food&tag=${encodeURIComponent(tag)}`)}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 font-medium">No approved menu items for this category yet.</p>
                  )}
                </TabsContent>

                {/* Promotions tab */}
                <TabsContent value="promotions" className="mt-0">
                  {promotions.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {promotions.map((promo) => (
                        <PromotionCard key={promo.id} promotion={promo} showClaimButton />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 font-medium">No promotions published yet.</p>
                  )}
                </TabsContent>

                {/* Images tab */}
                <TabsContent value="images" className="mt-0">
                  {galleryImages.length ? (
                    <div className="space-y-3">
                      <ImageCarousel images={galleryImages} autoPlayInterval={5000} />
                      <p className="text-[10px] text-center text-neutral-600 font-bold uppercase tracking-wider">
                        {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-12 text-center">
                      <p className="text-neutral-600 text-xs font-bold uppercase tracking-wider">No images uploaded yet.</p>
                    </div>
                  )}
                </TabsContent>

                {/* About tab */}
                <TabsContent value="about" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Cuisine', value: safeString(restaurant.cuisine, 'Not set') },
                      { label: 'Working Hours', value: restaurant.working_hours || 'Not set' },
                      { label: 'Phone', value: restaurant.phone || 'Not set' },
                      { label: 'Promotions', value: `${promotions.length} active` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em] mb-2">{label}</p>
                        <p className="text-sm font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Info card */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Restaurant Info
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, value: restaurant.address || 'Address not set' },
                    { icon: Clock, value: restaurant.working_hours || 'Hours not set' },
                    { icon: Phone, value: restaurant.phone || 'Phone not set' },
                    { icon: Sparkles, value: `${promotions.length} promotion(s) live` },
                  ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#ffcf1c] group-hover:border-[#ffcf1c] transition-colors">
                        <Icon className="w-3.5 h-3.5 text-[#ffcf1c] group-hover:text-black transition-colors" />
                      </div>
                      <p className="text-neutral-500 text-xs font-medium leading-relaxed mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-[3px] bg-[#ffcf1c] rounded-full" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.1em]" style={{ fontFamily: "'Georgia', serif" }}>
                    Summary
                  </h3>
                </div>
                {[
                  { label: 'Menu Count', value: String(menuItems.length), yellow: true },
                  { label: 'Latest Promo Ends', value: promotions[0]?.end_date ? formatDate(promotions[0].end_date) : 'Not set', yellow: false },
                  { label: 'Sample Price', value: menuItems[0]?.price ? formatCurrency(menuItems[0].price) : 'Not set', yellow: false },
                ].map(({ label, value, yellow }) => (
                  <div key={label} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                    <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em] mb-1">{label}</p>
                    <p className={`text-lg font-black ${yellow ? 'text-[#ffcf1c]' : 'text-white'}`} style={{ fontFamily: "'Georgia', serif" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}