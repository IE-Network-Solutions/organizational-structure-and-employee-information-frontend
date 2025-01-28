'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useConversationTypes } from '@/store/server/features/CFR/conversation/queries';
import ConversationTypeList from './_component/conversation';
import { Card, Col, Empty, Row } from 'antd';

function Index() {
  const { data: conversationData, isLoading } = useConversationTypes();
  const cardsData = conversationData?.items?.map((item: any) => ({
    id: item?.id,
    name: item.name,
    description: item.description,
  }));

  return (
    <TabLandingLayout
      buttonDisabled={true}
      id="conversationLayoutId"
      title="Conversation types"
      subtitle="Conversations"
    >
      <div className="p-4">
        <Row gutter={[16, 16]}>
          {isLoading ? (
        Array.from({ length: 6 }).map((notused, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card loading={true}  />
          </Col>
        ))
          ) : cardsData?.length > 0 ? (
        cardsData.map((item: any, index: number) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <ConversationTypeList data={item} />
          </Col>
        ))
          ) : (
        <Col span={24}>
          <Empty description="No conversations found" />
        </Col>
          )}
        </Row>
      </div>
    </TabLandingLayout>
  );
}

export default Index;
