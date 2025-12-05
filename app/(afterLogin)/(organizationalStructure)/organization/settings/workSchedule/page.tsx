'use client';
import React from 'react';
import { Button, Col, Collapse, Dropdown, Input, Row, Space } from 'antd';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { MoreOutlined } from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { ScheduleDetail as StoreScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomWorkingScheduleDrawer from '../_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from '../_components/workSchedule/deleteModal';
import { InfoLine } from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/common/infoLine';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEffect, useMemo } from 'react';

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
    searchQuery,
    setSearchQuery,
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

    data.detail.forEach((dayData: ScheduleDetail) => {
      const duration = dayData.duration ? parseFloat(dayData.duration) : 0;
      const updatedDetails: Partial<StoreScheduleDetail> = {
        id: dayData.id,
        day: dayData.day,
        duration: duration,
        startTime: dayData.startTime ?? undefined,
        endTime: dayData.endTime ?? undefined,
        workDay: dayData.workDay,
      };
      setDetail(dayData.day, updatedDetails);

      // Add duration only for working days
      if (dayData.workDay && duration > 0) {
        setStandardHours(useScheduleStore.getState().standardHours + duration);
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
    const scheduleId = scheduleItem.id || 'schedule-item';
    const items = [];

    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.CreateWorkingSchedule],
      })
    ) {
      items.push({
        key: 'edit',
        label: 'Edit',
        icon: (
          <FaEdit
            data-cy="org-organization-settings-workschedule-page-faedit-1"
            id="org-organization-settings-workschedule-page-faedit-1"
          />
        ),
        onClick: () => handleEditSchedule(scheduleItem),
        'data-cy': `org-settings-work-schedule-edit-${scheduleId}`,
        id: `org-settings-work-schedule-edit-${scheduleId}`,
      });
      items.push({
        key: 'delete',
        label: 'Delete',
        icon: (
          <FaTrashAlt
            data-cy="org-organization-settings-workschedule-page-fatrashalt-1"
            id="org-organization-settings-workschedule-page-fatrashalt-1"
          />
        ),
        onClick: () => handleDeleteSchedule(scheduleItem),
        'data-cy': `org-settings-work-schedule-delete-${scheduleId}`,
        id: `org-settings-work-schedule-delete-${scheduleId}`,
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

  const filteredWorkSchedules = useMemo(() => {
    if (!workScheudleData?.items) return [];
    if (!searchQuery.trim()) return workScheudleData.items;

    const query = searchQuery.toLowerCase().trim();
    return workScheudleData.items.filter((schedule: ScheduleItem) => {
      const name = schedule.name?.toLowerCase() || '';
      return name.includes(query);
    });
  }, [workScheudleData?.items, searchQuery]);

  return (
    <>
      <div
        className="p-5 bg-white rounded-2xl h-full"
        data-cy="org-settings-work-schedule-container"
        id="org-settings-work-schedule-container"
      >
        <div
          className="flex justify-between items-center mb-4"
          data-cy="org-settings-work-schedule-header"
          id="org-settings-work-schedule-header"
        >
          <h1
            className="text-base text-bold"
            data-cy="org-settings-work-schedule-title"
            id="org-settings-work-schedule-title"
          >
            Work Schedule
          </h1>
          <AccessGuard
            permissions={[Permissions.CreateWorkingSchedule]}
            data-cy="org-settings-work-schedule-create-btn"
            id="org-settings-work-schedule-create-btn"
          >
            <Space data-cy="org-organization-settings-workschedule-page-space-1">
              <Button
                type="primary"
                className="h-10 w-10 sm:w-auto"
                icon={
                  <FaPlus
                    data-cy="org-organization-settings-workschedule-page-faplus-1"
                    id="org-organization-settings-workschedule-page-faplus-1"
                  />
                }
                onClick={openDrawer}
                data-cy="org-settings-work-schedule-create-btn"
                id="org-settings-work-schedule-create-btn"
              >
                <span
                  className="hidden lg:inline"
                  data-cy="org-settings-work-schedule-create-btn-text"
                  id="org-settings-work-schedule-create-btn-text"
                >
                  Create work Schedule
                </span>
              </Button>
            </Space>
          </AccessGuard>
        </div>
        <Input
          placeholder="Search work schedule"
          className="flex-1 h-12 rounded-lg border-gray-200 mb-4"
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="org-settings-work-schedule-search-input"
          data-cy="org-settings-work-schedule-search-input"
        />

        {filteredWorkSchedules.map((scheduleItem, index) => {
          const scheduleId = `schedule-item-${index}`;
          return (
            <Collapse
              key={index}
              accordion
              defaultActiveKey={['1']}
              className="bg-white rounded-lg mb-4 w-full"
              expandIconPosition="end"
              data-cy={`org-settings-work-schedule-collapse-${scheduleId}`}
            >
              <Panel
                key="1"
                className="mb-0"
                data-cy="org-settings-work-schedule-collapse-panel"
                id="org-settings-work-schedule-collapse-panel"
                header={
                  <div
                    className="flex justify-between items-center"
                    data-cy="org-settings-work-schedule-collapse-panel-header"
                    id="org-settings-work-schedule-collapse-panel-header"
                  >
                    <span
                      className="flex justify-start items-center gap-2 sm:gap-4"
                      data-cy="org-settings-work-schedule-collapse-panel-header-inner"
                      id="org-settings-work-schedule-collapse-panel-header-inner"
                    >
                      <p
                        className="text-xs sm:text-base font-semibold"
                        data-cy={`org-settings-work-schedule-name-${scheduleId}`}
                        id={`org-settings-work-schedule-name-${scheduleId}`}
                      >
                        {scheduleItem.name}
                      </p>
                      <span
                        className="px-2 py-1 bg-[#3636f0] text-white rounded-lg font-bold text-[8px] sm:text-xs"
                        data-cy={`org-settings-work-schedule-badge-${scheduleId}`}
                        id={`org-settings-work-schedule-badge-${scheduleId}`}
                      >
                        Working-Hour
                      </span>
                    </span>
                    <Dropdown
                      menu={renderMenu(scheduleItem)}
                      trigger={['click']}
                      data-cy={`org-settings-work-schedule-dropdown-${scheduleId}`}
                    >
                      <MoreOutlined
                        className="text-lg cursor-pointer"
                        data-cy={`org-settings-work-schedule-actions-${scheduleId}`}
                        id={`org-settings-work-schedule-actions-${scheduleId}`}
                      />
                    </Dropdown>
                  </div>
                }
                extra={
                  <span
                    className="hidden sm:inline text-blue-500 bg-blue-100 py-1 px-2 rounded text-xs font-medium"
                    data-cy={`org-settings-work-schedule-extra-${scheduleId}`}
                    id={`org-settings-work-schedule-extra-${scheduleId}`}
                  >
                    Working-hours
                  </span>
                }
              >
                <Row
                  gutter={[16, 24]}
                  data-cy="org-settings-work-schedule-collapse-panel-info-line-row"
                  id="org-settings-work-schedule-collapse-panel-info-line-row"
                >
                  <Col
                    lg={16}
                    data-cy="org-settings-work-schedule-collapse-panel-info-line-col"
                    id="org-settings-work-schedule-collapse-panel-info-line-col"
                  >
                    <InfoLine
                      title="Standard working hours/day"
                      data-cy="org-settings-work-schedule-collapse-panel-info-line-title"
                      value={
                        <div
                          className="text-xs"
                          data-cy="org-settings-work-schedule-collapse-panel-info-line-value"
                          id="org-settings-work-schedule-collapse-panel-info-line-value"
                        >
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
                      data-cy="org-settings-work-schedule-collapse-panel-info-line-title-2"
                      value={
                        <div
                          className="text-xs"
                          data-cy="org-settings-work-schedule-collapse-panel-info-line-value-2"
                          id="org-settings-work-schedule-collapse-panel-info-line-value-2"
                        >
                          {(() => {
                            const totalHours = getTotalWorkingHours(
                              scheduleItem?.detail || [],
                            );
                            const hours = Math.floor(totalHours);
                            const minutes = Math.round(
                              (totalHours - hours) * 60,
                            );
                            return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
                          })()}
                        </div>
                      }
                    />
                    <InfoLine
                      title="Daily working hours"
                      data-cy="org-settings-work-schedule-collapse-panel-info-line-title-3"
                      value={
                        <div
                          className="flex gap-6 text-xs"
                          data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3"
                          id="org-settings-work-schedule-collapse-panel-info-line-value-3"
                        >
                          {/* Day Names */}
                          <div
                            className="flex flex-col space-y-4 text-xs font-bold text-gray-700"
                            data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3-inner"
                            id="org-settings-work-schedule-collapse-panel-info-line-value-3-inner"
                          >
                            {getWorkingHoursForSchedule(
                              scheduleItem?.detail || [],
                            )?.map((item: WorkingHours) => (
                              <div
                                key={`${item?.day}-label`}
                                className="whitespace-nowrap"
                                data-cy="org-organization-settings-workschedule-page-div-1"
                                id="org-organization-settings-workschedule-page-div-1"
                              >
                                {item?.day}
                              </div>
                            ))}
                          </div>

                          {/* Start - End Time */}
                          <div
                            className="flex flex-col space-y-4 text-xs font-light text-gray-800"
                            data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-2"
                            id="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-2"
                          >
                            {getWorkingHoursForSchedule(
                              scheduleItem?.detail || [],
                            )?.map((item: WorkingHours) => (
                              <div
                                key={`${item?.day}-time`}
                                className="whitespace-nowrap overflow-hidden text-ellipsis"
                                data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-2-item"
                                id="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-2-item"
                              >
                                {item?.startTime || '--'} -{' '}
                                {item?.endTime || '--'}
                              </div>
                            ))}
                          </div>

                          {/* Total Hours */}
                          <div
                            className="flex flex-col space-y-4 text-xs font-light text-gray-800"
                            data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-3"
                            id="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-3"
                          >
                            {getWorkingHoursForSchedule(
                              scheduleItem?.detail || [],
                            )?.map((item: WorkingHours) => (
                              <div
                                key={`${item?.day}-hours`}
                                className="whitespace-nowrap"
                                data-cy="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-3-item"
                                id="org-settings-work-schedule-collapse-panel-info-line-value-3-inner-3-item"
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
          );
        })}

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
                data-cy="org-settings-work-schedule-pagination-mobile"
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
                data-cy="org-settings-work-schedule-pagination"
              />
            )}
          </>
        )}
      </div>
      <CustomWorkingScheduleDrawer data-cy="org-settings-work-schedule-drawer" />
      <CustomDeleteWorkingSchduel data-cy="org-settings-work-schedule-delete-modal" />
    </>
  );
}

export default WorkScheduleTab;
