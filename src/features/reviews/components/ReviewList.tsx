import * as React from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Review } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight uppercase text-[#6EA15C]">CUSTOMER REVIEWS</h3>
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
          <MessageSquare className="w-4 h-4" />
          <span>{reviews.length} Reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Avatar className="h-12 w-12 border-2 border-green-100">
                    <AvatarImage src={review.customerPhoto} />
                    <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-[#6EA15C]">{review.customerName}</h4>
                    <p className="text-xs text-neutral-400 font-medium">2 days ago</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-4 h-4",
                        i < review.rating ? "text-[#6EA15C] fill-[#6EA15C]" : "text-neutral-200 fill-neutral-200"
                      )} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed font-medium">
                {review.comment}
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-[#6EA15C] transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
