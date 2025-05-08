'use client';
import React from 'react';
import { Button, Card, Col, Collapse, Dropdown, Menu, Row, Space } from 'antd';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';
import { InfoLine } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/common/infoLine';

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

  const workingHours: {
    day: string;
    hours: number;
    endTime: number;
    startTime: number;
  }[] =
    workScheudleData?.items?.[1]?.detail?.map((day: any) => ({
      day: day.dayOfWeek || '',
      hours: day.hours || day.duration || 0,
      startTime: day.startTime || 0,
      endTime: day.endTime || 0,
    })) || [];

  const getTotslWorkingHours = (details: any) => {
    return details.reduce((total: number, day: any) => {
      return total + (day?.hours || day?.duration || 0);
    }, 0);
  };
  return (
    <>
      <div className="p-5 bg-white rounded-2xl h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg text-bold">Work Schedule</h1>
          <AccessGuard permissions={[Permissions.CreateWorkingSchedule]}>
            <Space>
              <Button
                type="primary"
                className="h-10 w-10 sm:w-auto"
                icon={<FaPlus />}
                onClick={openDrawer}
              >
                <span className="hidden lg:inline">Create work Schedule</span>
              </Button>
            </Space>
          </AccessGuard>
        </div>

        {workScheudleData?.items?.map((scheduleItem, index) => (
          <Collapse
            key={index}
            accordion
            defaultActiveKey={['1']}
            className="bg-white rounded-lg mb-4 w-full"
            expandIconPosition="end"
          >
            <Panel
              key="1"
              className="mb-0"
              header={
                <div className="flex justify-between items-center">
                  <span className="flex justify-start items-center gap-2 sm:gap-4">
                    <p className="text-xs sm:text-base font-semibold">
                      {scheduleItem.name}
                    </p>
                    <span className="px-2 py-1 bg-[#3636f0] text-white rounded-lg font-bold text-[8px] sm:text-xs">
                      Working-Hour
                    </span>
                  </span>
                  <Dropdown
                    overlay={renderMenu(scheduleItem)}
                    trigger={['click']}
                  >
                    <MoreOutlined className="text-lg cursor-pointer" />
                  </Dropdown>
                </div>
              }
              extra={
                <span className="hidden sm:inline text-blue-500 bg-blue-100 py-1 px-2 rounded text-xs font-medium">
                  Working-hours
                </span>
              }
            >
              <Card
                bordered={false}
                className=""
                bodyStyle={{ padding: 0, margin: 0, borderBottom: 'none' }}
              >
                <Row gutter={[16, 24]}>
                  <Col lg={16}>
                    <InfoLine
                      title="Standard working hours/day"
                      value={
                        <div>
                          {scheduleItem.detail
                            ?.filter((i) => Number(i.hours ?? i.duration) !== 0)
                            .reduce(
                              (total, i) =>
                                total + Number((i.hours ?? i.duration) || 0),
                              0,
                            ) /
                            scheduleItem.detail.filter(
                              (i) => Number(i.hours ?? i.duration) !== 0,
                            ).length || 0}
                          h 00m
                        </div>
                      }
                    />
                    <InfoLine
                      title="Total working hours/week"
                      value={getTotslWorkingHours(scheduleItem?.detail || [])}
                    />
                    <InfoLine
                      title="Daily working hours"
                      value={
                        <div className="flex gap-6">
                          {/* Day Names */}
                          <div className="flex flex-col space-y-4 text-xs font-bold text-gray-700">
                            {workingHours?.map((item) => (
                              <div
                                key={`${item?.day}-label`}
                                className="whitespace-nowrap"
                              >
                                {item?.day}
                              </div>
                            ))}
                          </div>

                          {/* Start - End Time */}
                          <div className="flex flex-col space-y-4 text-xs font-light text-gray-800">
                            {workingHours?.map((item) => (
                              <div
                                key={`${item?.day}-time`}
                                className="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                {item?.startTime || '--'} -{' '}
                                {item?.endTime || '--'}
                              </div>
                            ))}
                          </div>

                          {/* Total Hours */}
                          <div className="flex flex-col space-y-4 text-xs font-light text-gray-800">
                            {workingHours?.map((item) => (
                              <div
                                key={`${item?.day}-hours`}
                                className="whitespace-nowrap"
                              >
                                {item?.hours || 0}h 00m
                              </div>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </Col>
                </Row>
              </Card>
            </Panel>
          </Collapse>
        ))}
      </div>
      <CustomWorkingScheduleDrawer />
      <CustomDeleteWorkingSchduel />
    </>
  );
}

export default WorkScheduleTab;
