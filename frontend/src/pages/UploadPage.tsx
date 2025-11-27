import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uploadPhotos } from '../store/slices/photoSlice';
import { PhotoUpload } from '../components';

export const UploadPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { uploading, error } = useAppSelector((state) => state.photos);

  const handleUpload = async (files: File[]) => {
    const result = await dispatch(uploadPhotos({ files }));
    if (uploadPhotos.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Photos</h1>
        <p className="text-gray-600">
          Add new photos to your gallery. Our AI will automatically detect faces.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <PhotoUpload onUpload={handleUpload} isUploading={uploading} />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload high-quality images for better face detection</li>
          <li>• Supported formats: JPEG, PNG, GIF, WebP</li>
          <li>• Maximum file size: 10MB per image</li>
          <li>• Face detection runs automatically after upload</li>
        </ul>
      </div>
    </div>
  );
};
