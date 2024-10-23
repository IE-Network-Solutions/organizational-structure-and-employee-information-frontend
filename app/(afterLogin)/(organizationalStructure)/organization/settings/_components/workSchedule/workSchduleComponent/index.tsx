import { Button, Card, Collapse, Dropdown, Menu, Select, Space } from 'antd';
import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';

function WorkScheduleTab() {
  const handleMenuClick = () => {};
  const { data: workScheudleData } = useFetchSchedule();
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
          <Button
            type="primary"
            className="h-12"
            icon={<PlusOutlined />}
            onClick={openDrawer}
          >
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
              title={
                <div className="font-bold text-xl">{scheduleItem.name}</div>
              }
              bordered={false}
              className="shadow-sm rounded-lg border-b-2"
              extra={
                <Dropdown
                  overlay={renderMenu(scheduleItem)}
                  trigger={['click']}
                >
                  <MoreOutlined className="text-lg cursor-pointer" />
                </Dropdown>
              }
            >
              <div className="mt-1 ">
                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-4 mb-2 font-bold text-md border-b pb-2">
                    <div className="text-black">Day</div>
                    <div className="text-center">Time</div>
                    <div className="text-right">Hours</div>
                  </div>

                  {scheduleItem?.detail?.map((dayDetail, detailIndex) => (
                    <div key={detailIndex} className="text-sm mb-2">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-black">
                          {dayDetail?.dayOfWeek ?? '-'}
                        </div>
                        <div className="text-center">
                          {dayDetail.startTime} - {dayDetail.endTime}
                        </div>
                        <div className="font-semibold text-right">
                          {dayDetail.hours ?? '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </Panel>
      </Collapse>
    </div>
  );
}

export default WorkScheduleTab;
