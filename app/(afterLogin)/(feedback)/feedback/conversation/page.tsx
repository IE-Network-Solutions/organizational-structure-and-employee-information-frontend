'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useConversationTypes } from '@/store/server/features/conversation/queries';
import ConversationTypeList from './_component/conversation';

function Index() {

  const {data:conversationData}=useConversationTypes();
  const cardsData = conversationData?.items?.map((item: any) => ({
    name: item.name,
    description: item.description,

  }))

  console.log(conversationData,"conversationData");

  const generateReportHandler = () => {};
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => generateReportHandler}
      title="Conversation types"
      subtitle="Conversations / bi-weekly"
      allowSearch={false}
    >
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cardsData?.map((item:any, index:number) => <ConversationTypeList key={index} data={item} />)}
      </div>
    </TabLandingLayout>
  );
}

export default Index;
