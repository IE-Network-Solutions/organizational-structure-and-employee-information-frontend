// components/MeetingDetail/MeetingHeader.tsx
import { Button, Card } from 'antd';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { FileTextOutlined } from '@ant-design/icons';

interface MeetingHeaderProps {
  title: string;
  loading: boolean;
}

export default function MeetingHeader({ title, loading }: MeetingHeaderProps) {
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="my-3 sm:my-5 border-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <Link
          href="/feedback/meeting"
          className="!text-black flex items-center gap-2 sm:gap-3"
        >
          <IoIosArrowBack size={18} className="sm:w-5 sm:h-5" />
          <span className="font-semibold text-lg sm:text-xl lg:text-2xl break-words">
            {title}
          </span>
        </Link>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          className="h-8 sm:h-10 w-full sm:w-auto text-xs sm:text-sm"
        >
          MoM
        </Button>
      </div>
    </Card>
  );
}
