import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { CatalogItem } from '@/types';
import { formatCurrency, getCatalogItemName, truncateText } from '@/utils';

interface BestDealsProps {
  items: CatalogItem[];
}


export default function BestDeals({ items }: BestDealsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Only show deals from approved restaurants
  const approvedDeals = items.filter(
    (deal) => deal.tblrestaurant?.verificationStatus === 'approved' || deal.tblrestaurant?.is_verified === true
  );
  const deals = approvedDeals.slice(0, 6);

  return (
    <section className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900">{t('deals.title')}</h2>
            <p className="text-sm text-neutral-400 font-medium">{t('deals.subtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-sm font-black text-[#ffcf1c] uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            {t('restaurants.view_all')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/restaurants?q=${encodeURIComponent(getCatalogItemName(deal))}`)}
              className="flex items-center gap-6 p-6 bg-white hover:bg-[#FFF9DC]/30 transition-colors group cursor-pointer"
            >
              <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                <img src={deal.image_base64 || `https://picsum.photos/seed/${deal.id}/200/200`} alt={getCatalogItemName(deal)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ffcf1c] mb-1">{deal.tblcategory?.name_en || 'Catalog item'}</p>
                <h3 className="text-base font-black text-neutral-900 truncate mb-0.5">{getCatalogItemName(deal)}</h3>
                <p className="text-xs text-neutral-400 font-medium truncate mb-1">
                  {truncateText(deal.description_en || deal.description_ms || deal.description_ar, 70) || 'Fresh from the backend catalog.'}
                </p>
                <p className="text-sm font-black text-[#ffcf1c]">{formatCurrency(deal.price)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-neutral-400 self-start pt-1">
                <Star className="w-3 h-3 fill-[#ffcf1c] text-[#ffcf1c]" />
                Live
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
