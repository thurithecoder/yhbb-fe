import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFavorites, removeFavorite } from '@/features/favorites/services';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import { confirmAction, showErrorAlert, showSuccessAlert, showInfoAlert } from '@/lib/alerts';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, getCatalogItemName, truncateText } from '@/utils';
import type { CatalogItem, Restaurant } from '@/types';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { user, isHydrated } = useAuth();
  const { setFavoriteStatus } = useFavoriteIds();
  const [loading, setLoading] = React.useState(true);
  const [favorites, setFavorites] = React.useState<{ restaurants: Restaurant[]; menuItems: CatalogItem[] }>({
    restaurants: [],
    menuItems: [],
  });

  const loadFavorites = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites({
        restaurants: data.restaurants,
        menuItems: (data.menuItems && data.menuItems.length ? data.menuItems : [...(data.meals || []), ...(data.drinks || [])]),
      });
    } catch (error) {
      await showErrorAlert(error, 'Unable to load favorites');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      showInfoAlert('Please log in with a user account to manage favorites.', 'Login required');
      setLoading(false);
      return;
    }

    if (user.role !== 'user') {
      showInfoAlert('Favorites are available from user accounts.', 'User account required');
      setLoading(false);
      return;
    }

    loadFavorites();
  }, [isHydrated, loadFavorites, user]);

  const handleRemove = async (entityType: 'restaurant' | 'menu_item', entityId: string) => {
    const confirmed = await confirmAction({
      title: 'Remove favorite?',
      text: 'This item will be removed from your favorites list.',
      confirmButtonText: 'Remove',
    });

    if (!confirmed) return;

    try {
      const result = await removeFavorite({ entity_type: entityType, entity_id: entityId });
      setFavoriteStatus(entityType, entityId, false);
      await showSuccessAlert(result.msg || 'Favorite removed successfully.');
      await loadFavorites();
    } catch (error) {
      await showErrorAlert(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 min-h-screen">
      <div className="space-y-4">
        <div className="inline-block w-12 h-1 bg-[#6EA15C] rounded-full" />
        <h1 className="text-5xl font-black tracking-tighter uppercase text-neutral-900">
          {t('favorites.title', 'My Favorites')}
        </h1>
      </div>

      <Tabs defaultValue="restaurants" className="w-full space-y-12">
        <TabsList className="bg-neutral-100 p-1.5 rounded-2xl h-16 w-full md:w-fit grid grid-cols-2 md:flex">
          <TabsTrigger value="restaurants" className="rounded-xl px-12 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="menu-items" className="rounded-xl px-12 data-[state=active]:bg-[#6EA15C] data-[state=active]:text-white font-black uppercase tracking-tight text-sm transition-all">
            Menu Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurants" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {favorites.restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
                <div className="h-52 w-full bg-neutral-50 p-4">
                  <img
                    src={restaurant.profilepic || `https://picsum.photos/seed/${restaurant.id}/800/500`}
                    alt={restaurant.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-neutral-900">{restaurant.name}</h3>
                    <p className="text-sm text-neutral-500">{restaurant.address || 'Address not set'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/restaurant/${restaurant.id}`}
                      className="inline-flex flex-1 h-10 items-center justify-center rounded-xl bg-[#6EA15C] px-4 text-sm font-black uppercase tracking-wide text-white hover:bg-[#5D8A4E]"
                    >
                      Open
                    </Link>
                    <Button
                      type="button"
                      title="Remove favorite"
                      aria-label={`Remove ${restaurant.name} from favorites`}
                      onClick={() => handleRemove('restaurant', restaurant.id)}
                      variant="outline"
                      className="h-10 w-10 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!loading && !favorites.restaurants.length && <EmptyState />}
        </TabsContent>

        <TabsContent value="menu-items" className="mt-0">
          <CatalogFavorites items={favorites.menuItems} onRemove={handleRemove} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CatalogFavorites({
  items,
  onRemove,
  loading,
}: {
  items: CatalogItem[];
  onRemove: (entityType: 'restaurant' | 'menu_item', entityId: string) => void;
  loading: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item) => (
          <Card key={item.id} className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
            <div className="h-52 w-full bg-neutral-50 p-4">
              <img
                src={item.image_base64 || `https://picsum.photos/seed/${item.id}/800/500`}
                alt={getCatalogItemName(item)}
                className="h-full w-full object-contain"
              />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-neutral-900">{getCatalogItemName(item)}</h3>
                <p className="text-sm text-neutral-500">{truncateText(item.description_en || item.description_ms || item.description_ar, 100)}</p>
                <p className="text-lg font-black text-[#6EA15C]">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  title="Remove favorite"
                  aria-label={`Remove ${getCatalogItemName(item)} from favorites`}
                  onClick={() => onRemove('menu_item', item.id)}
                  variant="outline"
                  className="h-10 w-10 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!loading && !items.length && <EmptyState />}
    </>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <p className="text-neutral-500 font-medium">No favorites saved yet.</p>
    </div>
  );
}
