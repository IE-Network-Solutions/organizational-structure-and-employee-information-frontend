'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react'
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import { Card, Col, Row, Tabs } from 'antd';
import BiWeeklyDetail from './_components/biWeeklyDetail';
import CollapsibleCardList from './_components/collapsableCard';
import ActionPlans from './_components/actionPlans';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import CreateActionPlan from '../../categories/[id]/survey/[slug]/_components/createActionPlan';
interface Params {
  id: string;
}
interface BiWeeklyDetailsProps {
  params: Params;
}

function page({ params: { id } }: BiWeeklyDetailsProps) {
  const {
    open,
    setOpen,
  } = useOrganizationalDevelopment();
 const items = [
    {
      key: '1',
      label: 'All',
      children: <CollapsibleCardList/>,
    },
    {
      key: '2',
      label: 'Individual',
      children: <CollapsibleCardList/>,
    },
    {
      key: '3',
      label: 'Action Plans',
      children: <ActionPlans/>,
    },
  ];
    return (
        <TabLandingLayout
            buttonTitle='Add Action Plan'
            id='conversationLayoutId'
            onClickHandler={()=>setOpen(true)}
            title="←   Details"
            allowSearch={false}
            subtitle=''
        >
        <Row gutter={[16, 24]}>
            <Col lg={8} md={10} xs={24}>
            <BiWeeklyDetail id={id} />
            </Col>
            <Col lg={16} md={14} xs={24}>
            <Card>
                <Tabs
                items={items}
                tabBarGutter={16}
                size="small"
                tabBarStyle={{ textAlign: 'center' }}
                />
            </Card>
            </Col>
        </Row>
        <CreateActionPlan 
           onClose={()=>setOpen(false)}
           />
        </TabLandingLayout>
      );
}

export default page
