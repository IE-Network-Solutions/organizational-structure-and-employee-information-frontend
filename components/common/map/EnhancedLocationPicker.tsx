import React, { useState, useEffect } from 'react';
import { Card, InputNumber, Slider, Space, Typography, Divider, Button, message } from 'antd';
import { EnvironmentOutlined, RadiusUprightOutlined, SearchOutlined, AimOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import LocationSearch from './LocationSearch';

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
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
  /** Enable automatic search in the location search component (default: true) */
  autoSearch?: boolean;
  /** Delay in milliseconds before triggering auto-search (default: 500) */
  debounceDelay?: number;
  /** Enable automatic zoom to selected location (default: true) */
  autoZoom?: boolean;
  /** Zoom level when auto-zooming to selected location (default: 15) */
  zoomLevel?: number;
  /** Enable smooth transitions when zooming (default: true) */
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
  height = '500px',
  width = '100%',
  autoSearch = true,
  debounceDelay = 500,
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
          message.error('Unable to get current location. Please select manually.');
        }
      );
    } else {
      message.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <Card className="w-full">
      <Space direction="vertical" size="large" className="w-full">
        {/* Search Section */}
        <div>
          <Title level={5} className="mb-2">
            <SearchOutlined className="mr-2" />
            Search Location
          </Title>
          <LocationSearch 
            onLocationSelect={handleSearchSelect} 
            autoSearch={autoSearch}
            debounceDelay={debounceDelay}
          />
          <Button 
            type="dashed" 
            icon={<AimOutlined />} 
            onClick={handleUseCurrentLocation}
            className="mt-2"
          >
            Use Current Location
          </Button>
        </div>

        <Divider />

        {/* Map Section */}
        <div>
          <Title level={5} className="mb-2">
            <EnvironmentOutlined className="mr-2" />
            Select Location on Map
          </Title>
          <Text type="secondary" className="text-sm">
            Double click on the map to set the center point of your allowed area
          </Text>
          <div className="mt-2">
            <LocationPicker
              latitude={currentLat}
              longitude={currentLng}
              radius={currentRadius}
              onLocationChange={handleLocationChange}
              onRadiusChange={handleRadiusChange}
              height={height}
              width={width}
              autoZoom={autoZoom}
              zoomLevel={zoomLevel}
              smoothZoom={smoothZoom}
            />
          </div>
        </div>

        <Divider />

        {/* Coordinates Display */}
        <div>
          <Title level={5} className="mb-2">
            Coordinates
          </Title>
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

        {/* Radius Control */}
        <div>
          <Title level={5} className="mb-2">
            <RadiusUprightOutlined className="mr-2" />
            Radius (km)
          </Title>
          <Space direction="vertical" className="w-full">
            <Slider
              min={0.01}
              max={10}
              step={0.01}
              value={currentRadius}
              onChange={handleRadiusChange}
              marks={{
                0.01: '10m',
                0.1: '100m',
                1: '1km',
                5: '5km',
                10: '10km',
              }}
            />
            <InputNumber
              value={currentRadius}
              onChange={(value) => {
                if (value !== null) {
                  handleRadiusChange(value);
                }
              }}
              min={0.01}
              max={10}
              step={0.01}
              precision={2}
              addonAfter="km"
              style={{ width: 120 }}
            />
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default EnhancedLocationPicker; 