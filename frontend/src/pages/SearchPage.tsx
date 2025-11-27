import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { searchPhotos } from '../store/slices/photoSlice';
import { PhotoGrid, LoadingSpinner } from '../components';

export const SearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { photos, loading } = useAppSelector((state) => state.photos);
  const { persons } = useAppSelector((state) => state.faces);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    dispatch(searchPhotos({
      query: searchQuery || undefined,
      personId: selectedPerson || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }));
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedPerson('');
    setStartDate('');
    setEndDate('');
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Photos</h1>
        <p className="text-gray-600">Find photos by tags, people, or date</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
              Search Keywords
            </label>
            <input
              type="text"
              id="search-query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tags or filename..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="person" className="block text-sm font-medium text-gray-700 mb-1">
              Person
            </label>
            <select
              id="person"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All People</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <span>🔍</span>
            <span>Search</span>
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner message="Searching..." />
      ) : hasSearched ? (
        <div>
          <p className="text-gray-600 mb-4">
            Found {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
          <PhotoGrid photos={photos} emptyMessage="No photos match your search criteria" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-lg">Enter search criteria to find photos</p>
        </div>
      )}
    </div>
  );
};
