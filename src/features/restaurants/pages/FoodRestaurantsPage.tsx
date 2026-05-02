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

  React.useEffect(() => {
    const loadData = async () => {
      if (!foodName) {
        setLoading(false);
        setMatchingRestaurants([]);
        return;
      }

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
        const restaurantIds = new Set(
          matchingItems
            .map((item: CatalogItem) => item.restaurant_id)
            .filter(Boolean)
        );
        setMatchingRestaurants(loadedRestaurants.filter((restaurant) => restaurantIds.has(restaurant.id)));
      } catch (error) {
        await showErrorAlert(error, 'Unable to load restaurants for this food');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [foodCategoryId, foodName]);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container px-4 mx-auto space-y-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#6EA15C]">Food Search Result</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">
              Restaurants Selling {foodName || 'Selected Food'}
            </h1>
            <p className="text-neutral-500 font-medium">
              {selectedCategory?.name_en ? `Category: ${selectedCategory.name_en}. ` : ''}
              Click a restaurant card to check inside.
            </p>
          </div>

          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-12 px-6 rounded-xl border-neutral-200 font-bold uppercase tracking-tight hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading restaurants...</p>
        ) : matchingRestaurants.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-[#6EA15C] grid place-items-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">No restaurants found</h2>
            <p className="text-neutral-500 font-medium">
              No restaurant currently sells "{foodName}". Try another food item.
            </p>
            <p className="text-sm text-neutral-400">Total restaurants scanned: {restaurants.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
