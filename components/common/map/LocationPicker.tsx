import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Usage Examples:
 * 
 * // Auto-zoom enabled (default)
 * <LocationPicker
 *   latitude={latitude}
 *   longitude={longitude}
 *   radius={radius}
 *   onLocationChange={handleLocationChange}
 *   onRadiusChange={handleRadiusChange}
 * />
 * 
 * // Custom zoom level
 * <LocationPicker
 *   latitude={latitude}
 *   longitude={longitude}
 *   radius={radius}
 *   onLocationChange={handleLocationChange}
 *   onRadiusChange={handleRadiusChange}
 *   zoomLevel={18}
 * />
 * 
 * // Disable auto-zoom
 * <LocationPicker
 *   latitude={latitude}
 *   longitude={longitude}
 *   radius={radius}
 *   onLocationChange={handleLocationChange}
 *   onRadiusChange={handleRadiusChange}
 *   autoZoom={false}
 * />
 */

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  width?: string;
  /** Enable automatic zoom to selected location (default: true) */
  autoZoom?: boolean;
  /** Zoom level when auto-zooming to selected location (default: 15) */
  zoomLevel?: number;
  /** Enable smooth transitions when zooming (default: true) */
  smoothZoom?: boolean;
}

// Component to handle map view updates and automatic zooming
const MapViewManager: React.FC<{
  position: [number, number];
  autoZoom?: boolean;
  zoomLevel?: number;
  smoothZoom?: boolean;
  radius?: number;
}> = ({ position, autoZoom = true, zoomLevel = 15, smoothZoom = true, radius = 1 }) => {
  const map = useMap();

  useEffect(() => {
    if (autoZoom && map) {
      // Calculate the appropriate zoom level based on radius
      // Larger radius needs lower zoom level to show the entire circle
      const radiusInMeters = radius * 1000;
      let calculatedZoom = zoomLevel;
      
      // Adjust zoom based on radius size
      if (radiusInMeters > 5000) { // 5km
        calculatedZoom = 10;
      } else if (radiusInMeters > 2000) { // 2km
        calculatedZoom = 12;
      } else if (radiusInMeters > 500) { // 500m
        calculatedZoom = 14;
      } else if (radiusInMeters > 100) { // 100m
        calculatedZoom = 16;
      } else { // 10m-100m
        calculatedZoom = 18;
      }

      const flyToOptions = {
        duration: smoothZoom ? 1.5 : 0, // 1.5 seconds for smooth transition
        easeLinearity: 0.25,
      };

      map.flyTo(position, calculatedZoom, flyToOptions);
    }
  }, [position, autoZoom, zoomLevel, smoothZoom, map, radius]);

  // Add a listener to ensure marker stays in view when user zooms out
  useEffect(() => {
    if (!map) return;

    const handleZoomEnd = () => {
      const currentZoom = map.getZoom();
      const markerLatLng = L.latLng(position[0], position[1]);
      const mapBounds = map.getBounds();
      
      // If marker is not in view, adjust the map
      if (!mapBounds.contains(markerLatLng)) {
        const flyToOptions = {
          duration: smoothZoom ? 1.0 : 0,
          easeLinearity: 0.25,
        };
        
        // Calculate appropriate zoom to show marker and radius
        const radiusInMeters = radius * 1000;
        let targetZoom = currentZoom;
        
        if (radiusInMeters > 5000) {
          targetZoom = Math.max(currentZoom, 10);
        } else if (radiusInMeters > 2000) {
          targetZoom = Math.max(currentZoom, 12);
        } else if (radiusInMeters > 500) {
          targetZoom = Math.max(currentZoom, 14);
        } else if (radiusInMeters > 100) {
          targetZoom = Math.max(currentZoom, 16);
        } else {
          targetZoom = Math.max(currentZoom, 18);
        }
        
        map.flyTo(position, targetZoom, flyToOptions);
      }
    };

    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleZoomEnd);
    };
  }, [map, position, radius, smoothZoom]);

  return null;
};

const MapClickHandler: React.FC<{
  onLocationChange: (lat: number, lng: number) => void;
}> = ({ onLocationChange }) => {
  useMapEvents({
    dblclick: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  radius,
  onLocationChange,
  height = '400px',
  width = '100%',
  autoZoom = true,
  zoomLevel = 15,
  smoothZoom = true,
}) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const [currentRadius, setCurrentRadius] = useState(radius);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  useEffect(() => {
    setCurrentRadius(radius);
  }, [radius]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  if (!isClient) {
    return (
      <div style={{ height, width }} className="bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      <MapContainer
        center={position}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        easeLinearity={0.35}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={handleLocationChange} />
        <MapViewManager 
          position={position} 
          autoZoom={autoZoom} 
          zoomLevel={zoomLevel} 
          smoothZoom={smoothZoom} 
          radius={currentRadius}
        />
        <Marker 
          position={position}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: #1890ff;
                border: 2px solid white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                <div style="
                  background: white;
                  border-radius: 50%;
                  width: 8px;
                  height: 8px;
                "></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
        <Circle
          center={position}
          radius={currentRadius * 1000} // Convert km to meters
          pathOptions={{
            color: '#1890ff',
            fillColor: '#1890ff',
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(LocationPicker), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
}); 