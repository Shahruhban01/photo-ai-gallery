import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPhoto, updatePhoto, deletePhoto } from '../store/slices/photoSlice';
import { LoadingSpinner } from '../components';

export const PhotoViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentPhoto, loading } = useAppSelector((state) => state.photos);

  useEffect(() => {
    if (id) {
      dispatch(fetchPhoto(id));
    }
  }, [dispatch, id]);

  const handleToggleFavorite = () => {
    if (currentPhoto) {
      dispatch(updatePhoto({
        id: currentPhoto.id,
        data: { isFavorite: !currentPhoto.isFavorite },
      }));
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this photo?')) {
      await dispatch(deletePhoto(id));
      navigate('/');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading photo..." />;
  }

  if (!currentPhoto) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Photo not found</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>Back to Gallery</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              currentPhoto.isFavorite
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {currentPhoto.isFavorite ? '❤️' : '🤍'} Favorite
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center min-h-[60vh]">
        <img
          src={`http://localhost:5000/api/photos/${currentPhoto.id}/image`}
          alt={currentPhoto.originalName}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Filename</p>
            <p className="font-medium">{currentPhoto.originalName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uploaded</p>
            <p className="font-medium">
              {new Date(currentPhoto.createdAt).toLocaleDateString()}
            </p>
          </div>
          {currentPhoto.width && currentPhoto.height && (
            <div>
              <p className="text-sm text-gray-500">Dimensions</p>
              <p className="font-medium">{currentPhoto.width} × {currentPhoto.height}</p>
            </div>
          )}
          {currentPhoto.tags && currentPhoto.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentPhoto.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
