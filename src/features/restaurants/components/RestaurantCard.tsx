import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn, parseCuisines } from '@/utils';
import { Restaurant } from '@/types';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';

interface RestaurantCardProps {
  restaurant: Restaurant;
  initiallyFavorited?: boolean;
  onFavoriteChanged?: (favorited: boolean) => void;
}

export default function RestaurantCard({
  restaurant,
  initiallyFavorited = false,
  onFavoriteChanged,
}: RestaurantCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 bg-white group"
    >
      <Link to={`/restaurant/${restaurant.id}`}>
        <div className="relative h-48 overflow-hidden bg-black">
          <img
            src={restaurant.profilepic || `https://picsum.photos/seed/${restaurant.id}/600/400`}
            className="w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700"
            alt={restaurant.name}
          />
          <div className="absolute top-4 left-4 flex justify-between items-center w-[calc(100%-32px)]">
            <FavoriteButton
              entityType="restaurant"
              entityId={restaurant.id}
              initiallyFavorited={initiallyFavorited}
              onChanged={onFavoriteChanged}
              mode="explicit"
              requireRemoveConfirmation
              className="p-2 rounded-xl backdrop-blur-md"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-black uppercase tracking-tight mb-0.5">{restaurant.name}</h3>
            <p className="text-xs text-white/70 font-medium line-clamp-1">{restaurant.address || 'Address coming soon'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-white border-t border-neutral-100">
          <div className="flex items-center gap-4 text-xs font-bold text-neutral-400">
            <div className="flex items-center gap-1 text-[#6EA15C]">
              <UtensilsCrossed className="w-3 h-3" />
              <span>{restaurant.menu_item_count || 0} Menu</span>
            </div>
            <div className="flex items-center gap-1 text-[#6EA15C]">
              <Sparkles className="w-3 h-3" />
              <span>{restaurant.promotion_count || 0} Promos</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
