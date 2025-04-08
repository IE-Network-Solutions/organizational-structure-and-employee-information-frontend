'use client';
import React from 'react';
import { Button, Card, Collapse, Dropdown, Menu, Space } from 'antd';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';

function WorkScheduleTab() {
  const handleMenuClick = () => {};
  const { data: workScheudleData } = useFetchSchedule();
  const { Panel } = Collapse;

  const {
    setDetail,
    setScheduleName,
    setId,
    setStandardHours,
    openDrawer,
    setEditMode,
    setDeleteMode,
  } = useScheduleStore();

  const handleEditSchedule = (data: any) => {
    setScheduleName(data.name);
    setId(data.id);
    let updatedDetails = {};
    data.detail.forEach((dayData: any) => {
      updatedDetails = {
        id: dayData.id,
        dayOfWeek: dayData.day,
        hours: dayData.duration,
        startTime: dayData.startTime,
        endTime: dayData.endTime,
        status: dayData.workDay,
      };
      setDetail(dayData.day, updatedDetails);
      setStandardHours(
        useScheduleStore.getState().standardHours + Number(dayData.duration),
      );
    });
    openDrawer();
    setEditMode(true);
  };

  const handleDeleteSchedule = (data: any) => {
    setId(data.id);
    setDeleteMode(true);
  };

  const renderMenu = (scheduleItem: any) => (
    <Menu onClick={handleMenuClick}>
      <AccessGuard permissions={[Permissions.CreateWorkingSchedule]}>
        <Menu.Item
          key="edit"
          onClick={() => handleEditSchedule(scheduleItem)}
          icon={<FaEdit />}
        >
          Edit
        </Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.CreateWorkingSchedule]}>
        <Menu.Item
          key="delete"
          icon={<FaTrashAlt />}
          onClick={() => handleDeleteSchedule(scheduleItem)}
        >
          Delete
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Work Schedule</h2>
          <AccessGuard permissions={[Permissions.CreateWorkingSchedule]}>
            <Space>
              <Button
                type="primary"
                className="h-12"
                icon={<FaPlus />}
                onClick={openDrawer}
              >
                <span className="hidden lg:inline">
                  Create work Schedule
                </span>
              </Button>
            </Space>
          </AccessGuard>
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
                  <p className="text-xl font-semibold">
                    Full-time Schedule
                  </p>{' '}
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
                            {dayDetail?.day ?? '-'}
                          </div>
                          <div className="text-center">
                            {dayDetail.workDay ? dayDetail.startTime : ''} -{' '}
                            {dayDetail.workDay ? dayDetail.endTime : ''}
                          </div>
                          <div className="font-semibold text-right">
                            {dayDetail.workDay
                              ? Number(dayDetail.duration).toFixed(1)
                              : '-'}
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
      <CustomWorkingScheduleDrawer />
      <CustomDeleteWorkingSchduel />
    </>
  );
}

export default WorkScheduleTab;
