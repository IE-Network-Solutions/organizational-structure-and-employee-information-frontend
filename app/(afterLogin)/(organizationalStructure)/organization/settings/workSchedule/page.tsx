'use client';
import React from 'react';
import { Button, Col, Collapse, Dropdown, Row, Space } from 'antd';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';
import { InfoLine } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/common/infoLine';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEffect } from 'react';

interface ScheduleDetail {
  id: string;
  day: string;
  dayOfWeek?: string;
  startTime?: string | null;
  endTime?: string | null;
  duration?: string;
  hours?: string;
  workDay: boolean;
}

interface WorkingHours {
  day: string;
  hours: number;
  endTime: string;
  startTime: string;
}

interface ScheduleItem {
  id?: string;
  name: string;
  standardHours: number;
  detail: ScheduleDetail[];
}

interface UpdatedDetails {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: boolean;
}

function WorkScheduleTab() {
  const {
    setDetail,
    setScheduleName,
    setId,
    setStandardHours,
    openDrawer,
    setEditMode,
    setDeleteMode,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useScheduleStore();
  const { isMobile, isTablet } = useIsMobile();

  const { data: workScheudleData, refetch: refetchSchedules } =
    useFetchSchedule(currentPage, pageSize);
  const { Panel } = Collapse;

  // Refetch data when drawer closes to ensure we have the latest data
  const { isOpen } = useScheduleStore();
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure any mutations have completed
      setTimeout(() => {
        refetchSchedules();
      }, 200);
    }
  }, [isOpen, refetchSchedules]);

  const handleEditSchedule = (data: ScheduleItem) => {
    setScheduleName(data.name);
    if (data.id) {
      setId(data.id);
    }

    // Reset standard hours before calculating
    setStandardHours(0);

    let updatedDetails: UpdatedDetails;
    data.detail.forEach((dayData: ScheduleDetail) => {
      const hours = dayData.duration ? parseFloat(dayData.duration) : 0;
      updatedDetails = {
        id: dayData.id,
        dayOfWeek: dayData.day,
        hours: hours,
        startTime: dayData.startTime || '',
        endTime: dayData.endTime || '',
        status: dayData.workDay,
      };
      setDetail(dayData.day, updatedDetails);

      // Add hours only for working days
      if (dayData.workDay && hours > 0) {
        setStandardHours(useScheduleStore.getState().standardHours + hours);
      }
    });
    openDrawer();
    setEditMode(true);
  };

  const handleDeleteSchedule = (data: ScheduleItem) => {
    if (data.id) {
      setId(data.id);
    }
    setDeleteMode(true);
  };

  const renderMenu = (scheduleItem: ScheduleItem) => {
    const items = [];

    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.CreateWorkingSchedule],
      })
    ) {
      items.push({
        key: 'edit',
        label: 'Edit',
        icon: <FaEdit />,
        onClick: () => handleEditSchedule(scheduleItem),
      });
      items.push({
        key: 'delete',
        label: 'Delete',
        icon: <FaTrashAlt />,
        onClick: () => handleDeleteSchedule(scheduleItem),
      });
    }

    return { items };
  };

  const getWorkingHoursForSchedule = (
    details: ScheduleDetail[],
  ): WorkingHours[] => {
    const result =
      details?.map((day: ScheduleDetail) => {
        return {
          day: day.day || '',
          hours: day.workDay
            ? day.hours
              ? parseFloat(day.hours)
              : day.duration
                ? parseFloat(day.duration)
                : 0
            : 0,
          startTime: day.workDay ? day.startTime || '' : '',
          endTime: day.workDay ? day.endTime || '' : '',
          workDay: day.workDay,
        };
      }) || [];
    return result;
  };

  const getTotalWorkingHours = (details: ScheduleDetail[]): number => {
    return details.reduce((total: number, day: ScheduleDetail) => {
      // Only count hours for working days
      if (!day.workDay) return total;

      const hours = day?.hours ? parseFloat(day.hours) : 0;
      const duration = day?.duration ? parseFloat(day.duration) : 0;
      return total + (hours || duration || 0);
    }, 0);
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  return (
    <>
      <div className="p-5 bg-white rounded-2xl h-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-base text-bold">Work Schedule</h1>
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
                  <Dropdown menu={renderMenu(scheduleItem)} trigger={['click']}>
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
              <Row gutter={[16, 24]}>
                <Col lg={16}>
                  <InfoLine
                    title="Standard working hours/day"
                    value={
                      <div className="text-xs">
                        {(() => {
                          const workingDays =
                            scheduleItem.detail?.filter(
                              (i) =>
                                Number(i.hours ?? i.duration) !== 0 &&
                                i.workDay,
                            ) || [];
                          const totalHours = workingDays.reduce(
                            (total, i) =>
                              total + Number((i.hours ?? i.duration) || 0),
                            0,
                          );
                          const avgHours =
                            workingDays.length > 0
                              ? totalHours / workingDays.length
                              : 0;
                          const hours = Math.floor(avgHours);
                          const minutes = Math.round((avgHours - hours) * 60);
                          return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
                        })()}
                      </div>
                    }
                  />
                  <InfoLine
                    title="Total working hours/week"
                    value={
                      <div className="text-xs">
                        {(() => {
                          const totalHours = getTotalWorkingHours(
                            scheduleItem?.detail || [],
                          );
                          const hours = Math.floor(totalHours);
                          const minutes = Math.round((totalHours - hours) * 60);
                          return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
                        })()}
                      </div>
                    }
                  />
                  <InfoLine
                    title="Daily working hours"
                    value={
                      <div className="flex gap-6 text-xs">
                        {/* Day Names */}
                        <div className="flex flex-col space-y-4 text-xs font-bold text-gray-700">
                          {getWorkingHoursForSchedule(
                            scheduleItem?.detail || [],
                          )?.map((item: WorkingHours) => (
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
                          {getWorkingHoursForSchedule(
                            scheduleItem?.detail || [],
                          )?.map((item: WorkingHours) => (
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
                          {getWorkingHoursForSchedule(
                            scheduleItem?.detail || [],
                          )?.map((item: WorkingHours) => (
                            <div
                              key={`${item?.day}-hours`}
                              className="whitespace-nowrap"
                            >
                              {(() => {
                                const hours = Math.floor(item.hours || 0);
                                const minutes = Math.round(
                                  ((item.hours || 0) - hours) * 60,
                                );
                                return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </Col>
              </Row>
            </Panel>
          </Collapse>
        ))}

        {/* Pagination */}
        {workScheudleData?.meta && (
          <>
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={workScheudleData.meta.totalItems || 0}
                pageSize={pageSize}
                currentPage={currentPage}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
              />
            ) : (
              <CustomPagination
                current={currentPage}
                total={workScheudleData.meta.totalItems || 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={(pageSize) => {
                  setPageSize(pageSize);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}
      </div>
      <CustomWorkingScheduleDrawer />
      <CustomDeleteWorkingSchduel />
    </>
  );
}

export default WorkScheduleTab;
