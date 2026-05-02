import * as React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import type { CatalogItem } from '@/types';
import { formatCurrency, getCatalogItemDescription, getCatalogItemName, getCategoryName } from '@/utils';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';

interface FoodCardProps {
  item: CatalogItem;
  entityType?: 'menu_item';
  initiallyFavorited?: boolean;
  onFavoriteChanged?: (favorited: boolean) => void;
  onTagClick?: (tag: string) => void;
}

export default function FoodCard({
  item,
  entityType = 'menu_item',
  initiallyFavorited = false,
  onFavoriteChanged,
  onTagClick,
}: FoodCardProps) {
  const tags = Array.isArray(item.taqs) ? item.taqs : [];
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - visibleTags.length;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-3xl overflow-hidden bg-white group">
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image_base64 || `https://picsum.photos/seed/${item.id}/400/400`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt={getCatalogItemName(item)}
          />
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold shadow-sm">
              <Star className="w-2.5 h-2.5 fill-[#6EA15C] text-[#6EA15C]" />
              {getCategoryName(item)}
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <h4 className="font-bold text-[#6EA15C] line-clamp-1 group-hover:opacity-80 transition-opacity">
              {getCatalogItemName(item)}
            </h4>
            <p className="text-xs text-neutral-500 line-clamp-2">
              {getCatalogItemDescription(item)}
            </p>
          </div>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-[#6EA15C] border border-green-100 hover:bg-green-100 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
              {extraCount > 0 && (
                <span className="text-[10px] text-neutral-400 self-center">+{extraCount} more</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-[#6EA15C]">{formatCurrency(item.price)}</span>
            <FavoriteButton
              entityType={entityType}
              entityId={item.id}
              initiallyFavorited={initiallyFavorited}
              onChanged={onFavoriteChanged}
              mode="explicit"
              requireRemoveConfirmation
              className="h-8 w-8 rounded-xl border border-neutral-100 shadow-sm transition-all active:scale-90"
              activeClassName="h-8 w-8 rounded-xl border border-red-200 bg-red-500 text-white shadow-sm transition-all active:scale-90"
              inactiveClassName="h-8 w-8 rounded-xl border border-neutral-100 bg-white text-neutral-500 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all active:scale-90"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
