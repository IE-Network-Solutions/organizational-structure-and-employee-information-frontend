'use client';
import CustomBreadcrumb from '@/components/common/breadCramp'
import React from 'react'
import { usePlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import CreatePlan from './_components/createPlan';
import { Radio, Tabs } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import Planning from './_components/planning';
import { useAllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';

function page() {
  const {setOpen,setActiveTab,activeTab,setActivePlanPeriod}=usePlanningAndReportingStore()
  const {data:planningPeriods}=useAllPlanningPeriods()

  const onChange = (e: RadioChangeEvent) => {
    setActiveTab(e.target.value);
  };
 
  const TabsContent = () =>
    planningPeriods?.items?.map((item, index) => ({
      label: <span className='font-semibold text-sm'>{item?.name}</span>,
      key: String(index),  
      children: <Planning />,
    }));
  return (
    <div>
    <div className="h-full w-auto p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb className='text-sm' title="Planning & Reporting" subtitle="OKR setting" />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CreatePlan/>
        </div>
      </div>
      <div className="w-full h-auto space-y-4">
      <Radio.Group className='flex justify-center  font-semibold' onChange={onChange} value={activeTab}>
          <Radio value={1}>Planning</Radio>
          <Radio value={2}>Reporting</Radio>
      </Radio.Group>
      <Tabs defaultActiveKey="1" onChange={(e:any)=>setActivePlanPeriod(e)} centered items={TabsContent()} />
      </div>
    </div>
    </div>
  )
}

export default page