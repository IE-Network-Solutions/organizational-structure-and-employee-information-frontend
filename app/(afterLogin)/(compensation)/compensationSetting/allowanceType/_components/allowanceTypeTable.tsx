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
import {
  useCompensationSettingStore,
  useCompensationTypeTablesStore,
} from '@/store/uistate/features/compensation/settings';
import CustomPagination from '@/components/customPagination';

const AllowanceTypeTable = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { data, isLoading } = useFetchAllowanceTypes();
  const { mutate: deleteAllowanceType } = useDeleteAllowanceType();
  const { mutate: updateCompensationStatus } = useUpdateCompensationStatus();
  const {
    allowanceCurrentPage,
    allowancePageSize,
    setAllowanceCurrentPage,
    setAllowancePageSize,
  } = useCompensationTypeTablesStore();
  const {
    setSelectedAllowanceRecord,
    setIsAllowanceOpen,
    tableData,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: any) => item.type === 'ALLOWANCE',
      );
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
      render: (text: string) => (
        <div data-testid="allowance-type-name">{text || '-'}</div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      render: (text: string) => (
        <div data-testid="allowance-type-description">{text || '-'}</div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'type',
      sorter: true,
      render: (isRate: boolean) => (
        <div data-testid="allowance-type-type">{isRate ? 'Rate' : 'Fixed'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'defaultAmount',
      key: 'amount',
      sorter: true,
      render: (amount: number, record: any) => (
        <div data-testid={`allowance-type-amount-${record.id}`}>
          {!record.isRate ? `${amount} ETB` : `${amount}% of base salary`}
        </div>
      ),
    },
    {
      title: 'Applicable to',
      dataIndex: 'applicableTo',
      key: 'applicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div data-testid="allowance-type-applicable">
          {applicableTo === 'GLOBAL' ? 'All Employees' : 'Selected Employees'}
        </div>
      ),
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
            data-testid={`allowance-type-status-${record.id}`}
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
            Permissions.UpdateAllowanceType,
            Permissions.DeleteAllowanceType,
          ]}
        >
          <div data-testid={`allowance-type-actions-${record.id}`}>
            <ActionButtons
              id={record?.id ?? null}
              onEdit={() => handleAllowanceEdit(record)}
              onDelete={() => handleDelete(record.id)}
            />
          </div>
        </AccessGuard>
      ),
    },
  ];
  const paginatedData = tableData.slice(
    (allowanceCurrentPage - 1) * allowancePageSize,
    allowanceCurrentPage * allowancePageSize,
  );

  return (
    <div data-testid="allowance-type-table-container">
      <Spin spinning={isLoading} data-testid="allowance-type-table-loading">
        <Table
          className="mt-6"
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          data-testid="allowance-type-table"
        />
        <CustomPagination
          current={allowanceCurrentPage}
          total={tableData.length}
          pageSize={allowancePageSize}
          onChange={(page, size) => {
            setAllowanceCurrentPage(page);
            setAllowancePageSize(size);
          }}
          onShowSizeChange={(size) => {
            setAllowancePageSize(size);
            setAllowanceCurrentPage(1);
          }}
          data-testid="allowance-type-pagination"
        />
      </Spin>
    </div>
  );
};

export default AllowanceTypeTable;
