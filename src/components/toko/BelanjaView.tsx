import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ShoppingCart, Package } from 'lucide-react';
import { StyledButton } from '../StyledButton';

const CATEGORIES = [
  "Semua", "Sembako", "Rumah tangga", "Makanan & minuman", "Fashion", "Elektronik", "ATK & lainnya",
  "🔧 Servis (AC, listrik, bangunan)", "🧺 Laundry & kebersihan", "🚚 Transport / kurir", "🎓 Les & jasa profesional"
];

const PRODUCTS = [
  { id: '1', name: 'beras', category: 'Sembako', description: 'beras 5w5mw56', price: 1000000, stock: 1 },
  { id: '2', name: 'jasa rental massa', category: '🔧 Servis (AC, listrik, bangunan)', description: 'jasa rental massa cocok tuk demo', price: 12000, stock: 500 },
  { id: '3', name: 'Jual Rumah Tetangga', category: 'Rumah tangga', description: 'Jual Rumah Tetangga LT LB', price: 500000000, stock: 1 },
  { id: '4', name: 'banner', category: 'ATK & lainnya', description: 'banner banner semarakebalen 26', price: 26000000, stock: 26 },
  { id: '5', name: 'PLANGSUNG TUBUH', category: 'Fashion', description: 'Siapa cepat nanti tidak terlambat', price: 20000000, stock: 1000 },
];

export default function BelanjaView() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const filteredProducts = activeCategory === "Semua" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6">
        <StyledButton label="Pembeli" onClick={() => {}} colorType="pastelRed" />
        <StyledButton label="Penjual" onClick={() => {}} colorType="pastelBlue" />
      </div>

      <div className="flex gap-4 mb-8 border-b pb-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <StyledButton 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            label={cat}
            colorType={activeCategory === cat ? 'pastelGreen' : 'secondary'}
            className="text-xs px-4 py-2 whitespace-nowrap"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={() => console.log('Added', product.name)} />
        ))}
      </div>
    </div>
  );
}
