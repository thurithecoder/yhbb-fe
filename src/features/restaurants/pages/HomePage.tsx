import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import HeroSection from '../components/HeroSection';
import CategoryList from '../components/CategoryList';
import RestaurantCard from '../components/RestaurantCard';
import BestDeals from '../components/BestDeals';
import { getCategories, getCatalogMenuItems, getRestaurants } from '@/features/restaurants/services';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import { showErrorAlert } from '@/lib/alerts';
import type { CatalogItem, Category, Restaurant } from '@/types';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [dealItems, setDealItems] = React.useState<CatalogItem[]>([]);
  const { isFavorited, setFavoriteStatus } = useFavoriteIds();

  React.useEffect(() => {
    const loadHome = async () => {
      try {
        setLoading(true);
        const [loadedCategories, loadedRestaurants, loadedMenuItems] = await Promise.all([
          getCategories(),
          getRestaurants(),
          getCatalogMenuItems(),
        ]);

        setCategories(loadedCategories);
        setRestaurants(loadedRestaurants);
        setDealItems(loadedMenuItems);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load home page');
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  return (
    <div className="bg-[#ffcf1c] min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col">
      <HeroSection
        categories={categories}
        onSearch={({ query, categoryId }) => {
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          if (categoryId) params.set('categoryId', categoryId);
          navigate(`/restaurants${params.toString() ? `?${params}` : ''}`);
        }}
      />

      <CategoryList categories={categories} />

      <div className="h-1.5 sm:h-[6px] bg-black" />

      <section className="py-12 sm:py-20 bg-[#111] w-full">
        <div className="container px-4 mx-auto space-y-8 sm:space-y-12">
          <div className="flex flex-row items-end sm:items-baseline justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {t('restaurants.popular_title')}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                {t('restaurants.popular_subtitle')}
              </p>
            </div>
            <button
              onClick={() => navigate('/restaurants')}
              className="text-xs sm:text-sm font-black text-[#ffcf1c] uppercase tracking-widest hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
            >
              {t('restaurants.view_all')}
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-neutral-500">Loading restaurants...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {restaurants.slice(0, 4).map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  initiallyFavorited={isFavorited('restaurant', restaurant.id)}
                  onFavoriteChanged={(favorited) => setFavoriteStatus('restaurant', restaurant.id, favorited)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-1.5 sm:h-[6px] bg-black" />

      <section className="py-12 sm:py-20 bg-[#ffcf1c] w-full">
        <div className="container px-4 mx-auto">
          <div className="relative h-[280px] sm:h-[400px] bg-[#111] rounded-[28px] sm:rounded-[48px] overflow-hidden flex flex-col items-start justify-center px-6 sm:px-12 md:px-24">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80"
              className="absolute inset-0 w-full h-full object-cover"
              alt="CTA Background"
            />
            <div className="absolute inset-0 bg-black/75" />

            <div className="relative z-10 space-y-3 sm:space-y-6 max-w-2xl">
              <p className="text-[10px] sm:text-xs font-black text-white/60 uppercase tracking-[0.3em]">
                Yalla Habibi
              </p>
              <h2
                style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)' }}
                className="font-black text-white tracking-tighter uppercase leading-tight"
              >
                More than <span className="text-[#ffcf1c]">{restaurants.length}</span> live restaurants
              </h2>
              <p className="text-white/80 text-sm sm:text-lg font-medium hidden sm:block">
                Browse restaurant profiles, promotions, and approved menu items.
              </p>
              <Button
                onClick={() => navigate('/restaurants')}
                className="h-11 sm:h-14 px-6 sm:px-10 mt-2 sm:mt-0 bg-[#ffcf1c] hover:bg-[#e6b919] text-black rounded-xl text-sm sm:text-lg font-black uppercase tracking-wide transition-all active:scale-95 shadow-xl shadow-yellow-900/20"
              >
                {t('restaurants.view_all')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <BestDeals items={dealItems} />

      <section className="py-12 sm:py-20 bg-[#ffcf1c] w-full">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row bg-[#111] rounded-[28px] sm:rounded-[48px] overflow-hidden min-h-[auto] sm:min-h-[450px]">
            <div className="w-full lg:w-1/2 relative h-[200px] sm:h-[260px] lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Chef"
              />
            </div>

            <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-20 flex flex-col justify-center space-y-4 sm:space-y-8">
              <h2
                style={{ fontSize: 'clamp(1.4rem, 4vw, 3rem)' }}
                className="font-black text-white tracking-tighter uppercase leading-tight"
              >
                Restaurant owners, <br />
                <span className="text-[#ffcf1c]">manage it all from their panel</span>
              </h2>
              <p className="text-neutral-400 text-sm sm:text-lg font-medium leading-relaxed">
                Profile updates, promotions, menu change requests, and marketing submissions now run through the restaurant panel.
              </p>
              <Button
                onClick={() => navigate('/restaurant-panel')}
                className="h-11 sm:h-14 px-7 sm:px-10 bg-[#ffcf1c] hover:bg-[#e6b919] text-black rounded-xl text-sm sm:text-lg font-black uppercase tracking-wide transition-all active:scale-95 self-start"
              >
                Open Restaurant Panel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}