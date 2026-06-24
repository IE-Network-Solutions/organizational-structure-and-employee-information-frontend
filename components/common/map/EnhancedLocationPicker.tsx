import React, { useState, useEffect } from 'react';
import { InputNumber, Slider, Space, Typography } from 'antd';
import dynamic from 'next/dynamic';
import LocationSearch from './LocationSearch';

const { Text } = Typography;

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: '400px' }}
      data-cy="enhanced-location-picker-loading"
    >
      <div
        className="text-gray-500"
        data-cy="enhanced-location-picker-loading-text"
      >
        Loading map...
      </div>
    </div>
  ),
});

interface EnhancedLocationPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
  height?: string;
  width?: string;
  /** Enable automatic search as user types (default: true) */
  autoSearch?: boolean;
  /** Enable automatic zoom to selected location (default: true) */
  autoZoom?: boolean;
  /** Zoom level for the map (default: 13) */
  zoomLevel?: number;
  /** Enable smooth zoom animation (default: true) */
  smoothZoom?: boolean;
}

/**
 * EnhancedLocationPicker component with integrated location search and map selection
 *
 * Features:
 * - Automatic location search as user types (with debouncing)
 * - Interactive map for location selection
 * - Current location detection
 * - Radius control with slider and input
 * - Coordinate display and manual editing
 * - Automatic zoom to selected location
 * - Smooth map transitions
 *
 * @param props - Component props
 * @param props.latitude - Initial latitude
 * @param props.longitude - Initial longitude
 * @param props.radius - Initial radius in kilometers
 * @param props.onLocationChange - Callback when location changes
 * @param props.onRadiusChange - Callback when radius changes
 * @param props.height - Map height (default: '500px')
 * @param props.width - Map width (default: '100%')
 * @param props.autoSearch - Enable automatic search (default: true)
 * @param props.debounceDelay - Delay before auto-search triggers (default: 500ms)
 * @param props.autoZoom - Enable automatic zoom to selected location (default: true)
 * @param props.zoomLevel - Zoom level when auto-zooming (default: 15)
 * @param props.smoothZoom - Enable smooth transitions when zooming (default: true)
 */
const EnhancedLocationPicker: React.FC<EnhancedLocationPickerProps> = ({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
  height = '400px',
  width = '100%',
  autoSearch = true,
  autoZoom = true,
  zoomLevel = 15,
  smoothZoom = true,
}) => {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [currentRadius, setCurrentRadius] = useState(radius);

  useEffect(() => {
    setCurrentLat(latitude);
    setCurrentLng(longitude);
  }, [latitude, longitude]);

  useEffect(() => {
    setCurrentRadius(radius);
  }, [radius]);

  const handleLocationChange = (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    onLocationChange(lat, lng);
  };

  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handleSearchSelect = (lat: number, lng: number) => {
    handleLocationChange(lat, lng);
  };

  return (
    <div className="w-full" data-cy="enhanced-location-picker">
      {/* Map with integrated search */}
      <div
        className="relative"
        data-cy="enhanced-location-picker-map-container"
      >
        {/* Search bar positioned at top center of map */}
        <div
          className="absolute top-4 left-4 right-4 z-10"
          data-cy="enhanced-location-picker-search-container"
        >
          <div
            className="relative"
            data-cy="enhanced-location-picker-search-wrapper"
          >
            <LocationSearch
              onLocationSelect={handleSearchSelect}
              autoSearch={autoSearch}
            />
          </div>
        </div>

        {/* Map */}
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          onLocationChange={handleLocationChange}
          onRadiusChange={onRadiusChange}
          height={height}
          width={width}
          autoZoom={autoZoom}
          zoomLevel={zoomLevel}
          smoothZoom={smoothZoom}
        />
      </div>

      {/* Radius Control */}
      <div
        data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-178"
        className="mt-4"
        hidden
      >
        <div
          data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-179"
          className="flex items-center justify-between mb-2"
        >
          <span
            data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-span-180"
            className="text-sm text-gray-900"
          >
            Radius
          </span>
          <div
            data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-181"
            className="flex items-center gap-2"
          >
            <InputNumber
              value={currentRadius}
              onChange={(value) => {
                if (value !== null) {
                  handleRadiusChange(value);
                }
              }}
              min={0.01}
              step={0.001}
              precision={3}
              style={{ width: 120 }}
              className="text-sm border border-gray-300 rounded-lg"
              placeholder="Radius"
            />
            <span
              data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-span-196"
              className="text-xs text-gray-900"
            >
              km
            </span>
          </div>
        </div>
        <Slider
          min={0.01}
          max={0.5}
          step={0.001}
          value={currentRadius}
          onChange={handleRadiusChange}
          marks={{
            0.01: '10 m',
            0.05: '50 m',
            0.1: '100 m',
            0.2: '200 m',
            0.3: '300 m',
            0.4: '400 m',
            0.5: '500 m',
          }}
          trackStyle={{ backgroundColor: '#3b82f6' }}
          // handleStyle={{
          //   backgroundColor: '#3b82f6',
          //   borderColor: '#3b82f6',
          //   width: '20px',
          //   height: '20px',
          //   borderRadius: '50%', // makes it perfectly round
          //   boxShadow: 'none',   // removes AntD's focus shadow
          //   outline: 'none'      // removes browser focus outline
          // }}
          railStyle={{ backgroundColor: '#e9d5ff' }}
          className="mt-6"
        />
      </div>

      {/* Coordinates Display - after radius */}
      <div
        data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-230"
        className="mt-4"
        hidden
      >
        <div
          data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-231"
          className="text-sm text-gray-600 mb-2"
        >
          Use Coordinates
        </div>
        <Space size="large">
          <div data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-233">
            <Text strong>Latitude:</Text>
            <InputNumber
              value={currentLat}
              onChange={(value) => {
                if (value !== null) {
                  handleLocationChange(value, currentLng);
                }
              }}
              precision={6}
              className="ml-2"
              style={{ width: 150 }}
            />
          </div>
          <div data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-div-247">
            <Text strong>Longitude:</Text>
            <InputNumber
              value={currentLng}
              onChange={(value) => {
                if (value !== null) {
                  handleLocationChange(currentLat, value);
                }
              }}
              precision={6}
              className="ml-2"
              style={{ width: 150 }}
            />
          </div>
        </Space>
      </div>
    </div>
  );
};

export default EnhancedLocationPicker;
