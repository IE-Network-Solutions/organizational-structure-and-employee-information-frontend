'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useConversationTypes } from '@/store/server/features/CFR/conversation/queries';
import ConversationTypeList from './_component/conversation';
import { Empty, Skeleton } from 'antd';

function Index() {
  const { data: conversationData,isLoading } = useConversationTypes();
  const cardsData = conversationData?.items?.map((item: any) => ({
    id: item?.id,
    name: item.name,
    description: item.description,
  }));

  const generateReportHandler = () => {};
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => generateReportHandler}
      title="Conversation types"
      subtitle="Conversations / bi-weekly"
    >
 <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((notused, index) => (
          <div key={index} className="p-4 border rounded shadow-sm">
            <Skeleton active />
          </div>
        ))
      ) : cardsData?.length > 0 ? (
        cardsData.map((item: any, index: number) => (
          <ConversationTypeList key={index} data={item} />
        ))
      ) : (
        <div className="col-span-full">
          <Empty description="No conversations found" />
        </div>
      )}
    </div>
    </TabLandingLayout>
  );
}

export default Index;
