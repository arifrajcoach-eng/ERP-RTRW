import React, { useState } from 'react';

export default function ETokoView({ userRole }: { userRole: string }) {
  const [view, setView] = useState<'buyer' | 'seller'>('buyer');
  const [products] = useState([
    { id: 1, name: 'Beras Premium', price: 65000, stock: 20 },
    { id: 2, name: 'Minyak Goreng', price: 18000, stock: 50 },
    { id: 3, name: 'Gula Pasir', price: 16000, stock: 30 },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">E-Toko RW 26</h2>
        {(userRole === 'ADMIN' || userRole === 'Super Admin') && (
          <div className="bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setView('buyer')} className={`px-4 py-2 rounded-lg \${view === 'buyer' ? 'bg-white shadow' : ''}`}>Pembeli</button>
            <button onClick={() => setView('seller')} className={`px-4 py-2 rounded-lg \${view === 'seller' ? 'bg-white shadow' : ''}`}>Penjual</button>
          </div>
        )}
      </div>
      
      {view === 'buyer' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow border">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-slate-500">Harga: Rp {product.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Stok: {product.stock}</p>
              <button className="mt-2 w-full bg-blue-600 text-white rounded-lg py-2">Beli</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="font-bold mb-4">Manajemen Produk (Penjual)</h3>
            <p className="text-slate-500">Fitur penambahan/pengeditan produk akan hadir di sini.</p>
        </div>
      )}
    </div>
  );
}
