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
    <section className="py-12 sm:py-20 bg-[#ffcf1c]">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          {/* eyebrow accent — black line instead of yellow */}
          <div className="inline-block w-8 sm:w-9 h-1 bg-black rounded-full mb-3 sm:mb-4" />

          {/* heading color */}
          <h2
            style={{ fontFamily: "'Georgia', serif" }}
            className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase"
          >
            {t('categories.title')}
          </h2>

          {/* subtitle */}
          <p className="text-[#5a4a00] text-sm sm:text-base font-medium mt-1.5 sm:mt-2">
            {t('categories.subtitle')}
          </p>
        </div>

        {/* Reduced gap on mobile for better scrolling flow */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-8 no-scrollbar">
          {categoryList.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/restaurants?categoryId=${category.id}`)}

              className="flex-[0_0_130px] sm:flex-[0_0_170px] shrink-0 bg-[#111] border border-[#2a2a2a] rounded-[0.9rem] sm:rounded-[1.25rem] px-3 sm:px-5 pt-6 sm:pt-8 pb-5 sm:pb-6 text-center relative cursor-pointer group transition-all duration-300 hover:border-[#ffcf1c] hover:-translate-y-1"
            >
              {/* Image circle — smaller on mobile */}
              <div className="mx-auto relative border-[2px] sm:border-[3px] border-[#ffcf1c] rounded-full w-[56px] sm:w-[72px] h-[56px] sm:h-[72px] flex items-center justify-center bg-black/40">
                {category.image_base64 ? (
                  <img
                    src={category.image_base64}
                    alt={category.name_en}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-[10px] sm:text-sm font-black text-neutral-400">IMG</span>
                )}

                {/* Badge — yellow bg with black border, smaller on mobile */}
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-[#ffcf1c] border border-black text-black flex items-center justify-center rounded-full font-black w-5 sm:w-6 h-5 sm:h-6 text-[8px] sm:text-[9px] z-10">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-3 sm:mt-4">
                {/* category name - smaller font on mobile */}
                <h3 className="text-[13px] sm:text-base leading-tight font-black text-white uppercase tracking-tight">
                  {category.name_en}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}