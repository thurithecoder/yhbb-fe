import * as React from 'react';
import { Trash2, Camera, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMyRestaurantImages, uploadRestaurantImages, deleteRestaurantImage } from '@/features/restaurants/services';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import type { RestaurantImage } from '@/types';

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function RestaurantImagesManagementPage() {
    const [images, setImages] = React.useState<RestaurantImage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadImages = async () => {
        try {
            setLoading(true);
            setImages(await getMyRestaurantImages());
        } catch (error) {
            await showErrorAlert(error, 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { loadImages(); }, []);

    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const base64List: string[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) { await showErrorAlert(null, `${file.name} is not an image.`); continue; }
            if (file.size > MAX_IMAGE_SIZE_BYTES) { await showErrorAlert(null, `${file.name} exceeds ${MAX_IMAGE_SIZE_MB}MB.`); continue; }
            const base64 = await new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.onerror = reject;
                r.readAsDataURL(file);
            });
            base64List.push(base64);
        }
        if (!base64List.length) return;
        setUploading(true);
        try {
            await uploadRestaurantImages(base64List);
            await showSuccessAlert('Images uploaded successfully!');
            await loadImages();
        } catch (error) {
            await showErrorAlert(error, 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!window.confirm('Delete this image? This cannot be undone.')) return;
        try {
            await deleteRestaurantImage(imageId);
            await showSuccessAlert('Image deleted');
            await loadImages();
        } catch (error) {
            await showErrorAlert(error, 'Deletion failed');
        }
    };

    if (loading) {
        return (
            <div className="bg-[#111] min-h-screen grid place-items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] border-t-[#ffcf1c] animate-spin" />
                    <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">Loading gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#ffcf1c] min-h-screen">

            {/* ── Hero band ── */}
            <section className="bg-[#ffcf1c] px-4 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-7 h-[3px] bg-black rounded-full" />
                        <span className="bg-black text-[#ffcf1c] text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                            Restaurant Panel
                        </span>
                    </div>
                    <h1
                        className="font-black uppercase tracking-tighter text-black leading-[0.9] mb-2"
                        style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
                    >
                        Restaurant Gallery
                    </h1>
                    <p className="text-[#5a4a00] font-semibold text-sm max-w-md leading-relaxed">
                        Upload and manage photos for your restaurant profile.
                    </p>
                </div>
            </section>

            <div className="h-[5px] bg-black" />

            {/* ── Gallery body ── */}
            <section className="bg-[#111] px-4 sm:px-8 md:px-12 py-8 sm:py-12 min-h-screen">
                <div className="max-w-5xl mx-auto">

                    {/* Stats row */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.14em]">
                            <span className="text-[#ffcf1c]">{images.length}</span> photo{images.length !== 1 ? 's' : ''} uploaded
                        </p>
                        <Button
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            disabled={uploading}
                            className="h-10 px-5 bg-[#ffcf1c] text-black rounded-xl text-[10px] font-black uppercase tracking-wide border-none flex items-center gap-2 active:scale-95 transition-all"
                        >
                            {uploading
                                ? <><div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Uploading...</>
                                : <><ImagePlus className="w-3.5 h-3.5" /> Add Photos</>
                            }
                        </Button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">

                        {/* Upload tile */}
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className="aspect-square border-[1.5px] border-dashed border-[#2a2a2a] hover:border-[#ffcf1c] bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                        >
                            {uploading ? (
                                <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#ffcf1c] rounded-full animate-spin" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center group-hover:bg-[#ffcf1c] group-hover:border-[#ffcf1c] transition-colors">
                                        <Camera className="w-5 h-5 text-neutral-500 group-hover:text-black transition-colors" />
                                    </div>
                                    <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.1em] group-hover:text-[#ffcf1c] transition-colors">Add Image</p>
                                    <p className="text-[9px] text-neutral-700">Max {MAX_IMAGE_SIZE_MB}MB</p>
                                </>
                            )}
                        </div>

                        {/* Image tiles */}
                        {images.map((img, idx) => (
                            <div key={img.id} className="aspect-square relative rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a] group">
                                <img
                                    src={img.image_base64}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {/* Delete overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {!images.length && (
                        <div className="py-20 text-center">
                            <p className="text-neutral-600 text-xs font-black uppercase tracking-wider">No images yet — add your first photo!</p>
                        </div>
                    )}
                </div>
            </section>

            <input type="file" ref={fileInputRef} onChange={handleFilesSelected} accept="image/*" multiple className="hidden" />
        </div>
    );
}