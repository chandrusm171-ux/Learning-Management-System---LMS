import { useState, useRef } from 'react';
import { Image, Loader2 } from 'lucide-react';
import { uploadImageAPI } from '@/api/upload.api';
import toast from 'react-hot-toast';

export default function ImageUploader({ onUploadComplete, existingUrl = '', label = 'Upload Image' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(existingUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await uploadImageAPI(file, setProgress);
      setImageUrl(data.url);
      onUploadComplete?.(data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
          <img src={imageUrl} alt="Upload" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Change
            </button>
            <button
              onClick={() => { setImageUrl(''); onUploadComplete?.(''); }}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-violet-400'
          }`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto text-violet-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {progress}%</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-xs mx-auto">
                <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Image className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <p className="text-xs text-gray-400">PNG, JPG — Max 5MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}