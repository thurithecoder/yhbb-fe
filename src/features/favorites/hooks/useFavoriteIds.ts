import * as React from 'react';
import { getFavorites } from '@/features/favorites/services';
import { useAuth } from '@/hooks/useAuth';
import type { FavoriteEntityType, FavoritesPayload } from '@/types';

const FAVORITES_CACHE_KEY = 'yalah-favorites-cache-v1';

type FavoriteIdSets = {
  restaurant: Set<string>;
  menu_item: Set<string>;
};

type FavoriteCachePayload = {
  userId: string;
  restaurantIds: string[];
  menuItemIds: string[];
  updatedAt: number;
};

const emptyFavoriteIdSets = (): FavoriteIdSets => ({
  restaurant: new Set<string>(),
  menu_item: new Set<string>(),
});

const buildFavoriteIdSetsFromPayload = (payload: FavoritesPayload): FavoriteIdSets => {
  const menuItems = payload.menuItems?.length
    ? payload.menuItems
    : [...(payload.meals || []), ...(payload.drinks || [])];

  return {
    restaurant: new Set((payload.restaurants || []).map((item) => item.id).filter(Boolean)),
    menu_item: new Set(menuItems.map((item) => item.id).filter(Boolean)),
  };
};

const readFavoritesCache = (userId: string): FavoriteIdSets | null => {
  if (typeof window === 'undefined') return null;

  try {
    const rawCache = window.localStorage.getItem(FAVORITES_CACHE_KEY);
    if (!rawCache) return null;

    const parsed = JSON.parse(rawCache) as FavoriteCachePayload;
    if (!parsed || parsed.userId !== userId) return null;

    return {
      restaurant: new Set((parsed.restaurantIds || []).filter(Boolean)),
      menu_item: new Set((parsed.menuItemIds || []).filter(Boolean)),
    };
  } catch {
    return null;
  }
};

const writeFavoritesCache = (userId: string, favorites: FavoriteIdSets) => {
  if (!userId || typeof window === 'undefined') return;

  try {
    const payload: FavoriteCachePayload = {
      userId,
      restaurantIds: Array.from(favorites.restaurant),
      menuItemIds: Array.from(favorites.menu_item),
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures (private mode/quota) and keep in-memory state.
  }
};

export function useFavoriteIds() {
  const { user, isHydrated } = useAuth();
  const [favoriteIds, setFavoriteIds] = React.useState<FavoriteIdSets>(() => emptyFavoriteIdSets());
  const [isLoaded, setIsLoaded] = React.useState(false);

  const userId = user?.id || '';
  const canLoadFavorites = Boolean(isHydrated && user && user.role === 'user' && userId);

  const replaceFavoriteIds = React.useCallback(
    (nextIds: FavoriteIdSets) => {
      setFavoriteIds(nextIds);
      writeFavoritesCache(userId, nextIds);
    },
    [userId]
  );

  React.useEffect(() => {
    if (!isHydrated) {
      setIsLoaded(false);
      return;
    }

    if (!canLoadFavorites) {
      setFavoriteIds(emptyFavoriteIdSets());
      setIsLoaded(true);
      return;
    }

    const cachedIds = readFavoritesCache(userId);
    setFavoriteIds(cachedIds || emptyFavoriteIdSets());
    setIsLoaded(true);

    let cancelled = false;

    const loadFromApi = async () => {
      try {
        const payload = await getFavorites();
        if (cancelled) return;

        replaceFavoriteIds(buildFavoriteIdSetsFromPayload(payload));
      } catch (error) {
        console.error('Failed to refresh favorites cache:', error);
      }
    };

    void loadFromApi();

    return () => {
      cancelled = true;
    };
  }, [canLoadFavorites, isHydrated, replaceFavoriteIds, userId]);

  const isFavorited = React.useCallback(
    (entityType: FavoriteEntityType, entityId: string) => {
      if (!entityId) return false;
      return favoriteIds[entityType].has(entityId);
    },
    [favoriteIds]
  );

  const setFavoriteStatus = React.useCallback(
    (entityType: FavoriteEntityType, entityId: string, favorited: boolean) => {
      if (!entityId) return;

      setFavoriteIds((current) => {
        const next: FavoriteIdSets = {
          restaurant: new Set(current.restaurant),
          menu_item: new Set(current.menu_item),
        };

        if (favorited) {
          next[entityType].add(entityId);
        } else {
          next[entityType].delete(entityId);
        }

        writeFavoritesCache(userId, next);
        return next;
      });
    },
    [userId]
  );

  const refreshFavorites = React.useCallback(async () => {
    if (!canLoadFavorites) return;

    try {
      const payload = await getFavorites();
      replaceFavoriteIds(buildFavoriteIdSetsFromPayload(payload));
    } catch (error) {
      console.error('Failed to refresh favorites:', error);
    }
  }, [canLoadFavorites, replaceFavoriteIds]);

  return {
    isLoaded,
    isFavorited,
    setFavoriteStatus,
    refreshFavorites,
  };
}
