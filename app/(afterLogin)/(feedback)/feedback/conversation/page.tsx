'use client';
import React from 'react';
import DashboardComponent from './_component/conversation/conversationDashboard';

function Index() {
  return (
    <div
      className="py-4"
      data-cy="feedback-conversation-page-div"
      id="feedback-conversation-page-div"
    >
      <DashboardComponent data-cy="feedback-conversation-page-component" />
    </div>
  );
}

export default Index;
