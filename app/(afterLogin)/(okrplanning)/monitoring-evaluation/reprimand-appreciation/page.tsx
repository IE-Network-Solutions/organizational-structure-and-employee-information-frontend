'use client';
import { Tabs } from 'antd';
import All from './_components/All';
import Appreciation from './_components/appreciation';
import Reprimand from './_components/reprimand';
export default function ReprimandAppreciation() {
  const { TabPane } = Tabs;

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Reprimand & Appreciation</h1>
        <p className="text-gray-500">Reprimand & Appreciation</p>
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
