import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/features/restaurants/components/RestaurantCard';
import { getCatalogMenuItems, getCategories, getRestaurants } from '@/features/restaurants/services';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import { showErrorAlert } from '@/lib/alerts';
import type { CatalogItem, Category, Restaurant } from '@/types';
import { getCatalogItemName } from '@/utils';

export default function FoodRestaurantsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [matchingRestaurants, setMatchingRestaurants] = React.useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const { isFavorited, setFavoriteStatus } = useFavoriteIds();

  const foodName = (searchParams.get('foodName') || '').trim();
  const foodCategoryId = searchParams.get('foodCategoryId') || '';

  // ── Backend logic unchanged ──────────────────────────────────────────────
  React.useEffect(() => {
    const loadData = async () => {
      if (!foodName) { setLoading(false); setMatchingRestaurants([]); return; }
      try {
        setLoading(true);
        const [loadedRestaurants, loadedCategories, categoryItems] = await Promise.all([
          getRestaurants(),
          getCategories(),
          getCatalogMenuItems({ category_id: foodCategoryId || undefined }),
        ]);
        const selected = loadedCategories.find((item) => item.id === foodCategoryId) || null;
        setSelectedCategory(selected);
        setRestaurants(loadedRestaurants);
        const normalizedFoodName = foodName.toLowerCase();
        const matchingItems = categoryItems.filter(
          (item: CatalogItem) => getCatalogItemName(item).trim().toLowerCase() === normalizedFoodName
        );
        const restaurantIds = new Set(matchingItems.map((item: CatalogItem) => item.restaurant_id).filter(Boolean));
        setMatchingRestaurants(loadedRestaurants.filter((r) => restaurantIds.has(r.id)));
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurants for this food');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [foodCategoryId, foodName]);
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-[3px] bg-black rounded-full" />
                <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                  Food Search Result
                </span>
              </div>
              <h1
                className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-2"
                style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.8rem, 6vw, 4rem)' }}
              >
                Restaurants Selling<br />
                <span>{foodName || 'Selected Food'}</span>
              </h1>
              <p className="text-[#5a4a00] font-semibold text-sm max-w-md leading-relaxed">
                {selectedCategory?.name_en ? `Category: ${selectedCategory.name_en}. ` : ''}
                Click a restaurant card to explore inside.
              </p>
            </div>
            <Button
              onClick={() => navigate(-1)}
              className="h-10 sm:h-11 px-5 sm:px-6 bg-black hover:opacity-90 text-[#ffcf1c] rounded-xl font-black uppercase tracking-wide text-xs sm:text-sm border-none transition-all active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
            </Button>
          </div>
        </div>
      </section>

      <div className="h-[5px] bg-black" />

      {/* ── Results band ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12 min-h-screen">
        <div className="max-w-5xl mx-auto">

          {/* Summary */}
          {!loading && (
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.14em] mb-6">
              Found <span className="text-[#ffcf1c]">{matchingRestaurants.length} restaurant{matchingRestaurants.length !== 1 ? 's' : ''}</span>
              {' '}serving <span className="text-[#ffcf1c]">"{foodName}"</span>
            </p>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ffcf1c] animate-spin" />
              <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">Loading restaurants...</p>
            </div>
          ) : matchingRestaurants.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {matchingRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  initiallyFavorited={isFavorited('restaurant', restaurant.id)}
                  onFavoriteChanged={(favorited) => setFavoriteStatus('restaurant', restaurant.id, favorited)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#ffcf1c]/10 border border-[#ffcf1c]/20 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6 text-[#ffcf1c]" />
              </div>
              <h2
                className="font-black uppercase tracking-tight text-white"
                style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}
              >
                No Restaurants Found
              </h2>
              <p className="text-neutral-600 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                No restaurant currently sells "{foodName}". Try another food item.
              </p>
              <p className="text-[10px] text-neutral-700 font-bold uppercase tracking-wider">
                {restaurants.length} restaurants scanned
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}