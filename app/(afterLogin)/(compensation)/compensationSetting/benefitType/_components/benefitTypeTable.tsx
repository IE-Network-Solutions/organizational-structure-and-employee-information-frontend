import React, { useEffect } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import { useDeleteAllowanceType } from '@/store/server/features/compensation/settings/mutations';
import { useCompensationTypeTablesStore } from '@/store/uistate/features/compensation/settings';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';

const BenefitTypeTable = () => {
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const {
    benefitPageSize,
    benefitCurrentPage,
    setBenefitPageSize,
    setBenefitCurrentPage,
  } = useCompensationTypeTablesStore();
  const {
    setSelectedBenefitRecord,
    setIsBenefitOpen,
    tableData,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'MERIT');
      setTableData(filteredData);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
  };

  const handleBenefitEdit = (record: any | null) => {
    setSelectedBenefitRecord(record);
    setIsBenefitOpen(true);
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
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      render: (mode: string) => (
        <div>{mode == 'CREDIT' ? 'Credit' : 'Debit'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'defaultAmount',
      key: 'defaultAmount',
      sorter: true,
      render: (amount: number, record: any) =>
        amount && amount != 0
          ? !record.isRate
            ? `${amount} ETB`
            : `${amount}% of base salary`
          : '-',
    },
    {
      title: 'Applied to',
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
            Permissions.UpdateBenefitType,
            Permissions.DeleteBenefitType,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => handleBenefitEdit(record)}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setBenefitCurrentPage(pagination.current);
    setBenefitPageSize(pagination.pageSize);
  };

  return (
    <Spin spinning={isLoading}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: benefitCurrentPage,
          pageSize: benefitPageSize,
          total: tableData.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default BenefitTypeTable;
