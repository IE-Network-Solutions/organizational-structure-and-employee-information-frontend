'use client';

import React, { useMemo } from 'react';
import { Button, Modal, Tag, Typography } from 'antd';
import { CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GoLocation } from 'react-icons/go';
import { useAttendanceLocationErrorStore } from '@/store/uistate/features/timesheet/attendanceLocationError';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import AttendanceLocationMap from '@/components/common/attendanceLocationMap';
import {
  formatCoordinates,
  formatDistanceMeters,
  getAreaDistanceSummaries,
  getAreaRadiusMeters,
  getNearestAreaSummary,
} from '@/helpers/geofenceHelper';

const { Text } = Typography;

const DEFAULT_TITLE = 'Location not allowed';

const AttendanceLocationErrorModal = () => {
  const { isOpen, errorMessage, userCoords, allowedAreas, closeModal } =
    useAttendanceLocationErrorStore();
  const setShowCameraCapture = useRemoteAttendanceCameraStore(
    (s) => s.setShowCameraCapture,
  );
  const pendingAction = useRemoteAttendanceCameraStore((s) => s.pendingAction);

  const areaSummaries = useMemo(() => {
    if (!userCoords) return [];
    return getAreaDistanceSummaries(userCoords, allowedAreas);
  }, [allowedAreas, userCoords]);

  const nearestArea = useMemo(
    () => getNearestAreaSummary(areaSummaries),
    [areaSummaries],
  );

  const isInsideAnyArea = areaSummaries.some((summary) => summary.isInside);

  const modalTitle = errorMessage?.trim() || DEFAULT_TITLE;

  const handleTryAgain = () => {
    closeModal();
    if (pendingAction) {
      setShowCameraCapture(true);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      closable={false}
      mask
      maskClosable
      centered
      width={680}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      footer={
        pendingAction ? (
          <div
            className="flex w-full justify-end"
            data-cy="attendance-location-error-modal-footer"
          >
            <Button
              type="primary"
              onClick={handleTryAgain}
              className="h-10 px-4"
              data-cy="attendance-location-error-modal-retry-button"
            >
              Try again
            </Button>
          </div>
        ) : null
      }
      title={
        <div
          className="flex w-full items-center justify-between gap-4"
          data-cy="attendance-location-error-modal-title-row"
        >
          <span
            className="text-base font-semibold text-gray-900"
            data-cy="attendance-location-error-modal-title"
          >
            {modalTitle}
          </span>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            data-cy="attendance-location-error-modal-close-icon"
          >
            <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
          </button>
        </div>
      }
      rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full"
      classNames={{
        header: '!mb-0 !px-6 !py-3 !min-h-0',
        body: '!px-6 !pb-4 !pt-3',
        footer: pendingAction ? '!px-6 !pb-4 !pt-0 !mt-0' : undefined,
      }}
      styles={{
        content: { borderRadius: 8, padding: 0 },
        header: { marginBottom: 0 },
        body: { paddingTop: 12 },
      }}
      data-cy="attendance-location-error-modal"
    >
      <div className="space-y-3" data-cy="attendance-location-error-modal-body">
        {userCoords ? (
          <>
            <div
              className="flex flex-wrap items-center gap-2"
              data-cy="attendance-location-error-modal-status-row"
            >
              <Tag
                color={isInsideAnyArea ? 'success' : 'error'}
                className="m-0"
                data-cy="attendance-location-error-modal-inside-tag"
              >
                {isInsideAnyArea
                  ? 'Inside an allowed area'
                  : 'Outside all allowed areas'}
              </Tag>
              {nearestArea ? (
                <Tag
                  color="default"
                  className="m-0"
                  data-cy="attendance-location-error-modal-nearest-tag"
                >
                  Nearest: {nearestArea.area.title} (
                  {formatDistanceMeters(nearestArea.distanceMeters)} away)
                </Tag>
              ) : null}
              <span
                className="inline-flex min-w-0 flex-1 items-center justify-end gap-1.5 text-sm text-gray-700 sm:flex-none"
                data-cy="attendance-location-error-modal-user-location"
              >
                <EnvironmentOutlined
                  className="shrink-0 text-[#ff4d4f]"
                  data-cy="attendance-location-error-modal-coordinates-icon"
                />
                <span
                  className="truncate tabular-nums"
                  data-cy="attendance-location-error-modal-coordinates"
                >
                  {formatCoordinates(userCoords.latitude, userCoords.longitude)}
                </span>
              </span>
            </div>

            <AttendanceLocationMap
              userCoords={userCoords}
              allowedAreas={allowedAreas}
            />

            <div data-cy="attendance-location-error-modal-areas-list">
              <Text
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400"
                data-cy="attendance-location-error-modal-areas-list-title"
              >
                Your allowed areas
              </Text>
              {areaSummaries.length === 0 ? (
                <Text
                  className="text-sm text-gray-500"
                  data-cy="attendance-location-error-modal-no-areas"
                >
                  No allowed areas configured.
                </Text>
              ) : (
                <div
                  className="max-h-40 space-y-2 overflow-y-auto pr-1"
                  data-cy="attendance-location-error-modal-areas-scroll"
                >
                  {areaSummaries.map((summary) => (
                    <div
                      key={summary.area.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
                      data-cy={`attendance-location-error-modal-area-${summary.area.id}`}
                    >
                      <div
                        className="flex min-w-0 items-center gap-2"
                        data-cy={`attendance-location-error-modal-area-info-${summary.area.id}`}
                      >
                        <GoLocation
                          className="shrink-0 text-gray-400"
                          size={15}
                          data-cy={`attendance-location-error-modal-area-icon-${summary.area.id}`}
                        />
                        <div
                          className="min-w-0"
                          data-cy={`attendance-location-error-modal-area-text-${summary.area.id}`}
                        >
                          <Text
                            className="block truncate text-sm font-medium text-gray-900"
                            data-cy={`attendance-location-error-modal-area-title-${summary.area.id}`}
                          >
                            {summary.area.title}
                          </Text>
                          <Text
                            className="block text-xs text-gray-500"
                            data-cy={`attendance-location-error-modal-area-radius-${summary.area.id}`}
                          >
                            Radius:{' '}
                            {formatDistanceMeters(
                              getAreaRadiusMeters(summary.area),
                            )}
                            {summary.area.isGlobal ? ' · Global' : ''}
                          </Text>
                        </div>
                      </div>
                      <Tag
                        color={summary.isInside ? 'success' : 'warning'}
                        className="m-0 shrink-0"
                        data-cy={`attendance-location-error-modal-area-status-${summary.area.id}`}
                      >
                        {summary.isInside
                          ? 'Inside'
                          : `${formatDistanceMeters(summary.distanceMeters)} away`}
                      </Tag>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex flex-wrap gap-4 text-xs text-gray-500"
              data-cy="attendance-location-error-modal-legend"
            >
              <span
                className="inline-flex items-center gap-1.5"
                data-cy="attendance-location-error-modal-legend-you"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full bg-[#ff4d4f]"
                  data-cy="attendance-location-error-modal-legend-you-dot"
                />
                You
              </span>
              <span
                className="inline-flex items-center gap-1.5"
                data-cy="attendance-location-error-modal-legend-area"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border-2 border-[#3636F0] bg-[#3636F0]/20"
                  data-cy="attendance-location-error-modal-legend-area-dot"
                />
                Allowed area radius
              </span>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default AttendanceLocationErrorModal;
