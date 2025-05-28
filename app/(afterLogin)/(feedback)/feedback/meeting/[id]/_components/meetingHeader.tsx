// components/MeetingDetail/MeetingHeader.tsx
import { Button, Card } from 'antd';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';

interface MeetingHeaderProps {
  title: string;
  loading: boolean;
}

export default function MeetingHeader({ title, loading }: MeetingHeaderProps) {
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className=" my-5 border-none"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/feedback/meeting"
          className=" !text-black flex items-center gap-3"
        >
          <IoIosArrowBack size={20} />
          <span className="font-semibold  text-2xl">{title}</span>
        </Link>
        <Button type="primary">MoM</Button>
      </div>
    </Card>
  );
}
