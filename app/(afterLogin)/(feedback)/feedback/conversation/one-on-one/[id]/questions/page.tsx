'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import QuestionDataTable from '../_components/questions';
import CreateOneOnOneMeeting from '../_components/meeting/createMeeting';

function page() {
  const { open, setOpen } = ConversationStore();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      New One To One Meeting
    </div>
  );
  return (
    <>
      <TabLandingLayout
        buttonTitle="New Meeting"
        id="conversationLayoutId"
        onClickHandler={() => setOpen(true)}
        title="FY 2017 Q1 Bi Weekly Questions"
        subtitle="Conversations / One-On-One / FY 2017 Q1 Bi Weekly Questions"
      >
        <QuestionDataTable />
      </TabLandingLayout>
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <CreateOneOnOneMeeting />
      </CustomDrawerLayout>
    </>
  );
}

export default page;
