'use client';
import TabLandingLayout from "@/components/tabLanding";
import React from 'react';
import { Card, Col, Empty, Row } from 'antd';
import MeetingList from "./_component/meetingList";
import AddNewMeetingForm from "./_component/addMeetingForm";
import { FaPlus } from "react-icons/fa";
import { useMeetingStore } from "@/store/uistate/features/conversation/meeting";

export default function Index() {
       const { 
      setOpenAddMeeting } = useMeetingStore();
      function HandleOpen(){
            setOpenAddMeeting(true)
      }
      return (

<TabLandingLayout
      buttonDisabled={false}
      id="meetingLayoutId"
      title="Meeting types"
      subtitle="manage your Meetings"
      buttonTitle={'Add New'}
      buttonIcon={<FaPlus/>}
      onClickHandler={()=>HandleOpen()}
    >
<MeetingList /> 
<AddNewMeetingForm /> 
</TabLandingLayout>
      )
}
