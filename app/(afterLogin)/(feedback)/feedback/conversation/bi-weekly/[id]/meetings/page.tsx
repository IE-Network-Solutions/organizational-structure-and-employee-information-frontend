'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react'
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import CreateMeeting from '../_components/meeting/createMeeting';
import MettingDataTable from '../_components/meeting/mettingTable';

function page() {
  const {open,setOpen}=ConversationStore()
        
    const modalHeader = (
      <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
        Add New Bi-Weekly Meeting
      </div>
    );
    return (
      <>
        <TabLandingLayout
          buttonTitle='New Meeting'
          id='conversationLayoutId'
          onClickHandler={()=>setOpen(true)}
          title='Bi-Weekly'
          subtitle='Conversations / bi-weekly '
         >
           <MettingDataTable />
        </TabLandingLayout>
        <CustomDrawerLayout
          open={open}
          onClose={()=>setOpen(false)}
          modalHeader={modalHeader}
          width="40%"
        >
           <CreateMeeting/>
        </CustomDrawerLayout>
        </>
      );
}

export default page