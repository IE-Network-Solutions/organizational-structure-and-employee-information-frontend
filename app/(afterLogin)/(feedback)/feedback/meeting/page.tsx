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
      subtitle="Manage your Meetings"
      buttonTitle={'Add New'}
      buttonIcon={<FaPlus data-cy="feedback-meeting-page-icon-plus" id="feedback-meeting-page-icon-plus" />}
      onClickHandler={() => HandleOpen()}
    >
      <MeetingList data-cy="feedback-meeting-page-meeting-list" />
      <AddNewMeetingForm data-cy="feedback-meeting-page-add-new-meeting-form" />
    </TabLandingLayout>
  );
}
