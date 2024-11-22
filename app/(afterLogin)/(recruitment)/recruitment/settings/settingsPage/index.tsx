'use client';
import { Card, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import { TbNotes } from 'react-icons/tb';
import TalentPoolCategoryTab from '../_components/talentPoolCategory/talentPoolCategoryTab';
import TalentPoolDrawer from '../_components/talentPoolCategory/customDrawer';
import CustomAddJobFields from '../_components/customFields';
import Status from '../_components/status';

function SettingsPage() {
  const [tabPosition, setTabPosition] = useState<'left' | 'top'>('left');

  useEffect(() => {
    const updateTabPosition = () => {
      if (window.innerWidth < 768) {
        setTabPosition('top');
      } else {
        setTabPosition('left');
      }
    };

    updateTabPosition();

    window.addEventListener('resize', updateTabPosition);

    return () => {
      window.removeEventListener('resize', updateTabPosition);
    };
  }, []);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />
          <p className="font-semibold">Define Status </p>
        </span>
      ),
      children: (
        <div className="">
          <Status />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Talent Pool Category </p>{' '}
        </span>
      ),
      children: <TalentPoolCategoryTab />,
    },

    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Template Question</p>{' '}
        </span>
      ),
      children: <CustomAddJobFields />,
    },
  ];
  return (
    <>
      <div className="flex justify-start bg-[#F5F5F5] -mt-2 -ml-2">
        <Card className="shadow-none bg-[#F5F5F5]" bordered={false}>
          <p className="font-bold text-xl">Recruitment</p>
          <p className="text-gray-400">Settings</p>
        </Card>
      </div>
      <Tabs
        defaultActiveKey="1"
        moreIcon={false}
        className="bg-white min-w-full"
        items={items}
        tabPosition={tabPosition}
      />
      <TalentPoolDrawer />
    </>
  );
}

export default SettingsPage;
