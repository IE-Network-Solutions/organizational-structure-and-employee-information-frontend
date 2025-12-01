import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AttendanceImport } from '@/types/timesheet/attendance';
import { FC } from 'react';
import dayjs from 'dayjs';
import { DATETIME_FORMAT } from '@/utils/constants';

interface LogCardProps {
  item: AttendanceImport;
}

const LogCard: FC<LogCardProps> = ({ item }) => {
  return (
    <div
      className="flex  gap-3 mb-4 last:mb-0 p-1"
      id={`time-attendance-settings-imported-logs-card-${item.id}-container`}
      data-cy={`time-attendance-settings-imported-logs-card-${item.id}-container`}
    >
      <Avatar
        icon={<UserOutlined data-cy={`time-attendance-settings-imported-logs-card-${item.id}-avatar-icon`} />}
        size={30}
        data-cy={`time-attendance-settings-imported-logs-card-${item.id}-avatar`}
      />
      <div
        className="flex-1"
        id={`time-attendance-settings-imported-logs-card-${item.id}-content`}
        data-cy={`time-attendance-settings-imported-logs-card-${item.id}-content`}
      >
        <div
          className="flex items-center text-xs text-gray-900 gap-1.5"
          id={`time-attendance-settings-imported-logs-card-${item.id}-info`}
          data-cy={`time-attendance-settings-imported-logs-card-${item.id}-info`}
        >
          <span
            className="font-bold"
            id={`time-attendance-settings-imported-logs-card-${item.id}-name`}
            data-cy={`time-attendance-settings-imported-logs-card-${item.id}-name`}
          >
            Dagmawit Yilma
          </span>
          <span
            className="text-success"
            id={`time-attendance-settings-imported-logs-card-${item.id}-status`}
            data-cy={`time-attendance-settings-imported-logs-card-${item.id}-status`}
          >
            approved
          </span>
          <span
            id={`time-attendance-settings-imported-logs-card-${item.id}-action`}
            data-cy={`time-attendance-settings-imported-logs-card-${item.id}-action`}
          >
            attendance{' '}
          </span>
        </div>
        <div
          className="text-xs text-gray-500 mt-1"
          id={`time-attendance-settings-imported-logs-card-${item.id}-date`}
          data-cy={`time-attendance-settings-imported-logs-card-${item.id}-date`}
        >
          {dayjs(item.createdAt).format(DATETIME_FORMAT)}
        </div>
      </div>
    </div>
  );
};

export default LogCard;
