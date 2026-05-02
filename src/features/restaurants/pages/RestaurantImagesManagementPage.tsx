import * as React from 'react';
import { Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getMyRestaurantImages, uploadRestaurantImages, deleteRestaurantImage } from '@/features/restaurants/services';
import { showSuccessAlert, showErrorAlert } from '@/lib/alerts';
import type { RestaurantImage } from '@/types';

const confirmAction = async (message: string): Promise<boolean> => {
    return window.confirm(message);
};

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
            const data = await getMyRestaurantImages();
            setImages(data);
        } catch (error) {
            await showErrorAlert(error, 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadImages();
    }, []);

    const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const base64List: string[] = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                await showErrorAlert(null, `${file.name} is not an image.`);
                continue;
            }
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                await showErrorAlert(null, `${file.name} exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`);
                continue;
            }
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            base64List.push(base64);
        }

        if (base64List.length === 0) return;

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
        const confirmed = await confirmAction('Delete this image? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await deleteRestaurantImage(imageId);
            await showSuccessAlert('Image deleted');
            await loadImages();
        } catch (error) {
            await showErrorAlert(error, 'Deletion failed');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-neutral-500">Loading your gallery...</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Restaurant Gallery</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Fixed Upload Tile */}
                <Card
                    className="overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-[#6EA15C] hover:bg-green-50 transition-all cursor-pointer group"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <CardContent className="p-0 h-56 flex flex-col items-center justify-center gap-3">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6EA15C] border-t-transparent" />
                        ) : (
                            <>
                                <div className="bg-white rounded-full p-3 shadow-md group-hover:bg-[#6EA15C] transition-colors">
                                    <Camera className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                                </div>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wide">Add Image</p>
                                <p className="text-xs text-neutral-400">Max {MAX_IMAGE_SIZE_MB}MB each</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Existing Images */}
                {images.map((img, idx) => (
                    <Card key={img.id} className="overflow-hidden rounded-2xl group relative bg-neutral-100">
                        <div className="h-56 w-full flex items-center justify-center bg-neutral-100">
                            <img
                                src={img.image_base64}
                                alt={`Gallery ${idx + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-full bg-red-500 hover:bg-red-600 w-8 h-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(img.id);
                                }}
                            >
                                <Trash2 className="w-4 h-4 text-white" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesSelected}
                accept="image/*"
                multiple
                className="hidden"
            />
        </div>
    );
}