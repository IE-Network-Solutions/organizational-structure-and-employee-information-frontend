'use client';

import { Button, Dropdown, Input, Tag } from 'antd';
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { WorkScheduleBlueprint } from '@/types/timesheet/workSchedule';
import {
  useGetAssignments,
  useGetBlueprints,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  formatHours,
  formatTimeRange,
  formatTimeRangeMeridiem,
  remainingHoursForWeekday,
  shiftsForWeekday,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { useMemo } from 'react';

const EMPTY_BLUEPRINTS: NonNullable<
  ReturnType<typeof useGetBlueprints>['data']
> = [];
const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetAssignments>['data']
> = [];

const BlueprintList = () => {
  const { data: blueprintsData, isLoading } = useGetBlueprints();
  const blueprints = blueprintsData ?? EMPTY_BLUEPRINTS;
  const { data: assignmentsData } = useGetAssignments();
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const {
    searchQuery,
    setSearchQuery,
    openEditBlueprintModal,
    openAssignDrawer,
    openDeleteModal,
    openCreateBlueprintModal,
  } = useWorkScheduleUiStore();

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return blueprints;
    return blueprints.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }, [blueprints, searchQuery]);

  const assignmentCount = (blueprintId: string) =>
    assignments.filter((item) => item.blueprintId === blueprintId).length;

  const renderMenu = (blueprint: WorkScheduleBlueprint) => {
    const items = [];
    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.UpdateWorkingSchedule],
      })
    ) {
      items.push({
        key: 'edit',
        label: 'Edit',
        onClick: () => openEditBlueprintModal(blueprint.id),
      });
      items.push({
        key: 'assign',
        label: 'Assign employees',
        onClick: () => openAssignDrawer(blueprint.id),
      });
    }
    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.DeleteWorkingSchedule],
      })
    ) {
      items.push({
        key: 'delete',
        label: 'Delete',
        danger: true,
        onClick: () => openDeleteModal(blueprint.id),
      });
    }
    return { items };
  };

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg p-4"
      data-cy="time-attendance-settings-work-schedule-blueprint-list"
      id="time-attendance-settings-work-schedule-blueprint-list"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
        data-cy="time-attendance-settings-work-schedule-blueprint-toolbar"
      >
        <Input
          placeholder="Search work schedule"
          className="w-full sm:w-[300px] h-8"
          suffix={
            <div
              className="text-gray-400 border-l border-gray-300 py-1 px-2"
              data-cy="time-attendance-settings-work-schedule-search-suffix"
            >
              <SearchOutlined />
            </div>
          }
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-cy="time-attendance-settings-work-schedule-search"
        />
      </div>

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          title="No work schedules yet"
          description="Create a permanent work schedule for selected days, then add Morning, Afternoon, or custom shifts inside each day."
          actionText="Create Work Schedule"
          onAction={openCreateBlueprintModal}
          compact
        />
      )}

      {filtered.map((blueprint) => (
        <div
          key={blueprint.id}
          className="bg-white rounded-xl border border-gray-200 mb-4 w-full p-4"
          data-cy={`time-attendance-settings-work-schedule-blueprint-card-${blueprint.id}`}
        >
          <div
            className="flex justify-between items-start gap-3 mb-3"
            data-cy={`time-attendance-settings-work-schedule-blueprint-card-header-${blueprint.id}`}
          >
            <div
              data-cy={`time-attendance-settings-work-schedule-blueprint-card-meta-${blueprint.id}`}
            >
              <div
                className="flex flex-wrap items-center gap-2 mb-1"
                data-cy={`time-attendance-settings-work-schedule-blueprint-card-tags-${blueprint.id}`}
              >
                <p
                  className="text-base font-semibold text-[#4d4d4d] mb-0"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-card-title-${blueprint.id}`}
                >
                  {blueprint.title}
                </p>
                <Tag color={blueprint.hasShifts ? 'blue' : 'default'}>
                  {blueprint.hasShifts ? 'Shifts' : 'Baseline'}
                </Tag>
                {blueprint.hasShifts && (
                  <Tag color={blueprint.isSwappable ? 'success' : 'default'}>
                    {blueprint.isSwappable ? 'Swappable' : 'Fixed'}
                  </Tag>
                )}
                <span
                  className="text-gray-700 bg-gray-50 border border-gray-200 py-1 px-2 rounded-md text-xs font-medium"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-card-days-${blueprint.id}`}
                >
                  {blueprint.activeWeekdays.length} Days
                </span>
                <span
                  className="text-gray-700 bg-gray-50 border border-gray-200 py-1 px-2 rounded-md text-xs font-medium"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-card-assigned-${blueprint.id}`}
                >
                  {assignmentCount(blueprint.id)} Assigned
                </span>
              </div>
              <p
                className="text-xs text-gray-500 mb-0"
                data-cy={`time-attendance-settings-work-schedule-blueprint-card-range-${blueprint.id}`}
              >
                Permanent ·{' '}
                {formatTimeRange(
                  blueprint.defaultStartTime,
                  blueprint.defaultEndTime,
                )}
              </p>
            </div>
            <Dropdown menu={renderMenu(blueprint)} trigger={['click']}>
              <Button
                type="default"
                className="border border-[#D9D9D9] h-8 w-8"
                data-cy={`time-attendance-settings-work-schedule-blueprint-actions-${blueprint.id}`}
              >
                <MoreHorizIcon fontSize="small" />
              </Button>
            </Dropdown>
          </div>

          <div
            className="text-base font-semibold text-gray-900 mb-3"
            data-cy={`time-attendance-settings-work-schedule-blueprint-card-daily-title-${blueprint.id}`}
          >
            Daily Schedule
          </div>
          <div
            className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
            data-cy={`time-attendance-settings-work-schedule-blueprint-card-days-grid-${blueprint.id}`}
          >
            {blueprint.activeWeekdays.map((day) => {
              const dayShifts = shiftsForWeekday(blueprint, day);
              const remaining = remainingHoursForWeekday(
                blueprint.defaultStartTime,
                blueprint.defaultEndTime,
                blueprint.shifts || [],
                day,
              );
              return (
                <div
                  key={`${blueprint.id}-${day}`}
                  className="min-w-0 overflow-hidden rounded-xl border border-gray-200 p-3"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-day-${blueprint.id}-${day}`}
                >
                  <div
                    className="mb-2 flex min-w-0 items-center gap-1"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-day-header-${blueprint.id}-${day}`}
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-[#4d4d4d]"
                      title={day}
                      data-cy={`time-attendance-settings-work-schedule-blueprint-day-name-${blueprint.id}-${day}`}
                    >
                      {day}
                    </span>
                    {blueprint.hasShifts && (
                      <Tag
                        className="!m-0 !h-4 !shrink-0 !px-1 !py-0 !text-[10px] !leading-4"
                        data-cy={`time-attendance-settings-work-schedule-blueprint-day-remaining-${blueprint.id}-${day}`}
                      >
                        {remaining > 0
                          ? `${formatHours(remaining)} left`
                          : 'Full'}
                      </Tag>
                    )}
                  </div>
                  <div
                    className="flex min-w-0 flex-col items-start gap-1.5"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-day-tags-${blueprint.id}-${day}`}
                  >
                    <Tag
                      className="!m-0 !max-w-full !overflow-hidden !text-ellipsis !text-[11px] !leading-5"
                      data-cy={`time-attendance-settings-work-schedule-blueprint-day-time-${blueprint.id}-${day}`}
                    >
                      <CalendarOutlined className="mr-1" />
                      {formatTimeRangeMeridiem(
                        blueprint.defaultStartTime,
                        blueprint.defaultEndTime,
                      )}
                    </Tag>
                    {dayShifts.length === 0 ? (
                      <Tag
                        className="!m-0 !max-w-full !overflow-hidden !text-ellipsis !text-[11px] !leading-5"
                        data-cy={`time-attendance-settings-work-schedule-blueprint-day-baseline-${blueprint.id}-${day}`}
                      >
                        Day hours only
                      </Tag>
                    ) : (
                      dayShifts.map((shift) => (
                        <Tag
                          key={`${blueprint.id}-${day}-${shift.id}`}
                          color="blue"
                          className="!m-0 !max-w-full !overflow-hidden !text-ellipsis !text-[11px] !leading-5"
                          title={`${shift.name} · ${formatTimeRangeMeridiem(shift.startTime, shift.endTime)}`}
                          data-cy={`time-attendance-settings-work-schedule-blueprint-day-shift-${blueprint.id}-${day}-${shift.id}`}
                        >
                          {shift.name} ·{' '}
                          {formatTimeRangeMeridiem(
                            shift.startTime,
                            shift.endTime,
                          )}
                        </Tag>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlueprintList;
