import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3, // Target ~300KB
    maxWidthOrHeight: 1080,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.75,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}
