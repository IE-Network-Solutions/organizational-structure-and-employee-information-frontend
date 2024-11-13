'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import BiWeekly from './_components/bi-weekly';
import { useGetAllQuestionSet } from '@/store/server/features/conversation/bi-weekly/queries';

function index() {

  const {data:questionSet}=useGetAllQuestionSet();
  const cardsData = questionSet?.items?.map((item: any) => ({
    id:item?.id,
    title: item?.name,
    queriesCount: item?.totalAttendees,
    totalAttendees: item?.totalAttendees,
    meetingsConducted: item?.totalAttendees,
  }))
  const generateReportHandler = () => {};
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => generateReportHandler}
      title="Bi Weekly"
      subtitle="Conversations / bi-weekly"
    >
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cardsData?.map((item:any, index:any) => <BiWeekly key={index} data={item} />)}
      </div>
    </TabLandingLayout>
  );
}

export default index;
