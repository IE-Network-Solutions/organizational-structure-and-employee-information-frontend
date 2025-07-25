// components/MeetingDetail/MeetingHeader.tsx
import { Button, Card } from 'antd';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { FileTextOutlined } from '@ant-design/icons';
import { usePDF } from '@react-pdf/renderer';
import MomTemplate from './momTemplate';
import { useEffect } from 'react';
import { useQueryClient, QueryClientProvider } from 'react-query';

interface MeetingHeaderProps {
  title: string;
  loading: boolean;
  meetingData: any; // Replace with a more specific type if available
}

export default function MeetingHeader({
  title,
  loading,
  meetingData,
}: MeetingHeaderProps) {
  const [instance, updateInstance] = usePDF();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (meetingData) {
      updateInstance(
        <QueryClientProvider client={queryClient}>
          <MomTemplate meetingData={meetingData} />
        </QueryClientProvider>,
      );
    }
  }, [meetingData, updateInstance, queryClient]);

  const handleDownload = () => {
    if (instance.url && !instance.loading && !instance.error) {
      const link = document.createElement('a');
      link.href = instance.url;
      link.download = `${title || 'meeting-minutes'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
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
          onClick={handleDownload}
          disabled={instance.loading || !meetingData}
          loading={instance.loading}
        >
          MoM
        </Button>
      </div>
    </Card>
  );
}
