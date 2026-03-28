'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import MeetingList from './_component/meetingList';
import AddNewMeetingForm from './_component/addMeetingForm';
import { FaPlus } from 'react-icons/fa';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

export default function Index() {
  const { setOpenAddMeeting } = useMeetingStore();
  function HandleOpen() {
    setOpenAddMeeting(true);
  }
  return (
    <TabLandingLayout
      buttonDisabled={false}
      id="meetingLayoutId"
      data-cy="feedback-meeting-page-tab-landing-layout"
      title="Meetings"
      subtitle={
        <p className="flex items-center gap-1.5 text-slate-400 text-sm font-normal">
          <span>CFR</span>
          <span>/</span>
          <span>Conversation</span>
          <span>/</span>
          <span className="text-slate-700 font-medium">Meeting</span>
        </p>
      }
      buttonTitle={'Create Meeting'}
      buttonIcon={
        <FaPlus
          data-cy="feedback-meeting-page-icon-plus"
          id="feedback-meeting-page-icon-plus"
        />
      }
      onClickHandler={() => HandleOpen()}
    >
      <MeetingList data-cy="feedback-meeting-page-meeting-list" />
      <AddNewMeetingForm data-cy="feedback-meeting-page-add-new-meeting-form" />
    </TabLandingLayout>
  );
}
