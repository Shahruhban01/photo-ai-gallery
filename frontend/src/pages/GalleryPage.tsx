import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPhotos, updatePhoto } from '../store/slices/photoSlice';
import { PhotoGrid, LoadingSpinner } from '../components';
import { Photo } from '../services/photoService';

export const GalleryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { photos, loading, pagination } = useAppSelector((state) => state.photos);

  useEffect(() => {
    dispatch(fetchPhotos());
  }, [dispatch]);

  const handleFavoriteToggle = (photo: Photo) => {
    dispatch(updatePhoto({
      id: photo.id,
      data: { isFavorite: !photo.isFavorite },
    }));
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      dispatch(fetchPhotos({ page: pagination.page + 1 }));
    }
  };

  if (loading && photos.length === 0) {
    return <LoadingSpinner message="Loading your photos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Gallery</h1>
          <p className="text-gray-600">
            {pagination.total} photo{pagination.total !== 1 ? 's' : ''} in your collection
          </p>
        </div>
      </div>

      <PhotoGrid
        photos={photos}
        onFavoriteToggle={handleFavoriteToggle}
        emptyMessage="No photos yet. Upload some photos to get started!"
      />

      {pagination.page < pagination.totalPages && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};
