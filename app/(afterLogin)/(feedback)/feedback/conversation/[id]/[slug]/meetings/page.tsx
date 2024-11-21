'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import CreateMeeting from '../_components/meeting/createMeeting';
import MettingDataTable from '../_components/meeting/mettingTable';
import { useGetConversationById } from '@/store/server/features/conversation/meetings/queries';
interface Params {
  id: string;
  slug:string;
}

const Page = ({ params}: { params: Params }) => {
  const { id, slug } = params;
  
  const { open, setOpen } = ConversationStore();
  const {data:conversationMeetingData}=useGetConversationById(id);
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
        title="Bi-Weekly"
        subtitle="Conversations / bi-weekly "
      >
        <MettingDataTable id={id} slug={slug} />
      </TabLandingLayout>
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <CreateMeeting id={id} slug={slug} onClose={()=>setOpen(false)} />
      </CustomDrawerLayout>
    </>
  );
}

export default Page;
