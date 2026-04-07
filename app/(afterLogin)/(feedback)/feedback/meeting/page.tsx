'use client';

import TabLandingLayout from '@/components/tabLanding';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';
import MeetingList from './_component/meetingList';
import MeetingListFilters from './_component/meetingListFilters';
import MeetingDetailPanel from './_component/MeetingDetailPanel';
import AddNewMeetingForm from './_component/addMeetingForm';
import { FaPlus } from 'react-icons/fa';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

function MeetingsSplitContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get('id') ?? undefined;

  return (
    <div
      className="box-border w-full min-w-0 bg-white p-4 sm:p-5"
      data-cy="feedback-meeting-page-main-card"
    >
      <div
        className="flex w-full min-w-0 flex-col gap-6"
        data-cy="feedback-meeting-page-split"
      >
        <MeetingListFilters />
        <div
          className="flex w-full min-w-0 flex-col items-stretch gap-6 xl:flex-row xl:items-stretch"
          data-cy="feedback-meeting-page-split-columns"
        >
          <div
            className="flex w-full min-w-0 flex-col xl:h-[720px] xl:min-h-0 xl:flex-1 xl:basis-0 xl:overflow-hidden"
            data-cy="feedback-meeting-page-list-column"
          >
            <MeetingList
              hideFilters
              matchRightPanelHeight
              selectedMeetingId={selectedId}
              data-cy="feedback-meeting-page-meeting-list"
            />
          </div>
          <div
            className="flex w-full min-w-0 flex-col xl:h-[720px] xl:min-h-0 xl:flex-1 xl:basis-0"
            data-cy="feedback-meeting-page-detail-column"
          >
            {selectedId ? (
              <MeetingDetailPanel meetingId={selectedId} />
            ) : (
              <AddNewMeetingForm
                embedded
                data-cy="feedback-meeting-page-add-meeting-inline"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingMeetingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams?.get('id') ?? undefined;
  const { setOpenAddMeeting, bumpAddMeetingFormReset } = useMeetingStore();

  const handleCreateMeeting = () => {
    setOpenAddMeeting(false);
    if (selectedId) {
      router.replace('/feedback/meeting', { scroll: false });
    } else {
      bumpAddMeetingFormReset();
    }
  };

  return (
    <TabLandingLayout
      buttonDisabled={false}
      flushHorizontal
      id="meetingLayoutId"
      data-cy="feedback-meeting-page-tab-landing-layout"
      primaryActionButtonClassName="!self-center !h-[40px] !min-h-[40px] !inline-flex !items-center !justify-center !px-[15px] rounded-lg border-none bg-blue-600 hover:bg-blue-700 !leading-none [&_.ant-btn-icon]:!m-0 [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center"
      primaryActionTextClassName="text-sm font-normal !leading-none !inline-flex !items-center"
      title="Meetings"
      subtitle={
        <p
          className="flex items-center gap-1.5 text-slate-400 text-sm font-normal"
          data-cy="feedback-meeting-page-breadcrumb-subtitle"
        >
          <span data-cy="feedback-meeting-page-breadcrumb-cfr">CFR</span>
          <span data-cy="feedback-meeting-page-breadcrumb-sep-1">/</span>
          <span data-cy="feedback-meeting-page-breadcrumb-conversation">
            Conversation
          </span>
          <span data-cy="feedback-meeting-page-breadcrumb-sep-2">/</span>
          <span
            className="text-slate-700 font-medium"
            data-cy="feedback-meeting-page-breadcrumb-meeting"
          >
            Meeting
          </span>
        </p>
      }
      buttonTitle={selectedId ? 'Create Meeting' : undefined}
      buttonIcon={
        selectedId ? (
          <FaPlus
            className="text-[12px]"
            data-cy="feedback-meeting-page-icon-plus"
            id="feedback-meeting-page-icon-plus"
          />
        ) : undefined
      }
      onClickHandler={handleCreateMeeting}
    >
      <Suspense
        fallback={
          <div
            className="flex justify-center py-24"
            data-cy="feedback-meeting-page-split-suspense"
          >
            <Spin size="large" />
          </div>
        }
      >
        <MeetingsSplitContent />
      </Suspense>
    </TabLandingLayout>
  );
}

export default function Index() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[40vh] justify-center items-center"
          data-cy="feedback-meeting-page-root-suspense-fallback"
        >
          <Spin size="large" />
        </div>
      }
    >
      <MeetingMeetingsPageInner />
    </Suspense>
  );
}
