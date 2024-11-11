'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { Card, Col, Row, Tabs } from 'antd';
import CreateActionPlan from '../../../categories/[id]/survey/[slug]/_components/createActionPlan';
import { OrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import CollapsibleCardList from '../../bi-weekly/[id]/_components/collapsableCard';
import OneOnOneDetail from './_components/biWeeklyDetail';
import ActionPlans from './_components/actionPlans';
function page() {
  const { setOpen } = OrganizationalDevelopment();
  const items = [
    {
      key: '1',
      label: 'Individual',
      children: <CollapsibleCardList />,
    },
    {
      key: '2',
      label: 'Action Plans',
      children: <ActionPlans />,
    },
  ];
  return (
    <TabLandingLayout
      buttonTitle="Add Action Plan"
      id="conversationLayoutId"
      onClickHandler={() => setOpen(true)}
      title="←   Details"
      allowSearch={false}
      subtitle=""
    >
      <Row gutter={[16, 24]}>
        <Col lg={8} md={10} xs={24}>
          <OneOnOneDetail />
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
      <CreateActionPlan onClose={() => setOpen(false)} />
    </TabLandingLayout>
  );
}

export default page;
