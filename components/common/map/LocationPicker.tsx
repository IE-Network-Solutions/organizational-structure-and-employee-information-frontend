'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
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
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MIN_RADIUS_KM = 0.01;
const MAX_RADIUS_KM = 10;
const RADIUS_STEP_KM = 0.01;

function clampRadiusKm(km: number): number {
  return Math.min(
    MAX_RADIUS_KM,
    Math.max(MIN_RADIUS_KM, Number(Number(km).toFixed(3))),
  );
}

/** Point on the circle edge (east of center) for the resize handle */
function getEdgeLatLng(
  lat: number,
  lng: number,
  radiusKm: number,
): [number, number] {
  const radiusMeters = radiusKm * 1000;
  const metersPerDegreeLng =
    111320 * Math.cos((lat * Math.PI) / 180) || 111320;
  const deltaLng = radiusMeters / metersPerDegreeLng;
  return [lat, lng + deltaLng];
}

const resizeHandleIcon = L.divIcon({
  className: 'radius-resize-handle-icon',
  html: '<div class="radius-resize-handle" title="Drag to resize"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
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
}> = ({
  position,
  autoZoom = true,
  zoomLevel = 15,
  smoothZoom = true,
  radius = 1,
}) => {
  const map = useMap();

  useEffect(() => {
    if (autoZoom && map) {
      // Calculate the appropriate zoom level based on radius
      // Larger radius needs lower zoom level to show the entire circle
      const radiusInMeters = radius * 1000;
      let calculatedZoom = zoomLevel;

      // Adjust zoom based on radius size
      if (radiusInMeters > 5000) {
        // 5km
        calculatedZoom = 10;
      } else if (radiusInMeters > 2000) {
        // 2km
        calculatedZoom = 12;
      } else if (radiusInMeters > 500) {
        // 500m
        calculatedZoom = 14;
      } else if (radiusInMeters > 100) {
        // 100m
        calculatedZoom = 16;
      } else {
        // 10m-100m
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
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
};

/** Draggable handle on the circle edge to resize radius */
const CircleResizeHandle: React.FC<{
  center: [number, number];
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
}> = ({ center, radiusKm, onRadiusChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [handlePosition, setHandlePosition] = useState<[number, number]>(() =>
    getEdgeLatLng(center[0], center[1], radiusKm),
  );

  useEffect(() => {
    if (!isDragging) {
      setHandlePosition(getEdgeLatLng(center[0], center[1], radiusKm));
    }
  }, [center, radiusKm, isDragging]);

  const updateRadiusFromDrag = (dragLat: number, dragLng: number) => {
    const centerLatLng = L.latLng(center[0], center[1]);
    const dragLatLng = L.latLng(dragLat, dragLng);
    const meters = centerLatLng.distanceTo(dragLatLng);
    onRadiusChange(clampRadiusKm(meters / 1000));
  };

  return (
    <Marker
      position={handlePosition}
      draggable
      icon={resizeHandleIcon}
      zIndexOffset={1000}
      eventHandlers={{
        dragstart: () => setIsDragging(true),
        drag: (e) => {
          const { lat, lng } = e.target.getLatLng();
          setHandlePosition([lat, lng]);
          updateRadiusFromDrag(lat, lng);
        },
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateRadiusFromDrag(lat, lng);
          setIsDragging(false);
        },
        click: (e) => {
          L.DomEvent.stopPropagation(e);
        },
        mousedown: (e) => {
          L.DomEvent.stopPropagation(e);
        },
      }}
    />
  );
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
  height = '400px',
  width = '100%',
  autoZoom = true,
  zoomLevel = 15,
  smoothZoom = true,
}) => {
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
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

  const handleRadiusChange = (newRadiusKm: number) => {
    const clamped = clampRadiusKm(newRadiusKm);
    setCurrentRadius(clamped);
    onRadiusChange?.(clamped);
  };

  const adjustRadius = (deltaKm: number) => {
    handleRadiusChange(currentRadius + deltaKm);
  };

  if (!isClient) {
    return (
      <div
        style={{ height, width }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        data-cy="location-picker-loading"
      >
        <div className="text-gray-500" data-cy="location-picker-loading-text">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height, width, position: 'relative' }}
      data-cy="location-picker"
    >
      <MapContainer
        center={position}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        zoomControl={false}
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
        <Marker position={position} />
        <Circle
          center={position}
          radius={currentRadius * 1000}
          pathOptions={{
            color: '#3636F0',
            fillColor: '#3636F0',
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
        {onRadiusChange && (
          <CircleResizeHandle
            center={position}
            radiusKm={currentRadius}
            onRadiusChange={handleRadiusChange}
          />
        )}
      </MapContainer>

      {onRadiusChange && (
        <div
          className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
          data-cy="location-picker-radius-controls"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Increase radius"
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-semibold text-[#3636F0] hover:bg-[#EFF6FF]"
            onClick={() => adjustRadius(RADIUS_STEP_KM)}
            data-cy="location-picker-radius-increase"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Decrease radius"
            className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-semibold text-[#3636F0] hover:bg-[#EFF6FF] disabled:opacity-40"
            disabled={currentRadius <= MIN_RADIUS_KM}
            onClick={() => adjustRadius(-RADIUS_STEP_KM)}
            data-cy="location-picker-radius-decrease"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
};

// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(LocationPicker), {
  ssr: false,
  loading: () => (
    <div
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: '400px' }}
      data-cy="components-common-map-locationpicker-tsx-locationpicker-div-316"
    >
      <div
        data-cy="components-common-map-locationpicker-tsx-locationpicker-div-320"
        className="text-gray-500"
      >
        Loading map...
      </div>
    </div>
  ),
});
