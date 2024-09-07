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

const CheckControl = () => {
  const [workTime, setWorkTime] = useState<string>('');
  const { checkStatus, setIsShowCheckOutSidebar, currentAttendance } =
    useMyTimesheetStore();

  const { mutate: setCurrentAttendance, isLoading } = useSetCurrentAttendance();

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
        <Button
          className="h-14 text-base"
          size="large"
          type="primary"
          icon={<GoClock size={20} />}
          loading={isLoading}
          onClick={() => {
            setCurrentAttendance({
              latitude: 23.5,
              longitude: 44.5,
              isSignIn: true,
              userId: localUserID,
            });
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
            loading={isLoading}
            onClick={() => setIsShowCheckOutSidebar(true)}
          >
            Break Check Out
          </Button>
          <Button
            className="h-14 text-base"
            size="large"
            icon={<GoClock size={20} />}
            loading={isLoading}
            onClick={() => {
              setCurrentAttendance({
                latitude: 23.5,
                longitude: 44.5,
                isSignIn: false,
                userId: localUserID,
              });
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
            loading={isLoading}
            onClick={() => {
              setCurrentAttendance({
                latitude: 23.5,
                longitude: 44.5,
                isSignIn: true,
                userId: localUserID,
              });
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
