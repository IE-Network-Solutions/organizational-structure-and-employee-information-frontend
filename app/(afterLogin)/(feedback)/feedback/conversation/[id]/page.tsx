'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useGetAllQuestionSet } from '@/store/server/features/conversation/bi-weekly/queries';
import { useGetConversationById } from '@/store/server/features/conversation/queries';
import QuestionSet from './_components/question-set';
interface Params {
  id: string;
}

function index({ params}: { params: Params }) {
  const { id } = params;

  const {data:conversationType}=useGetConversationById(id);
  // const {data:questionSet}=useGetAllQuestionSet();
  const questionSetListData = conversationType?.questionSets?.map((item: any) => ({
    id:item?.id,
    title: item?.name,
    queriesCount: item?.conversationsQuestions?.length ?? 0,
    totalAttendees: item?.totalAttendees,
    meetingsConducted: item?.conversationInstances?.length ?? 0,
  }))

  const generateReportHandler = () => {};
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => generateReportHandler}
      title={conversationType?.name}
      subtitle={`Conversations / ${conversationType?.name}`}
    >
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {questionSetListData?.map((item:any, index:any) => <QuestionSet key={index} data={item} />)}
      </div>
    </TabLandingLayout>
  );
}

export default index;
