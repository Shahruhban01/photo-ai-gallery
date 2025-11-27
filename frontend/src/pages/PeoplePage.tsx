import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPersons, clusterFaces } from '../store/slices/faceSlice';
import { LoadingSpinner } from '../components';

export const PeoplePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { persons, loading, clustering } = useAppSelector((state) => state.faces);

  useEffect(() => {
    dispatch(fetchPersons());
  }, [dispatch]);

  const handleClusterFaces = async () => {
    await dispatch(clusterFaces());
    dispatch(fetchPersons());
  };

  if (loading && persons.length === 0) {
    return <LoadingSpinner message="Loading people..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600">
            {persons.length} {persons.length === 1 ? 'person' : 'people'} recognized in your photos
          </p>
        </div>
        <button
          onClick={handleClusterFaces}
          disabled={clustering}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          {clustering ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Cluster Faces</span>
            </>
          )}
        </button>
      </div>

      {persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="text-5xl mb-4">👥</span>
          <p className="text-lg mb-2">No people recognized yet</p>
          <p className="text-sm">Upload photos with faces and click "Cluster Faces" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {persons.map((person) => (
            <Link
              key={person.id}
              to={`/people/${person.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {person.thumbnailUrl ? (
                  <img
                    src={`http://localhost:5000${person.thumbnailUrl}`}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                  {person.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {person.faceCount} photo{person.faceCount !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
