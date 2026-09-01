'use client';

import { Button, Dropdown, Tag, Tooltip, type MenuProps } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { IoChevronBackSharp } from 'react-icons/io5';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useParams, useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetAssignments,
  useGetBlueprint,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  formatHours,
  formatTimeRange,
  formatTimeRangeMeridiem,
  remainingHoursForWeekday,
  shiftsForWeekday,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import {
  blueprintStatusColor,
  blueprintStatusLabel,
} from '../_components/blueprintStatus';
import BlueprintFormModal from '../_components/blueprintFormModal';
import AssignEmployeesDrawer from '../_components/assignEmployeesDrawer';
import DeleteBlueprintModal from '../_components/deleteBlueprintModal';

const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetAssignments>['data']
> = [];

const WorkScheduleDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const blueprintId = typeof params?.id === 'string' ? params.id : null;
  const { openEditBlueprintModal, openAssignDrawer, openDeleteModal } =
    useWorkScheduleUiStore();
  const { data: blueprint, isLoading, isError } = useGetBlueprint(blueprintId);
  const { data: assignmentsData } = useGetAssignments(blueprintId ?? undefined);
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const canUpdate = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateWorkingSchedule],
  });
  const canDelete = AccessGuard.checkAccess({
    permissions: [Permissions.DeleteWorkingSchedule],
  });

  const goBack = () => router.push('/timesheet/settings/workSchedule');

  const actionMenu: MenuProps | null =
    blueprint && (canUpdate || canDelete)
      ? {
          items: [
            ...(canUpdate
              ? [
                  {
                    key: 'edit',
                    label: 'Edit',
                    onClick: () => openEditBlueprintModal(blueprint.id),
                  },
                  {
                    key: 'assign',
                    label: 'Assign employees',
                    onClick: () => openAssignDrawer(blueprint.id),
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    key: 'delete',
                    label: 'Delete',
                    danger: true,
                    onClick: () => openDeleteModal(blueprint.id),
                  },
                ]
              : []),
          ],
        }
      : null;

  return (
    <div
      className="space-y-4 w-full max-w-full"
      data-cy="time-attendance-settings-work-schedule-detail-page"
      id="time-attendance-settings-work-schedule-detail-page"
    >
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        data-cy="time-attendance-settings-work-schedule-detail-header"
      >
        <div
          className="flex items-start gap-3 min-w-0"
          data-cy="time-attendance-settings-work-schedule-detail-title-area"
        >
          <Button
            type="default"
            size="small"
            icon={<IoChevronBackSharp />}
            className="!h-8 !w-8 !p-0 flex items-center justify-center border-[1px] border-[#D9D9D9] rounded-lg shrink-0"
            onClick={goBack}
            data-cy="time-attendance-settings-work-schedule-detail-back"
            aria-label="Back"
          />
          <div
            className="min-w-0"
            data-cy="time-attendance-settings-work-schedule-detail-title-content"
          >
            {isLoading ? (
              <p
                className="mb-0 text-sm text-gray-500"
                data-cy="time-attendance-settings-work-schedule-detail-loading"
              >
                Loading schedule…
              </p>
            ) : isError || !blueprint ? (
              <p
                className="mb-0 text-sm text-gray-500"
                data-cy="time-attendance-settings-work-schedule-detail-not-found"
              >
                Work schedule not found.
              </p>
            ) : (
              <>
                <div
                  className="flex flex-wrap items-center gap-2 mb-1"
                  data-cy="time-attendance-settings-work-schedule-detail-title-row"
                >
                  <h1
                    className="mb-0 text-base sm:text-lg font-semibold text-gray-900 truncate"
                    data-cy="time-attendance-settings-work-schedule-detail-title"
                  >
                    {blueprint.title}
                  </h1>
                  <Tag
                    color={blueprintStatusColor(blueprint)}
                    className="!m-0"
                    data-cy="time-attendance-settings-work-schedule-detail-status"
                  >
                    {blueprintStatusLabel(blueprint)}
                  </Tag>
                </div>
                <div
                  className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600"
                  data-cy="time-attendance-settings-work-schedule-detail-meta"
                >
                  <span data-cy="time-attendance-settings-work-schedule-detail-hours">
                    {formatTimeRange(
                      blueprint.defaultStartTime,
                      blueprint.defaultEndTime,
                    )}
                  </span>
                  <span data-cy="time-attendance-settings-work-schedule-detail-days-count">
                    {blueprint.activeWeekdays.length} days
                  </span>
                  <button
                    type="button"
                    className="text-primary hover:underline disabled:text-gray-500 disabled:no-underline"
                    disabled={!canUpdate}
                    onClick={() => openAssignDrawer(blueprint.id)}
                    data-cy="time-attendance-settings-work-schedule-detail-assigned"
                  >
                    {assignments.length} assigned
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {actionMenu ? (
          <div
            className="shrink-0"
            data-cy="time-attendance-settings-work-schedule-detail-actions"
          >
            <Dropdown menu={actionMenu} trigger={['click']}>
              <Button
                type="default"
                className="border border-[#D9D9D9] h-8 w-8"
                data-cy="time-attendance-settings-work-schedule-detail-actions-trigger"
              >
                <MoreHorizIcon fontSize="small" />
              </Button>
            </Dropdown>
          </div>
        ) : null}
      </div>

      {blueprint ? (
        <div
          className="rounded-lg border border-gray-200 bg-white p-4"
          data-cy="time-attendance-settings-work-schedule-detail-body"
        >
          <p
            className="mb-3 text-base font-semibold text-gray-900"
            data-cy="time-attendance-settings-work-schedule-detail-daily-title"
          >
            Daily Schedule
          </p>
          <div
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-cy="time-attendance-settings-work-schedule-detail-days-grid"
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
                  className="min-w-0 overflow-hidden rounded-lg bg-[#FAFAFA] p-3"
                  data-cy={`time-attendance-settings-work-schedule-detail-day-${blueprint.id}-${day}`}
                >
                  <div
                    className="mb-2 flex min-w-0 items-center gap-1"
                    data-cy={`time-attendance-settings-work-schedule-detail-day-header-${blueprint.id}-${day}`}
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-[#4d4d4d]"
                      title={day}
                      data-cy={`time-attendance-settings-work-schedule-detail-day-name-${blueprint.id}-${day}`}
                    >
                      {day}
                    </span>
                    {blueprint.hasShifts && (
                      <Tag
                        className="!m-0 !h-4 !shrink-0 !px-1 !py-0 !text-[10px] !leading-4"
                        data-cy={`time-attendance-settings-work-schedule-detail-day-remaining-${blueprint.id}-${day}`}
                      >
                        {remaining > 0
                          ? `${formatHours(remaining)} left`
                          : 'Full'}
                      </Tag>
                    )}
                  </div>
                  <div
                    className="flex min-w-0 flex-col items-start gap-1.5"
                    data-cy={`time-attendance-settings-work-schedule-detail-day-tags-${blueprint.id}-${day}`}
                  >
                    <Tag
                      className="!m-0 !max-w-full !overflow-hidden !text-ellipsis !text-[11px] !leading-5"
                      data-cy={`time-attendance-settings-work-schedule-detail-day-time-${blueprint.id}-${day}`}
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
                        data-cy={`time-attendance-settings-work-schedule-detail-day-baseline-${blueprint.id}-${day}`}
                      >
                        Day hours only
                      </Tag>
                    ) : (
                      dayShifts.map((shift) => (
                        <Tooltip
                          key={`${blueprint.id}-${day}-${shift.id}`}
                          title={`${shift.name} · ${formatTimeRangeMeridiem(shift.startTime, shift.endTime)}`}
                        >
                          <Tag
                            color="blue"
                            className="!m-0 !max-w-full !overflow-hidden !text-ellipsis !text-[11px] !leading-5"
                            data-cy={`time-attendance-settings-work-schedule-detail-day-shift-${blueprint.id}-${day}-${shift.id}`}
                          >
                            {shift.name} ·{' '}
                            {formatTimeRangeMeridiem(
                              shift.startTime,
                              shift.endTime,
                            )}
                          </Tag>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <BlueprintFormModal />
      <AssignEmployeesDrawer />
      <DeleteBlueprintModal />
    </div>
  );
};

export default WorkScheduleDetailPage;
