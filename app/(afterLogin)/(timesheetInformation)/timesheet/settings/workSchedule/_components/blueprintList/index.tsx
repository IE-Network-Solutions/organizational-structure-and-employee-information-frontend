'use client';

import { Button, Dropdown, Input, Tag, type MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { blueprintStatusColor, blueprintStatusLabel } from '../blueprintStatus';

const EMPTY_BLUEPRINTS: NonNullable<
  ReturnType<typeof useGetBlueprints>['data']
> = [];
const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetAssignments>['data']
> = [];

const BlueprintList = () => {
  const router = useRouter();
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

  const openDetail = (id: string) => {
    router.push(`/timesheet/settings/workSchedule/${id}`);
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return blueprints;
    return blueprints.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }, [blueprints, searchQuery]);

  const assignmentCount = (blueprintId: string) =>
    assignments.filter((item) => item.blueprintId === blueprintId).length;

  const renderMenu = (blueprint: WorkScheduleBlueprint): MenuProps => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        label: 'View details',
        onClick: () => openDetail(blueprint.id),
      },
    ];
    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.UpdateWorkingSchedule],
      })
    ) {
      items.push(
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
      );
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

      {filtered.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          data-cy="time-attendance-settings-work-schedule-blueprint-grid"
        >
          {filtered.map((blueprint) => {
            const assigned = assignmentCount(blueprint.id);
            return (
              <div
                key={blueprint.id}
                role="button"
                tabIndex={0}
                onClick={() => openDetail(blueprint.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openDetail(blueprint.id);
                  }
                }}
                className="rounded-lg border border-gray-200 bg-white p-4 h-full cursor-pointer hover:border-primary/40 transition-colors"
                data-cy={`time-attendance-settings-work-schedule-blueprint-card-${blueprint.id}`}
              >
                <div
                  className="flex justify-between items-start gap-3"
                  data-cy={`time-attendance-settings-work-schedule-blueprint-card-header-${blueprint.id}`}
                >
                  <div
                    className="min-w-0 flex-1"
                    data-cy={`time-attendance-settings-work-schedule-blueprint-card-meta-${blueprint.id}`}
                  >
                    <div
                      className="flex flex-wrap items-center gap-2 mb-1"
                      data-cy={`time-attendance-settings-work-schedule-blueprint-card-tags-${blueprint.id}`}
                    >
                      <p
                        className="text-base font-semibold text-[#4d4d4d] mb-0 truncate"
                        title={blueprint.title}
                        data-cy={`time-attendance-settings-work-schedule-blueprint-card-title-${blueprint.id}`}
                      >
                        {blueprint.title}
                      </p>
                      <Tag
                        color={blueprintStatusColor(blueprint)}
                        className="!m-0 shrink-0"
                        data-cy={`time-attendance-settings-work-schedule-blueprint-card-status-${blueprint.id}`}
                      >
                        {blueprintStatusLabel(blueprint)}
                      </Tag>
                    </div>
                    <p
                      className="text-xs text-gray-500 mb-0"
                      data-cy={`time-attendance-settings-work-schedule-blueprint-card-range-${blueprint.id}`}
                    >
                      {blueprint.activeWeekdays.length} days · {assigned}{' '}
                      assigned ·{' '}
                      {formatTimeRange(
                        blueprint.defaultStartTime,
                        blueprint.defaultEndTime,
                      )}
                    </p>
                  </div>
                  <div
                    className="shrink-0"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    data-cy={`time-attendance-settings-work-schedule-blueprint-actions-wrap-${blueprint.id}`}
                  >
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
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default BlueprintList;
