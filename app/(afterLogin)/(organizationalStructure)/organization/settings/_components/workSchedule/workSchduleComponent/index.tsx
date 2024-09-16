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
  const { openDrawer, setEditMode, setDeleteMode, setSelectedSchedule } =
    useWorkScheduleDrawerStore();

  const handleEditSchedule = (data: any) => {
    openDrawer();
    setEditMode(true);
    setSelectedSchedule(data);
  };

  const handleDeleteSchedule = (data: any) => {
    setSelectedSchedule(data);
    setDeleteMode(true);
  };

  const renderMenu = (scheduleItem: any) => (
    <Menu onClick={handleMenuClick}>
      <Menu.Item
        key="edit"
        onClick={() => handleEditSchedule(scheduleItem)}
        icon={<FaEdit />}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<FaTrashAlt />}
        onClick={() => handleDeleteSchedule(scheduleItem)}
      >
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

      <Collapse
        accordion
        defaultActiveKey={['1']}
        className="bg-white shadow-sm rounded-lg"
      >
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
            </div>
          }
          key="1"
          extra={
            <span className="text-blue-500 bg-blue-100 py-1 px-2 rounded text-xs font-medium">
              Working-hours
            </span>
          }
          className="mb-4"
        >
          {workScheudleData?.items?.map((scheduleItem, rootIndex) => (
            <Card
              key={rootIndex}
              title={scheduleItem.name}
              bordered={false}
              className="shadow-sm rounded-lg"
              extra={
                <Dropdown
                  overlay={renderMenu(scheduleItem)}
                  trigger={['click']}
                >
                  <MoreOutlined className="text-lg cursor-pointer" />
                </Dropdown>
              }
            >
              setName
              <div className="mt-1">
                <p className="text-sm">
                  Standard working hours/day:{' '}
                  <span className="font-semibold">8h 00m</span>
                </p>
                <p className="text-sm">
                  Total working hours/week:{' '}
                  <span className="font-semibold">40h 00m</span>
                </p>
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">
                    Daily working hours:
                  </p>
                  {scheduleItem?.detail?.map((dayDetail, detailIndex) => (
                    <ul key={detailIndex} className="text-sm">
                      <li className="flex justify-between items-center mb-2">
                        <span>{dayDetail?.dayOfWeek}</span>
                        <span>
                          {dayDetail.startTime} - {dayDetail.endTime}
                        </span>
                        <span className="font-semibold">8h 00m</span>
                      </li>
                    </ul>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Panel>

        {/* Break-hours Section 
        <Panel
          header={
            <div className="flex justify-between items-center">
              <span className="flex justify-start items-center space-x-4">
                <p className="text-lg font-semibold">Break-hours</p>
                <span className="px-2 bg-blue text-white rounded-lg text-sm font-semibold">
                  Break-Hour
                </span>
              </span>
            </div>
          }
          key="break-hours"
          extra={
            <span className="text-purple-500 bg-purple-100 py-1 px-2 rounded text-xs font-medium">
              Break-hours
            </span>
          }
          className="shadow-sm rounded-lg"
        >
          <Card bordered={false} className="shadow-sm rounded-lg">
            <p className="text-sm">No break hours scheduled.</p>
          </Card>
        </Panel> */}
      </Collapse>
    </div>
  );
}

export default WorkScheduleTab;
