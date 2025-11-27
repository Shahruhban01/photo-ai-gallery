import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPerson, updatePerson } from '../store/slices/faceSlice';
import { PhotoGrid, LoadingSpinner } from '../components';

export const PersonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentPerson, currentPersonPhotos, loading } = useAppSelector((state) => state.faces);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchPerson(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPerson) {
      setNewName(currentPerson.name);
    }
  }, [currentPerson]);

  const handleUpdateName = () => {
    if (id && newName.trim()) {
      dispatch(updatePerson({ id, name: newName.trim() }));
      setIsEditing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading person..." />;
  }

  if (!currentPerson) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Person not found</p>
        <Link to="/people" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to People
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/people" className="hover:text-primary-600">
              People
            </Link>
            <span>/</span>
            <span>{currentPerson.name}</span>
          </div>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-2xl font-bold border-b-2 border-primary-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleUpdateName}
                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewName(currentPerson.name);
                }}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{currentPerson.name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✏️
              </button>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            {currentPerson.faceCount} photo{currentPerson.faceCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <PhotoGrid
        photos={currentPersonPhotos}
        emptyMessage="No photos found for this person"
      />
    </div>
  );
};
