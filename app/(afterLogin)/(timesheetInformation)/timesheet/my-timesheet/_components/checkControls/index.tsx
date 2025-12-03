import { Button, Space, Dropdown } from 'antd';
import { GoClock } from 'react-icons/go';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import { useSetCurrentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import { useEffect, useState } from 'react';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { useGetCurrentAttendance } from '@/store/server/features/timesheet/attendance/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { IoLocationOutline } from 'react-icons/io5';
import { MdOutlineLocationOn } from 'react-icons/md';

const CheckControl = () => {
  const [workTime, setWorkTime] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const {
    checkStatus,
    setIsShowCheckOutSidebar,
    currentAttendance,
    setCurrentAttendance,
  } = useMyTimesheetStore();

  const { isMobile } = useIsMobile();
  const { data: currentAttendanceData, isFetching } =
    useGetCurrentAttendance(userId);
  const { mutate: setCurrentAttendanceData, isLoading } =
    useSetCurrentAttendance();

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

  const getCoords = (setLocation: (position: GeolocationPosition) => void) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
        },
        () => {
          NotificationMessage.error({
            message: `No access to geolocation`,
            description: `To check-in/check-out we need to have access to geolocation.`,
          });
        },
      );
    } else {
      NotificationMessage.error({
        message: `No access to geolocation`,
        description: `To check-in/check-out we need to have access to geolocation.`,
      });
    }
  };

  const setAttendance = (isSignIn: boolean) => {
    getCoords((pos) => {
      setCurrentAttendanceData({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        isSignIn,
        userId: userId,
      });
    });
  };

  const mobileMenuItems = [
    {
      key: 'break',
      label: (
        <Button
          type="text"
          icon={<GoClock data-cy="time-attendance-check-controls-mobile-break-check-out-button-icon" size={20} />}
          loading={isLoading || isFetching}
          onClick={() => {
            getCoords(() => {
              setIsShowCheckOutSidebar(true);
            });
          }}
          id="time-attendance-check-controls-mobile-break-check-out-button"
          data-cy="time-attendance-check-controls-mobile-break-check-out-button"
        >
          Break Check Out
        </Button>
      ),
    },
    {
      key: 'checkout',
      label: (
        <Button
          type="text"
          icon={<GoClock data-cy="time-attendance-check-controls-mobile-check-out-button-icon" size={20} />}
          loading={isLoading || isFetching}
          onClick={() => {
            setAttendance(false);
          }}
          id="time-attendance-check-controls-mobile-check-out-menu-button"
          data-cy="time-attendance-check-controls-mobile-check-out-menu-button"
        >
          Check Out
        </Button>
      ),
    },
  ];

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <AccessGuard data-cy="time-attendance-check-controls-check-in-button-access-guard" permissions={[Permissions.CheckInRemotely]}>
          <Button
            className="h-10 sm:h-10 text-base"
            id="time-attendance-check-controls-check-in-button"
            data-cy="time-attendance-check-controls-check-in-button"
            size="large"
            type="primary"
            icon={
              isMobile ? (
                <IoLocationOutline data-cy="time-attendance-check-controls-check-in-button-icon" size={20} />
              ) : (
                <MdOutlineLocationOn data-cy="time-attendance-check-controls-check-in-button-icon" size={16} />
              )
            }
            loading={isLoading || isFetching}
            onClick={() => {
              setAttendance(true);
            }}
          >
            {isMobile ? '' : 'Check in'}
          </Button>
        </AccessGuard>
      );
    case CheckStatus.started:
      return (
        <div
          id="time-attendance-check-controls-started-container"
          data-cy="time-attendance-check-controls-started-container"
        >
          {!isMobile ? (
            <Space data-cy="time-attendance-check-controls-started-buttons-space" className="hidden sm:block">
              <AccessGuard data-cy="time-attendance-check-controls-break-check-out-button-access-guard" permissions={[Permissions.CheckOutRemotely]}>
                <div
                  className="flex justify-between gap-2"
                  id="time-attendance-check-controls-started-buttons"
                  data-cy="time-attendance-check-controls-started-buttons"
                >
                  <Button
                    className="h-10 text-base px-2"
                    size="large"
                    id="time-attendance-check-controls-break-check-out-button"
                    data-cy="time-attendance-check-controls-break-check-out-button"
                    icon={<GoClock data-cy="time-attendance-check-controls-break-check-out-button-icon" size={20} />}
                    loading={isLoading || isFetching}
                    onClick={() => {
                      getCoords(() => {
                        setIsShowCheckOutSidebar(true);
                      });
                    }}
                  >
                    Break Check Out
                  </Button>
                  <Button
                    className="h-10 text-base"
                    size="large"
                    id="time-attendance-check-controls-check-out-button"
                    data-cy="time-attendance-check-controls-check-out-button"
                    icon={<GoClock data-cy="time-attendance-check-controls-check-out-button-icon" size={20} />}
                    loading={isLoading || isFetching}
                    onClick={() => {
                      setAttendance(false);
                    }}
                  >
                    Check Out
                  </Button>
                </div>
              </AccessGuard>
            </Space>
          ) : (
            <AccessGuard data-cy="time-attendance-check-controls-check-out-button-access-guard" permissions={[Permissions.CheckOutRemotely]}>
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
                  icon={<IoLocationOutline data-cy="time-attendance-check-controls-mobile-check-out-button-icon" size={20} />}
                  loading={isLoading || isFetching}
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
          <AccessGuard data-cy="time-attendance-check-controls-break-check-in-button-access-guard" permissions={[Permissions.CheckInRemotely]}>
            <Button
              className="h-14 text-base"
              size="large"
              id="time-attendance-check-controls-break-check-in-button"
              data-cy="time-attendance-check-controls-break-check-in-button"
              icon={
                isMobile ? (
                  <IoLocationOutline data-cy="time-attendance-check-controls-break-check-in-button-icon" size={30} />
                ) : (
                  <GoClock data-cy="time-attendance-check-controls-break-check-in-button-clock-icon" size={30} />
                )
              }
              loading={isLoading || isFetching}
              onClick={() => {
                setAttendance(true);
              }}
            >
              {isMobile ? '' : 'Check in'}
            </Button>
          </AccessGuard>
        </Space>
      );
    case CheckStatus.finished:
      return '';
  }
};

export default CheckControl;
