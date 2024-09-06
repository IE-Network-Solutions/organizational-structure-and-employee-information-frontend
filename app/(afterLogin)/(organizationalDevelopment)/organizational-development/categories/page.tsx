'use client'
import UserSidebar from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/_components/userSidebar'
import CustomBreadcrumb from '@/components/common/breadCramp'
import CustomButton from '@/components/common/buttons/customButton'
import React from 'react'
import { PlusOutlined } from '@ant-design/icons';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Col, DatePicker, Flex, Row, Select, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { Input } from 'antd'
import Questions from './_components/questions'
import Individualresponses from './_components/individualResponses'
import SummaryResponses from './_components/summaryResponses'
import ActionPlans from './_components/actionPlans'
import CreateActionPlan from './_components/createActionPlan'
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment'

const {Option}=Select;

function page(){
    const {activeTab,setActiveTab,open,setOpen}=useOrganizationalDevelopment();
    // const { setOpen } = useEmployeeManagementStore();

  const items: TabsProps['items'] = [
  {
    key: '1',
    label: (<span className="mt-4">
              <p className="font-semibold">Questions</p>
            </span>),
    children: <Questions/>,
    className:"text-gray-950 font-semibold"
  },
  {
    key: '2',
    label: (<span className="mt-4">
      <p className="font-semibold">Individual Responses</p>
    </span>),
    children: <Individualresponses/>,
    className:"text-gray-950 font-semibold",
  },
  {
    key: '3',
    label: (<span className="mt-4">
      <p className="font-semibold">Summary Responses</p>
    </span>),
    children: <SummaryResponses/>,
    className:"text-gray-950 font-semibold"
  },
  {
      key: '4',
      label:(<span className="mt-4">
        <p className="font-semibold">Action Plans</p>
      </span>),
      children: <ActionPlans />,
      className:"text-gray-950 font-semibold"
    },
  ];
 const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onChange = (key: string) => {
    setActiveTab(key)
  };
  return (
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Employee Engagement Survey"
          subtitle="survey/engagement survey"
          items={[
            { title: 'Home', href: '/' },
            {
              title: 'Tenants',
              href: '/tenant-manuser_typem"098765445676"/tenants',
            },
          ]}
        />
        
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title="Create New Action Plan"
            id="createUserButton"
            icon={<PlusOutlined className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <CreateActionPlan onClose={onClose} />
        </div>
        <Row justify="center" style={{ width: '100%' }}>
        <Col span={activeTab==='2' ? 16:24}>
            <Input className='w-full h-[48px] my-4' placeholder='search questions'/>
          </Col>
          {activeTab==="2"&&<Col span={8}>
            <Select
                id={`selectStatusChartType`}
                placeholder="All Status"
                // onChange={handleStatusChange}
                allowClear
                className="w-full h-[48px] my-4"
              >
                <Option key="active" value={"pieChart"}>
                  Pie chart
                </Option>
                <Option key="inactive" value={"lineGraph"}>
                  Line Graph
                </Option>
            </Select>
          </Col>}
        </Row>
            <div className='flex justify-between'>
            <Tabs defaultActiveKey="1" className='w-[900px]' items={items} onChange={onChange} />
              {activeTab==="3"&&<div className='ml-10'><Select
                id={`selectStatusChartType`}
                placeholder="All Status"
                // onChange={handleStatusChange}
                allowClear
                className="w-full h-10"
              >
                <Option key="active" value={"pieChart"}>
                  Pie chart
                </Option>
                <Option key="inactive" value={"lineGraph"}>
                  Line Graph
                </Option>
              </Select>
              </div>}
            </div>
      </div>
  )
}

export default page

