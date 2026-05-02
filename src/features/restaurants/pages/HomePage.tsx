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
    <div className="bg-white min-h-screen">
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

      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto space-y-12">
          <div className="flex items-baseline justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">{t('restaurants.popular_title')}</h2>
              <p className="text-sm text-neutral-400 font-medium">{t('restaurants.popular_subtitle')}</p>
            </div>
            <button onClick={() => navigate('/restaurants')} className="text-sm font-black text-[#6EA15C] uppercase tracking-widest hover:opacity-80 transition-opacity">
              {t('restaurants.view_all')}
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-neutral-500">Loading restaurants...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="relative h-[400px] rounded-[48px] overflow-hidden flex flex-col items-start justify-center px-12 md:px-24">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80"
              className="absolute inset-0 w-full h-full object-cover"
              alt="CTA Background"
            />
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 space-y-6 max-w-2xl">
              <p className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Yalla Habibi</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                More than <span className="text-[#6EA15C]">{restaurants.length}</span> live restaurants
              </h2>
              <p className="text-white/80 text-lg font-medium">
                Browse restaurant profiles, promotions, and approved menu items.
              </p>
              <Button onClick={() => navigate('/restaurants')} className="h-14 px-10 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl text-lg font-black uppercase tracking-wide transition-all active:scale-95 shadow-xl shadow-green-900/20">
                {t('restaurants.view_all')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <BestDeals items={dealItems} />

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row bg-neutral-900 rounded-[48px] overflow-hidden min-h-[450px]">
            <div className="lg:w-1/2 relative h-[300px] lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Chef"
              />
            </div>
            <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                Restaurant owners, <br />
                <span className="text-[#6EA15C]">manage it all from their panel</span>
              </h2>
              <p className="text-neutral-400 text-lg font-medium leading-relaxed">
                Profile updates, promotions, menu change requests, and marketing submissions now run through the restaurant panel.
              </p>
              <Button onClick={() => navigate('/restaurant-panel')} className="h-14 px-10 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl text-lg font-black uppercase tracking-wide transition-all active:scale-95 self-start">
                Open Restaurant Panel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
