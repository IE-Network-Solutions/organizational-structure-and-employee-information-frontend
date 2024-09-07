import { Button, Space } from 'antd';
import { GoClock } from 'react-icons/go';
import {
  CheckStatus,
  useMyTimesheetStore,
} from '@/store/uistate/features/timesheet/myTimesheet';
import { useSetCurrentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import { localUserID } from '@/utils/constants';
import { useEffect, useState } from 'react';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { useGetCurrentAttendance } from '@/store/server/features/timesheet/attendance/queries';

const CheckControl = () => {
  const [location, setLocation] = useState<{
    lat: null | number;
    lon: null | number;
  }>({ lat: null, lon: null });
  const [workTime, setWorkTime] = useState<string>('');
  const {
    checkStatus,
    setIsShowCheckOutSidebar,
    currentAttendance,
    setCurrentAttendance,
  } = useMyTimesheetStore();

  const { data: currentAttendanceData, isFetching } = useGetCurrentAttendance();
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    } else {
      // TODO: notify about no geolocation
    }
  }, []);

  const setAttendance = (isSignIn: boolean) => {
    // TODO: notify about enable geolocation
    if (location.lat && location.lon) {
      setCurrentAttendanceData({
        latitude: location.lat,
        longitude: location.lon,
        isSignIn,
        userId: localUserID,
      });
    }
  };

  switch (checkStatus) {
    case CheckStatus.notStarted:
      return (
        <Button
          className="h-14 text-base"
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
      );
    case CheckStatus.started:
      return (
        <Space>
          <Button
            className="h-14 text-base px-2"
            size="large"
            icon={<GoClock size={20} />}
            loading={isLoading || isFetching}
            onClick={() => setIsShowCheckOutSidebar(true)}
          >
            Break Check Out
          </Button>
          <Button
            className="h-14 text-base"
            size="large"
            icon={<GoClock size={20} />}
            loading={isLoading || isFetching}
            onClick={() => {
              setAttendance(false);
            }}
          >
            Check out
          </Button>
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

          <Button
            className="h-14 text-base"
            size="large"
            icon={<GoClock size={20} />}
            loading={isLoading || isFetching}
            onClick={() => {
              setAttendance(true);
            }}
          >
            Check in
          </Button>
        </Space>
      );
    case CheckStatus.finished:
      return '';
  }
};

export default CheckControl;
