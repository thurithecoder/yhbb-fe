import * as React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types';
import { CUISINE_OPTIONS } from '@/constants/cuisines';

export type ListingSearchMode = 'restaurant' | 'food' | 'cuisine';

interface FiltersSidebarProps {
  categories: Category[];
  foodOptions: string[];
  values: {
    mode: ListingSearchMode;
    restaurantQuery: string;
    cuisineQuery: string;
    foodCategoryId: string;
    foodQuery: string;
  };
  onApply: (values: {
    mode: ListingSearchMode;
    restaurantQuery: string;
    cuisineQuery: string;
    foodCategoryId: string;
    foodQuery: string;
  }) => void;
}

export default function FiltersSidebar({ categories, foodOptions, values, onApply }: FiltersSidebarProps) {
  const [localValues, setLocalValues] = React.useState(values);

  React.useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleModeChange = (mode: ListingSearchMode) => {
    setLocalValues((current) => ({
      ...current,
      mode,
      restaurantQuery: mode === 'restaurant' ? current.restaurantQuery : '',
      cuisineQuery: mode === 'cuisine' ? current.cuisineQuery : '',
      foodCategoryId: mode === 'food' ? current.foodCategoryId : '',
      foodQuery: mode === 'food' ? current.foodQuery : '',
    }));
  };

  return (
    <aside className="space-y-8 sticky top-24">
      <div className="space-y-4">
        <select
          value={localValues.mode}
          onChange={(event) => handleModeChange(event.target.value as ListingSearchMode)}
          className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-600 outline-none focus:border-[#6EA15C]"
        >
          <option value="restaurant">Search by restaurant</option>
          <option value="food">Search by food</option>
          <option value="cuisine">Search by cuisine</option>
        </select>
      </div>

      {localValues.mode === 'restaurant' && (
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-[#6EA15C] transition-colors" />
            <Input
              value={localValues.restaurantQuery}
              onChange={(event) => setLocalValues((current) => ({ ...current, restaurantQuery: event.target.value }))}
              placeholder="Type restaurant name..."
              className="h-12 pl-11 rounded-xl bg-white border-neutral-200 focus-visible:ring-[#6EA15C]"
            />
          </div>
        </div>
      )}

      {localValues.mode === 'cuisine' && (
        <div className="space-y-4">
          <Input
            value={localValues.cuisineQuery}
            onChange={(event) => setLocalValues((current) => ({ ...current, cuisineQuery: event.target.value }))}
            list="listing-cuisine-options"
            placeholder="Type cuisine..."
            className="h-12 rounded-xl bg-white border-neutral-200 focus-visible:ring-[#6EA15C]"
          />
          <datalist id="listing-cuisine-options">
            {CUISINE_OPTIONS.map((cuisine) => (
              <option key={cuisine} value={cuisine} />
            ))}
          </datalist>
        </div>
      )}

      {localValues.mode === 'food' && (
        <div className="space-y-4">
          <select
            value={localValues.foodCategoryId}
            onChange={(event) => setLocalValues((current) => ({ ...current, foodCategoryId: event.target.value, foodQuery: '' }))}
            className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-600 outline-none focus:border-[#6EA15C]"
          >
            <option value="">Select food category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en}
              </option>
            ))}
          </select>

          <Input
            value={localValues.foodQuery}
            onChange={(event) => setLocalValues((current) => ({ ...current, foodQuery: event.target.value }))}
            list="listing-food-options"
            disabled={!localValues.foodCategoryId || !foodOptions.length}
            placeholder={localValues.foodCategoryId ? 'Search food item by name...' : 'Choose category first'}
            className="h-12 rounded-xl bg-white border-neutral-200 focus-visible:ring-[#6EA15C] disabled:opacity-60"
          />
          <datalist id="listing-food-options">
            {foodOptions.map((foodName) => (
              <option key={foodName} value={foodName}>
                {foodName}
              </option>
            ))}
          </datalist>

          <p className="text-xs text-neutral-500 font-medium">
            Type part of the food name, then press Apply Search.
          </p>
        </div>
      )}

      <Button
        onClick={() => onApply(localValues)}
        className="w-full h-12 bg-neutral-900 hover:bg-[#6EA15C] text-white rounded-xl font-bold uppercase tracking-tight transition-all active:scale-95"
      >
        Apply Search
      </Button>
    </aside>
  );
}
