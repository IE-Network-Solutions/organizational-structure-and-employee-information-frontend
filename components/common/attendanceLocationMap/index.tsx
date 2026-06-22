'use client';

import React, { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AllowedArea } from '@/types/timesheet/settings';
import {
  UserCoords,
  formatDistanceMeters,
  getAllowedAreaCircleBounds,
  getCircleEdgeLatLng,
} from '@/helpers/geofenceHelper';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userMarkerIcon = L.divIcon({
  className: 'attendance-location-user-marker',
  html: '<div class="attendance-location-user-marker-dot" title="You"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const areaMarkerIcon = L.divIcon({
  className: 'attendance-location-area-marker',
  html: '<div class="attendance-location-area-marker-dot"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const DEFAULT_ZOOM = 16;
const AREA_CIRCLE_COLOR = '#3636F0';

function createRadiusLabelIcon(radiusMeters: number) {
  const label = formatDistanceMeters(radiusMeters);
  return L.divIcon({
    className: 'attendance-location-radius-label',
    html: `<span class="attendance-location-radius-label-text">${label}</span>`,
    iconSize: [48, 20],
    iconAnchor: [24, 10],
  });
}

const FitMapToUserAndAreas: React.FC<{
  userCoords: UserCoords;
  allowedAreas: AllowedArea[];
}> = ({ userCoords, allowedAreas }) => {
  const map = useMap();

  useEffect(() => {
    const userLatLng = L.latLng(userCoords.latitude, userCoords.longitude);
    let bounds = L.latLngBounds(userLatLng, userLatLng);

    allowedAreas.forEach((area) => {
      const circleBounds = getAllowedAreaCircleBounds(area);
      if (circleBounds) {
        bounds = bounds.extend(circleBounds);
      } else {
        bounds.extend([area.latitude, area.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [48, 48],
        duration: 0.8,
        easeLinearity: 0.25,
        maxZoom: 18,
      });
      return;
    }

    map.flyTo(userLatLng, DEFAULT_ZOOM, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
  }, [map, userCoords.latitude, userCoords.longitude, allowedAreas]);

  return null;
};

export type AttendanceLocationMapProps = {
  userCoords: UserCoords;
  allowedAreas: AllowedArea[];
  height?: string;
};

const AttendanceLocationMapInner: React.FC<AttendanceLocationMapProps> = ({
  userCoords,
  allowedAreas,
  height = '300px',
}) => {
  const center = useMemo(
    () => [userCoords.latitude, userCoords.longitude] as [number, number],
    [userCoords.latitude, userCoords.longitude],
  );

  return (
    <>
      <style data-cy="attendance-location-map-styles">{`
        .attendance-location-user-marker-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ff4d4f;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .attendance-location-area-marker-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${AREA_CIRCLE_COLOR};
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
        .attendance-location-radius-label {
          background: transparent;
          border: none;
        }
        .attendance-location-radius-label-text {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid ${AREA_CIRCLE_COLOR};
          color: ${AREA_CIRCLE_COLOR};
          font-size: 10px;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }
        .attendance-location-map .leaflet-tooltip.attendance-area-map-label {
          background: #ffffff;
          border: 1px solid ${AREA_CIRCLE_COLOR};
          color: ${AREA_CIRCLE_COLOR};
          font-size: 11px;
          font-weight: 600;
          line-height: 1.3;
          padding: 3px 8px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
          white-space: nowrap;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .attendance-location-map .leaflet-tooltip.attendance-area-map-label::before {
          border-top-color: ${AREA_CIRCLE_COLOR};
        }
        .attendance-location-map .leaflet-tooltip.attendance-area-map-user-label {
          background: #ffffff;
          border: 1px solid #ff4d4f;
          color: #ff4d4f;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
        }
        .attendance-location-map .leaflet-tooltip.attendance-area-map-user-label::before {
          border-top-color: #ff4d4f;
        }
      `}</style>
      <div
        style={{ height, width: '100%' }}
        className="attendance-location-map overflow-hidden rounded-lg border border-gray-200"
        data-cy="attendance-location-map"
      >
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          dragging
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMapToUserAndAreas
            userCoords={userCoords}
            allowedAreas={allowedAreas}
          />
          <Marker position={center} icon={userMarkerIcon}>
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              className="attendance-area-map-user-label"
            >
              You
            </Tooltip>
          </Marker>
          {allowedAreas.map((area) => {
            const radiusMeters = Number(area.distance) || 0;
            const areaCenter = [area.latitude, area.longitude] as [
              number,
              number,
            ];
            const areaName = area.title?.trim() || 'Allowed area';
            const radiusLabel = formatDistanceMeters(radiusMeters);
            const edgePosition =
              radiusMeters > 0
                ? getCircleEdgeLatLng(
                    area.latitude,
                    area.longitude,
                    radiusMeters,
                  )
                : null;
            return (
              <React.Fragment key={area.id}>
                {radiusMeters > 0 ? (
                  <>
                    <Circle
                      center={areaCenter}
                      radius={radiusMeters}
                      pathOptions={{
                        color: AREA_CIRCLE_COLOR,
                        fillColor: AREA_CIRCLE_COLOR,
                        fillOpacity: 0.18,
                        weight: 2.5,
                        opacity: 0.9,
                      }}
                    />
                    {edgePosition ? (
                      <Marker
                        position={edgePosition}
                        icon={createRadiusLabelIcon(radiusMeters)}
                        interactive={false}
                        zIndexOffset={-100}
                        data-cy={`attendance-location-map-area-radius-${area.id}`}
                      />
                    ) : null}
                  </>
                ) : null}
                <Marker
                  position={areaCenter}
                  icon={areaMarkerIcon}
                  data-cy={`attendance-location-map-area-marker-${area.id}`}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -8]}
                    className="attendance-area-map-label"
                  >
                    {areaName}
                    {radiusMeters > 0 ? ` · ${radiusLabel}` : ''}
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </>
  );
};

const AttendanceLocationMap = dynamic(
  () => Promise.resolve(AttendanceLocationMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
        data-cy="attendance-location-map-loading"
      >
        Loading map...
      </div>
    ),
  },
);

export default AttendanceLocationMap;
