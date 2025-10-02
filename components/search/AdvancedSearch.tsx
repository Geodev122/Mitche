import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SearchFilters, RequestType, RequestUrgency, RequestStatus } from '../../types-enhanced';

interface AdvancedSearchProps {
  onSearch: (results: any[]) => void;
  searchType: 'requests' | 'offerings';
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, searchType }) => {
  const { enhancedFirebase } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        searchText: searchText || undefined,
        limit: 20
      };

      let response;
      if (searchType === 'requests') {
        response = await enhancedFirebase.searchRequests(searchFilters);
      } else {
        response = await enhancedFirebase.searchOfferings(searchFilters);
      }

      if (response.success && response.data) {
        onSearch(response.data);
      } else {
        console.error('Search failed:', response.error);
        onSearch([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      onSearch([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev: SearchFilters) => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchText('');
    onSearch([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Advanced Search - {searchType === 'requests' ? 'Help Requests' : 'Available Help'}
      </h2>

      {/* Search Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Keywords
        </label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter keywords to search..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value={RequestType.Food}>Food</option>
            <option value={RequestType.Shelter}>Shelter</option>
            <option value={RequestType.Medical}>Medical</option>
            <option value={RequestType.Emotional}>Emotional Support</option>
            <option value={RequestType.Legal}>Legal</option>
            <option value={RequestType.Employment}>Employment</option>
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency
          </label>
          <select
            value={filters.urgency || ''}
            onChange={(e) => handleFilterChange('urgency', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Urgency Levels</option>
            <option value={RequestUrgency.Low}>Low</option>
            <option value={RequestUrgency.Medium}>Medium</option>
            <option value={RequestUrgency.High}>High</option>
            <option value={RequestUrgency.Critical}>Critical</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value={RequestStatus.Open}>Open</option>
            <option value={RequestStatus.Pending}>In Progress</option>
            <option value={RequestStatus.Fulfilled}>Fulfilled</option>
            <option value={RequestStatus.Closed}>Closed</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
            placeholder="City, region..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || ''}
            onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Recent First</option>
            <option value="createdAt">Date Created</option>
            <option value="urgency">Urgency Level</option>
            <option value="hopePoints">Hope Points</option>
            {searchType === 'requests' && <option value="deadline">Deadline</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        
        <button
          onClick={clearFilters}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Clear Filters
        </button>

        {/* Quick Filters */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              handleFilterChange('urgency', RequestUrgency.Critical);
              handleSearch();
            }}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            Critical Only
          </button>
          
          <button
            onClick={() => {
              handleFilterChange('verified', true);
              handleSearch();
            }}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            Verified Only
          </button>
        </div>
      </div>

      {/* Geographic Search Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Enter your city or region in the location field to find help near you. 
          You can also use coordinates or postal codes for more precise geographic matching.
        </p>
      </div>
    </div>
  );
};