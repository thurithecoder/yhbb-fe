import * as React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_CART_ITEMS = [
  { id: '1', name: 'Signature Mixed Grill', price: 24.99, quantity: 1, image: 'https://picsum.photos/seed/m1/100/100' },
  { id: '2', name: 'Truffle Hummus', price: 12.50, quantity: 2, image: 'https://picsum.photos/seed/m2/100/100' },
];

export default function CartSidebar() {
  const subtotal = MOCK_CART_ITEMS.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  return (
    <Card className="border-none shadow-2xl rounded-[32px] bg-white overflow-hidden sticky top-24">
      <div className="bg-neutral-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#ffcf1c] p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">Your Cart</h3>
        </div>
        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {MOCK_CART_ITEMS.length} Items
        </span>
      </div>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-6">
          <div className="space-y-6">
            <AnimatePresence>
              {MOCK_CART_ITEMS.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-[#ffcf1c] line-clamp-1">{item.name}</h4>
                    <p className="text-[#ffcf1c] font-black text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 bg-[#FFF9DC] rounded-lg p-1">
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black">{item.quantity}</span>
                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button className="text-neutral-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-6 bg-white space-y-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-neutral-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-500">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-[#ffcf1c] pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full h-14 bg-[#ffcf1c] hover:bg-[#ffcf1c] hover:text-[#070605] rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 shadow-lg shadow-yellow-100 group">
            Checkout <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
