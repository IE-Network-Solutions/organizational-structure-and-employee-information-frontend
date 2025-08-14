import React, { useState, useEffect } from 'react';

import { Card, InputNumber, Slider, Space, Typography, Divider, Button, message, Input } from 'antd';
import { EnvironmentOutlined, RadiusUprightOutlined, SearchOutlined, AimOutlined } from '@ant-design/icons';

import dynamic from 'next/dynamic';
import LocationSearch from './LocationSearch';

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: '400px' }}
    >
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

const { Title, Text } = Typography;

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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange(latitude, longitude);
          message.success('Current location set successfully!');
        },
        () => {
          message.error(
            'Unable to get current location. Please select manually.',
          );
        },
      );
    } else {
      message.error('Geolocation is not supported by this browser.');
    }
  };

  return (

    <div className="w-full">
      {/* Map with integrated search */}
      <div className="relative">
        {/* Search bar positioned at top center of map */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <LocationSearch
              onLocationSelect={handleSearchSelect}
              autoSearch={autoSearch}
            />
          </div>
        </div>
        
        {/* Use Current Location button positioned at bottom left of map */}
        <div className="absolute bottom-4 left-4 z-10">
          <Button 
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm rounded-md px-4 py-2 h-auto text-sm"

            onClick={handleUseCurrentLocation}
          >
            Use Current Location
          </Button>
        </div>

        {/* Map */}
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          onLocationChange={handleLocationChange}
          height={height}
          width={width}
          autoZoom={autoZoom}
          zoomLevel={zoomLevel}
          smoothZoom={smoothZoom}
        />
      </div>

      {/* Radius Control */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-900">Radius</span>
          <InputNumber
            value={currentRadius}
            onChange={(value) => {
              if (value !== null) {
                handleRadiusChange(value);
              }
            }}
            min={0.01}
            max={0.05}
            step={0.001}
            precision={3}
            style={{ width: 120 }}
            className="text-sm border border-gray-300 rounded-lg"
            placeholder="Radius"
          />
        </div>
        <Slider
          min={0.01}
          max={0.05}
          step={0.001}
          value={currentRadius}
          onChange={handleRadiusChange}
          
          marks={{
            0.01: '10 m',
            0.02: '20 m',
            0.03: '30 m',
            0.04: '40 m',
            0.05: '50 m',
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
      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">
          Use Coordinates
        </div>
        <Space size="large">
          <div>
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
          <div>
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
