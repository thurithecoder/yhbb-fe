import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TAQ_OPTIONS } from '@/constants/taqs';
import {
  createRestaurantMenuItem,
  deleteRestaurantMenuItem,
  getCategories,
  getRestaurantMenuItems,
  updateRestaurantMenuItem,
} from '@/features/restaurants/services';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { formatCurrency, readFileAsDataUrl } from '@/utils';
import type { CatalogItem, Category } from '@/types';
import { Edit, Trash2, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── All types, helpers, and state unchanged ──────────────────────────────────
type MenuItemFormState = {
  id: string; category_id: string; name_en: string; name_ar: string; name_ms: string;
  description_en: string; description_ar: string; description_ms: string;
  price: string; taqs: string[]; image_base64: string; is_available: boolean;
};

const normalizeTaqs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const uniqueByKey = new Map<string, string>();
  value.forEach((entry) => {
    const cleaned = String(entry || '').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (!uniqueByKey.has(key)) uniqueByKey.set(key, cleaned);
  });
  return Array.from(uniqueByKey.values());
};

const emptyForm: MenuItemFormState = {
  id: '', category_id: '', name_en: '', name_ar: '', name_ms: '',
  description_en: '', description_ar: '', description_ms: '',
  price: '', taqs: [], image_base64: '', is_available: true,
};

// Status badge styles — dark theme
const statusStyles: Record<string, string> = {
  approved: 'bg-[#052814] text-emerald-400 border-none',
  pending: 'bg-[#2a1f00] text-[#ffcf1c] border-none',
  rejected: 'bg-[#2a0808] text-red-400 border-none',
};

export default function RestaurantMenuRequestsPage() {
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [menuItems, setMenuItems] = React.useState<CatalogItem[]>([]);
  const [createForm, setCreateForm] = React.useState<MenuItemFormState>(emptyForm);
  const [editingItem, setEditingItem] = React.useState<CatalogItem | null>(null);
  const [editForm, setEditForm] = React.useState<MenuItemFormState>(emptyForm);
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(null);
  const [createImageError, setCreateImageError] = React.useState(false);

  // ── All backend logic completely unchanged ────────────────────────────────
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [loadedCategories, loadedMenuItems] = await Promise.all([getCategories(), getRestaurantMenuItems()]);
      const validMenuItems = loadedMenuItems.filter((item) => item && item.name_en && item.id);
      setCategories(loadedCategories);
      setMenuItems(validMenuItems);
      setCreateForm((current) => ({ ...current, category_id: current.category_id || loadedCategories[0]?.id || '' }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to load menu item data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const submit = async (action: () => Promise<{ msg: string }>, onSuccess: () => void) => {
    try {
      setIsSubmitting(true);
      const result = await action();
      await showSuccessAlert(result.msg || 'Saved successfully.');
      onSuccess();
      await loadData();
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<MenuItemFormState>>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setter((current) => ({ ...current, image_base64: dataUrl }));
      setCreateImageError(false);
    } catch (error) { await showErrorAlert(error, 'Unable to read image'); }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditForm((current) => ({ ...current, image_base64: dataUrl }));
    } catch (error) { await showErrorAlert(error, 'Unable to read image'); }
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditForm({
      id: item.id, category_id: item.category_id, name_en: item.name_en,
      name_ar: item.name_ar || '', name_ms: item.name_ms || '',
      description_en: item.description_en || '', description_ar: item.description_ar || '',
      description_ms: item.description_ms || '', price: String(item.price ?? ''),
      taqs: normalizeTaqs((item as any).taqs), image_base64: item.image_base64 || '',
      is_available: item.is_available ?? true,
    });
    setExpandedCardId(item.id);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    if (!editForm.name_en.trim()) { await showErrorAlert(null, 'Please enter item name in English'); return; }
    if (!editForm.category_id) { await showErrorAlert(null, 'Please select a category'); return; }
    if (!editForm.price || parseFloat(editForm.price) <= 0) { await showErrorAlert(null, 'Please enter a valid price'); return; }
    const confirmed = await confirmAction({ title: 'Update Menu Item', text: `Update "${editingItem.name_en}"?`, confirmButtonText: 'Yes, Update' });
    if (!confirmed) return;
    const submitData: any = {
      id: editForm.id, category_id: editForm.category_id, name_en: editForm.name_en,
      name_ar: editForm.name_ar, name_ms: editForm.name_ms, description_en: editForm.description_en,
      description_ar: editForm.description_ar, description_ms: editForm.description_ms,
      price: parseFloat(editForm.price), taqs: editForm.taqs,
    };
    if (editForm.image_base64?.startsWith('data:image')) submitData.image_base64 = editForm.image_base64;
    await submit(() => updateRestaurantMenuItem(submitData), () => { setEditingItem(null); setEditForm(emptyForm); setExpandedCardId(null); });
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = await confirmAction({ title: 'Delete Menu Item', text: `Delete "${item.name_en}"? Cannot be undone.`, confirmButtonText: 'Yes, Delete' });
    if (!confirmed) return;
    await submit(() => deleteRestaurantMenuItem(item.id), () => {
      if (editingItem?.id === item.id) { setEditingItem(null); setEditForm(emptyForm); setExpandedCardId(null); }
    });
  };

  const handleCreate = async () => {
    if (!createForm.name_en.trim()) { await showErrorAlert(null, 'Please enter item name in English'); return; }
    if (!createForm.category_id) { await showErrorAlert(null, 'Please select a category'); return; }
    if (!createForm.price || parseFloat(createForm.price) <= 0) { await showErrorAlert(null, 'Please enter a valid price'); return; }
    if (!createForm.image_base64) { setCreateImageError(true); await showErrorAlert(null, 'Please select an image'); return; }
    const confirmed = await confirmAction({ title: 'Create Menu Item', text: `Create "${createForm.name_en}"?`, confirmButtonText: 'Yes, Create' });
    if (!confirmed) return;
    const submitData: any = {
      category_id: createForm.category_id, name_en: createForm.name_en, name_ar: createForm.name_ar,
      name_ms: createForm.name_ms, description_en: createForm.description_en, description_ar: createForm.description_ar,
      description_ms: createForm.description_ms, price: parseFloat(createForm.price),
      taqs: createForm.taqs, image_base64: createForm.image_base64,
    };
    await submit(() => createRestaurantMenuItem(submitData), () => { setCreateForm({ ...emptyForm, category_id: categories[0]?.id || '' }); setCreateImageError(false); });
  };

  const cancelEdit = () => { setEditingItem(null); setEditForm(emptyForm); setExpandedCardId(null); };
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#ffcf1c] min-h-screen">

      {/* ── Hero band ── */}
      <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-[3px] bg-black rounded-full" />
            <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
              Restaurant Backend
            </span>
          </div>
          <h1
            className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-2"
            style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
          >
            Menu Items
          </h1>
          <p className="text-[#5a4a00] font-semibold text-sm max-w-lg leading-relaxed">
            New and updated items go to admin review. Only approved items are shown to users.
          </p>
        </div>
      </section>

      <div className="h-[5px] bg-black" />

      {/* ── Main content ── */}
      <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Create form card ── */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-[9px] font-black text-[#ffcf1c] uppercase tracking-[0.18em] mb-1">Create</p>
                <h2
                  className="font-black text-white uppercase tracking-tight"
                  style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
                >
                  New Menu Item
                </h2>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <DarkField label="Category *">
                  <div className="relative">
                    <select
                      value={createForm.category_id}
                      onChange={(e) => setCreateForm({ ...createForm, category_id: e.target.value })}
                      className={darkSelect}
                    >
                      <option value="" disabled hidden>Choose a category</option>
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
                    </select>
                  </div>
                </DarkField>

                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DarkField label="Name EN *">
                    <input value={createForm.name_en} onChange={(e) => setCreateForm((f) => ({ ...f, name_en: e.target.value }))} placeholder="English name" className={darkInput} required />
                  </DarkField>
                  <DarkField label="Name AR">
                    <input value={createForm.name_ar} onChange={(e) => setCreateForm((f) => ({ ...f, name_ar: e.target.value }))} placeholder="Arabic name" className={darkInput} />
                  </DarkField>
                  <DarkField label="Name MS">
                    <input value={createForm.name_ms} onChange={(e) => setCreateForm((f) => ({ ...f, name_ms: e.target.value }))} placeholder="Malay name" className={darkInput} />
                  </DarkField>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DarkField label="Desc EN">
                    <textarea value={createForm.description_en} onChange={(e) => setCreateForm((f) => ({ ...f, description_en: e.target.value }))} placeholder="English description" className={darkTextarea} />
                  </DarkField>
                  <DarkField label="Desc AR">
                    <textarea value={createForm.description_ar} onChange={(e) => setCreateForm((f) => ({ ...f, description_ar: e.target.value }))} placeholder="Arabic description" className={darkTextarea} />
                  </DarkField>
                  <DarkField label="Desc MS">
                    <textarea value={createForm.description_ms} onChange={(e) => setCreateForm((f) => ({ ...f, description_ms: e.target.value }))} placeholder="Malay description" className={darkTextarea} />
                  </DarkField>
                </div>

                {/* Tags */}
                <TaqSection form={createForm} onChange={setCreateForm} />

                {/* Price + Image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <DarkField label="Price (RM) *">
                    <input type="number" value={createForm.price} onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" className={darkInput} required />
                  </DarkField>

                  <DarkField label="Item Image *">
                    <div className="flex flex-col items-center">
                      <input type="file" id="create-menu-image" accept="image/png,image/jpeg" onChange={(e) => handleImageUpload(e, setCreateForm)} className="hidden" />
                      <label htmlFor="create-menu-image" className="cursor-pointer group">
                        <div className={`w-24 h-24 rounded-2xl border-[1.5px] border-dashed overflow-hidden flex items-center justify-center transition-colors ${createImageError ? 'border-red-500 bg-red-900/10' : 'border-[#2a2a2a] bg-[#111] group-hover:border-[#ffcf1c]'
                          }`}>
                          {createForm.image_base64 ? (
                            <img src={createForm.image_base64} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`flex flex-col items-center gap-1 ${createImageError ? 'text-red-400' : 'text-neutral-600'}`}>
                              <Camera className="w-6 h-6" />
                              <span className="text-[9px] font-bold uppercase">Upload</span>
                            </div>
                          )}
                        </div>
                      </label>
                      <p className={`text-[9px] mt-1.5 font-medium ${createImageError ? 'text-red-400' : 'text-neutral-600'}`}>
                        {createImageError ? 'Image required' : 'Click to upload'}
                      </p>
                    </div>
                  </DarkField>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={isSubmitting || !createForm.name_en || !createForm.category_id || !createForm.price || !createForm.image_base64}
                  className="w-full h-12 bg-[#ffcf1c] text-black rounded-xl font-black uppercase tracking-wide text-xs border-none transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Item →'}
                </Button>
              </div>
            </div>

            {/* ── Live data card ── */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-[9px] font-black text-[#ffcf1c] uppercase tracking-[0.18em] mb-1">Live Data</p>
                <h2
                  className="font-black text-white uppercase tracking-tight"
                  style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
                >
                  Current Menu Items
                </h2>
              </div>

              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2a2a2a] border-t-[#ffcf1c] animate-spin" />
                    <p className="text-neutral-700 text-[10px] font-black uppercase tracking-wider">Loading items...</p>
                  </div>
                ) : menuItems.length ? menuItems.map((item) => {
                  const itemTaqs = normalizeTaqs((item as any).taqs);
                  return (
                    <AnimatePresence key={item.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-colors"
                      >
                        {/* Item row */}
                        <div className="flex items-center gap-3 p-3 sm:p-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-[#2a2a2a]">
                            <img
                              src={item.image_base64 || `https://picsum.photos/seed/${item.id}/100/100`}
                              alt={item.name_en}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm truncate">{item.name_en}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <Badge className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${statusStyles[item.verification_status || 'pending'] || statusStyles.pending}`}>
                                {(item.verification_status || 'pending')}
                              </Badge>
                              <span
                                className="font-black text-[#ffcf1c] text-xs"
                                style={{ fontFamily: "'Georgia', serif" }}
                              >
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {itemTaqs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {itemTaqs.slice(0, 2).map((taq) => (
                                  <span key={taq} className="text-[8px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-500 font-bold">#{taq}</span>
                                ))}
                                {itemTaqs.length > 2 && (
                                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-neutral-600">+{itemTaqs.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg bg-[#2a1a00] border border-[#3a2a00] flex items-center justify-center hover:bg-amber-900/40 transition-colors" title="Edit">
                              <Edit className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button onClick={() => handleDelete(item)} className="w-8 h-8 rounded-lg bg-[#2a0808] border border-[#3a1010] flex items-center justify-center hover:bg-red-900/40 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                            {expandedCardId === item.id && (
                              <button onClick={cancelEdit} className="w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center hover:bg-[#333] transition-colors" title="Cancel">
                                <X className="w-3.5 h-3.5 text-neutral-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded edit form */}
                        {expandedCardId === item.id && editingItem && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-[#2a2a2a] bg-[#1a1a1a] p-4 space-y-4"
                          >
                            {/* Category */}
                            <DarkField label="Category *">
                              <select value={editForm.category_id} onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })} className={darkSelect}>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
                              </select>
                            </DarkField>

                            {/* Names */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <DarkField label="Name EN *">
                                <input value={editForm.name_en} onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })} placeholder="English name" className={darkInput} />
                              </DarkField>
                              <DarkField label="Name AR">
                                <input value={editForm.name_ar} onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })} placeholder="Arabic name" className={darkInput} />
                              </DarkField>
                              <DarkField label="Name MS">
                                <input value={editForm.name_ms} onChange={(e) => setEditForm({ ...editForm, name_ms: e.target.value })} placeholder="Malay name" className={darkInput} />
                              </DarkField>
                            </div>

                            {/* Descriptions */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <DarkField label="Desc EN">
                                <textarea value={editForm.description_en} onChange={(e) => setEditForm({ ...editForm, description_en: e.target.value })} placeholder="English description" className={darkTextarea} />
                              </DarkField>
                              <DarkField label="Desc AR">
                                <textarea value={editForm.description_ar} onChange={(e) => setEditForm({ ...editForm, description_ar: e.target.value })} placeholder="Arabic description" className={darkTextarea} />
                              </DarkField>
                              <DarkField label="Desc MS">
                                <textarea value={editForm.description_ms} onChange={(e) => setEditForm({ ...editForm, description_ms: e.target.value })} placeholder="Malay description" className={darkTextarea} />
                              </DarkField>
                            </div>

                            {/* Price + Image */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                              <DarkField label="Price (RM) *">
                                <input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="0.00" className={darkInput} />
                              </DarkField>
                              <DarkField label="Update Image">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#111] border border-[#2a2a2a] flex-shrink-0">
                                    <img src={editForm.image_base64 || editingItem.image_base64 || `https://picsum.photos/seed/placeholder/100/100`} alt="Preview" className="w-full h-full object-cover" />
                                  </div>
                                  <input type="file" id={`edit-image-${item.id}`} accept="image/png,image/jpeg" onChange={handleEditImageUpload} className="hidden" />
                                  <label htmlFor={`edit-image-${item.id}`} className="text-[10px] font-black text-[#ffcf1c] uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity">
                                    Change Image
                                  </label>
                                </div>
                              </DarkField>
                            </div>

                            <TaqSection form={editForm} onChange={setEditForm} />

                            <div className="flex gap-3 pt-1">
                              <Button
                                onClick={handleUpdate}
                                disabled={isSubmitting}
                                className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black uppercase tracking-wide text-xs border-none"
                              >
                                {isSubmitting ? 'Updating...' : 'Update Item'}
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                className="flex-1 h-10 bg-[#2a2a2a] hover:bg-[#333] text-neutral-400 rounded-xl font-black uppercase tracking-wide text-xs border-none"
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  );
                }) : (
                  <div className="py-16 text-center">
                    <p className="text-neutral-700 text-xs font-black uppercase tracking-wider">No items yet. Create your first one!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

// ── TaqSection — logic unchanged, only styled ────────────────────────────────
function TaqSection({ form, onChange }: { form: MenuItemFormState; onChange: React.Dispatch<React.SetStateAction<MenuItemFormState>> }) {
  const [taqDraft, setTaqDraft] = React.useState('');
  const taqListId = React.useId();

  const addTaq = React.useCallback((rawValue: string) => {
    const candidate = rawValue.trim();
    if (!candidate) return;
    onChange((current) => {
      const normalized = normalizeTaqs(current.taqs);
      if (normalized.some((tag) => tag.toLowerCase() === candidate.toLowerCase())) return current;
      return { ...current, taqs: [...normalized, candidate] };
    });
    setTaqDraft('');
  }, [onChange]);

  const removeTaq = React.useCallback((value: string) => {
    onChange((current) => ({ ...current, taqs: normalizeTaqs(current.taqs).filter((t) => t !== value) }));
  }, [onChange]);

  const handleTaqKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTaq(taqDraft); }
  };

  const selectedTaqs = normalizeTaqs(form.taqs);

  return (
    <div className="space-y-2">
      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em]">Tags</span>
      <div className="flex gap-2">
        <input
          value={taqDraft}
          onChange={(e) => setTaqDraft(e.target.value)}
          onKeyDown={handleTaqKeyDown}
          list={taqListId}
          placeholder="Type a tag and press Enter"
          className={`${darkInput} flex-1`}
        />
        <button
          type="button"
          onClick={() => addTaq(taqDraft)}
          className="h-10 px-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#ffcf1c] text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-[#3a3a3a] transition-colors flex-shrink-0"
        >
          Add
        </button>
        <datalist id={taqListId}>{TAQ_OPTIONS.map((taq) => <option key={taq} value={taq} />)}</datalist>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {selectedTaqs.map((taq) => (
          <span key={taq} className="inline-flex items-center gap-1.5 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] px-3 py-1 text-[9px] font-bold text-neutral-400">
            #{taq}
            <button type="button" onClick={() => removeTaq(taq)} className="text-neutral-600 hover:text-red-400 transition-colors leading-none" aria-label={`Remove ${taq}`}>×</button>
          </span>
        ))}
        {!selectedTaqs.length && <p className="text-[9px] text-neutral-700">No tags added yet.</p>}
      </div>
    </div>
  );
}

// Shared helpers
function DarkField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.14em]">{label}</label>
      {children}
    </div>
  );
}

const darkInput =
  'w-full h-10 rounded-xl border-[1.5px] border-[#2a2a2a] bg-[#111] text-white text-xs font-medium px-3 outline-none focus:border-[#ffcf1c] transition-colors placeholder:text-neutral-600 font-[inherit]';

const darkSelect =
  'w-full h-10 rounded-xl border-[1.5px] border-[#2a2a2a] bg-[#111] text-white text-xs font-medium px-3 outline-none focus:border-[#ffcf1c] transition-colors appearance-none cursor-pointer font-[inherit]';

const darkTextarea =
  'w-full min-h-[72px] rounded-xl border-[1.5px] border-[#2a2a2a] bg-[#111] text-white text-xs font-medium p-3 outline-none focus:border-[#ffcf1c] transition-colors placeholder:text-neutral-600 resize-none font-[inherit]';