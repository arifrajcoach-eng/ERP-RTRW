import { ShoppingCart, Package } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <motion.div
      layout
      className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-8 group hover:shadow-rose-500/10 hover:border-rose-200 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors"></div>

      <div className="absolute top-4 right-4 z-10">
         <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
           <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
           <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/90">LAPAK +26 ORIGINAL</span>
         </div>
      </div>

      <div className="relative h-56 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-hidden group-hover:bg-rose-50/50 transition-colors border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="absolute inset-0 flex items-center justify-center">
           <Package className="w-20 h-20 text-slate-300 dark:text-slate-700 group-hover:scale-110 group-hover:text-rose-200/50 transition-all duration-700" />
        </div>
        <div className="absolute top-6 left-6">
           <span className="px-5 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
             {product.category.split(' ')[0]}
           </span>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight line-clamp-1 uppercase font-elegant leading-none truncate group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-pulse animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">UMKM Lokal</p>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[3rem] opacity-80 italic">
          "{product.description}"
        </p>
        
        <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block opacity-70">Harga</span>
            <div className="flex items-baseline gap-1.5">
               <span className="text-xs font-black text-rose-600/50">Rp</span>
               <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums font-elegant">
                 {new Intl.NumberFormat('id-ID').format(product.price)}
               </span>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2 opacity-70">Stok</span>
             <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black border tracking-widest ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
               {product.stock} UNIT
             </span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onAddToCart(product)} 
        className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-4 group/btn relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
        <ShoppingCart size={18} className="group-hover/btn:rotate-12 transition-transform" />
        <span>Beli Sekarang</span>
      </button>
    </motion.div>
  );
};
