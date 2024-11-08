'use client'
import TabLandingLayout from '@/components/tabLanding'
import React from 'react'
import OneToOne from './_components/one-on-one';

function index() {
    const cardsData = [
        { title: 'Card 1', queriesCount: 150, totalAttendees: 1200, meetingsConducted: 45 },
        { title: 'Card 2', queriesCount: 200, totalAttendees: 1500, meetingsConducted: 50 },
        { title: 'Card 3', queriesCount: 180, totalAttendees: 1100, meetingsConducted: 30 },
        { title: 'Card 4', queriesCount: 250, totalAttendees: 1600, meetingsConducted: 55 },
        { title: 'Card 5', queriesCount: 100, totalAttendees: 900, meetingsConducted: 25 },
      ];
    
const generateReportHandler=()=>{
    console.log("");
}
  return (
    <TabLandingLayout
      buttonTitle='Generate report'
      id='conversationLayoutId'
      onClickHandler={()=>generateReportHandler}
      title='One to One'
      subtitle='Conversations / one to one'
     >
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cardsData?.map(item=>(
          <OneToOne data={item}/>
        ))}
    </div>
    </TabLandingLayout>
  )
}

export default index