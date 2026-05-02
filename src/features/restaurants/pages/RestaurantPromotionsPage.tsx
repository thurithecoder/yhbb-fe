// import * as React from 'react';
// import { Trash2 } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import PromotionCard from '@/features/restaurants/components/PromotionCard';
// import {
//   createRestaurantPromotion,
//   deleteRestaurantPromotion,
//   getRestaurantPromotions,
// } from '@/features/restaurants/services';
// import { readFileAsDataUrl } from '@/utils';
// import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
// import type { Promotion } from '@/types';

// const emptyPromotionForm = {
//   title: '',
//   description: '',
//   start_date: '',
//   end_date: '',
//   discount_type: 'percent' as 'percent' | 'cash',
//   discount_percent: '',
//   min_spend: '',
//   max_uses_total: '',
//   max_uses_per_user: '',
//   image_base64: '',
// };

// export default function RestaurantPromotionsPage() {
//   const [loading, setLoading] = React.useState(true);
//   const [isSubmitting, setIsSubmitting] = React.useState(false);
//   const [promotions, setPromotions] = React.useState<Promotion[]>([]);
//   const [form, setForm] = React.useState(emptyPromotionForm);

//   const loadPromotions = React.useCallback(async () => {
//     try {
//       setLoading(true);
//       setPromotions(await getRestaurantPromotions());
//     } catch (error) {
//       await showErrorAlert(error, 'Unable to load promotions');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   React.useEffect(() => {
//     loadPromotions();
//   }, [loadPromotions]);

//   const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     try {
//       const dataUrl = await readFileAsDataUrl(file);
//       setForm((current) => ({ ...current, image_base64: dataUrl }));
//     } catch (error) {
//       await showErrorAlert(error, 'Unable to read promotion image');
//     }
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const payload: Record<string, unknown> = {
//         title: form.title,
//         description: form.description || undefined,
//         start_date: form.start_date || undefined,
//         end_date: form.end_date || undefined,
//         discount_type: form.discount_percent ? form.discount_type : undefined,
//         discount_percent: form.discount_percent || undefined,
//         image_base64: form.image_base64 || undefined,
//       };
//       if (form.max_uses_total.trim()) payload.max_uses_total = parseInt(form.max_uses_total, 10);
//       if (form.max_uses_per_user.trim()) payload.max_uses_per_user = parseInt(form.max_uses_per_user, 10);
//       if (form.min_spend.trim()) payload.min_spend = parseFloat(form.min_spend);

//       const result = await createRestaurantPromotion(payload);
//       await showSuccessAlert(result.msg || 'Promotion created successfully.');
//       setForm(emptyPromotionForm);
//       await loadPromotions();
//     } catch (error) {
//       await showErrorAlert(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (promotion: Promotion) => {
//     const confirmed = await confirmAction({
//       title: 'Delete promotion?',
//       text: `"${promotion.title}" will be permanently removed.`,
//       confirmButtonText: 'Delete',
//     });
//     if (!confirmed) return;
//     try {
//       const result = await deleteRestaurantPromotion(promotion.id);
//       await showSuccessAlert(result.msg || 'Promotion deleted.');
//       await loadPromotions();
//     } catch (error) {
//       await showErrorAlert(error);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div className="space-y-2">
//         <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Backend</p>
//         <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Promotions</h1>
//         <p className="text-neutral-500 font-medium">Create voucher promotions with usage limits. Users claim a voucher code and your staff can scan or enter it to redeem.</p>
//       </div>

//       <Card className="rounded-[32px] border-none shadow-sm bg-white">
//         <CardContent className="p-8">
//           <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//             <div className="space-y-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Promotion Title <span className="text-red-500">*</span></Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">The name customers will see for this promotion</p>
//                 <Input
//                   placeholder="e.g. Weekend Special"
//                   value={form.title}
//                   onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
//                 />
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Description</Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">Explain what customers receive with this promotion</p>
//                 <Textarea
//                   placeholder="Describe what the customer gets with this promotion"
//                   value={form.description}
//                   onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
//                   className="min-h-24"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Start Date</Label>
//                   <p className="text-[10px] text-neutral-400 font-medium mb-1">When promotion goes live</p>
//                   <Input type="date" value={form.start_date} onChange={(e) => setForm((c) => ({ ...c, start_date: e.target.value }))} />
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">End Date</Label>
//                   <p className="text-[10px] text-neutral-400 font-medium mb-1">When promotion expires</p>
//                   <Input type="date" value={form.end_date} onChange={(e) => setForm((c) => ({ ...c, end_date: e.target.value }))} />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Discount Type</Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">Choose between percentage or fixed amount discount</p>
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setForm((c) => ({ ...c, discount_type: 'percent' }))}
//                     className={`flex-1 py-2 rounded-xl text-sm font-black uppercase tracking-wide border-2 transition-colors ${form.discount_type === 'percent' ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#6EA15C]'}`}
//                   >
//                     % Percent
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setForm((c) => ({ ...c, discount_type: 'cash' }))}
//                     className={`flex-1 py-2 rounded-xl text-sm font-black uppercase tracking-wide border-2 transition-colors ${form.discount_type === 'cash' ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#6EA15C]'}`}
//                   >
//                     $ Cash
//                   </button>
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
//                   {form.discount_type === 'cash' ? 'Discount Amount (Cash)' : 'Discount Amount (%)'}
//                 </Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">{form.discount_type === 'cash' ? 'Enter discount amount in currency' : 'Enter discount percentage (0-100)'}</p>
//                 <Input
//                   type="number"
//                   min={0}
//                   max={form.discount_type === 'percent' ? 100 : undefined}
//                   placeholder={form.discount_type === 'cash' ? 'e.g. 5000' : 'e.g. 10'}
//                   value={form.discount_percent}
//                   onChange={(e) => setForm((c) => ({ ...c, discount_percent: e.target.value }))}
//                 />
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Minimum Spend (Optional)</Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">Customers must spend this amount to use the promotion</p>
//                 <Input
//                   type="number"
//                   min={0}
//                   placeholder="e.g. 5000 (leave blank for no minimum)"
//                   value={form.min_spend}
//                   onChange={(e) => setForm((c) => ({ ...c, min_spend: e.target.value }))}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Total Tickets</Label>
//                   <p className="text-[10px] text-neutral-400 font-medium mb-1">Total coupons available (leave blank for unlimited)</p>
//                   <Input
//                     type="number"
//                     min={1}
//                     placeholder="e.g. 100"
//                     value={form.max_uses_total}
//                     onChange={(e) => setForm((c) => ({ ...c, max_uses_total: e.target.value }))}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Uses Per User</Label>
//                   <p className="text-[10px] text-neutral-400 font-medium mb-1">How many times each customer can use it</p>
//                   <Input
//                     type="number"
//                     min={1}
//                     placeholder="e.g. 1"
//                     value={form.max_uses_per_user}
//                     onChange={(e) => setForm((c) => ({ ...c, max_uses_per_user: e.target.value }))}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Promotion Image</Label>
//                 <p className="text-[10px] text-neutral-400 font-medium mb-1">Upload PNG or JPEG image to display with promotion</p>
//                 <Input type="file" accept="image/png,image/jpeg" onChange={handleImageChange} />
//               </div>
//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide"
//               >
//                 {isSubmitting ? 'Saving...' : 'Create Promotion'}
//               </Button>
//             </div>

//             <div className="space-y-4">
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Preview</p>
//               <PromotionCard
//                 promotion={{
//                   id: 'preview',
//                   restaurant_id: 'preview',
//                   title: form.title || 'Promotion title',
//                   description: form.description || 'Your promotion will appear with this look.',
//                   start_date: form.start_date || null,
//                   end_date: form.end_date || null,
//                   discount_type: form.discount_percent ? form.discount_type : null,
//                   discount_percent: form.discount_percent || null,
//                   min_spend: form.min_spend ? parseFloat(form.min_spend) : null,
//                   max_uses_total: form.max_uses_total ? parseInt(form.max_uses_total, 10) : null,
//                   max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user, 10) : null,
//                   current_uses: 0,
//                   image_base64: form.image_base64 || null,
//                 }}
//               />
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       <div>
//         <h2 className="text-xl font-black uppercase tracking-tight text-neutral-800 mb-4">Active Promotions</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {promotions.map((promotion) => (
//             <div key={promotion.id} className="relative group">
//               <PromotionCard promotion={promotion} />
//               <button
//                 onClick={() => handleDelete(promotion)}
//                 className="absolute top-4 right-4 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
//                 title="Delete promotion"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           ))}
//         </div>
//         {!loading && !promotions.length && (
//           <p className="text-sm text-neutral-500">No promotions created yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }
import * as React from 'react';
import { Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PromotionCard from '@/features/restaurants/components/PromotionCard';
import {
  createRestaurantPromotion,
  deleteRestaurantPromotion,
  getRestaurantPromotions,
} from '@/features/restaurants/services';
import { readFileAsDataUrl } from '@/utils';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import type { Promotion } from '@/types';

const emptyPromotionForm = {
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  discount_type: 'percent' as 'percent' | 'cash',
  discount_percent: '',
  min_spend: '',
  max_uses_total: '',
  max_uses_per_user: '',
  image_base64: '',
};

export default function RestaurantPromotionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [form, setForm] = React.useState(emptyPromotionForm);

  const loadPromotions = React.useCallback(async () => {
    try {
      setLoading(true);
      setPromotions(await getRestaurantPromotions());
    } catch (error) {
      await showErrorAlert(error, 'Unable to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, image_base64: dataUrl }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to read promotion image');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        discount_type: form.discount_percent ? form.discount_type : undefined,
        discount_percent: form.discount_percent || undefined,
        image_base64: form.image_base64 || undefined,
      };
      if (form.max_uses_total.trim()) payload.max_uses_total = parseInt(form.max_uses_total, 10);
      if (form.max_uses_per_user.trim()) payload.max_uses_per_user = parseInt(form.max_uses_per_user, 10);
      if (form.min_spend.trim()) payload.min_spend = parseFloat(form.min_spend);

      const result = await createRestaurantPromotion(payload);
      await showSuccessAlert(result.msg || 'Promotion created successfully.');
      setForm(emptyPromotionForm);
      await loadPromotions();
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    const confirmed = await confirmAction({
      title: 'Delete promotion?',
      text: `"${promotion.title}" will be permanently removed.`,
      confirmButtonText: 'Delete',
    });
    if (!confirmed) return;
    try {
      const result = await deleteRestaurantPromotion(promotion.id);
      await showSuccessAlert(result.msg || 'Promotion deleted.');
      await loadPromotions();
    } catch (error) {
      await showErrorAlert(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Backend</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Promotions</h1>
        <p className="text-neutral-500 font-medium">Create voucher promotions with usage limits. Users claim a voucher code and your staff can scan or enter it to redeem.</p>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Promotion Title <span className="text-red-500">*</span></Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">The name customers will see for this promotion</p>
                <Input
                  placeholder="e.g. Weekend Special"
                  value={form.title}
                  onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Description</Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">Explain what customers receive with this promotion</p>
                <Textarea
                  placeholder="Describe what the customer gets with this promotion"
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Start Date</Label>
                  <p className="text-[10px] text-neutral-400 font-medium mb-1">When promotion goes live</p>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm((c) => ({ ...c, start_date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">End Date</Label>
                  <p className="text-[10px] text-neutral-400 font-medium mb-1">When promotion expires</p>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm((c) => ({ ...c, end_date: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Discount Type</Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">Choose between percentage or fixed amount discount</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, discount_type: 'percent' }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-black uppercase tracking-wide border-2 transition-colors ${form.discount_type === 'percent' ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#6EA15C]'}`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, discount_type: 'cash' }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-black uppercase tracking-wide border-2 transition-colors ${form.discount_type === 'cash' ? 'bg-[#6EA15C] text-white border-[#6EA15C]' : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#6EA15C]'}`}
                  >
                    $ Cash
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {form.discount_type === 'cash' ? 'Discount Amount (Cash)' : 'Discount Amount (%)'}
                </Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">{form.discount_type === 'cash' ? 'Enter discount amount in currency' : 'Enter discount percentage (0-100)'}</p>
                <Input
                  type="number"
                  min={0}
                  max={form.discount_type === 'percent' ? 100 : undefined}
                  placeholder={form.discount_type === 'cash' ? 'e.g. 5000' : 'e.g. 10'}
                  value={form.discount_percent}
                  onChange={(e) => setForm((c) => ({ ...c, discount_percent: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Minimum Spend (Optional)</Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">Customers must spend this amount to use the promotion</p>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 5000 (leave blank for no minimum)"
                  value={form.min_spend}
                  onChange={(e) => setForm((c) => ({ ...c, min_spend: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Total Tickets</Label>
                  <p className="text-[10px] text-neutral-400 font-medium mb-1">Total coupons available (leave blank for unlimited)</p>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 100"
                    value={form.max_uses_total}
                    onChange={(e) => setForm((c) => ({ ...c, max_uses_total: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Uses Per User</Label>
                  <p className="text-[10px] text-neutral-400 font-medium mb-1">How many times each customer can use it</p>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    value={form.max_uses_per_user}
                    onChange={(e) => setForm((c) => ({ ...c, max_uses_per_user: e.target.value }))}
                  />
                </div>
              </div>

              {/* Promotion Image Upload with Camera/Image Icon - Full image display */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Promotion Image</Label>
                <p className="text-[10px] text-neutral-400 font-medium mb-1">Upload PNG or JPEG image to display with promotion</p>
                <input
                  id="promotion-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="promotion-image"
                  className="relative block min-h-[200px] overflow-hidden rounded-2xl border-2 border-dashed border-[#6EA15C]/50 bg-[#F7FBF6] cursor-pointer transition-colors hover:border-[#6EA15C]"
                >
                  {form.image_base64 ? (
                    <>
                      <div className="flex items-center justify-center p-4 bg-white/50 min-h-[200px]">
                        <img
                          src={form.image_base64}
                          alt="Promotion preview"
                          className="max-w-full max-h-[300px] w-auto h-auto object-contain"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs font-black uppercase tracking-wide py-2 text-center">
                        Change Image
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full grid place-items-center px-4 py-8 min-h-[200px]">
                      <div className="flex flex-col items-center gap-2 text-[#6EA15C]">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-[#6EA15C]/30 grid place-items-center">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="font-black uppercase tracking-wide text-sm flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </p>
                        <p className="text-xs font-semibold text-neutral-500">Click to select promotion image</p>
                        <p className="text-[10px] text-neutral-400">Supports PNG, JPEG, WEBP</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide"
              >
                {isSubmitting ? 'Saving...' : 'Create Promotion'}
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Preview</p>
              <PromotionCard
                promotion={{
                  id: 'preview',
                  restaurant_id: 'preview',
                  title: form.title || 'Promotion title',
                  description: form.description || 'Your promotion will appear with this look.',
                  start_date: form.start_date || null,
                  end_date: form.end_date || null,
                  discount_type: form.discount_percent ? form.discount_type : null,
                  discount_percent: form.discount_percent || null,
                  min_spend: form.min_spend ? parseFloat(form.min_spend) : null,
                  max_uses_total: form.max_uses_total ? parseInt(form.max_uses_total, 10) : null,
                  max_uses_per_user: form.max_uses_per_user ? parseInt(form.max_uses_per_user, 10) : null,
                  current_uses: 0,
                  image_base64: form.image_base64 || null,
                }}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-800 mb-4">Active Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="relative group">
              <PromotionCard promotion={promotion} />
              <button
                onClick={() => handleDelete(promotion)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Delete promotion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {!loading && !promotions.length && (
          <p className="text-sm text-neutral-500">No promotions created yet.</p>
        )}
      </div>
    </div>
  );
}