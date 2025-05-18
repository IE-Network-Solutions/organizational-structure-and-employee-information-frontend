// components/MeetingDetail/MeetingHeader.tsx
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';

interface MeetingHeaderProps {
  title: string;
}

export default function MeetingHeader({ title }: MeetingHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Link href="/meetings" className="text-blue-500 flex items-center gap-1">
          <ArrowLeftOutlined /> Details of <span className="font-semibold">[{title}]</span>
        </Link>
      </div>
      <Button type="primary">MoM</Button>
    </div>
  );
}
