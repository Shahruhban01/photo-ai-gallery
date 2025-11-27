import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAlbums, createAlbum, deleteAlbum } from '../store/slices/albumSlice';
import { LoadingSpinner, CreateAlbumModal } from '../components';
import { getApiBaseUrl } from '../services';

export const AlbumsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { albums, loading } = useAppSelector((state) => state.albums);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAlbums());
  }, [dispatch]);

  const handleCreateAlbum = (data: { name: string; description?: string }) => {
    dispatch(createAlbum(data));
  };

  const handleDeleteAlbum = (albumId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this album?')) {
      dispatch(deleteAlbum(albumId));
    }
  };

  if (loading && albums.length === 0) {
    return <LoadingSpinner message="Loading albums..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Albums</h1>
          <p className="text-gray-600">Organize your photos into albums</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>New Album</span>
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="text-5xl mb-4">📁</span>
          <p className="text-lg mb-4">No albums yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {album.coverPhoto ? (
                  <img
                    src={`${getApiBaseUrl()}${album.coverPhoto}`}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📁</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {album.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {album.photoCount} photo{album.photoCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteAlbum(album.id, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
                {album.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{album.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateAlbumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlbum}
      />
    </div>
  );
};
