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
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const BenefitTypeTable = () => {
  const { isMobile, isTablet } = useIsMobile();
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
    setSelectedBenefitRecord,
    setIsBenefitOpen,
    tableData,
    setTableData,
  } = useCompensationSettingStore();

  useEffect(() => {
    if (data) {
      const filteredData = data.filter((item: any) => item.type === 'MERIT');
      setTableData(filteredData);
      // Reset pagination when data changes
      setBenefitCurrentPage(1);
    }
  }, [data, setTableData, setBenefitCurrentPage]);

  const handleDelete = (id: string) => {
    deleteAllowanceType(id);
  };

  const handleBenefitEdit = (record: any | null) => {
    setSelectedBenefitRecord(record);
    setIsBenefitOpen(true);
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
        <div data-testid="benefit-type-name" className="text-xs truncate">
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
          data-testid="benefit-type-description"
          className="text-xs truncate"
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'type',
      sorter: true,
      render: (isRate: boolean) => (
        <div data-testid="benefit-type-type">{isRate ? 'Rate' : 'Fixed'}</div>
      ),
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      render: (mode: string) => (
        <div data-testid="benefit-type-mode">
          {mode == 'CREDIT' ? 'Credit' : 'Debit'}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'defaultAmount',
      key: 'defaultAmount',
      sorter: true,
      render: (amount: number, record: any) => (
        <div data-testid={`benefit-type-amount-${record.id}`}>
          {amount && amount != 0
            ? !record.isRate
              ? `${amount} ETB`
              : `${amount}% of base salary`
            : '-'}
        </div>
      ),
    },
    {
      title: 'Applied to',
      dataIndex: 'applicableTo',
      key: 'applicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div data-testid="benefit-type-applicable" className="text-xs truncate">
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
            data-testid={`benefit-type-status-${record.id}`}
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
          <div data-testid={`benefit-type-actions-${record.id}`}>
            <ActionButtons
              id={record?.id ?? null}
              onEdit={() => handleBenefitEdit(record)}
              onDelete={() => handleDelete(record.id)}
            />
          </div>
        </AccessGuard>
      ),
    },
  ];

  const paginatedData = tableData.slice(
    (benefitCurrentPage - 1) * benefitPageSize,
    benefitCurrentPage * benefitPageSize,
  );

  return (
    <div data-testid="benefit-type-table-container">
      <Spin spinning={isLoading} data-testid="benefit-type-table-loading">
        <div className="flex overflow-x-auto scrollbar-none w-full ">
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="benefit-type-table"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={tableData.length}
            pageSize={benefitPageSize}
            onChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
            onShowSizeChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
          />
        ) : (
          <CustomPagination
            current={benefitCurrentPage}
            total={tableData.length}
            pageSize={benefitPageSize}
            onChange={(page, size) => {
              setBenefitCurrentPage(page);
              setBenefitPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setBenefitPageSize(size);
              setBenefitCurrentPage(1);
            }}
          />
        )}
        {/* <CustomPagination
          current={benefitCurrentPage}
          total={tableData.length}
          pageSize={benefitPageSize}
          onChange={(page, size) => {
            setBenefitCurrentPage(page);
            setBenefitPageSize(size);
          }}
          onShowSizeChange={(size) => {
            setBenefitPageSize(size);
            setBenefitCurrentPage(1);
          }}
          data-testid="benefit-type-pagination"
        /> */}
      </Spin>
    </div>
  );
};

export default BenefitTypeTable;
