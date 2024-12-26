import React from 'react';
import { Input, message, Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { SearchOutlined } from '@ant-design/icons';

const VariablePayTable = () => {
    
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } = useTimesheetSettingsStore();
  const { data: fiscalActiveYear, isLoading: fiscalActiveYearFetchLoading } = useGetActiveFiscalYears();
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

  const sampleClosedDates = [
    {
      id: 1,
      name: 'End of Q1',
      Type: 'Rate',
      Amount: '20% of salery',
      'Applicable to': 'Finance Team',
    },
    {
      id: 2,
      name: 'Mid-Year Review',
      Type: 'Fixed',
      Amount: 1500,
      'Applicable to': 'All Departments',
    },
    {
      id: 3,
      name: 'End of Fiscal Year',
      Type: 'Fixed',
      Amount: 5000,
      'Applicable to': 'Management',
    },
    {
      id: 4,
      name: 'Special Bonus',
      Type: 'Fixed',
      Amount: 2000,
      'Applicable to': 'HR & Admin',
    },
  ];
  

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'Type',
      key: 'Type',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Applicable to',
      dataIndex: 'Applicable to',
      key: 'Applicable to',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
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
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record)}
          />
        </AccessGuard>
      ),
    },
  ];

  return (
    <Spin spinning={fiscalActiveYearFetchLoading}>
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input addonBefore={<SearchOutlined />} placeholder="large size" />
        <Select
          placeholder="Sort by"
          style={{ width: 150 }}
          options={[
            { value: 'age', label: 'Age' },
            { value: 'name', label: 'Name' },
            { value: 'date', label: 'Date' },
          ]}
        />
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          placeholder="Filter by"
          style={{ width: 150 }}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
      </Space>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={sampleClosedDates}
        pagination={false}
      />
    </Spin>
  );
};

export default VariablePayTable;