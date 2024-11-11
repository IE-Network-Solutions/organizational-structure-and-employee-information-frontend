'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import BiWeekly from './_components/bi-weekly';

function index() {
  const cardsData = [
    {
      title: 'Card 1',
      queriesCount: 150,
      totalAttendees: 1200,
      meetingsConducted: 45,
    },
    {
      title: 'Card 2',
      queriesCount: 200,
      totalAttendees: 1500,
      meetingsConducted: 50,
    },
    {
      title: 'Card 3',
      queriesCount: 180,
      totalAttendees: 1100,
      meetingsConducted: 30,
    },
    {
      title: 'Card 4',
      queriesCount: 250,
      totalAttendees: 1600,
      meetingsConducted: 55,
    },
    {
      title: 'Card 5',
      queriesCount: 100,
      totalAttendees: 900,
      meetingsConducted: 25,
    },
  ];

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
        {cardsData?.map((item, index) => <BiWeekly key={index} data={item} />)}
      </div>
    </TabLandingLayout>
  );
}

export default index;
