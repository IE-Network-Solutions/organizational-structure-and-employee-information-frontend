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
        <div
          data-testid="benefit-type-name"
          className="text-xs truncate"
          id="compensation-settings-benefit-type-name"
          data-cy="compensation-settings-benefit-type-name"
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
          data-testid="benefit-type-description"
          className="text-xs truncate"
          id="compensation-settings-benefit-type-description"
          data-cy="compensation-settings-benefit-type-description"
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
        <div
          data-testid="benefit-type-type"
          id="compensation-settings-benefit-type-type"
          data-cy="compensation-settings-benefit-type-type"
        >
          {isRate ? 'Rate' : 'Fixed'}
        </div>
      ),
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      render: (mode: string) => (
        <div
          data-testid="benefit-type-mode"
          id="compensation-settings-benefit-type-mode"
          data-cy="compensation-settings-benefit-type-mode"
        >
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
        <div
          data-testid={`benefit-type-amount-${record.id}`}
          id={`compensation-settings-benefit-type-amount-${record.id}`}
          data-cy={`compensation-settings-benefit-type-amount-${record.id}`}
        >
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
        <div
          data-testid="benefit-type-applicable"
          className="text-xs truncate"
          id="compensation-settings-benefit-type-applicable"
          data-cy="compensation-settings-benefit-type-applicable"
        >
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
          id={`compensation-settings-benefit-type-status-access-guard-${record.id}`}
          data-cy={`compensation-settings-benefit-type-status-access-guard-${record.id}`}
          permissions={[
            Permissions.UpdateAllowanceType,
            Permissions.DeleteAllowanceType,
          ]}
        >
          <Switch
            id={`compensation-settings-benefit-type-status-switch-${record.id}`}
            data-cy={`compensation-settings-benefit-type-status-switch-${record.id}`}
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
          id={`compensation-settings-benefit-type-actions-access-guard-${record.id}`}
          data-cy={`compensation-settings-benefit-type-actions-access-guard-${record.id}`}
          permissions={[
            Permissions.UpdateBenefitType,
            Permissions.DeleteBenefitType,
          ]}
        >
          <div
            data-testid={`benefit-type-actions-${record.id}`}
            id={`compensation-settings-benefit-type-actions-${record.id}`}
            data-cy={`compensation-settings-benefit-type-actions-${record.id}`}
          >
            <ActionButtons
              id={record?.id ?? null}
              onEdit={() => handleBenefitEdit(record)}
              onDelete={() => handleDelete(record.id)}
              data-cy="compensation-settings-benefit-type-actions-buttons"
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
    <div
      data-testid="benefit-type-table-container"
      id="compensation-settings-benefit-type-table-container"
      data-cy="compensation-settings-benefit-type-table-container"
    >
      <Spin
        spinning={isLoading}
        data-testid="benefit-type-table-loading"
        data-cy="compensation-settings-benefit-type-table-loading"
      >
        <div
          className="flex overflow-x-auto scrollbar-none w-full "
          id="compensation-settings-benefit-type-table-scroll"
          data-cy="compensation-settings-benefit-type-table-scroll"
        >
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="benefit-type-table"
            id="compensation-settings-benefit-type-table"
            data-cy="compensation-settings-benefit-type-table"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="compensation-settings-benefit-type-mobile-pagination"
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
            data-cy="compensation-settings-benefit-type-pagination"
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
