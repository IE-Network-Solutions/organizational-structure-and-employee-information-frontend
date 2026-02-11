import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useDeleteBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import AccessGuard from '@/utils/permissionGuard';
import { Spin, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { Permissions } from '@/types/commons/permissionEnum';

const BreakTypeTable = () => {
  const { setIsShowBreakTypeSidebar, setSelectedBreakType } =
    useTimesheetSettingsStore();
  const { data: breakTypeData, isLoading: breakTypeIsLoading } =
    useGetBreakTypes();
  const { mutate: setDeleteBreakType } = useDeleteBreakType();

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-break-type-table-row-name"
          data-cy="time-attendance-settings-break-type-table-row-name"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-break-type-table-row-description"
          data-cy="time-attendance-settings-break-type-table-row-description"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startAt',
      key: 'startAt',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-break-type-table-row-start-time"
          data-cy="time-attendance-settings-break-type-table-row-start-time"
        >
          {dayjs(text, 'HH:mm:ss').format('HH:mm') || '-'}
        </div>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endAt',
      key: 'endAt',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-break-type-table-row-end-time"
          data-cy="time-attendance-settings-break-type-table-row-end-time"
        >
          <div
            id="time-attendance-settings-break-type-table-row-end-time-div"
            data-cy="time-attendance-settings-break-type-table-row-end-time-div"
          >
            {dayjs(text, 'HH:mm:ss').format('HH:mm') || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <div
          className="flex items-center space-x-2"
          id="time-attendance-settings-break-type-table-row-actions-container"
          data-cy="time-attendance-settings-break-type-table-row-actions-container"
        >
          <AccessGuard
            permissions={[Permissions.UpdateBreakType]}
            data-cy="time-attendance-settings-break-type-table-row-edit-access-guard"
          >
            <ActionButtons
              id={record?.id ?? null}
              onEdit={() => handleEdit(record)}
              data-cy="time-attendance-settings-break-type-table-row-edit-buttons"
            />
          </AccessGuard>{' '}
          <AccessGuard
            permissions={[Permissions.DeleteBreakType]}
            data-cy="time-attendance-settings-break-type-table-row-delete-access-guard"
          >
            <ActionButtons
              id={record?.id ?? null}
              onDelete={() => handleDelete(record)}
              data-cy="time-attendance-settings-break-type-table-row-delete-buttons"
            />
          </AccessGuard>
        </div>
      ),
    },
  ];
  const handleEdit = (record: any) => {
    setSelectedBreakType(record);
    setIsShowBreakTypeSidebar(true);
  };
  const handleDelete = (record: any) => {
    setDeleteBreakType(record?.id, {
      onSuccess: () => {},
    });
  };
  return (
    <Spin
      spinning={breakTypeIsLoading}
      data-cy="time-attendance-settings-break-type-table-spin"
    >
      <Table
        className="mt-6"
        columns={columns}
        dataSource={breakTypeData?.items || []}
        pagination={false}
        id="time-attendance-settings-break-type-table"
        data-cy="time-attendance-settings-break-type-table"
      />
    </Spin>
  );
};

export default BreakTypeTable;
