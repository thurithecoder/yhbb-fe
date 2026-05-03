import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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

  // ── All backend logic unchanged ──────────────────────────────────────────
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
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-[3px] bg-black rounded-full" />
            <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
              My Collection
            </span>
          </div>
          <h1
            className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-2"
            style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2.2rem, 7vw, 4.5rem)' }}
          >
            {t('favorites.title', 'My Favorites')}
          </h1>
          <p className="text-[#5a4a00] font-semibold text-sm max-w-md leading-relaxed">
            Your saved restaurants and menu items, all in one place.
          </p>
        </div>
      </section>

      <div className="h-[5px] bg-black" />

      {/* ── Content band ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="restaurants" className="w-full">

            {/* Tab bar */}
            <TabsList className="flex w-full sm:w-auto gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-1.5 mb-8">
              {['restaurants', 'menu-items'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex-1 sm:flex-none px-6 sm:px-10 h-9 rounded-xl text-[10px] font-black uppercase tracking-[0.08em] text-neutral-500 data-[state=active]:bg-[#ffcf1c] data-[state=active]:text-black transition-all"
                >
                  {tab === 'restaurants' ? 'Restaurants' : 'Menu Items'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Restaurants tab */}
            <TabsContent value="restaurants" className="mt-0">
              {loading ? (
                <LoadingSpinner label="Loading favorites..." />
              ) : favorites.restaurants.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {favorites.restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ffcf1c] rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-200"
                    >
                      <div className="h-44 sm:h-48 overflow-hidden">
                        <img
                          src={restaurant.profilepic || `https://picsum.photos/seed/${restaurant.id}/800/500`}
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <div>
                          <h3
                            className="font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#ffcf1c] transition-colors"
                            style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}
                          >
                            {restaurant.name}
                          </h3>
                          <p className="text-[10px] text-neutral-600 font-medium mt-1">{restaurant.address || 'Address not set'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/restaurant/${restaurant.id}`}
                            className="flex-1 h-9 flex items-center justify-center rounded-xl bg-[#ffcf1c] text-black text-[10px] font-black uppercase tracking-wide hover:opacity-90 transition-opacity"
                          >
                            Open →
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${restaurant.name} from favorites`}
                            onClick={() => handleRemove('restaurant', restaurant.id)}
                            className="w-9 h-9 rounded-xl bg-[#2a0808] border border-[#3a1010] flex items-center justify-center hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No favourite restaurants yet." />
              )}
            </TabsContent>

            {/* Menu items tab */}
            <TabsContent value="menu-items" className="mt-0">
              <CatalogFavorites items={favorites.menuItems} onRemove={handleRemove} loading={loading} />
            </TabsContent>

          </Tabs>
        </div>
      </section>
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
  if (loading) return <LoadingSpinner label="Loading menu items..." />;

  return items.length ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="group bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#ffcf1c] rounded-xl sm:rounded-2xl overflow-hidden transition-colors duration-200"
        >
          <div className="h-40 sm:h-44 overflow-hidden">
            <img
              src={item.image_base64 || `https://picsum.photos/seed/${item.id}/800/500`}
              alt={getCatalogItemName(item)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-4 sm:p-5 space-y-2">
            <h3
              className="font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#ffcf1c] transition-colors"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
            >
              {getCatalogItemName(item)}
            </h3>
            <p className="text-[10px] text-neutral-600 font-medium leading-relaxed line-clamp-2">
              {truncateText(item.description_en || item.description_ms || item.description_ar, 100)}
            </p>
            <p
              className="font-black text-[#ffcf1c]"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
            >
              {formatCurrency(item.price)}
            </p>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                aria-label={`Remove ${getCatalogItemName(item)} from favorites`}
                onClick={() => onRemove('menu_item', item.id)}
                className="w-9 h-9 rounded-xl bg-[#2a0808] border border-[#3a1010] flex items-center justify-center hover:bg-red-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState label="No favourite menu items yet." />
  );
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="py-24 flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ffcf1c] animate-spin" />
      <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">{label}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-24 text-center">
      <div className="w-14 h-14 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Heart className="w-6 h-6 text-neutral-600" />
      </div>
      <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">{label}</p>
    </div>
  );
}