import { Button, Space } from 'antd';
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

const CheckControl = () => {
  const [workTime, setWorkTime] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const {
    checkStatus,
    setIsShowCheckOutSidebar,
    currentAttendance,
    setCurrentAttendance,
  } = useMyTimesheetStore();

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

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <AccessGuard permissions={[Permissions.CheckInRemotely]}>
          <Button
            className="h-14 text-base"
            id="buttonCheckin"
            size="large"
            type="primary"
            icon={<GoClock size={20} />}
            loading={isLoading || isFetching}
            onClick={() => {
              setAttendance(true);
            }}
          >
            Check in
          </Button>
        </AccessGuard>
      );
    case CheckStatus.started:
      return (
        <Space>
          <AccessGuard permissions={[Permissions.CheckOutRemotely]}>
            <Button
              className="h-14 text-base px-2"
              size="large"
              id="buttonBreakCheckOut"
              icon={<GoClock size={20} />}
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
              className="h-14 text-base"
              size="large"
              id="buttonCheckOut"
              icon={<GoClock size={20} />}
              loading={isLoading || isFetching}
              onClick={() => {
                setAttendance(false);
              }}
            >
              Check out
            </Button>
          </AccessGuard>
        </Space>
      );
    case CheckStatus.breaking:
      return (
        <Space size={32}>
          {workTime && (
            <div className="text-[28px] text-primary font-bold">
              {workTime} hrs
            </div>
          )}
          <AccessGuard permissions={[Permissions.CheckInRemotely]}>
            <Button
              className="h-14 text-base"
              size="large"
              id="checkInButton"
              icon={<GoClock size={20} />}
              loading={isLoading || isFetching}
              onClick={() => {
                setAttendance(true);
              }}
            >
              Check in
            </Button>
          </AccessGuard>
        </Space>
      );
    case CheckStatus.finished:
      return '';
  }
};

export default CheckControl;
