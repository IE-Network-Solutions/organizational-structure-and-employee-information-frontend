import React from 'react';
import { message, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import dayjs from 'dayjs';

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
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Start - end date',
      dataIndex: ['startDate', 'endDate'],
      key: 'date',
      sorter: true,
      render: (record: any) => (
        <div className="flex gap-2">
          <div>
            {dayjs(record.startDate).isValid()
              ? dayjs(record.startDate).format('DD MMM YYYY')
              : '-'}
          </div>
          <div>{'-'}</div>
          <div>
            {dayjs(record.endDate).isValid()
              ? dayjs(record.endDate).format('DD MMM YYYY')
              : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <ActionButtons
          id={record?.id ?? null}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      ),
    },
  ];

  return (
    <Spin spinning={fiscalActiveYearFetchLoading}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={fiscalActiveYear?.closedDates || []}
        pagination={false}
      />
    </Spin>
  );
};

export default ClosedDateTable;
