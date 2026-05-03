import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmAction, showErrorAlert, showSuccessAlert } from '@/lib/alerts';
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/features/admin/services';
import { readFileAsDataUrl } from '@/utils';
import type { Category } from '@/types';
import { Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const emptyCategoryForm = {
  id: '',
  name_en: '',
  name_ar: '',
  name_ms: '',
  image_base64: null as string | null,
};

// Camera Icon Component
const CameraIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default function AdminCatalogPage() {
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [createForm, setCreateForm] = React.useState(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [editForm, setEditForm] = React.useState(emptyCategoryForm);
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(null);
  const [createImageError, setCreateImageError] = React.useState(false);

  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      setCategories(await getCategories());
    } catch (error) {
      await showErrorAlert(error, 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<typeof emptyCategoryForm>>
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

  const submit = async (action: () => Promise<{ msg: string }>, onSuccess: () => void) => {
    try {
      setIsSubmitting(true);
      const result = await action();
      await showSuccessAlert(result.msg || 'Saved successfully.');
      onSuccess();
      await loadCategories();
    } catch (error) {
      await showErrorAlert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      id: category.id,
      name_en: category.name_en,
      name_ar: category.name_ar,
      name_ms: category.name_ms,
      image_base64: category.image_base64 || null,
    });
    setExpandedCardId(category.id);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    // Validate required fields
    if (!editForm.name_en.trim()) {
      await showErrorAlert(null, 'Please enter category name in English');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Update Category',
      text: `Are you sure you want to update "${editingCategory.name_en}"?`,
      confirmButtonText: 'Yes, Update',
    });

    if (!confirmed) return;

    // Prepare data - only include image if it exists
    const submitData: any = {
      id: editForm.id,
      name_en: editForm.name_en,
      name_ar: editForm.name_ar,
      name_ms: editForm.name_ms,
    };

    if (editForm.image_base64 && editForm.image_base64.startsWith('data:image')) {
      submitData.image_base64 = editForm.image_base64;
    }

    await submit(() => updateCategory(submitData), () => {
      setEditingCategory(null);
      setEditForm(emptyCategoryForm);
      setExpandedCardId(null);
    });
  };

  const handleDelete = async (category: Category) => {
    // منع حذف تصنيف "Other" نفسه
    if (category.name_en === 'Other') {
      await showErrorAlert(null, 'Cannot delete "Other" category. This is a system default category.');
      return;
    }

    // إذا كان التصنيف يحتوي على عناصر، أظهر تحذيراً إضافياً
    const hasItems = (category as any).item_count > 0;

    let message = `Are you sure you want to delete "${category.name_en}"?`;

    if (hasItems) {
      message = `⚠️ WARNING: This category contains ${(category as any).item_count} menu item(s).\n\nIf you delete this category, all these items will be moved to "Other".\n\nAre you sure you want to continue?`;
    } else {
      message = `Are you sure you want to delete "${category.name_en}"?`;
    }

    const confirmed = await confirmAction({
      title: hasItems ? '⚠️ Delete Category with Items' : 'Delete Category',
      text: message,
      confirmButtonText: 'Yes, Delete',
    });

    if (!confirmed) return;

    await submit(() => deleteCategory({ id: category.id }), () => {
      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setEditForm(emptyCategoryForm);
        setExpandedCardId(null);
      }
    });
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!createForm.name_en.trim()) {
      await showErrorAlert(null, 'Please enter category name in English');
      return;
    }

    if (!createForm.image_base64) {
      setCreateImageError(true);
      await showErrorAlert(null, 'Please select an image for the category');
      return;
    }

    const confirmed = await confirmAction({
      title: 'Create Category',
      text: `Are you sure you want to create "${createForm.name_en}"?`,
      confirmButtonText: 'Yes, Create',
    });

    if (!confirmed) return;

    // Prepare data
    const submitData: any = {
      name_en: createForm.name_en,
      name_ar: createForm.name_ar,
      name_ms: createForm.name_ms,
    };

    if (createForm.image_base64) {
      submitData.image_base64 = createForm.image_base64;
    }

    await submit(() => createCategory(submitData), () => {
      setCreateForm(emptyCategoryForm);
      setCreateImageError(false);
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditForm(emptyCategoryForm);
    setExpandedCardId(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#ffcf1c]">Backend Catalog</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase text-neutral-900">Category Management</h1>
        <p className="text-neutral-500 font-medium">Admins create, update, and delete categories only. Restaurants will set item prices later under these categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Category Card */}
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Create</p>
              <h2 className="text-2xl font-black text-neutral-900">New Category</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Name EN *"
                  value={createForm.name_en}
                  onChange={(value) => setCreateForm((current) => ({ ...current, name_en: value }))}
                  required
                />
                <FormInput
                  label="Name AR"
                  value={createForm.name_ar}
                  onChange={(value) => setCreateForm((current) => ({ ...current, name_ar: value }))}
                />
                <FormInput
                  label="Name MS"
                  value={createForm.name_ms}
                  onChange={(value) => setCreateForm((current) => ({ ...current, name_ms: value }))}
                />
              </div>

              {/* Camera Upload Section - Required */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Category Image <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="create-category-image"
                    accept="image/png,image/jpeg"
                    onChange={(e) => handleImageUpload(e, setCreateForm)}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="create-category-image"
                    className="relative cursor-pointer group"
                  >
                    <div className={`w-32 h-32 rounded-full border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors ${createImageError
                      ? 'bg-red-50 border-red-400'
                      : 'bg-neutral-100 border-neutral-300 group-hover:bg-neutral-50'
                      }`}>
                      {createForm.image_base64 ? (
                        <img
                          src={createForm.image_base64}
                          alt="Category preview"
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
                      <div className="absolute bottom-0 right-0 bg-[#ffcf1c] rounded-full p-1.5 shadow-md">
                        <CameraIcon />
                      </div>
                    )}
                  </label>
                  <p className={`text-xs mt-2 ${createImageError ? 'text-red-500' : 'text-neutral-400'}`}>
                    {createImageError ? 'Image is required' : 'Click to select category image (required)'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !createForm.name_en || !createForm.image_base64}
                className="w-full bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-xl font-black uppercase tracking-wide h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Data Section with Edit/Delete Icons */}
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf1c]">Live Data</p>
              <h2 className="text-2xl font-black text-neutral-900">Current Categories</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {(loading ? [] : categories).map((category) => (
                <AnimatePresence key={category.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Card Header with Image and Info */}
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={category.image_base64 || `https://picsum.photos/seed/category-${category.id}/100/100`}
                          alt={category.name_en}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-neutral-900 text-lg">{category.name_en}</p>
                        <div className="flex gap-3 text-xs text-neutral-500">
                          <span>AR: {category.name_ar || '—'}</span>
                          <span>MS: {category.name_ms || '—'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedCardId === category.id && (
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
                    {expandedCardId === category.id && editingCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-neutral-100 bg-neutral-50 p-4 space-y-4"
                      >
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

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs font-bold">Update Image</Label>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                                <img
                                  src={editForm.image_base64 || category.image_base64 || 'https://picsum.photos/seed/placeholder/100/100'}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <input
                                type="file"
                                id={`edit-image-${category.id}`}
                                accept="image/png,image/jpeg"
                                onChange={handleEditImageUpload}
                                className="hidden"
                              />
                              <label
                                htmlFor={`edit-image-${category.id}`}
                                className="text-sm text-[#ffcf1c] font-medium cursor-pointer hover:underline"
                              >
                                Change Image
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                          >
                            {isSubmitting ? 'Updating...' : 'Update Category'}
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
              ))}
              {!loading && !categories.length && (
                <p className="text-sm text-neutral-500 text-center py-8">No categories yet. Create your first category!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Input
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}
