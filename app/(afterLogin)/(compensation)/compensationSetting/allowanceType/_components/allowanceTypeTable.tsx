import React, { useEffect } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import { useDeleteAllowanceType } from '@/store/server/features/compensation/settings/mutations';
import { useCompensationSettingStore, useCompensationTypeTablesStore } from '@/store/uistate/features/compensation/settings';

const AllowanceTypeTable = () => {
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { allowanceCurrentPage, allowancePageSize, setAllowanceCurrentPage, setAllowancePageSize, } = useCompensationTypeTablesStore();
  const { setSelectedAllowanceRecord, setIsAllowanceOpen, tableData, setTableData } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'ALLOWANCE');
      setTableData(filteredData);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
  };
  
  const handleAllowanceEdit = (record: string) => {
    setSelectedAllowanceRecord(record);
    setIsAllowanceOpen(true);
  };

  const handleTableChange = (pagination: any) => {
    setAllowanceCurrentPage(pagination.current);
    setAllowancePageSize(pagination.pageSize);
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
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceType,
            Permissions.DeleteAllowanceType,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => handleAllowanceEdit(record)}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

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