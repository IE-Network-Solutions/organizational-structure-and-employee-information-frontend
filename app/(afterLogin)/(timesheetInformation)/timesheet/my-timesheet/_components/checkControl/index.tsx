import React, { useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { GoClock } from 'react-icons/go';
import { IoLocationOutline } from 'react-icons/io5';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import { useGetCurrentAttendance } from '@/store/server/features/timesheet/attendance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import RemoteAttendanceActionButton from '@/components/common/remoteAttendanceActionButton';
import { useIsWithinBreakPeriod } from '@/hooks/useIsWithinBreakPeriod';

const CheckControl = () => {
  const [workTime, setWorkTime] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const { checkStatus, currentAttendance, setCurrentAttendance } =
    useMyTimesheetStore();
  const withinBreakPeriod = useIsWithinBreakPeriod();
  const isSubmitInProgress = useRemoteAttendanceCameraStore(
    (s) => s.isSubmitInProgress,
  );

  const { data: currentAttendanceData, isFetching } =
    useGetCurrentAttendance(userId);

  const loading = isSubmitInProgress || isFetching;

  useEffect(() => {
    setCurrentAttendance(
      currentAttendanceData ? currentAttendanceData.item : null,
    );
  }, [currentAttendanceData]);

  useEffect(() => {
    if (checkStatus === CheckStatus.breaking && currentAttendance) {
      const calcTime =
        calculateAttendanceRecordToTotalWorkTime(currentAttendance);
      setWorkTime(`${timeToHour(calcTime)}:${timeToLastMinute(calcTime)}`);
    }
  }, [checkStatus, currentAttendance]);

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <AccessGuard
          data-cy="time-attendance-check-control-check-in-button-access-guard"
          permissions={[Permissions.CheckInRemotely]}
        >
          <RemoteAttendanceActionButton action={{ isSignIn: true }}>
            <Button
              className="h-12 sm:h-14 text-base w-full sm:w-auto"
              id="time-attendance-check-control-check-in-button"
              data-cy="time-attendance-check-control-check-in-button"
              size="large"
              type="primary"
              icon={
                <>
                  <IoLocationOutline
                    data-cy="time-attendance-check-control-check-in-button-icon"
                    className="block sm:hidden"
                    size={20}
                  />
                  <GoClock
                    data-cy="time-attendance-check-control-check-in-button-clock-icon"
                    className="hidden sm:block"
                    size={20}
                  />
                </>
              }
              loading={loading}
            >
              Check in
            </Button>
          </RemoteAttendanceActionButton>
        </AccessGuard>
      );
    case CheckStatus.started:
      return (
        <Space
          className="w-full sm:w-auto"
          direction="vertical"
          size="middle"
          id="time-attendance-check-control-started-container"
          data-cy="time-attendance-check-control-started-container"
        >
          <AccessGuard
            data-cy="time-attendance-check-control-break-check-out-button-access-guard"
            permissions={[Permissions.CheckOutRemotely]}
          >
            <RemoteAttendanceActionButton
              action={{
                isSignIn: false,
                openBreakCheckOutSidebarAfterCapture: true,
              }}
            >
              <Button
                className="h-12 sm:h-14 text-base w-full sm:w-auto"
                size="large"
                id="time-attendance-check-control-break-check-out-button"
                data-cy="time-attendance-check-control-break-check-out-button"
                icon={
                  <>
                    <IoLocationOutline
                      data-cy="time-attendance-check-control-break-check-out-button-icon"
                      className="block sm:hidden"
                      size={20}
                    />
                    <GoClock
                      data-cy="time-attendance-check-control-break-check-out-button-clock-icon"
                      className="hidden sm:block"
                      size={20}
                    />
                  </>
                }
                loading={loading}
              >
                Break Check Out
              </Button>
            </RemoteAttendanceActionButton>
            {!withinBreakPeriod && (
              <RemoteAttendanceActionButton action={{ isSignIn: false }}>
                <Button
                  className="h-12 sm:h-14 text-base w-full sm:w-auto"
                  size="large"
                  id="time-attendance-check-control-check-out-button"
                  data-cy="time-attendance-check-control-check-out-button"
                  icon={
                    <>
                      <IoLocationOutline
                        data-cy="time-attendance-check-control-check-out-button-icon"
                        className="block sm:hidden"
                        size={20}
                      />
                      <GoClock
                        data-cy="time-attendance-check-control-check-out-button-clock-icon"
                        className="hidden sm:block"
                        size={20}
                      />
                    </>
                  }
                  loading={loading}
                >
                  Check out
                </Button>
              </RemoteAttendanceActionButton>
            )}
          </AccessGuard>
        </Space>
      );
    case CheckStatus.breaking:
      return (
        <Space
          className="w-full sm:w-auto"
          direction="vertical"
          size="middle"
          id="time-attendance-check-control-breaking-container"
          data-cy="time-attendance-check-control-breaking-container"
        >
          {workTime && (
            <div
              className="text-[24px] sm:text-[28px] text-primary font-bold text-center sm:text-left"
              id="time-attendance-check-control-work-time"
              data-cy="time-attendance-check-control-work-time"
            >
              {workTime} hrs
            </div>
          )}
          <AccessGuard
            data-cy="time-attendance-check-control-break-check-in-button-access-guard"
            permissions={[Permissions.CheckInRemotely]}
          >
            <RemoteAttendanceActionButton action={{ isSignIn: true }}>
              <Button
                className="h-12 sm:h-14 text-base w-full sm:w-auto"
                size="large"
                id="time-attendance-check-control-break-check-in-button"
                data-cy="time-attendance-check-control-break-check-in-button"
                icon={
                  <>
                    <IoLocationOutline
                      data-cy="time-attendance-check-control-break-check-in-button-icon"
                      className="block sm:hidden"
                      size={20}
                    />
                    <GoClock
                      data-cy="time-attendance-check-control-break-check-in-button-clock-icon"
                      className="hidden sm:block"
                      size={20}
                    />
                  </>
                }
                loading={loading}
              >
                Check in
              </Button>
            </RemoteAttendanceActionButton>
          </AccessGuard>
        </Space>
      );
    case CheckStatus.finished:
      return '';
  }
};

export default CheckControl;
