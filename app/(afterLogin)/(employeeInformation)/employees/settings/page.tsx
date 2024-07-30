// 'use client';

import { Card, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import React from 'react';
import SettingsPage from './_components/rolePermission';
import { TbNotes } from 'react-icons/tb';
import { IoMdSettings } from 'react-icons/io';
import { FaLongArrowAltRight, FaUser } from 'react-icons/fa';
import Promotions from './_components/promotions';
import TransferTab from './_components/transfer';
import Resignation from './_components/resignation';
import EmploymentType from './_components/employementType';

function Settings() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Promotions</p>{' '}
        </span>
      ),
      children: <Promotions />,
    },
    {
      key: '2',
      label: (
        <span className="flex gap-2 mt-4">
          <FaLongArrowAltRight className="mt-1" />{' '}
          <p className="font-semibold">Transfer</p>{' '}
        </span>
      ),
      children: <TransferTab />,
    },
    {
      key: '3',
      label: (
        <span className="flex gap-2 mt-4">
          <TbNotes className="mt-1" />{' '}
          <p className="font-semibold">Resignation</p>{' '}
        </span>
      ),
      children: <Resignation />,
    },
    {
      key: '4',
      label: (
        <span className="flex gap-2 mt-4">
          <FaUser className="mt-1" />{' '}
          <p className="font-semibold">Employment Type</p>{' '}
        </span>
      ),
      children: <EmploymentType />,
    },
    {
      key: '5',
      label: (
        <span className="flex gap-2 mt-4">
          <IoMdSettings className="mt-1" />{' '}
          <p className="font-semibold">Role Permission</p>{' '}
        </span>
      ),
      children: <SettingsPage />,
    },
  ];
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
