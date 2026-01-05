import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitEntitlementSideBar from './benefitEntitlementSidebar';
import { useFetchBenefitEntitlement } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useDeleteBenefitEntitlement } from '@/store/server/features/compensation/benefit/mutations';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import BenefitEntitlementSideBarEdit from './benefitEntitlementSidebarEdit';
import BenefitTracking from './benefitTracker';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
type BenefitPropTypes = {
  title: string;
};
const BenefitEntitlementTable: React.FC<BenefitPropTypes> = ({ title }) => {
  const {
    setIsBenefitEntitlementSidebarUpdateOpen,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setEditBenefitData,
  } = useBenefitEntitlementStore();
  const { isMobile, isTablet } = useIsMobile();
  const { mutate: deleteBenefitEntitlement } = useDeleteBenefitEntitlement();
  const { id } = useParams();
  const { data: benefitEntitlementsData, isLoading } =
    useFetchBenefitEntitlement(id);
  const { searchQuery } = useAllowanceEntitlementStore();
  const { employeeBenefitData, setEmployeeBenefitData } =
    useBenefitEntitlementStore();
  const transformedData = Array.isArray(benefitEntitlementsData)
    ? benefitEntitlementsData.map((item: any) => ({
        id: item.id,
        userId: item.employeeId,
        isRate: item.compensationItem.isRate,
        Amount: item.totalAmount,
        ApplicableTo: item.compensationItem.applicableTo,
        mode: item.compensationItem.mode,
      }))
    : [];
  const handleDelete = (id: string) => {
    deleteBenefitEntitlement(id);
  };
  const handleEdit = (record: any) => {
    setEditBenefitData(record);
    setIsBenefitEntitlementSidebarUpdateOpen(true);
  };
  const handleEmployeeData = (data: any) => {
    setEmployeeBenefitData(data);
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (rule: any, record: any) => (
        <div
          onClick={() => handleEmployeeData(record)}
          id={`compensation-benefit-entitlement-employee-${record?.userId}`}
          data-cy={`compensation-benefit-entitlement-employee-${record?.userId}`}
        >
          {' '}
          <EmployeeDetails
            data-cy={`compensation-benefit-entitlement-employee-details-${record?.userId}`}
            empId={record?.userId}
          />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      width: 100,
      render: (isRate: string) => (
        <div
          id="compensation-benefit-entitlement-type-display"
          data-cy="compensation-benefit-entitlement-type-display"
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
      width: 100,
      render: (mode: string) => (
        <div
          id="compensation-benefit-entitlement-mode-display"
          data-cy="compensation-benefit-entitlement-mode-display"
        >
          {mode == 'CREDIT' ? 'Credit' : 'Debit'}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      width: 150,
      render: (amount: string, record) => (
        <div
          id={`compensation-benefit-entitlement-amount-${record?.id}`}
          data-cy={`compensation-benefit-entitlement-amount-${record?.id}`}
        >
          {amount
            ? record.isRate
              ? `${amount}% of base salary`
              : `${amount} ETB`
            : '-'}
        </div>
      ),
    },
    {
      title: <span className="truncate">Applicable To</span>,
      dataIndex: 'ApplicableTo',
      key: 'ApplicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div
          id="compensation-benefit-entitlement-applicable-display"
          data-cy="compensation-benefit-entitlement-applicable-display"
        >
          {applicableTo === 'PER-EMPLOYEE'
            ? 'Selected Employee'
            : 'All Employees'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <div
          id={`compensation-benefit-entitlement-actions-${record?.id}`}
          data-cy={`compensation-benefit-entitlement-actions-${record?.id}`}
        >
          <AccessGuard
            data-cy="compensation-benefit-entitlement-actions-access-guard"
            permissions={[
              Permissions.UpdateBenefitEntitlement,
              Permissions.DeleteBenefitEntitlement,
            ]}
          >
            <ActionButtons
              data-cy="compensation-benefit-entitlement-actions-button"
              id={record?.id ?? null}
              disableEdit={false}
              onEdit={() => handleEdit(record)}
              onDelete={() => handleDelete(record.id)}
            />
          </AccessGuard>
        </div>
      ),
    },
  ];

  const filteredDataSource = searchQuery
    ? transformedData.filter((employee: any) => employee.userId === searchQuery)
    : transformedData;

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      id="compensation-benefit-entitlement-table-container"
      data-cy="compensation-benefit-entitlement-table-container"
    >
      <Spin
        data-cy="compensation-benefit-entitlement-table-loading"
        spinning={isLoading}
      >
        {employeeBenefitData == null ? (
          <>
            <div
              className="overflow-x-auto scrollbar-hide"
              id="compensation-benefit-entitlement-table-scroll"
              data-cy="compensation-benefit-entitlement-table-scroll"
            >
              <Table
                data-cy="compensation-benefit-entitlement-table"
                className="mt-6"
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
              />
            </div>
            {isMobile || isTablet ? (
              <div
                id="compensation-benefit-entitlement-mobile-pagination"
                data-cy="compensation-benefit-entitlement-mobile-pagination"
              >
                <CustomMobilePagination
                  data-cy="compensation-benefit-entitlement-mobile-pagination"
                  totalResults={filteredDataSource.length}
                  pageSize={pageSize}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  onShowSizeChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                />
              </div>
            ) : (
              <div
                id="compensation-benefit-entitlement-pagination"
                data-cy="compensation-benefit-entitlement-pagination"
              >
                <CustomPagination
                  data-cy="compensation-benefit-entitlement-pagination"
                  current={currentPage}
                  total={filteredDataSource.length}
                  pageSize={pageSize}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  onShowSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div
            id="compensation-benefit-tracking-container"
            data-cy="compensation-benefit-tracking-container"
          >
            <BenefitTracking data-cy="compensation-benefit-tracking" />
          </div>
        )}
        <div
          id="compensation-benefit-sidebar-create"
          data-cy="compensation-benefit-sidebar-create"
        >
          <BenefitEntitlementSideBar
            data-cy="compensation-benefit-sidebar-create"
            title={title}
          />
        </div>
        <div
          id="compensation-benefit-sidebar-edit"
          data-cy="compensation-benefit-sidebar-edit"
        >
          <BenefitEntitlementSideBarEdit
            data-cy="compensation-benefit-sidebar-edit"
            title={title}
          />
        </div>
      </Spin>
    </div>
  );
};

export default BenefitEntitlementTable;
