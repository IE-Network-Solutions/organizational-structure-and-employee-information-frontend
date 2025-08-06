import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

/**
 * Usage Examples:
 * 
 * // Auto-search enabled (default)
 * <LocationSearch onLocationSelect={handleLocationSelect} />
 * 
 * // Auto-search with custom debounce delay
 * <LocationSearch 
 *   onLocationSelect={handleLocationSelect} 
 *   debounceDelay={1000} 
 * />
 * 
 * // Manual search only (auto-search disabled)
 * <LocationSearch 
 *   onLocationSelect={handleLocationSelect} 
 *   autoSearch={false} 
 * />
 */

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  /** Enable automatic search as user types (default: true) */
  autoSearch?: boolean;
  /** Delay in milliseconds before triggering auto-search (default: 500) */
  debounceDelay?: number;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * LocationSearch component with automatic search functionality
 * 
 * Features:
 * - Automatic search as user types (with debouncing)
 * - Manual search button (when autoSearch is disabled)
 * - Loading indicator during search
 * - Keyboard support (Enter key)
 * - Clear results when input is empty
 * 
 * @param props - Component props
 * @param props.onLocationSelect - Callback when a location is selected
 * @param props.placeholder - Input placeholder text
 * @param props.autoSearch - Enable automatic search (default: true)
 * @param props.debounceDelay - Delay before auto-search triggers (default: 500ms)
 */
const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
  autoSearch = true,
  debounceDelay = 500,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchLocation(query);
    }, debounceDelay),
    [debounceDelay]
  );

  // Effect for auto search
  useEffect(() => {
    if (autoSearch) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, autoSearch, debouncedSearch]);

  const handleSearch = () => {
    searchLocation(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation(searchQuery);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear results if input is empty
    if (!value.trim()) {
      setSearchResults([]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          className="flex-1"
          suffix={isLoading && <Spin size="small" />}
        />
        {!autoSearch && (
          <Button
            type="primary"
            onClick={handleSearch}
            loading={isLoading}
            icon={<SearchOutlined />}
          >
            Search
          </Button>
        )}
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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default LocationSearch; 