'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import QuestionDataTable from '../_components/questions';
import CreateMeeting from '../_components/meeting/createMeeting';
interface Params {
  id: string;
  slug: string;
}

const Page = ({ params }: { params: Params }) => {
  const { id, slug } = params;
  const { open, setOpen } = ConversationStore();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Bi-Weekly Meeting
    </div>
  );
  return (
    <>
      <TabLandingLayout
        buttonTitle="New Meeting"
        id="conversationLayoutId"
        onClickHandler={() => setOpen(true)}
        title="FY 2017 Q1 Bi Weekly Questions"
        subtitle="Conversations / bi-weekly / FY 2017 Q1 Bi Weekly Questions"
      >
        <QuestionDataTable />
      </TabLandingLayout>
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <CreateMeeting id={id} slug={slug} onClose={() => setOpen(false)} />
      </CustomDrawerLayout>
    </>
  );
};

export default Page;
