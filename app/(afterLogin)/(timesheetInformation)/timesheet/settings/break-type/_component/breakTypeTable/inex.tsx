import { useDeleteBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Dropdown, MenuProps, Skeleton } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { Permissions } from '@/types/commons/permissionEnum';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

const BreakTypeTable = () => {
  const { setIsShowBreakTypeSidebar, setSelectedBreakType } =
    useTimesheetSettingsStore();
  const { data: breakTypeData, isLoading: breakTypeIsLoading } =
    useGetBreakTypes();
  const { mutate: setDeleteBreakType } = useDeleteBreakType();

  const handleEdit = (record: any) => {
    setSelectedBreakType(record);
    setIsShowBreakTypeSidebar(true);
  };

  const handleDelete = (record: any) => {
    setDeleteBreakType(record?.id, {
      onSuccess: () => {},
    });
  };

  const items = (record: any): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlinedIcon fontSize="small" />,
      onClick: () => handleEdit(record),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlinedIcon fontSize="small" />,
      onClick: () => handleDelete(record),
    },
  ];

  const list = breakTypeData?.items || [];

  return (
    <Skeleton
      loading={breakTypeIsLoading}
      active
      data-cy="time-attendance-settings-break-type-table-spin"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border border-[#D9D9D9] rounded-lg p-4"
        id="time-attendance-settings-break-type-table"
        data-cy="time-attendance-settings-break-type-table"
      >
        {list.map((record: any) => (
          <div
            key={record?.id}
            className="rounded-lg border border-[#D9D9D9] bg-white p-4 relative"
            id={`time-attendance-settings-break-type-card-${record?.id}`}
            data-cy={`time-attendance-settings-break-type-card-${record?.id}`}
          >
            <div
              id="time-attendance-settings-break-type-table-row-header"
              data-cy="time-attendance-settings-break-type-table-row-header"
              className="flex items-start justify-between gap-2"
            >
              <h3
                className="font-bold text-gray-900 text-base m-0 flex-1 min-w-0"
                id="time-attendance-settings-break-type-table-row-name"
                data-cy="time-attendance-settings-break-type-table-row-name"
              >
                {record?.title || '-'}
              </h3>
              <AccessGuard
                permissions={[
                  Permissions.UpdateBreakType,
                  Permissions.DeleteBreakType,
                ]}
                data-cy="time-attendance-settings-break-type-table-row-actions-access-guard"
              >
                <Dropdown
                  trigger={['click']}
                  menu={{ items: items(record) }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    className="!w-8 !h-8 !min-w-8 !min-h-8 flex items-center justify-center border border-[#D9D9D9] rounded-lg hover:!bg-gray-50 shrink-0"
                    id={`time-attendance-settings-break-type-menu-btn-${record?.id}`}
                    data-cy={`time-attendance-settings-break-type-menu-btn-${record?.id}`}
                  >
                    <MoreHorizIcon />
                  </Button>
                </Dropdown>
              </AccessGuard>
            </div>
            <div
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D9D9D9] bg-gray-50/80 text-sm text-gray-700"
              id="time-attendance-settings-break-type-table-row-time-range"
              data-cy="time-attendance-settings-break-type-table-row-time-range"
            >
              <span
                id="time-attendance-settings-break-type-table-row-start-time"
                data-cy="time-attendance-settings-break-type-table-row-start-time"
              >
                {record?.startAt
                  ? dayjs(record.startAt, 'HH:mm:ss').format('HH:mm')
                  : '-'}
              </span>
              <span
                id="time-attendance-settings-break-type-table-row-time-range-separator"
                data-cy="time-attendance-settings-break-type-table-row-time-range-separator"
                className="text-gray-400"
                aria-hidden
              >
                →
              </span>
              <span
                id="time-attendance-settings-break-type-table-row-end-time"
                data-cy="time-attendance-settings-break-type-table-row-end-time"
              >
                {record?.endAt
                  ? dayjs(record.endAt, 'HH:mm:ss').format('HH:mm')
                  : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Skeleton>
  );
};

export default BreakTypeTable;
