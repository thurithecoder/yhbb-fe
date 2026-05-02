import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RestaurantImage } from '@/types';

interface ImageCarouselProps {
    images: RestaurantImage[];
    autoPlayInterval?: number; // in ms
}

export default function ImageCarousel({ images, autoPlayInterval = 5000 }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const total = images.length;

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    };

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoPlayInterval && total > 1) {
            timerRef.current = setInterval(goToNext, autoPlayInterval);
        }
    };

    React.useEffect(() => {
        resetTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, total, autoPlayInterval]);

    if (total === 0) return null;

    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-neutral-100 rounded-2xl overflow-hidden group">
            <img
                src={images[currentIndex].image_base64}
                alt={`Restaurant gallery ${currentIndex + 1}`}
                className="w-full h-full object-contain bg-neutral-50"
            />

            {/* Navigation arrows */}
            {total > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { goToPrev(); resetTimer(); }}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { goToNext(); resetTimer(); }}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-bold px-3 py-1 rounded-full">
                {currentIndex + 1} / {total}
            </div>
        </div>
    );
}