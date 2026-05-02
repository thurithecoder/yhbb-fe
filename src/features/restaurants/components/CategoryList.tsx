import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '@/types';

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categoryList = categories.slice(0, 10);

  return (
    <section className="py-20 bg-[#f5f4f0]">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block w-9 h-1 bg-[#6EA15C] rounded-full mb-4" />
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 uppercase">{t('categories.title')}</h2>
          <p className="text-neutral-500 font-medium mt-2">{t('categories.subtitle')}</p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
          {categoryList.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/restaurants?categoryId=${category.id}`)}
              className="flex-[0_0_200px] bg-white border border-neutral-200 rounded-2xl p-8 text-center relative cursor-pointer group transition-all duration-300 hover:border-[#6EA15C] hover:-translate-y-1"
            >
              <div className="category-image-container mx-auto relative">
                {category.image_base64 ? (
                  <img src={category.image_base64} alt={category.name_en} className="category-image" />
                ) : (
                  <span className="text-sm font-black text-neutral-400">IMG</span>
                )}
                <span className="category-number-badge">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight">{category.name_en}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
