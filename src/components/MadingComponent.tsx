import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../lib/imageCompression';

interface MadingItem {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: any;
}

export const MadingComponent: React.FC<{ isAdmin: boolean; tenantId: string }> = ({ isAdmin, tenantId }) => {
  const [madingItems, setMadingItems] = useState<MadingItem[]>([]);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Display Mading (Cache-First via Firestore local cache)
  useEffect(() => {
    if (!tenantId) return;
    const q = query(
      collection(db, 'mading'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MadingItem[];
      setMadingItems(items);
    }, (error) => {
      console.error('[MadingComponent] Gagal memuat data:', error.message);
    });

    return () => unsubscribe();
  }, [tenantId]);

  // Upload Mading
  const handleUpload = async () => {
    if (!imageFile || !title) return;
    if (!tenantId) {
      console.error('[MadingComponent] DITOLAK: tenantId tidak ditemukan.');
      return;
    }
    setUploading(true);

    try {
      // 1. Client-side compression
      const compressedFile = await compressImage(imageFile);

      // 2. Upload with cache-control
      const storageRef = ref(storage, `mading/${Date.now()}_${compressedFile.name}`);
      await uploadBytes(storageRef, compressedFile, {
        contentType: 'image/webp',
        customMetadata: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });

      const imageUrl = await getDownloadURL(storageRef);

      // 3. Save to Firestore
      await addDoc(collection(db, 'mading'), {
        tenantId,
        title,
        imageUrl,
        createdAt: serverTimestamp()
      });

      setTitle('');
      setImageFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Mading Digital</h2>
      
      {isAdmin && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full mb-2 p-2 border rounded" />
          <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="mb-2" />
          <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {madingItems.map(item => (
          <div key={item.id} className="border p-2 rounded">
            <h3 className="font-semibold">{item.title}</h3>
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-auto mt-2 rounded" 
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
