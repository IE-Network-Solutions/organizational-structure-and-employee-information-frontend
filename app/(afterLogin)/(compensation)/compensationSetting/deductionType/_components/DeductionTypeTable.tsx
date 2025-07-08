import React, { useEffect, useState } from 'react';
import { Spin, Switch, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllowanceTypes } from '@/store/server/features/compensation/settings/queries';
import {
  useDeleteAllowanceType,
  useUpdateCompensationStatus,
} from '@/store/server/features/compensation/settings/mutations';
import { useCompensationTypeTablesStore } from '@/store/uistate/features/compensation/settings';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';

const DeductionTypeTable = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { mutate: updateCompensationStatus } = useUpdateCompensationStatus();
  const {
    benefitPageSize,
    benefitCurrentPage,
    setBenefitPageSize,
    setBenefitCurrentPage,
  } = useCompensationTypeTablesStore();
  const {
    // setSelectedBenefitRecord,
    // setIsBenefitOpen,
    tableData,
    // isDeductionOpen,
    setIsDeductionOpen,
    setSelectedDeductionRecord,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: any) => item.type === 'DEDUCTION',
      );
      setTableData(filteredData);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
  };

  const handleDeductionEdit = (record: any | null) => {
    setSelectedDeductionRecord(record);
    setIsDeductionOpen(true);
  };
  const updateStatus = (id: string) => {
    setLoadingId(id);
    updateCompensationStatus(
      { id },
      {
        onSuccess: () => setLoadingId(null),
        onError: () => setLoadingId(null),
      },
    );
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceType,
            Permissions.DeleteAllowanceType,
          ]}
        >
          <Switch
            loading={loadingId === record.id}
            onClick={() => updateStatus(record.id)}
            checked={record.isActive}
          />
        </AccessGuard>
      ),
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
            onEdit={() => handleDeductionEdit(record)}
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

export default DeductionTypeTable;
