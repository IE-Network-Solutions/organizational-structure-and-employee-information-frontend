import React, { useEffect, useState } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import { useDeleteAllowanceType } from '@/store/server/features/compensation/settings/mutations';
import { useCompensationTypeTablesStore } from '@/store/uistate/features/compensation/settings';

const AllowanceTypeTable = () => {
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { allowanceCurrentPage, allowancePageSize, setAllowanceCurrentPage, setAllowancePageSize } = useCompensationTypeTablesStore();
  const [ tableData, setTableData ] = useState([]);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'ALLOWANCE');
      setTableData(filteredData);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
  };
  
  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      dataIndex: 'isRate',
      key: 'type',
      sorter: true,
      render: (isRate: boolean) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'defaultAmount',
      key: 'amount',
      sorter: true,
      render: (amount: number, record: any) =>
        !record.isRate
          ? `${amount} ETB`
          : `${amount}% of base salary`,
    },
    {
      title: 'Applicable to',
      dataIndex: 'applicableTo',
      key: 'applicableTo',
      sorter: true,
      render: (applicableTo: string) =>
        applicableTo === 'GLOBAL' ? 'All Employees' : 'Selected Employees',
    },
    {
      title: 'Is Recurring',
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      sorter: true,
      render: (isRecurring: boolean) => <div>{isRecurring ? 'Yes' : 'No'}</div>,
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
            disableEdit
            onEdit={() => {}}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];
  
  const handleTableChange = (pagination: any) => {
    setAllowanceCurrentPage(pagination.current);
    setAllowancePageSize(pagination.pageSize);
  };

  return (
    <Spin spinning={isLoading}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: allowanceCurrentPage,
          pageSize: allowancePageSize,
          total: tableData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default AllowanceTypeTable;