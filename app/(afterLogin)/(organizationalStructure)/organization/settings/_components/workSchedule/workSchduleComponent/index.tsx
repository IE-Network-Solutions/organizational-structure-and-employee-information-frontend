import { Button, Card, Collapse, Dropdown, Menu, Select, Space } from 'antd';
import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';

function WorkScheduleTab() {
  const handleMenuClick = () => {};

  const { data: workScheudleData } = useFetchSchedule();

  const { Option } = Select;
  const { Panel } = Collapse;

  const { openDrawer } = useWorkScheduleDrawerStore();

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit" icon={<FaEdit />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<FaTrashAlt />}>
        Delete
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Work Schedule</h2>
        <Space>
          <Select defaultValue="All" className="w-32">
            <Option value="all">All</Option>
            <Option value="work-hours">Work hours</Option>
            <Option value="break-hours">Break hours</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
            New Schedule
          </Button>
        </Space>
      </div>

      <Collapse accordion defaultActiveKey={['1']}>
        <Panel
          header={
            <div className="flex justify-between items-center ">
              <span className="flex justify-start items-center gap-4 ">
                {' '}
                <p className="text-xl font-semibold">Full-time Schedule</p>{' '}
                <span className="px-2 py-1 bg-blue text-white rounded-lg text-sm font-semibold">
                  Working-Hour
                </span>
              </span>
              <Dropdown overlay={menu} trigger={['click']}>
                <MoreOutlined className="text-lg cursor-pointer" />
              </Dropdown>
            </div>
          }
          key="1"
          extra={
            <span className="text-blue-500 bg-blue-100 py-1 px-2 rounded text-xs font-medium">
              Working-hours
            </span>
          }
        >
          {workScheudleData?.items?.map((item, rootIndex) => (
            <Card key={rootIndex} title={item.scheduleName} bordered={false}>
              <div className="mt-1">
                <p>
                  Total working hours/week:{' '}
                  <span className="font-semibold">40h 00m</span>
                </p>
                <p className="mt-2 grid grid-col gap-4 items-center  w-full">
                  <p className="col-span-1">Daily working hours:</p>
                  <ul className=" col-span-8">
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                    ].map((day, index) => (
                      <div key={index}>
                        <>{item.scheduleName}</>
                        {item?.detail?.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{day}</span>
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                            <span className="font-semibold">8h 00m</span>
                          </li>
                        ))}
                      </div>
                    ))}
                  </ul>
                </p>
              </div>
            </Card>
          ))}
        </Panel>

        {/* Break-hours Section */}
        <Panel
          header={
            <div className="flex justify-between items-center">
              <span className="flex justify-start items-center gap-4">
                {' '}
                <p className="text-xl font-semibold">Break-hours</p>{' '}
                <span className="px-2 py-1 bg-blue text-white rounded-lg text-sm font-semibold">
                  Break-Hour
                </span>
              </span>
              <Dropdown overlay={menu} trigger={['click']}>
                <MoreOutlined className="text-lg cursor-pointer" />
              </Dropdown>
            </div>
          }
          key="2"
          extra={
            <span className="text-purple-500 bg-purple-100 py-1 px-2 rounded text-xs font-medium">
              Break-hours
            </span>
          }
        >
          <Card bordered={false}>
            {/* Break-hours schedule content can go here */}
            <p>No break hours scheduled.</p>
          </Card>
        </Panel>
      </Collapse>
    </div>
  );
}

export default WorkScheduleTab;
