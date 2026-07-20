import { Button, Space, Dropdown } from 'antd';
import { GoClock } from 'react-icons/go';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import { useEffect, useState } from 'react';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { useGetCurrentAttendance } from '@/store/server/features/timesheet/attendance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CiLogin, CiLogout } from 'react-icons/ci';
import RemoteAttendanceActionButton from '@/components/common/remoteAttendanceActionButton';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useIsWithinBreakPeriod } from '@/hooks/useIsWithinBreakPeriod';

const CheckControl = () => {
  const [workTime, setWorkTime] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const { checkStatus, currentAttendance, setCurrentAttendance } =
    useMyTimesheetStore();
  const isSubmitInProgress = useRemoteAttendanceCameraStore(
    (s) => s.isSubmitInProgress,
  );

  const { isMobile } = useIsMobile();
  const withinBreakPeriod = useIsWithinBreakPeriod();
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

  const mobileMenuItems = [
    {
      key: 'break',
      label: (
        <RemoteAttendanceActionButton
          action={{
            isSignIn: false,
            openBreakCheckOutSidebarAfterCapture: true,
          }}
        >
          <Button
            type="text"
            icon={
              <GoClock
                data-cy="time-attendance-check-controls-mobile-break-check-out-button-icon"
                size={20}
              />
            }
            loading={loading}
            id="time-attendance-check-controls-mobile-break-check-out-button"
            data-cy="time-attendance-check-controls-mobile-break-check-out-button"
          >
            Break Check Out
          </Button>
        </RemoteAttendanceActionButton>
      ),
    },
    // Hide the Check Out option during any configured break period.
    ...(!withinBreakPeriod
      ? [
          {
            key: 'checkout',
            label: (
              <RemoteAttendanceActionButton action={{ isSignIn: false }}>
                <Button
                  type="text"
                  icon={
                    <GoClock
                      data-cy="time-attendance-check-controls-mobile-check-out-button-icon"
                      size={20}
                    />
                  }
                  loading={loading}
                  id="time-attendance-check-controls-mobile-check-out-menu-button"
                  data-cy="time-attendance-check-controls-mobile-check-out-menu-button"
                >
                  Check Out
                </Button>
              </RemoteAttendanceActionButton>
            ),
          },
        ]
      : []),
  ];

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <AccessGuard
          data-cy="time-attendance-check-controls-check-in-button-access-guard"
          permissions={[Permissions.CheckInRemotely]}
        >
          <RemoteAttendanceActionButton action={{ isSignIn: true }}>
            <Button
              className="h-10 sm:h-10 text-base"
              id="time-attendance-check-controls-check-in-button"
              data-cy="time-attendance-check-controls-check-in-button"
              size="large"
              type="primary"
              icon={
                <CiLogin
                  data-cy="time-attendance-check-controls-check-in-button-icon"
                  size={isMobile ? 20 : 16}
                />
              }
              loading={loading}
            >
              {isMobile ? '' : 'Check in'}
            </Button>
          </RemoteAttendanceActionButton>
        </AccessGuard>
      );
    case CheckStatus.started:
      return (
        <div
          id="time-attendance-check-controls-started-container"
          data-cy="time-attendance-check-controls-started-container"
        >
          {!isMobile ? (
            <Space
              data-cy="time-attendance-check-controls-started-buttons-space"
              className="hidden sm:block"
            >
              <AccessGuard
                data-cy="time-attendance-check-controls-break-check-out-button-access-guard"
                permissions={[Permissions.CheckOutRemotely]}
              >
                <div
                  className="flex justify-between gap-2"
                  id="time-attendance-check-controls-started-buttons"
                  data-cy="time-attendance-check-controls-started-buttons"
                >
                  <RemoteAttendanceActionButton
                    action={{
                      isSignIn: false,
                      openBreakCheckOutSidebarAfterCapture: true,
                    }}
                  >
                    <Button
                      className="h-10 text-base px-2"
                      size="large"
                      id="time-attendance-check-controls-break-check-out-button"
                      data-cy="time-attendance-check-controls-break-check-out-button"
                      icon={
                        <GoClock
                          data-cy="time-attendance-check-controls-break-check-out-button-icon"
                          size={20}
                        />
                      }
                      loading={loading}
                    >
                      Break Check Out
                    </Button>
                  </RemoteAttendanceActionButton>
                  {!withinBreakPeriod && (
                    <RemoteAttendanceActionButton action={{ isSignIn: false }}>
                      <Button
                        className="h-10 text-base"
                        size="large"
                        id="time-attendance-check-controls-check-out-button"
                        data-cy="time-attendance-check-controls-check-out-button"
                        icon={
                          <CiLogout
                            data-cy="time-attendance-check-controls-check-out-button-icon"
                            size={20}
                          />
                        }
                        loading={loading}
                      >
                        Check Out
                      </Button>
                    </RemoteAttendanceActionButton>
                  )}
                </div>
              </AccessGuard>
            </Space>
          ) : (
            <AccessGuard
              data-cy="time-attendance-check-controls-check-out-button-access-guard"
              permissions={[Permissions.CheckOutRemotely]}
            >
              <Dropdown
                menu={{ items: mobileMenuItems }}
                trigger={['click']}
                placement="bottomRight"
                data-cy="time-attendance-check-controls-mobile-dropdown"
              >
                <Button
                  className="h-10 text-base"
                  size="large"
                  id="time-attendance-check-controls-mobile-check-out-button"
                  data-cy="time-attendance-check-controls-mobile-check-out-button"
                  icon={
                    <CiLogout
                      data-cy="time-attendance-check-controls-mobile-check-out-button-icon"
                      size={20}
                    />
                  }
                  loading={loading}
                />
              </Dropdown>
            </AccessGuard>
          )}
        </div>
      );
    case CheckStatus.breaking:
      return (
        <Space
          size={32}
          id="time-attendance-check-controls-breaking-container"
          data-cy="time-attendance-check-controls-breaking-container"
        >
          {workTime && (
            <div
              className="text-[28px] text-primary font-bold"
              id="time-attendance-check-controls-work-time"
              data-cy="time-attendance-check-controls-work-time"
            >
              {workTime} hrs
            </div>
          )}
          <AccessGuard
            data-cy="time-attendance-check-controls-break-check-in-button-access-guard"
            permissions={[Permissions.CheckInRemotely]}
          >
            <RemoteAttendanceActionButton action={{ isSignIn: true }}>
              <Button
                className="h-14 text-base"
                size="large"
                id="time-attendance-check-controls-break-check-in-button"
                data-cy="time-attendance-check-controls-break-check-in-button"
                icon={
                  <CiLogin
                    data-cy="time-attendance-check-controls-break-check-in-button-icon"
                    size={30}
                  />
                }
                loading={loading}
              >
                {isMobile ? '' : 'Check in'}
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
