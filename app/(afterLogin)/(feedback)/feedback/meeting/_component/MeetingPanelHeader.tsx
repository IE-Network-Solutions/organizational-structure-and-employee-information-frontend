'use client';

import { Card, Skeleton } from 'antd';
import Link from 'next/link';
import { MdOutlineEdit, MdOutlineFileDownload } from 'react-icons/md';
import { usePDF } from '@react-pdf/renderer';
import MomTemplate from '../[id]/_components/momTemplate';
import { useEffect } from 'react';
import { useQueryClient, QueryClientProvider } from 'react-query';

interface MeetingPanelHeaderProps {
  loading: boolean;
  meetingTitle?: string;
  meetingData: any;
  canEdit: boolean;
  onEditDetails?: () => void;
}

export default function MeetingPanelHeader({
  loading,
  meetingTitle,
  meetingData,
  canEdit,
  onEditDetails,
}: MeetingPanelHeaderProps) {
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
      link.download = `${meetingTitle || 'meeting-minutes'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={false}
      className="!my-0 border-none shadow-none"
      data-cy="feedback-meeting-panel-header-card"
    >
      {loading ? (
        <div
          className="flex flex-row items-start justify-between gap-3"
          data-cy="feedback-meeting-panel-header-skeleton"
        >
          <Skeleton
            active
            title={{ style: { marginTop: 0, height: 28, width: 280 } }}
            paragraph={false}
            className="min-w-0 flex-1"
          />
          <div
            className="flex shrink-0 items-center gap-2"
            data-cy="feedback-meeting-panel-header-skeleton-actions"
          >
            <Skeleton.Button active size="default" shape="square" />
            <Skeleton.Button active size="default" shape="square" />
          </div>
        </div>
      ) : (
        <div
          className="flex flex-row items-start justify-between gap-3"
          data-cy="feedback-meeting-panel-header-row"
        >
          <div
            className="min-w-0 flex-1"
            data-cy="feedback-meeting-panel-header-title-col"
          >
            <Link
              href="/feedback/meeting"
              className="inline-block min-w-0 hover:opacity-80"
              data-cy="feedback-meeting-panel-header-link-back"
            >
              <span
                className="break-words text-[20px] font-bold leading-snug text-black/70"
                data-cy="feedback-meeting-panel-header-title"
              >
                {meetingTitle || '\u00a0'}
              </span>
            </Link>
          </div>
          <div
            className="flex items-center gap-2 shrink-0"
            data-cy="feedback-meeting-panel-header-actions"
          >
            {canEdit && onEditDetails ? (
              <button
                type="button"
                onClick={onEditDetails}
                className="box-border flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white p-0 text-[#2D3748] outline-none transition-colors hover:border-[#BFBFBF] hover:bg-[#FAFAFA] focus-visible:ring-2 focus-visible:ring-[#1677FF]/25"
                data-cy="feedback-meeting-panel-header-button-edit"
                aria-label="Edit meeting details"
              >
                <MdOutlineEdit className="text-[14px]" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleDownload}
              disabled={instance.loading || !meetingData}
              className="box-border flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white p-0 text-[#2D3748] outline-none transition-colors hover:border-[#BFBFBF] hover:bg-[#FAFAFA] focus-visible:ring-2 focus-visible:ring-[#1677FF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              data-cy="feedback-meeting-panel-header-button-mom"
              aria-label="Download meeting minutes"
            >
              <MdOutlineFileDownload className="text-[14px]" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
