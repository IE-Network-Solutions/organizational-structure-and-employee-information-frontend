'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { CiLogin, CiAlarmOn } from 'react-icons/ci';
import { RiCupLine } from 'react-icons/ri';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetCurrentAttendance } from '@/store/server/features/timesheet/attendance/queries';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { formatBreakTypeToStatus } from '@/helpers/formatTo';
import { BreakType } from '@/types/timesheet/breakType';
import { AttendanceRecord } from '@/types/timesheet/attendance';
import RemoteAttendanceActionButton from '@/components/common/remoteAttendanceActionButton';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';

const { Text } = Typography;

const TIME_FORMAT_24 = 'HH:mm:ss';
const TIME_FORMAT_SHORT = 'HH:mm';
const DATE_FULL_FORMAT = 'dddd, MMMM D, YYYY';

/** Get the break type that is currently in its time window and available to start (not yet taken). */
function getCurrentBreakByTime(
  breakTypes: BreakType[],
  currentAttendance: AttendanceRecord | null,
): BreakType | null {
  for (const bt of breakTypes) {
    const status = formatBreakTypeToStatus(bt, currentAttendance);
    if (!status.disabled && status.status.text === 'Available') {
      return bt;
    }
  }
  return null;
}

/** Get the ongoing break from current attendance (user is on break). */
function getOngoingBreak(
  currentAttendance: AttendanceRecord | null,
  breakTypes: BreakType[],
): { title: string } | null {
  const ongoing = currentAttendance?.attendanceBreaks?.find((b) => b.isOnGoing);
  if (!ongoing) return null;
  const title =
    ongoing?.breakType?.title ??
    (ongoing.breakTypeId
      ? breakTypes.find((bt) => bt.id === ongoing.breakTypeId)?.title
      : null);
  return { title: title ?? 'Break' };
}

export default function CurrentTimeCard() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { userId } = useAuthenticationStore();
  const { checkStatus, currentAttendance, setCurrentAttendance, breakTypes } =
    useMyTimesheetStore();
  const isSubmitInProgress = useRemoteAttendanceCameraStore(
    (s) => s.isSubmitInProgress,
  );

  const { data: currentAttendanceData, isFetching } = useGetCurrentAttendance(
    userId ?? '',
  );

  useEffect(() => {
    setCurrentAttendance(
      currentAttendanceData?.item ? currentAttendanceData.item : null,
    );
  }, [currentAttendanceData, setCurrentAttendance]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isToday = currentAttendance?.createdAt
    ? dayjs(currentAttendance.createdAt).isSame(dayjs(), 'day')
    : false;

  /** User has already checked out today — hide all check-in/check-out/break buttons until tomorrow. */
  const hasCheckedOutToday = isToday && currentAttendance?.endAt != null;

  const todayActivityLine = useMemo(() => {
    if (!currentAttendance?.startAt || !isToday) return null;
    const inTime = dayjs(currentAttendance.startAt).format(TIME_FORMAT_SHORT);
    if (currentAttendance.endAt) {
      const outTime = dayjs(currentAttendance.endAt).format(TIME_FORMAT_SHORT);
      return `In ${inTime}, out ${outTime}`;
    }
    return `In: ${dayjs(currentAttendance.startAt).format(TIME_FORMAT_24)}`;
  }, [currentAttendance, isToday]);

  const currentBreakByTime = useMemo(
    () => getCurrentBreakByTime(breakTypes, currentAttendance),
    [breakTypes, currentAttendance],
  );

  const ongoingBreak = useMemo(
    () => getOngoingBreak(currentAttendance, breakTypes),
    [currentAttendance, breakTypes],
  );

  const loading = isSubmitInProgress || isFetching;

  return (
    <Card
      className="overflow-hidden border border-[#91CAFF] shadow-sm bg-gradient-to-br from-[#FFFFFF] to-[#E6F4FF]"
      data-cy="my-timesheet-overview-current-time-card"
      id="my-timesheet-overview-current-time-card"
    >
      <div
        className="flex flex-col gap-4"
        data-cy="my-timesheet-overview-current-time-card-content"
      >
        <div
          className="flex flex-row items-center justify-between gap-4"
          data-cy="my-timesheet-overview-current-time-card-row"
        >
          <div data-cy="my-timesheet-overview-current-time-card-left">
            <Text
              className="block text-gray-400 text-sm font-medium mb-1"
              data-cy="my-timesheet-overview-current-time-label"
            >
              Current Time
            </Text>
            <div
              className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums"
              data-cy="my-timesheet-overview-current-time-value"
            >
              {currentTime.format(TIME_FORMAT_24)}
            </div>
            <Text
              className="block text-gray-600 text-sm mt-1"
              data-cy="my-timesheet-overview-current-date"
            >
              {currentTime.format(DATE_FULL_FORMAT)}
            </Text>
          </div>

          <div
            className="shrink-0 self-center"
            data-cy="my-timesheet-overview-current-time-card-actions"
          >
            {!hasCheckedOutToday && checkStatus === CheckStatus.notStarted && (
              <AccessGuard
                permissions={[Permissions.CheckInRemotely]}
                data-cy="my-timesheet-overview-check-in-guard"
              >
                <RemoteAttendanceActionButton action={{ isSignIn: true }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CiLogin size={20} />}
                    loading={loading}
                    data-cy="my-timesheet-overview-check-in-button"
                    id="my-timesheet-overview-check-in-button"
                    className="px-8 py-6 text-lg font-medium"
                  >
                    Check In
                  </Button>
                </RemoteAttendanceActionButton>
              </AccessGuard>
            )}

            {!hasCheckedOutToday && checkStatus === CheckStatus.started && (
              <AccessGuard
                permissions={[Permissions.CheckOutRemotely]}
                data-cy="my-timesheet-overview-check-out-guard"
              >
                <Space
                  direction="vertical"
                  size="middle"
                  className="w-full sm:w-auto"
                  data-cy="my-timesheet-overview-current-time-card-started-actions"
                >
                  {currentBreakByTime && (
                    <RemoteAttendanceActionButton
                      action={{
                        isSignIn: false,
                        breakTypeId: currentBreakByTime.id ?? '',
                      }}
                    >
                      <Button
                        type="primary"
                        ghost
                        size="large"
                        icon={<RiCupLine size={20} />}
                        loading={loading}
                        data-cy="my-timesheet-overview-break-start-button"
                        id="my-timesheet-overview-break-start-button"
                        className="!border-primary !text-primary hover:!bg-primary/10 px-8 py-6 text-lg font-medium"
                      >
                        {currentBreakByTime.title} Start
                      </Button>
                    </RemoteAttendanceActionButton>
                  )}
                  <RemoteAttendanceActionButton action={{ isSignIn: false }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CiLogin size={20} />}
                      loading={loading}
                      data-cy="my-timesheet-overview-check-out-button"
                      id="my-timesheet-overview-check-out-button"
                      className="px-8 py-6 text-lg font-medium"
                    >
                      Check Out
                    </Button>
                  </RemoteAttendanceActionButton>
                </Space>
              </AccessGuard>
            )}

            {!hasCheckedOutToday && checkStatus === CheckStatus.breaking && (
              <AccessGuard
                permissions={[Permissions.CheckInRemotely]}
                data-cy="my-timesheet-overview-end-break-guard"
              >
                <div
                  className="flex flex-col items-end gap-2"
                  data-cy="my-timesheet-overview-current-time-card-breaking-actions"
                >
                  {ongoingBreak && (
                    <Text
                      className="text-gray-500 text-sm"
                      data-cy="my-timesheet-overview-on-break-status"
                    >
                      On {ongoingBreak.title} - Timer Running
                    </Text>
                  )}
                  <RemoteAttendanceActionButton action={{ isSignIn: true }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CiAlarmOn size={20} />}
                      loading={loading}
                      data-cy="my-timesheet-overview-end-break-button"
                      id="my-timesheet-overview-end-break-button"
                      className="px-8 py-6 text-lg font-medium"
                    >
                      End Break
                    </Button>
                  </RemoteAttendanceActionButton>
                </div>
              </AccessGuard>
            )}
          </div>
        </div>

        {todayActivityLine !== null && (
          <div data-cy="my-timesheet-overview-current-time-card-activity">
            <Text
              className="block text-gray-400 text-sm font-medium mb-1"
              data-cy="my-timesheet-overview-todays-activity-label"
            >
              Today&apos;s Activity
            </Text>
            <Text
              className="block text-gray-900 font-medium"
              data-cy="my-timesheet-overview-todays-activity-in"
            >
              {todayActivityLine}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
