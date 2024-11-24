'use client';
import TabLandingLayout from '@/components/tabLanding';
import React, { useEffect } from 'react';
import { Card, Col, Row, Skeleton, Tabs } from 'antd';
import CollapsibleCardList from './_components/collapsableCard';
import ActionPlans from './_components/actionPlans';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import CreateActionPlan from '../../../categories/[id]/survey/[slug]/_components/createActionPlan';
import { useGetAllConversationInstancesById } from '@/store/server/features/conversation/conversation-instance/queries';
import ConversationInstanceDetail from './_components/biWeeklyDetail';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useGetAllActionPlansByConversationInstanceId } from '@/store/server/features/conversation/action-plan/queries';
interface Params {
  slug: string;
}
interface ConversationInstanceDetailProps {
  params: Params;
}
const Index = ({ params: { slug } }: ConversationInstanceDetailProps) => {
  const { setOpen } = useOrganizationalDevelopment();
  const {selectedUserId,setActiveTab,activeTab}=ConversationStore();

  const {data:conversationInstance,isLoading}=useGetAllConversationInstancesById(slug);
  const { data: allUserData,isLoading:userDataLoading } =useGetAllUsers();
 
  //  console.log(conversationInstanceActionPlan,"conversationInstanceActionPlan")
 useEffect(() => {
  if (selectedUserId !== null && selectedUserId !== '') {
    setActiveTab('2');
  }
}, [selectedUserId]); // Dependency ensures this runs when selectedUserId changes
  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  
  const getQuestionResponse = (questionId: string) => {
    const questionResponse = conversationInstance?.conversationResponse?.find(
      (response: any) =>
        response?.questionId === questionId &&
        (selectedUserId ? response?.userId === selectedUserId : true) 
    );
    if (questionResponse) {
      const employeeData = getEmployeeData(questionResponse?.userId);
  
      return {
        ...questionResponse,
        employeeDetail: `${employeeData?.firstName || ''} ${employeeData?.lastName || ''}`.trim(), 
      };
    }
  
    return {}; // Return an empty object if no match is found
  };
  
const filteredData=conversationInstance?.questionSet?.conversationsQuestions?.map((conversationQuestion:any)=>
  ({
    id:conversationQuestion?.id,
    questionTitle:conversationQuestion,
    responseData:getQuestionResponse(conversationQuestion?.id)
  }))
const handleRedirectback=()=>{
  
}
  console.log(  selectedUserId !== null && selectedUserId !== '' && activeTab === '2',"filteredData")
  
  const items = [
    {
      key: '1',
      label: 'All',
      children: <CollapsibleCardList isLoading={isLoading} filteredData={filteredData} />,
    },
    {
      key: '2',
      label: 'Individual',
      children: <CollapsibleCardList isLoading={isLoading} filteredData={filteredData} />,
    },
    {
      key: '3',
      label: 'Action Plans',
      children: <ActionPlans slug={slug} />,
    },
  ];


  return (
    <TabLandingLayout
      buttonTitle="Add Action Plan"
      id="conversationLayoutId"
      onClickHandler={() => setOpen(true)}
      title={<span onClick={()=>handleRedirectback} className='cursor-pointer'>←   Details</span>}
      allowSearch={false}
      subtitle=""
    >
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 4 }} avatar />
          ))
          ) : (
            <ConversationInstanceDetail conversationInstance={conversationInstance} />
          )}
        </Col>
        <Col lg={16} md={14} xs={24}>
        <Card>
          <Tabs
            items={items}
            activeKey={activeTab}
            tabBarGutter={16}
            size="small"
            onChange={(active: string) => setActiveTab(active)}
            tabBarStyle={{ textAlign: 'center' }}
          />
        </Card>
        </Col>
      </Row>
      <CreateActionPlan onClose={() => setOpen(false)} />
    </TabLandingLayout>
  );
};

export default Index;
