import React from 'react';
import { motion } from 'motion/react';
import { StyledButton } from '../StyledButton';
import { ShoppingCart } from 'lucide-react';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2"
    >
      <div className="h-32 bg-gray-200 rounded-xl mb-2 flex items-center justify-center text-gray-400">
        Image/Icon
      </div>
      <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.category} | RT?</p>
      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
      
      <div className="mt-2 flex justify-between items-center text-sm font-semibold">
        <span className="text-gray-700">Harga:</span>
        <span className="text-blue-600">Rp {product.price.toLocaleString('id-ID')}</span>
      </div>
      
      <div className="flex justify-between items-center text-sm mb-4">
        <span className="text-gray-500">Stok:</span>
        <span className="font-bold">{product.stock}</span>
      </div>

      <StyledButton 
        label="Tambah Keranjang" 
        onClick={() => onAddToCart(product)} 
        colorType="pastelGreen"
        icon={<ShoppingCart size={16} />}
      />
    </motion.div>
  );
};
