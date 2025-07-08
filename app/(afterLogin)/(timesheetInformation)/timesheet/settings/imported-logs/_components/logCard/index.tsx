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
    <div className="flex  gap-3 mb-4 last:mb-0 p-1">
      <Avatar icon={<UserOutlined />} size={30} />
      <div className="flex-1">
        <div className="flex items-center text-xs text-gray-900 gap-1.5">
          <span className="font-bold">Dagmawit Yilma</span>
          <span className="text-success">approved</span>
          <span>attendance </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {dayjs(item.createdAt).format(DATETIME_FORMAT)}
        </div>
      </div>
    </div>
  );
};

export default LogCard;
