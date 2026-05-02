import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MenuItemFormState = {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  name_ms: string;
  description_en: string;
  description_ar: string;
  description_ms: string;
  price: string;
  taqs: string[];
  image_base64: string;
  is_available: boolean;
};

const normalizeTaqs = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  const uniqueByKey = new Map<string, string>();
  value.forEach((entry) => {
    const cleaned = String(entry || '').trim();
    if (!cleaned) return;

    const key = cleaned.toLowerCase();
    if (!uniqueByKey.has(key)) {
      uniqueByKey.set(key, cleaned);
    }
  });

  return Array.from(uniqueByKey.values());
};

const emptyForm: MenuItemFormState = {
  id: '',
  category_id: '',
  name_en: '',
  name_ar: '',
  name_ms: '',
  description_en: '',
  description_ar: '',
  description_ms: '',
  price: '',
  taqs: [],
  image_base64: '',
  is_available: true,
};

// Camera Icon Component
const CameraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

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

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [loadedCategories, loadedMenuItems] = await Promise.all([
        getCategories(),
        getRestaurantMenuItems(),
      ]);

      // Filter out items that might have been deleted
      const validMenuItems = loadedMenuItems.filter(item =>
        item && item.name_en && item.id
      );

      setCategories(loadedCategories);
      setMenuItems(validMenuItems);
      setCreateForm((current) => ({
        ...current,
        category_id: current.category_id || loadedCategories[0]?.id || '',
      }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to load menu item data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<MenuItemFormState>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setter((current) => ({ ...current, image_base64: dataUrl }));
      setCreateImageError(false);
    } catch (error) {
      await showErrorAlert(error, 'Unable to read image');
    }
  };

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditForm((current) => ({ ...current, image_base64: dataUrl }));
    } catch (error) {
      await showErrorAlert(error, 'Unable to read image');
    }
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setEditForm({
      id: item.id,
      category_id: item.category_id,
      name_en: item.name_en,
      name_ar: item.name_ar || '',
      name_ms: item.name_ms || '',
      description_en: item.description_en || '',
      description_ar: item.description_ar || '',
      description_ms: item.description_ms || '',
      price: String(item.price ?? ''),
      taqs: normalizeTaqs((item as any).taqs),
      image_base64: item.image_base64 || '',
      is_available: item.is_available ?? true,
    });
    setExpandedCardId(item.id);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    if (!editForm.name_en.trim()) {
      await showErrorAlert(null, 'Please enter item name in English');
      return;
    }

    if (!editForm.category_id) {
      await showErrorAlert(null, 'Please select a category');
      return;
    }

    if (!editForm.price || parseFloat(editForm.price) <= 0) {
      await showErrorAlert(null, 'Please enter a valid price');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Update Menu Item',
      text: `Are you sure you want to update "${editingItem.name_en}"?`,
      confirmButtonText: 'Yes, Update',
    });

    if (!confirmed) return;

    const submitData: any = {
      id: editForm.id,
      category_id: editForm.category_id,
      name_en: editForm.name_en,
      name_ar: editForm.name_ar,
      name_ms: editForm.name_ms,
      description_en: editForm.description_en,
      description_ar: editForm.description_ar,
      description_ms: editForm.description_ms,
      price: parseFloat(editForm.price),
      taqs: editForm.taqs,
    };

    if (editForm.image_base64 && editForm.image_base64.startsWith('data:image')) {
      submitData.image_base64 = editForm.image_base64;
    }

    await submit(() => updateRestaurantMenuItem(submitData), () => {
      setEditingItem(null);
      setEditForm(emptyForm);
      setExpandedCardId(null);
    });
  };

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = await confirmAction({
      title: 'Delete Menu Item',
      text: `Are you sure you want to delete "${item.name_en}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, Delete',
    });

    if (!confirmed) return;

    await submit(() => deleteRestaurantMenuItem(item.id), () => {
      if (editingItem?.id === item.id) {
        setEditingItem(null);
        setEditForm(emptyForm);
        setExpandedCardId(null);
      }
    });
  };

  const handleCreate = async () => {
    if (!createForm.name_en.trim()) {
      await showErrorAlert(null, 'Please enter item name in English');
      return;
    }

    if (!createForm.category_id) {
      await showErrorAlert(null, 'Please select a category');
      return;
    }

    if (!createForm.price || parseFloat(createForm.price) <= 0) {
      await showErrorAlert(null, 'Please enter a valid price');
      return;
    }

    if (!createForm.image_base64) {
      setCreateImageError(true);
      await showErrorAlert(null, 'Please select an image for the menu item');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Create Menu Item',
      text: `Are you sure you want to create "${createForm.name_en}"?`,
      confirmButtonText: 'Yes, Create',
    });

    if (!confirmed) return;

    const submitData: any = {
      category_id: createForm.category_id,
      name_en: createForm.name_en,
      name_ar: createForm.name_ar,
      name_ms: createForm.name_ms,
      description_en: createForm.description_en,
      description_ar: createForm.description_ar,
      description_ms: createForm.description_ms,
      price: parseFloat(createForm.price),
      taqs: createForm.taqs,
      image_base64: createForm.image_base64,
    };

    await submit(() => createRestaurantMenuItem(submitData), () => {
      setCreateForm({ ...emptyForm, category_id: categories[0]?.id || '' });
      setCreateImageError(false);
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm(emptyForm);
    setExpandedCardId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-none';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-none';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-none';
      default:
        return 'bg-neutral-200 text-neutral-700 border-none';
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#6EA15C]">Restaurant Backend</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Menu Items</h1>
        <p className="text-neutral-500 font-medium">New and updated items are sent to admin review. Only approved items are shown to app users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Menu Item Card */}
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Create</p>
              <h2 className="text-2xl font-black text-neutral-900">New Menu Item</h2>
            </div>

            <div className="space-y-4">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <select
                    value={editForm.category_id}
                    onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                    className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#6EA15C] appearance-none"
                  >
                    <option value="" disabled hidden>Choose a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Name EN *" value={createForm.name_en} onChange={(value) => setCreateForm((current) => ({ ...current, name_en: value }))} required />
                <FormInput label="Name AR" value={createForm.name_ar} onChange={(value) => setCreateForm((current) => ({ ...current, name_ar: value }))} />
                <FormInput label="Name MS" value={createForm.name_ms} onChange={(value) => setCreateForm((current) => ({ ...current, name_ms: value }))} />
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormTextarea label="Description EN" value={createForm.description_en} onChange={(value) => setCreateForm((current) => ({ ...current, description_en: value }))} />
                <FormTextarea label="Description AR" value={createForm.description_ar} onChange={(value) => setCreateForm((current) => ({ ...current, description_ar: value }))} />
                <FormTextarea label="Description MS" value={createForm.description_ms} onChange={(value) => setCreateForm((current) => ({ ...current, description_ms: value }))} />
              </div>

              {/* Taqs */}
              <TaqSection form={createForm} onChange={setCreateForm} />

              {/* Price and Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Price (RM) *" type="number" value={createForm.price} onChange={(value) => setCreateForm((current) => ({ ...current, price: value }))} required />

                {/* Camera Upload Section */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Item Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-col items-center justify-center">
                    <input
                      type="file"
                      id="create-menu-image"
                      accept="image/png,image/jpeg"
                      onChange={(e) => handleImageUpload(e, setCreateForm)}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="create-menu-image"
                      className="relative cursor-pointer group"
                    >
                      <div className={`w-32 h-32 rounded-full border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors ${createImageError
                        ? 'bg-red-50 border-red-400'
                        : 'bg-neutral-100 border-neutral-300 group-hover:bg-neutral-50'
                        }`}>
                        {createForm.image_base64 ? (
                          <img
                            src={createForm.image_base64}
                            alt="Item preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`flex flex-col items-center gap-1 ${createImageError ? 'text-red-400' : 'text-neutral-400'}`}>
                            <CameraIcon />
                            <span className="text-xs font-medium">Upload</span>
                          </div>
                        )}
                      </div>
                      {createForm.image_base64 && (
                        <div className="absolute bottom-0 right-0 bg-[#6EA15C] rounded-full p-1.5 shadow-md">
                          <CameraIcon />
                        </div>
                      )}
                    </label>
                    <p className={`text-xs mt-2 ${createImageError ? 'text-red-500' : 'text-neutral-400'}`}>
                      {createImageError ? 'Image is required' : 'Click to select item image (required)'}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !createForm.name_en || !createForm.category_id || !createForm.price || !createForm.image_base64}
                className="w-full bg-[#6EA15C] hover:bg-[#5D8A4E] text-white rounded-xl font-black uppercase tracking-wide h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Data Section with Edit/Delete Icons */}
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6EA15C]">Live Data</p>
              <h2 className="text-2xl font-black text-neutral-900">Current Menu Items</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {(loading ? [] : menuItems).map((item) => {
                const itemTaqs = normalizeTaqs((item as any).taqs);
                const itemDeleted = !item.name_en || !item.id;

                return (
                  <AnimatePresence key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow ${itemDeleted ? 'opacity-50 bg-neutral-50' : ''}`}
                    >
                      {/* Card Header with Image and Info */}
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                          <img
                            src={item.image_base64 || `https://picsum.photos/seed/${item.id}/100/100`}
                            alt={item.name_en}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-neutral-900 text-lg">{item.name_en}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge className={getStatusBadge(item.verification_status || 'pending')}>
                              {(item.verification_status || 'pending').charAt(0).toUpperCase() + (item.verification_status || 'pending').slice(1)}
                            </Badge>
                            <span className="text-sm font-bold text-[#6EA15C]">{formatCurrency(item.price)}</span>
                          </div>
                          {itemTaqs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {itemTaqs.slice(0, 2).map((taq) => (
                                <span key={taq} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                                  #{taq}
                                </span>
                              ))}
                              {itemTaqs.length > 2 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-400">
                                  +{itemTaqs.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {expandedCardId === item.id && (
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                              title="Cancel edit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Edit Form */}
                      {expandedCardId === item.id && editingItem && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-neutral-100 bg-neutral-50 p-4 space-y-4"
                        >
                          {/* Category */}
                          <div>
                            <Label className="text-xs font-bold">Category *</Label>
                            <select
                              value={editForm.category_id}
                              onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                              className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#6EA15C] mt-1"
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name_en}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Name Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-bold">Name EN *</Label>
                              <Input
                                value={editForm.name_en}
                                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                                className="mt-1"
                                placeholder="English name"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold">Name AR</Label>
                              <Input
                                value={editForm.name_ar}
                                onChange={(e) => setEditForm({ ...editForm, name_ar: e.target.value })}
                                className="mt-1"
                                placeholder="Arabic name"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold">Name MS</Label>
                              <Input
                                value={editForm.name_ms}
                                onChange={(e) => setEditForm({ ...editForm, name_ms: e.target.value })}
                                className="mt-1"
                                placeholder="Malay name"
                              />
                            </div>
                          </div>

                          {/* Description Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-bold">Description EN</Label>
                              <Textarea
                                value={editForm.description_en}
                                onChange={(e) => setEditForm({ ...editForm, description_en: e.target.value })}
                                className="mt-1 min-h-[60px]"
                                placeholder="English description"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold">Description AR</Label>
                              <Textarea
                                value={editForm.description_ar}
                                onChange={(e) => setEditForm({ ...editForm, description_ar: e.target.value })}
                                className="mt-1 min-h-[60px]"
                                placeholder="Arabic description"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold">Description MS</Label>
                              <Textarea
                                value={editForm.description_ms}
                                onChange={(e) => setEditForm({ ...editForm, description_ms: e.target.value })}
                                className="mt-1 min-h-[60px]"
                                placeholder="Malay description"
                              />
                            </div>
                          </div>

                          {/* Price and Image */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs font-bold">Price (RM) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                className="mt-1"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold">Update Image</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                                  <img
                                    src={editForm.image_base64 || editingItem.image_base64 || 'https://picsum.photos/seed/placeholder/100/100'}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <input
                                  type="file"
                                  id={`edit-image-${item.id}`}
                                  accept="image/png,image/jpeg"
                                  onChange={handleEditImageUpload}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`edit-image-${item.id}`}
                                  className="text-sm text-[#6EA15C] font-medium cursor-pointer hover:underline"
                                >
                                  Change Image
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Taqs for edit */}
                          <TaqSection form={editForm} onChange={setEditForm} />

                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={handleUpdate}
                              disabled={isSubmitting}
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                            >
                              {isSubmitting ? 'Updating...' : 'Update Item'}
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              className="flex-1 border-neutral-300 rounded-xl font-bold"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                );
              })}
              {!loading && !menuItems.length && (
                <p className="text-sm text-neutral-500 text-center py-8">No menu items yet. Create your first menu item!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Taq Section Component
function TaqSection({
  form,
  onChange,
}: {
  form: MenuItemFormState;
  onChange: React.Dispatch<React.SetStateAction<MenuItemFormState>>;
}) {
  const [taqDraft, setTaqDraft] = React.useState('');
  const taqListId = React.useId();

  const addTaq = React.useCallback((rawValue: string) => {
    const candidate = rawValue.trim();
    if (!candidate) return;

    onChange((current) => {
      const normalizedCurrent = normalizeTaqs(current.taqs);
      if (normalizedCurrent.some((tag) => tag.toLowerCase() === candidate.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        taqs: [...normalizedCurrent, candidate],
      };
    });
    setTaqDraft('');
  }, [onChange]);

  const removeTaq = React.useCallback((value: string) => {
    onChange((current) => ({
      ...current,
      taqs: normalizeTaqs(current.taqs).filter((tag) => tag !== value),
    }));
  }, [onChange]);

  const handleTaqKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTaq(taqDraft);
    }
  };

  const selectedTaqs = normalizeTaqs(form.taqs);

  return (
    <div className="space-y-2">
      <Label>Taqs</Label>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input
          value={taqDraft}
          onChange={(event) => setTaqDraft(event.target.value)}
          onKeyDown={handleTaqKeyDown}
          list={taqListId}
          placeholder="Type a taq and press Enter"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-xl font-black uppercase tracking-wide"
          onClick={() => addTaq(taqDraft)}
        >
          Add Taq
        </Button>
        <datalist id={taqListId}>
          {TAQ_OPTIONS.map((taq) => (
            <option key={taq} value={taq} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTaqs.map((taq) => (
          <span
            key={taq}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700"
          >
            {taq}
            <button
              type="button"
              onClick={() => removeTaq(taq)}
              className="rounded-full border border-neutral-200 px-1.5 text-[10px] font-black leading-none text-neutral-500 hover:bg-neutral-100"
              aria-label={`Remove ${taq}`}
            >
              x
            </button>
          </span>
        ))}
        {!selectedTaqs.length && <p className="text-xs text-neutral-400">No taqs selected. Type a taq and press Enter.</p>}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <Input
        type={type}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function FormTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Textarea placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24" />
    </div>
  );
}