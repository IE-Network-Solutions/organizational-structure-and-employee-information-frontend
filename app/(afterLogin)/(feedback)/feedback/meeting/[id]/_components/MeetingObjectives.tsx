import type { ReactNode } from 'react';
import { Card } from 'antd';
import MeetingPanelBlockSkeleton from '../../_component/meetingPanelBlockSkeleton';

type MeetingObjectivesProps = {
  objective?: string | null;
  loading: boolean;
  variant?: 'default' | 'panel';
  'data-cy'?: string;
};

export default function MeetingObjectives({
  objective,
  loading,
  variant = 'default',
  'data-cy': dataCy,
}: MeetingObjectivesProps) {
  const trimmed =
    objective != null && typeof objective === 'string' ? objective.trim() : '';
  const hasContent = trimmed.length > 0;

  if (variant === 'panel') {
    const panelFixedHeight = loading || !hasContent;
    const panelShellClass = [
      'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100',
      panelFixedHeight ? 'h-[81px] overflow-hidden' : 'min-h-[81px]',
    ].join(' ');

    let panelBody: ReactNode;
    if (loading) {
      panelBody = (
        <MeetingPanelBlockSkeleton data-cy="feedback-meeting-objectives-panel-loading" />
      );
    } else if (!hasContent) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-1"
          data-cy="feedback-meeting-objectives-panel-empty-wrap"
        >
          <p
            className="m-0 text-center text-[14px] font-bold text-black/70"
            data-cy="feedback-meeting-components-meetingobjectives-empty"
          >
            No meeting objectives
          </p>
        </div>
      );
    } else {
      panelBody = (
        <div
          className="min-h-0 flex-1 overflow-y-auto scrollbar-none"
          data-cy="feedback-meeting-objectives-panel-body-scroll"
        >
          <p
            className="m-0 text-[14px] font-normal leading-snug text-[#323B49]"
            data-cy="feedback-meeting-components-meetingobjectives-text"
            id="feedback-meeting-components-meetingobjectives-text"
          >
            {trimmed}
          </p>
        </div>
      );
    }

    return (
      <div
        className={panelShellClass}
        data-cy={dataCy ?? 'feedback-meeting-meeting-objectives-panel'}
        id="feedback-meeting-meeting-objectives-panel"
      >
        <div
          className="flex h-[24px] w-full shrink-0 items-center justify-between"
          data-cy="feedback-meeting-objectives-panel-header-row"
        >
          <h2
            className="m-0 text-[14px] font-normal leading-none text-black"
            data-cy="feedback-meeting-components-meetingobjectives-heading"
            id="feedback-meeting-components-meetingobjectives-heading"
          >
            Meeting Objectives
          </h2>
        </div>
        {panelBody}
      </div>
    );
  }

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="border-none p-4"
      data-cy="feedback-meeting-components-meetingobjectives-card"
      id="feedback-meeting-components-meetingobjectives-card"
    >
      <h2
        className="mb-2 text-lg font-semibold"
        data-cy="feedback-meeting-components-meetingobjectives-heading"
        id="feedback-meeting-components-meetingobjectives-heading"
      >
        Meeting Objectives
      </h2>
      <p
        className="text-[#323B49]"
        data-cy="feedback-meeting-components-meetingobjectives-text"
        id="feedback-meeting-components-meetingobjectives-text"
      >
        {objective}
      </p>
    </Card>
  );
}
