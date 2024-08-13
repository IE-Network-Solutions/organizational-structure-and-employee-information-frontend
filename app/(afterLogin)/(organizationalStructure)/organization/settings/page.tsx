import { Card, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React from 'react';

function Settings() {
  const items: TabsProps['items'] = [];
  return (
    <>
      <div className="flex justify-start bg-[#F5F5F5] -mt-2 -ml-2">
        <Card className="shadow-none bg-[#F5F5F5]" bordered={false}>
          <p className="font-bold text-xl">Setting</p>
          <p className="text-gray-400">Setting Your Attendance</p>
        </Card>
      </div>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition="left"
      />
    </>
  );
}

export default Settings;
