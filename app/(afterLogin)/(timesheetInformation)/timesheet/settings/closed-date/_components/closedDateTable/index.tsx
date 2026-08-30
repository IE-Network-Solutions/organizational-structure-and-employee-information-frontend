import React from 'react';
import { message, Table } from 'antd';
import { TableSkeleton } from '@/components/tableSkeleton';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ActionButton from '@/components/common/actionButton';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const ClosedDateTable = () => {
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } =
    useTimesheetSettingsStore();
  const { data: fiscalActiveYear, isLoading: fiscalActiveYearFetchLoading } =
    useGetActiveFiscalYears();
  const { mutate: updateClosedDate } = useUpdateClosedDate();

  const handleEdit = (record: any) => {
    setSelectedClosedDate(record);
    setIsShowClosedDateSidebar(true);
  };

  const handleDelete = (record: any) => {
    const fiscalYearId = fiscalActiveYear?.id;

    const updatedClosedDatesArray =
      fiscalActiveYear?.closedDates?.filter(
        (item: any) => item.id !== record.id,
      ) || [];

    if (fiscalYearId) {
      updateClosedDate(
        { fiscalYearId, closedDates: updatedClosedDatesArray },
        {
          onSuccess: () => {
            message.success(`${record.name} deleted successfully.`);
          },
          onError: () => {
            message.error(`Failed to delete ${record.name}.`);
          },
        },
      );
    }
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-closed-date-table-row-name"
          data-cy="time-attendance-settings-closed-date-table-row-name"
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
          id="time-attendance-settings-closed-date-table-row-description"
          data-cy="time-attendance-settings-closed-date-table-row-description"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-closed-date-table-row-type"
          data-cy="time-attendance-settings-closed-date-table-row-type"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: true,
      render: (text: string) => (
        <div
          id="time-attendance-settings-closed-date-table-row-date"
          data-cy="time-attendance-settings-closed-date-table-row-date"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateClosedDate,
            Permissions.DeleteClosedDate,
          ]}
          data-cy="time-attendance-settings-closed-date-table-row-actions-access-guard"
        >
          <ActionButton
            id={record?.id ?? null}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
            data-cy="time-attendance-settings-closed-date-table-row-action-buttons"
          />
        </AccessGuard>
      ),
    },
  ];

  return (
    <>
      {fiscalActiveYearFetchLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          className="mt-6"
          columns={columns}
          dataSource={fiscalActiveYear?.closedDates || []}
          pagination={false}
          id="time-attendance-settings-closed-date-table"
          data-cy="time-attendance-settings-closed-date-table"
        />
      )}
    </>
  );
};

export default ClosedDateTable;
