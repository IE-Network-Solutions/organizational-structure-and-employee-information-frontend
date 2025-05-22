// components/MeetingDetail/OtherDetails.tsx
import { EnvironmentOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { GoClock } from 'react-icons/go';

type Meeting = {
  // Define the properties of meeting as needed, for example:
  startAt: string;
  endAt: string;
  duration: string;
  locationType: string;
  physicalLocation: string;
  publicAccessLink: string;
  virtualLink: string;
};

interface OtherDetailsProps {
  meeting: Meeting;
  loading: boolean;
}

export default function OtherDetails({ meeting, loading }: OtherDetailsProps) {
  const duration = (
    dayjs(meeting?.endAt).diff(dayjs(meeting?.startAt), 'minute') / 60
  ).toFixed(2);
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="p-4 space-y-3 border-none"
    >
      <h2 className="text-lg font-semibold">Other Details</h2>
      <div className="text-gray-700 space-y-3">
        <div className="flex gap-5">
          <p className="w-full border p-3 rounded-lg">
            {dayjs(meeting?.startAt).format('HH:mm')}
          </p>
          <p className="w-full border p-3 rounded-lg">
            {dayjs(meeting?.endAt).format('HH:mm')}
          </p>
        </div>
        <div className="flex gap-5">
          <div className="w-full border p-3 rounded-lg flex items-center gap-3">
            <GoClock size={16} />
            <p>
              {duration} hour{Number(duration) > 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-full border p-3 rounded-lg flex items-center gap-3 capitalize">
            <EnvironmentOutlined size={16} />
            <p>{meeting?.locationType}</p>
          </div>
        </div>
        {(meeting?.locationType == 'in-person' ||
          meeting?.locationType == 'hybrid') && (
          <div className="w-full border p-3 rounded-lg flex items-center gap-3">
            <EnvironmentOutlined size={16} />
            <p>{meeting?.physicalLocation || '-'}</p>
          </div>
        )}
        {(meeting?.locationType == 'virtual' ||
          meeting?.locationType == 'hybrid') && (
          <div className="w-full border p-3 rounded-lg flex items-center gap-3">
            <EnvironmentOutlined size={16} />
            <p>{meeting?.virtualLink || '-'}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
