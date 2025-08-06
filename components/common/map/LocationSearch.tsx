import React, { useState } from 'react';
import { Input, Button, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchLocation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          className="flex-1"
        />
        <Button
          type="primary"
          onClick={handleSearch}
          loading={isLoading}
          icon={<SearchOutlined />}
        >
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-2"
              onClick={() => handleResultClick(result)}
            >
              <EnvironmentOutlined className="text-blue-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">{result.display_name}</div>
                <div className="text-xs text-gray-500">
                  Lat: {result.lat}, Lon: {result.lon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch; 