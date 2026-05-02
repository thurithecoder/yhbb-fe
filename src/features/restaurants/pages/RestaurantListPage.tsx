import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronDown, UtensilsCrossed, Coffee, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RestaurantCard from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import { getRestaurants, getCategories, getCatalogMenuItems } from '@/features/restaurants/services';
import { useFavoriteIds } from '@/features/favorites/hooks/useFavoriteIds';
import { showErrorAlert } from '@/lib/alerts';
import type { Category, Restaurant, CatalogItem } from '@/types';
import { formatCurrency, getCatalogItemName, parseCuisines, truncateText } from '@/utils';
import { TAQ_OPTIONS } from '@/constants/taqs';
import bgforlist from '@/assets/images/bg-list.png'; // أو المسار الصحيح لصورتك

import { Map, List } from "lucide-react";
import RestaurantMapView from '@/features/map/components/RestaurantMapView';

type ListingSearchMode = 'restaurant' | 'cuisine' | 'food';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

type FiltersState = {
  mode: ListingSearchMode;
  searchQuery: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  selectedTag: string;
};

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
];

const MODES: { value: ListingSearchMode; label: string; icon: React.ReactNode }[] = [
  { value: 'restaurant', label: 'Restaurants', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: 'cuisine', label: 'Cuisines', icon: <Pizza className="w-4 h-4" /> },
  { value: 'food', label: 'Food Items', icon: <Coffee className="w-4 h-4" /> },
];

const MAX_PRICE = 1000;

// Helper function to get numeric price
const getNumericPrice = (price: string | number | undefined): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return parseFloat(price) || 0;
  return 0;
};

const SearchableTagsDropdown = ({
  selectedTag,
  onTagChange,
}: {
  selectedTag: string;
  onTagChange: (tag: string) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Filter tags based on search
  const filteredTags = TAQ_OPTIONS.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label className="text-xs font-black uppercase tracking-wider text-neutral-600">
        Tags
      </Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-white text-left flex items-center justify-between hover:border-[#6EA15C] transition-colors"
        >
          <span className={selectedTag ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
            {selectedTag ? `#${selectedTag}` : 'All Tags'}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-[100]">
            {/* Search input */}
            <div className="p-2 border-b border-neutral-100">
              <Input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-sm rounded-lg"
                autoFocus
              />
            </div>

            {/* Tags list */}
            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onTagChange("");
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${!selectedTag ? 'bg-[#6EA15C]/10 text-[#6EA15C] font-medium' : 'text-neutral-700'
                  }`}
              >
                All Tags
              </button>

              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onTagChange(tag);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${selectedTag === tag ? 'bg-[#6EA15C]/10 text-[#6EA15C] font-medium' : 'text-neutral-700'
                      }`}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-neutral-400 text-sm">No tags found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RestaurantListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [menuItems, setMenuItems] = React.useState<CatalogItem[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = React.useState<Restaurant[]>([]);
  const [filteredFoodItems, setFilteredFoodItems] = React.useState<CatalogItem[]>([]);
  const { isFavorited, setFavoriteStatus } = useFavoriteIds();

  // Dropdown states
  const [showModeDropdown, setShowModeDropdown] = React.useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);

  const [filters, setFilters] = React.useState<FiltersState>({
    mode: (searchParams.get('mode') as ListingSearchMode) || 'restaurant',
    searchQuery: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || MAX_PRICE,
    sortBy: (searchParams.get('sortBy') as SortOption) || 'name-asc',
    selectedTag: searchParams.get('tag') || '',
  });

  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');
  const [showSearchTagDropdown, setShowSearchTagDropdown] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [loadedRestaurants, loadedCategories, loadedMenuItems] = await Promise.all([
          getRestaurants(),
          getCategories(),
          getCatalogMenuItems({}), // Load all menu items
        ]);
        setRestaurants(loadedRestaurants);
        setCategories(loadedCategories);
        setMenuItems(loadedMenuItems);
      } catch (error) {
        await showErrorAlert(error, 'Unable to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters based on mode
  React.useEffect(() => {
    if (filters.mode === 'food') {
      // Filter food items
      let filtered = [...menuItems];

      // Search query filter - matches name or tags
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter((item) => {
          const itemName = getCatalogItemName(item).toLowerCase();
          if (itemName.includes(query)) return true;
          return Array.isArray(item.taqs) && item.taqs.some((t) => t.toLowerCase().includes(query));
        });
      }

      // Tag filter from dropdown
      if (filters.selectedTag) {
        filtered = filtered.filter((item) =>
          Array.isArray(item.taqs) && item.taqs.some((t) => t.toLowerCase() === filters.selectedTag.toLowerCase())
        );
      }

      // Category filter for food items
      if (filters.categoryId) {
        filtered = filtered.filter((item) => item.category_id === filters.categoryId);
      }

      // Price filter for food items
      if (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE) {
        filtered = filtered.filter((item) => {
          const price = getNumericPrice(item.price);
          return price >= filters.minPrice && price <= filters.maxPrice;
        });
      }

      // Sort food items
      filtered.sort((a, b) => {
        const nameA = getCatalogItemName(a) || "";
        const nameB = getCatalogItemName(b) || "";
        const priceA = getNumericPrice(a.price);
        const priceB = getNumericPrice(b.price);

        switch (filters.sortBy) {
          case 'name-asc':
            return nameA.localeCompare(nameB);
          case 'name-desc':
            return nameB.localeCompare(nameA);
          case 'price-asc':
            return priceA - priceB;
          case 'price-desc':
            return priceB - priceA;
          default:
            return 0;
        }
      });

      setFilteredFoodItems(filtered);
    } else {
      // Filter restaurants (for restaurant and cuisine modes)
      let filtered = [...restaurants];

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();

        if (filters.mode === 'restaurant') {
          filtered = filtered.filter((r) =>
            r.name.toLowerCase().includes(query)
          );
        } else if (filters.mode === 'cuisine') {
          filtered = filtered.filter((r) =>
            parseCuisines(r.cuisine).some((c) => c.toLowerCase().includes(query))
          );
        }
      }

      // Category filter for restaurants
      if (filters.categoryId) {
        filtered = filtered.filter((r) =>
          (r as any).category_id === filters.categoryId
        );
      }

      // Tag filter for restaurants — show only restaurants with at least one menu item carrying the tag
      if (filters.selectedTag) {
        filtered = filtered.filter((r) =>
          Array.isArray(r.menu_items) &&
          r.menu_items.some(
            (item) =>
              Array.isArray(item.taqs) &&
              item.taqs.some((t) => t.toLowerCase() === filters.selectedTag.toLowerCase())
          )
        );
      }

      // Price filter for restaurants
      if (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE) {
        filtered = filtered.filter((r) => {
          const avgPrice = (r as any).avg_price || 50;
          return avgPrice >= filters.minPrice && avgPrice <= filters.maxPrice;
        });
      }

      // Sort restaurants
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name-asc':
            return (a.name || "").localeCompare(b.name || "");
          case 'name-desc':
            return (b.name || "").localeCompare(a.name || "");
          case 'price-asc':
            return ((a as any).avg_price || 50) - ((b as any).avg_price || 50);
          case 'price-desc':
            return ((b as any).avg_price || 50) - ((a as any).avg_price || 50);
          default:
            return 0;
        }
      });

      setFilteredRestaurants(filtered);
    }

    // Update URL params
    const params = new URLSearchParams();
    params.set('mode', filters.mode);
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < MAX_PRICE) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy !== 'name-asc') params.set('sortBy', filters.sortBy);
    if (filters.selectedTag) params.set('tag', filters.selectedTag);
    setSearchParams(params, { replace: true });
  }, [filters, restaurants, menuItems, setSearchParams]);

  const handleClearFilters = () => {
    setFilters({
      mode: 'restaurant',
      searchQuery: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: MAX_PRICE,
      sortBy: 'name-asc',
      selectedTag: '',
    });
  };

  const handleFoodCardClick = (foodItem: CatalogItem) => {
    // Navigate to restaurants that serve this food item
    const params = new URLSearchParams();
    params.set('foodId', foodItem.id);
    params.set('foodName', getCatalogItemName(foodItem));
    navigate(`/restaurants/food?${params.toString()}`);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, isMin: boolean) => {
    const value = parseInt(e.target.value) || 0;
    if (isMin) {
      setFilters({ ...filters, minPrice: Math.min(value, filters.maxPrice) });
    } else {
      setFilters({ ...filters, maxPrice: Math.max(value, filters.minPrice) });
    }
  };

  // Custom Dropdown Component
  const Dropdown = ({
    label,
    value,
    displayValue,
    options,
    isOpen,
    setIsOpen,
    onChange,
  }: {
    label: string;
    value: string;
    displayValue: string;
    options: { value: string; label: string }[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onChange: (value: string) => void;
  }) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
      <div className="space-y-2 relative" ref={dropdownRef}>
        <Label className="text-xs font-black uppercase tracking-wider text-neutral-600">{label}</Label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-white text-left flex items-center justify-between hover:border-[#6EA15C] transition-colors"
        >
          <span className={value ? 'text-neutral-900 font-medium' : 'text-neutral-500'}>
            {displayValue}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-[100] max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${value === option.value ? 'bg-[#6EA15C]/10 text-[#6EA15C] font-medium' : 'text-neutral-700'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getModeLabel = () => {
    return MODES.find(m => m.value === filters.mode)?.label || 'Restaurants';
  };

  const getSortLabel = () => {
    return SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label || 'Sort by';
  };

  const getCategoryLabel = () => {
    if (!filters.categoryId) return 'All Categories';
    const category = categories.find(c => c.id === filters.categoryId);
    return category?.name_en || 'All Categories';
  };

  const getSelectedTagLabel = () => {
    return filters.selectedTag ? `#${filters.selectedTag}` : 'All Tags';
  };

  const getSummaryText = () => {
    if (filters.mode === 'food') {
      const baseText = `Found ${filteredFoodItems.length} food item${filteredFoodItems.length !== 1 ? 's' : ''}`;
      if (filters.selectedTag) return `${baseText} tagged "#${filters.selectedTag}"`;
      if (filters.searchQuery) return `${baseText} matching "${filters.searchQuery}"`;
      return baseText;
    } else {
      const baseText = `Found ${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''}`;
      if (filters.selectedTag) return `${baseText} serving "#${filters.selectedTag}"`;
      if (filters.searchQuery) return `${baseText} matching "${filters.searchQuery}"`;
      return baseText;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div
        className="relative py-12 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bgforlist})`,
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        <div className="relative z-10">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2 text-center">
                {filters.mode === 'food' ? 'Find Your Favorite Food' : 'Find Your Perfect Restaurant'}
              </h1>
              <p className="text-white/90 text-center mb-8">
                {filters.mode === 'food'
                  ? 'Discover delicious food items from top restaurants'
                  : 'Discover the best dining experiences near you'}
              </p>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  placeholder={filters.mode === "food" ? "Search food items or paste a tag..." : "Search restaurants, cuisines..."}
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full h-14 pl-12 pr-44 md:pr-52 rounded-2xl border-none shadow-lg text-base bg-white"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {filters.searchQuery && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, searchQuery: '' })}
                      className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {/* Search bar tag dropdown - using showSearchTagDropdown */}
                  <div className="relative" style={{ zIndex: 9999 }}>
                    <button
                      type="button"
                      onClick={() => setShowSearchTagDropdown(!showSearchTagDropdown)}
                      className={`flex h-9 w-32 items-center justify-between gap-1.5 rounded-xl border px-3 text-sm font-bold shadow-sm transition-colors ${filters.selectedTag
                        ? "border-[#6EA15C] bg-[#6EA15C]/10 text-[#6EA15C]"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-[#6EA15C] hover:text-[#6EA15C]"
                        }`}
                    >
                      <span className="truncate">{filters.selectedTag ? `#${filters.selectedTag}` : "Tags"}</span>
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-neutral-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="container px-4 mx-auto py-6">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Mode Dropdown */}
            <Dropdown
              label="Search By"
              value={filters.mode}
              displayValue={getModeLabel()}
              options={MODES.map(m => ({ value: m.value, label: m.label }))}
              isOpen={showModeDropdown}
              setIsOpen={setShowModeDropdown}
              onChange={(value) => setFilters({ ...filters, mode: value as ListingSearchMode, searchQuery: '', categoryId: '', selectedTag: '' })}
            />

            {/* Category Dropdown */}
            {filters.mode === 'food' && (
              <Dropdown
                label="Category"
                value={filters.categoryId}
                displayValue={getCategoryLabel()}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map(c => ({ value: c.id, label: c.name_en }))
                ]}
                isOpen={showCategoryDropdown}
                setIsOpen={setShowCategoryDropdown}
                onChange={(value) => setFilters({ ...filters, categoryId: value })}
              />
            )}

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-neutral-600">
                Price Range (RM)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange(e, true)}
                  className="h-12 rounded-xl"
                />
                <span className="text-neutral-400 self-center">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange(e, false)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <Dropdown
              label="Sort by"
              value={filters.sortBy}
              displayValue={getSortLabel()}
              options={SORT_OPTIONS}
              isOpen={showSortDropdown}
              setIsOpen={setShowSortDropdown}
              onChange={(value) => setFilters({ ...filters, sortBy: value as SortOption })}
            />

            {/* Tags Dropdown - Searchable */}
            <SearchableTagsDropdown
              selectedTag={filters.selectedTag}
              onTagChange={(tag) => setFilters({ ...filters, selectedTag: tag })}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <Button
                onClick={() => { }}
                className="flex-1 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-bold h-12"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="flex-1 border-neutral-200 rounded-xl font-bold h-12 hover:bg-neutral-50"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                variant="outline"
                className="rounded-xl h-12 px-4 flex items-center gap-2"
              >
                {viewMode === "list" ? (
                  <>
                    <Map className="w-5 h-5 text-green-600" />
                    Map View
                  </>
                ) : (
                  <>
                    <List className="w-5 h-5 text-green-600" />
                    List View
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div className="container px-4 mx-auto py-12">
        <div className="mb-8">
          <p className="text-neutral-500 font-medium">{getSummaryText()}</p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6EA15C]"></div>
            <p className="mt-4 text-neutral-500">Loading {filters.mode === 'food' ? 'food items' : 'restaurants'}...</p>
          </div>
        ) : filters.mode === 'food' ? (
          // Display Food Items
          filteredFoodItems.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFoodCardClick(item)}
                  className="cursor-pointer"
                >
                  <FoodCard
                    item={item}
                    entityType="menu_item"
                    initiallyFavorited={isFavorited('menu_item', item.id)}
                    onFavoriteChanged={(favorited) => setFavoriteStatus('menu_item', item.id, favorited)}
                    onTagClick={(tag) => setFilters((prev) => ({ ...prev, selectedTag: tag, mode: 'food' }))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="text-6xl">🍔</div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">No food items found</h3>
              <p className="text-neutral-500 font-medium">
                Try adjusting your filters or search for a different food item
              </p>
              <Button
                onClick={handleClearFilters}
                className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl"
              >
                Clear All Filters
              </Button>
            </div>
          )
        ) : viewMode === 'list' ? (
          // Restaurants in list view
          filteredRestaurants.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  initiallyFavorited={isFavorited('restaurant', restaurant.id)}
                  onFavoriteChanged={(favorited) => setFavoriteStatus('restaurant', restaurant.id, favorited)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="text-6xl">🍽️</div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-900">No restaurants found</h3>
              <p className="text-neutral-500 font-medium">
                {filters.mode === 'cuisine'
                  ? 'Try a different cuisine keyword.'
                  : 'Try adjusting your filters or search query'}
              </p>
              <Button
                onClick={handleClearFilters}
                className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl"
              >
                Clear All Filters
              </Button>
            </div>
          )
        ) : (
          // Map view
          <RestaurantMapView restaurants={filteredRestaurants} />
        )}
      </div>
    </div>
  );
}
