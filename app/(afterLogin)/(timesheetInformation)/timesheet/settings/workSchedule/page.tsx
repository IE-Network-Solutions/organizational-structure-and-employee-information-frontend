'use client';
import React from 'react';
import { Dropdown, Input } from 'antd';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import {
  CalendarOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { ScheduleDetail as StoreScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEffect, useMemo } from 'react';
import CustomWorkingScheduleDrawer from './_components/workSchedule/customDrawer';
import CustomDeleteWorkingSchduel from './_components/workSchedule/deleteModal';

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
  workDay: boolean;
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
        className="px-2 sm:px-5 py-2"
        data-cy="org-settings-work-schedule-container"
        id="org-settings-work-schedule-container"
      >
        <div
          id="time-attendance-settings-work-schedule-container"
          data-cy="time-attendance-settings-work-schedule-container"
          className="border border-[#D9D9D9] rounded-lg p-4"
        >
          <Input
            placeholder="Search work schedule"
            className="flex-1 h-12 rounded-lg border-gray-200 mb-4"
            suffix={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="org-settings-work-schedule-search-input"
            data-cy="org-settings-work-schedule-search-input"
          />

          {filteredWorkSchedules.map((scheduleItem, index) => {
            const scheduleId = `schedule-item-${index}`;
            const workingDays = getWorkingHoursForSchedule(
              scheduleItem?.detail || [],
            ).filter((d) => d.workDay);
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 mb-4 w-full p-4"
                data-cy={`org-settings-work-schedule-card-${scheduleId}`}
              >
                <div
                  className="flex justify-between items-center mb-3"
                  data-cy="org-settings-work-schedule-card-header"
                  id="org-settings-work-schedule-card-header"
                >
                  <span
                    className="flex justify-start items-center gap-2 sm:gap-3"
                    data-cy="org-settings-work-schedule-card-header-inner"
                    id="org-settings-work-schedule-card-header-inner"
                  >
                    <p
                      className="text-base font-semibold text-[#4d4d4d] mb-0"
                      data-cy={`org-settings-work-schedule-name-${scheduleId}`}
                      id={`org-settings-work-schedule-name-${scheduleId}`}
                    >
                      {scheduleItem.name}
                    </p>
                    <span
                      className="hidden sm:inline text-gray-700 bg-gray-50 border border-gray-200 py-1 px-2 rounded-md text-xs font-medium"
                      data-cy={`org-settings-work-schedule-extra-${scheduleId}`}
                      id={`org-settings-work-schedule-extra-${scheduleId}`}
                    >
                      {workingDays.length} Days
                    </span>
                  </span>
                  <div
                    className="flex items-center gap-2"
                    data-cy={`org-settings-work-schedule-actions-wrap-${scheduleId}`}
                  >
                    <span
                      className="hidden sm:inline text-gray-700 bg-gray-50 border border-gray-200 py-1 px-2 rounded-md text-xs font-medium"
                      data-cy={`org-settings-work-schedule-badge-${scheduleId}`}
                      id={`org-settings-work-schedule-badge-${scheduleId}`}
                    >
                      Working Hours
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
                </div>
                <div
                  className="text-base font-semibold text-gray-900 mb-3"
                  data-cy={`org-settings-work-schedule-daily-title-${scheduleId}`}
                >
                  Daily Schedule
                </div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
                  data-cy={`org-settings-work-schedule-days-grid-${scheduleId}`}
                >
                  {workingDays.map((item: WorkingHours) => (
                    <div
                      key={`${item?.day}-tile`}
                      className="rounded-xl border border-gray-200 p-3"
                      data-cy={`org-settings-work-schedule-day-tile-${scheduleId}-${item?.day}`}
                    >
                      <div
                        className="text-sm font-semibold text-[#4d4d4d] mb-2"
                        data-cy={`org-settings-work-schedule-day-name-${scheduleId}-${item?.day}`}
                      >
                        {item?.day}
                      </div>
                      <div
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                        data-cy={`org-settings-work-schedule-day-time-${scheduleId}-${item?.day}`}
                      >
                        <CalendarOutlined />
                        <span
                          data-cy={`org-settings-work-schedule-day-time-text-${scheduleId}-${item?.day}`}
                        >
                          {item?.startTime || '--'}{' '}
                          <span
                            className="mx-1"
                            data-cy={`org-settings-work-schedule-day-time-arrow-${scheduleId}-${item?.day}`}
                          >
                            →
                          </span>{' '}
                          {item?.endTime || '--'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      </div>
      <CustomWorkingScheduleDrawer data-cy="org-settings-work-schedule-drawer" />
      <CustomDeleteWorkingSchduel data-cy="org-settings-work-schedule-delete-modal" />
    </>
  );
}

export default WorkScheduleTab;
