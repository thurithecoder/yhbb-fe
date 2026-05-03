import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ChevronDown, Utensils, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import type { Category } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const POPULAR_TAGS = [
  'Shawarma', 'Kebab', 'Falafel', 'Mandi', 'Kabsa', 'Hummus',
  'Halal', 'Vegan', 'Grilled', 'BBQ', 'Breakfast', 'Fast Food',
  'Fine Dining', 'Dessert', 'Spicy', 'Street Food',
];

const DISCOVER_IMAGES = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=120&q=80',
];

interface HeroSectionProps {
  categories?: Category[];
  initialQuery?: string;
  initialCategoryId?: string;
  onSearch?: (payload: { query: string; categoryId: string }) => void;
}

export default function HeroSection({
  categories = [],
  initialQuery = '',
  initialCategoryId = '',
  onSearch,
}: HeroSectionProps) {
  const { t } = useTranslation();
  const [query, setQuery] = React.useState(initialQuery);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(initialCategoryId);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  React.useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  React.useEffect(() => { setSelectedCategoryId(initialCategoryId); }, [initialCategoryId]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedPopularTag = POPULAR_TAGS.includes(query) ? query : '';

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.({ query: query.trim(), categoryId: selectedCategoryId });
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    onSearch?.({ query: tag, categoryId: selectedCategoryId });
  };

  return (
    <section className="relative bg-[#ffcf1c] overflow-hidden">
      {/* ── Hero image panel ── */}
      <div
        className="relative mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{ height: 'clamp(260px, 58vw, 520px)' }}
      >
        {/* Background food image */}
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80"
          className="w-full h-full object-cover"
          alt="Hero Background"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

        {/* ── Hero content ── */}
        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center px-4 sm:px-8 md:px-12 pb-14 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="min-w-0 space-y-2 sm:space-y-3 max-w-[88%] sm:max-w-xl"
          >
            <h1 className="font-black leading-none tracking-tighter uppercase"
              style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.55rem, 11vw, 5.5rem)' }}>
              <span className="block text-white">
                {t('hero.title').split(' ')[0]} &amp;
              </span>
              <span className="block text-[#ffcf1c]">
                {t('hero.title').split(' ').slice(2).join(' ')}
              </span>
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base md:text-lg font-medium max-w-md hidden sm:block">
              {t('hero.subtitle')}
            </p>

            <p className="text-[#ffcf1c] text-xs sm:text-sm font-bold tracking-widest uppercase pt-1">
              BOOK A TABLE
            </p>


          </motion.div>
        </div>

        {/* ── Discover chip — HIDDEN ON MOBILE (hidden md:flex) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="hidden 2xl:flex absolute bottom-0 right-0 bg-[#ffcf1c] rounded-tl-[80px] pt-8 pl-12 pr-8 pb-8 z-10 flex-col items-center"
        >
          <div className="flex flex-col items-center mb-5">
            <div className="flex -space-x-3 mb-2">
              {DISCOVER_IMAGES.slice(0, 4).map((src, i) => (
                <img
                  key={`top-${i}`}
                  src={src}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-[3px] border-[#ffcf1c] relative shadow-sm"
                  style={{ zIndex: i }}
                />
              ))}
            </div>
            <div className="font-serif font-bold text-base flex items-center gap-1.5 text-black">
              Discover More <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {DISCOVER_IMAGES.slice(0, 3).map((src, i) => (
                <img
                  key={`bottom-${i}`}
                  src={src}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-[3px] border-[#ffcf1c] relative shadow-sm"
                  style={{ zIndex: i }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-black text-sm font-bold font-serif">Amazing Places</span>
              <span className="text-gray-700 text-[11px] leading-tight mt-0.5">Discover the flavor,<br />one table at a time.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Search bar — Filter beside Input on Mobile ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mx-auto w-full max-w-5xl relative z-20 px-3 sm:px-4 -mt-6 sm:-mt-10 mb-4 sm:mb-0"
      >
        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-col lg:flex-row items-stretch lg:items-center lg:bg-white lg:rounded-2xl lg:shadow-xl lg:p-2 gap-2 lg:gap-0"
        >
          {/* Top Row (Mobile) / Left Side (Desktop) */}
          <div className="flex w-full min-w-0 items-center gap-2 lg:gap-0 lg:flex-[1.4]">
            {/* Query & Tags input */}
            <div className="min-w-0 flex-1 relative flex items-center bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none px-3 sm:px-4 h-12 lg:h-14 lg:border-r border-gray-200 group">
              <Search className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5 shrink-0 mr-1.5 sm:mr-3 group-focus-within:text-[#ffcf1c] transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes or tags..."
                className="h-full min-w-0 border-none bg-transparent text-xs sm:text-base focus-visible:ring-0 p-0 placeholder:text-gray-400 truncate"
              />
              <div className="shrink-0 ml-1 sm:ml-2 max-[360px]:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-7 sm:h-8 max-w-16 sm:max-w-36 items-center gap-1 sm:gap-1.5 rounded-full border border-gray-200 px-2 sm:px-3.5 text-[11px] sm:text-sm text-gray-500 hover:border-[#ffcf1c] transition-colors bg-white">
                    <span className="truncate">{selectedPopularTag || 'Tags'}</span>
                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-xl z-50">
                    {POPULAR_TAGS.map((tag) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium ${selectedPopularTag === tag ? 'bg-[#ffcf1c]/10 text-[#ffcf1c]' : ''}`}
                      >
                        {tag}
                      </DropdownMenuItem>
                    ))}
                    {selectedPopularTag && (
                      <DropdownMenuItem onClick={() => setQuery('')} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                        Clear Tag
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Filter Button - VISIBLE ONLY ON MOBILE */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden shrink-0 flex items-center justify-center w-11 sm:w-12 h-12 bg-white rounded-xl shadow-xl border border-gray-100 text-gray-500 hover:text-black transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Collapsible Filters (Mobile) / Right Side (Desktop) */}
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row flex-1 min-w-0 w-full gap-2 lg:gap-0`}>
            {/* Categories dropdown */}
            <div className="flex-1 min-w-0 w-full flex items-center bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none px-3 sm:px-5 h-12 lg:h-14 lg:border-r border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex w-full items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-500 hover:text-black transition-colors bg-white outline-none">
                  <Utensils className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-400" />
                  <span className="truncate">{selectedCategory?.name_en || 'Popular Categories'}</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-auto text-gray-400 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-3rem)] sm:w-52 rounded-xl p-1.5 bg-white shadow-xl z-50">
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className="rounded-lg font-bold uppercase tracking-tight p-2.5 cursor-pointer hover:bg-neutral-50 text-sm"
                    >
                      {cat.name_en}
                    </DropdownMenuItem>
                  ))}
                  {selectedCategoryId && (
                    <DropdownMenuItem onClick={() => setSelectedCategoryId('')} className="rounded-lg font-bold p-2.5 cursor-pointer text-red-500 hover:bg-red-50 text-sm">
                      Clear
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Location input */}
            <div className="flex-1 min-w-0 w-full flex items-center bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-xl lg:shadow-none px-3 sm:px-5 h-12 lg:h-14 group">
              <MapPin className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5 shrink-0 mr-2 sm:mr-3 group-focus-within:text-[#ffcf1c] transition-colors" />
              <Input
                value={selectedCategory?.name_ar || selectedCategory?.name_ms || ''}
                readOnly
                placeholder="Address, neighborhood"
                className="h-full border-none bg-transparent text-sm sm:text-base focus-visible:ring-0 p-0 placeholder:text-gray-400 truncate"
              />
            </div>

            {/* Search button */}
            <div className="w-full lg:w-auto lg:pl-2">
              <Button
                type="submit"
                className="h-12 w-full lg:w-auto px-6 sm:px-8 rounded-xl lg:rounded-lg text-sm sm:text-base font-bold uppercase tracking-wide transition-all active:scale-95 text-black"
                style={{ background: '#ffcf1c' }}
              >
                SEARCH
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
