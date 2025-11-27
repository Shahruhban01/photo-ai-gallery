import React from 'react';
import { Link } from 'react-router-dom';
import { Photo } from '../services/photoService';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onFavoriteToggle?: (photo: Photo) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  emptyMessage?: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  onFavoriteToggle,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = 'No photos found',
}) => {
  const handleSelection = (photoId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedIds.includes(photoId)) {
      onSelectionChange(selectedIds.filter((id) => id !== photoId));
    } else {
      onSelectionChange([...selectedIds, photoId]);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="text-5xl mb-4">📷</span>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className={`relative group rounded-lg overflow-hidden bg-gray-100 aspect-square ${
            selectable ? 'cursor-pointer' : ''
          } ${selectedIds.includes(photo.id) ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => {
            if (selectable) {
              handleSelection(photo.id);
            } else if (onPhotoClick) {
              onPhotoClick(photo);
            }
          }}
        >
          {/* Thumbnail */}
          <Link to={selectable ? '#' : `/photos/${photo.id}`} onClick={(e) => selectable && e.preventDefault()}>
            <img
              src={`http://localhost:5000${photo.thumbnailUrl}`}
              alt={photo.originalName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />

          {/* Selection checkbox */}
          {selectable && (
            <div className="absolute top-2 left-2">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedIds.includes(photo.id)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-white bg-black bg-opacity-30'
                }`}
              >
                {selectedIds.includes(photo.id) && '✓'}
              </div>
            </div>
          )}

          {/* Favorite button */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteToggle(photo);
              }}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                photo.isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-black bg-opacity-30 text-white opacity-0 group-hover:opacity-100'
              }`}
            >
              {photo.isFavorite ? '❤️' : '🤍'}
            </button>
          )}

          {/* Face count indicator */}
          {photo.faceCount && photo.faceCount > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-50 rounded-full text-white text-xs flex items-center space-x-1">
              <span>👤</span>
              <span>{photo.faceCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
