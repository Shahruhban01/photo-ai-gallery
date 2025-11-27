import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAlbum, deleteAlbum } from '../store/slices/albumSlice';
import { PhotoGrid, LoadingSpinner } from '../components';

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentAlbum, currentAlbumPhotos, loading } = useAppSelector((state) => state.albums);

  useEffect(() => {
    if (id) {
      dispatch(fetchAlbum(id));
    }
  }, [dispatch, id]);

  const handleDeleteAlbum = async () => {
    if (id && window.confirm('Are you sure you want to delete this album?')) {
      await dispatch(deleteAlbum(id));
      navigate('/albums');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading album..." />;
  }

  if (!currentAlbum) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Album not found</p>
        <Link to="/albums" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Albums
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/albums" className="hover:text-primary-600">
              Albums
            </Link>
            <span>/</span>
            <span>{currentAlbum.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{currentAlbum.name}</h1>
          {currentAlbum.description && (
            <p className="text-gray-600 mt-1">{currentAlbum.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {currentAlbum.photoCount} photo{currentAlbum.photoCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleDeleteAlbum}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete Album
        </button>
      </div>

      <PhotoGrid
        photos={currentAlbumPhotos}
        emptyMessage="This album is empty. Add some photos!"
      />
    </div>
  );
};
