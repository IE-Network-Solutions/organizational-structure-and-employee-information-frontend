'use client';
import { Tabs } from 'antd';
import All from './_components/All';
import Appreciation from './_components/appreciation';
import Reprimand from './_components/reprimand';
export default function ReprimandAppreciation() {
  const { TabPane } = Tabs;

  return (
    <div className="p-6 min-h-screen" data-cy="reprimand-appreciation-page">
      {/* Header */}
      <div className="mb-4" data-cy="reprimand-appreciation-header">
        <h1
          className="text-2xl font-bold"
          data-cy="reprimand-appreciation-title"
        >
          Reprimand & Appreciation
        </h1>
        <p className="text-gray-500" data-cy="reprimand-appreciation-subtitle">
          Reprimand & Appreciation
        </p>
      </div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="All" key="1">
          <All />
        </TabPane>
        <TabPane tab="Appreciation" key="2">
          <Appreciation />
        </TabPane>
        <TabPane tab="Reprimand" key="3">
          <Reprimand />
        </TabPane>
      </Tabs>
    </div>
  );
}
