import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, ChevronDown, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';
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

  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  React.useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
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
    <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80"
          className="w-full h-full object-cover"
          alt="Hero Background"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
      </div>

      <div className="container relative z-10 px-4 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight uppercase">
            {t('hero.title').split(' ')[0]} & <span className="text-[#6EA15C]">{t('hero.title').split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-neutral-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto bg-white p-2 rounded-2xl md:rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-2"
        >
          <div className="flex-[1.5] w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-[#6EA15C] transition-colors" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('hero.search_placeholder')}
              className="h-14 pl-14 pr-32 md:pr-36 border-none bg-transparent text-lg focus-visible:ring-0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex h-10 max-w-[132px] items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-600 shadow-sm transition-colors hover:border-[#6EA15C] hover:text-[#6EA15C]">
                    <span className="truncate">{selectedPopularTag || 'Tags'}</span>
                    <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
                >
                  {POPULAR_TAGS.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`cursor-pointer rounded-lg px-3 py-2 font-medium ${selectedPopularTag === tag ? 'bg-[#6EA15C]/10 text-[#6EA15C]' : ''}`}
                    >
                      {tag}
                    </DropdownMenuItem>
                  ))}
                  {selectedPopularTag && (
                    <DropdownMenuItem
                      onClick={() => setQuery('')}
                      className="cursor-pointer rounded-lg px-3 py-2 font-medium text-red-500 hover:bg-red-50"
                    >
                      Clear Tag
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-neutral-200" />

          <div className="flex-1 w-full relative group hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="h-14 w-full flex items-center justify-start gap-3 px-6 text-lg font-bold text-neutral-500 hover:text-[#6EA15C] transition-colors cursor-pointer">
                  <Utensils className="w-5 h-5" />
                  <span className="truncate">{selectedCategory?.name_en || t('categories.title', 'Category')}</span>
                  <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl p-2 bg-white shadow-xl border-neutral-100">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="rounded-lg font-bold uppercase tracking-tight p-3 cursor-pointer hover:bg-neutral-50"
                  >
                    {category.name_en}
                  </DropdownMenuItem>
                ))}
                {selectedCategoryId && (
                  <DropdownMenuItem
                    onClick={() => setSelectedCategoryId('')}
                    className="rounded-lg font-bold uppercase tracking-tight p-3 cursor-pointer text-red-500 hover:bg-red-50"
                  >
                    Clear
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:block w-px h-8 bg-neutral-200" />

          <div className="flex-1 w-full relative group hidden md:block">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-[#6EA15C] transition-colors" />
            <Input
              value={selectedCategory?.name_ar || selectedCategory?.name_ms || ''}
              readOnly
              placeholder={t('hero.address_placeholder')}
              className="h-14 pl-12 pr-6 border-none bg-transparent text-lg focus-visible:ring-0"
            />
          </div>
          <Button type="submit" className="w-full md:w-auto h-14 px-10 bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl text-lg font-black uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-green-900/20">
            {t('hero.search_button')}
          </Button>
        </motion.form>

      </div>
    </section>
  );
}
