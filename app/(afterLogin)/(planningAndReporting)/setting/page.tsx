'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { Card, Tabs } from 'antd';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';

const Settings = () => {
  return (
    <div className="flex gap-2">
      <Card className="hidden md:block md:w-1/5 lg:w-1/5 bg-white">
        <div className="flex space-x-2 font-semibold px-2 py-2 bg-gray-100 overflow-scroll rounded">
          <AiOutlineUnorderedList className="text-xs md:text-sm lg:text-sm text-sky-600 pt-1" />
          <p className="text-[1px] md:text-sm lg:text-sm"></p>
        </div>
      </Card>
      <Card className="w-full md:w-4/5 bg-white top-0">
        <div className="flex flex-col md:flex-row justify-between">
          <CustomBreadcrumb
            title={'tabButton'}
            subtitle="Admin can see all fields, and do everything the system offers"
            items={[
              { title: 'Home', href: '/' },
              { title: 'Tenants', href: '/tenant-management/tenants' },
            ]}
          />
          <CustomButton
            // onClick={}
            title={`New`}
            icon={<FaPlus />}
            className="mt-4 md:mt-0"
          />
        </div>
        <footer>
          <Tabs
            defaultActiveKey="1"
            items={[]}
            onChange={() => {}}
            className="font-semibold"
          />
        </footer>
      </Card>
    </div>
  );
};

export default Settings;
