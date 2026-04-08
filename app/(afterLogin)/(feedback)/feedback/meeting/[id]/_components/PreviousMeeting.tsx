import type { ReactNode } from 'react';
import { useGetPrevMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card, Spin } from 'antd';
import Link from 'next/link';
import React from 'react';

export default function PreviousMeeting({
  meeting,
  variant = 'default',
  'data-cy': dataCy,
}: {
  meeting?: any;
  variant?: 'default' | 'panel';
  'data-cy'?: string;
}) {
  const { userId } = useAuthenticationStore();

  const { data: meetings, isLoading: meetingLoading } = useGetPrevMeetings(
    meeting?.meetingTypeId ?? '',
    userId,
  );

  const filtered =
    meetings?.items?.filter((ifm: any) => ifm?.id != meeting?.id) ?? [];
  const hasItems = filtered.length > 0;

  if (variant === 'panel') {
    const panelFixedHeight = meetingLoading || !hasItems;
    const panelShellClass = [
      'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100',
      panelFixedHeight ? 'h-[81px] overflow-hidden' : 'min-h-[81px]',
    ].join(' ');

    let panelBody: ReactNode;
    if (meetingLoading) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          data-cy="feedback-meeting-previous-panel-loading"
        >
          <Spin
            size="small"
            data-cy="feedback-meeting-components-previousmeeting-spin"
          />
        </div>
      );
    } else if (!hasItems) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-1"
          data-cy="feedback-meeting-previous-panel-empty-wrap"
        >
          <p
            className="m-0 text-center text-[14px] font-bold text-black/70"
            data-cy="feedback-meeting-components-previousmeeting-empty"
          >
            No previous meetings
          </p>
        </div>
      );
    } else {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col gap-[9px] overflow-y-auto scrollbar-none"
          data-cy="feedback-meeting-components-previousmeeting-div-list"
          id="feedback-meeting-components-previousmeeting-div-list"
        >
          {filtered.map((i: any, index: number) => (
            <Link
              key={i.id ?? index}
              href={`/feedback/meeting?id=${encodeURIComponent(String(i.id))}`}
              className="flex items-center justify-between gap-2 rounded-[6px] border border-solid border-[#D9D9D9] bg-white p-2 text-sm shadow-sm hover:bg-gray-50"
              data-cy={`feedback-meeting-components-previousmeeting-link-${index}`}
              id={`feedback-meeting-components-previousmeeting-link-${index}`}
            >
              <span
                className="min-w-0 flex-1 font-normal text-[#323B49]"
                data-cy={`feedback-meeting-components-previousmeeting-span-title-${index}`}
                id={`feedback-meeting-components-previousmeeting-span-title-${index}`}
              >
                {i.title}
              </span>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div
        className={panelShellClass}
        data-cy={dataCy ?? 'feedback-meeting-previous-meeting-panel'}
        id="feedback-meeting-previous-meeting-panel"
      >
        <div
          className="flex h-[24px] w-full shrink-0 items-center justify-between"
          data-cy="feedback-meeting-previous-panel-header-row"
        >
          <h2
            className="m-0 text-[14px] font-normal leading-none text-black"
            data-cy="feedback-meeting-components-previousmeeting-heading"
            id="feedback-meeting-components-previousmeeting-heading"
          >
            Previous Meeting
          </h2>
        </div>
        {panelBody}
      </div>
    );
  }

  return (
    <Card
      loading={meetingLoading}
      bodyStyle={{ padding: 0 }}
      className="border-none p-4"
      data-cy="feedback-meeting-components-previousmeeting-card"
      id="feedback-meeting-components-previousmeeting-card"
    >
      {hasItems && (
        <>
          <div
            className="flex items-center justify-between py-2"
            data-cy="feedback-meeting-components-previousmeeting-div-header"
            id="feedback-meeting-components-previousmeeting-div-header"
          >
            <h2
              className="mb-2 text-lg font-semibold"
              data-cy="feedback-meeting-components-previousmeeting-heading"
              id="feedback-meeting-components-previousmeeting-heading"
            >
              Previous Meeting
            </h2>
          </div>

          <div
            className="flex flex-col gap-2"
            data-cy="feedback-meeting-components-previousmeeting-div-list"
            id="feedback-meeting-components-previousmeeting-div-list"
          >
            {filtered.map((i: any, index: number) => (
              <Link
                key={i.id ?? index}
                href={`/feedback/meeting?id=${encodeURIComponent(String(i.id))}`}
                className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                data-cy={`feedback-meeting-components-previousmeeting-link-${index}`}
                id={`feedback-meeting-components-previousmeeting-link-${index}`}
              >
                <span
                  className="font-semibold text-gray-400"
                  data-cy={`feedback-meeting-components-previousmeeting-span-title-${index}`}
                  id={`feedback-meeting-components-previousmeeting-span-title-${index}`}
                >
                  {i.title}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
