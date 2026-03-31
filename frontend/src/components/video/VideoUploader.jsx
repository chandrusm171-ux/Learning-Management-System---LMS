import { useState, useRef } from 'react';
import { Upload, X, Play, CheckCircle, Loader2, Film } from 'lucide-react';
import { uploadVideoAPI } from '@/api/upload.api';
import toast from 'react-hot-toast';

export default function VideoUploader({ onUploadComplete, existingUrl = '' }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(existingUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be under 500MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const data = await uploadVideoAPI(file, setProgress);
      setVideoUrl(data.url);
      onUploadComplete?.(data);
      toast.success('Video uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const removeVideo = () => {
    setVideoUrl('');
    onUploadComplete?.(null);
  };

  if (videoUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-gray-700">
        <video src={videoUrl} controls className="w-full max-h-64 object-contain" />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={removeVideo}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          <CheckCircle className="w-3 h-3 text-green-400" />
          Video uploaded
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        } ${uploading ? 'cursor-not-allowed opacity-75' : ''}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-violet-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Uploading video... {progress}%
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-xs mx-auto">
                <div
                  className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Please don't close this window
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Film className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Drop your video here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                MP4, MOV, AVI — Max 500MB
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
              <Upload className="w-4 h-4" />
              Choose Video
            </div>
          </div>
        )}
      </div>
    </div>
  );
}