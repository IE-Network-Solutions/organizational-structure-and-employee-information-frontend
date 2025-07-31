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
        <div onClick={() => handleEmployeeData(record)}>
          {' '}
          <EmployeeDetails empId={record?.userId} />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      width: 100,
      render: (isRate: string) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      sorter: true,
      width: 100,
      render: (mode: string) => (
        <div>{mode == 'CREDIT' ? 'Credit' : 'Debit'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      width: 150,
      render: (amount: string, record) => (
        <div>
          {amount
            ? record.isRate
              ? `${amount}% of base salary`
              : `${amount} ETB`
            : '-'}
        </div>
      ),
    },
    {
      title: 'Applicable To',
      dataIndex: 'ApplicableTo',
      key: 'ApplicableTo',
      sorter: true,
      render: (applicableTo: string) => (
        <div>
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
        <AccessGuard
          permissions={[
            Permissions.UpdateBenefitEntitlement,
            Permissions.DeleteBenefitEntitlement,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            disableEdit={false}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
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
    <Spin spinning={isLoading}>
      {employeeBenefitData == null ? (
        <>
          <div className="overflow-x-auto scrollbar-hide">
            <Table
              className="mt-6"
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
            />
          </div>
          {isMobile || isTablet ? (
            <CustomMobilePagination
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
          ) : (
            <CustomPagination
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
          )}
        </>
      ) : (
        <BenefitTracking />
      )}
      <BenefitEntitlementSideBar title={title} />
      <BenefitEntitlementSideBarEdit title={title} />
    </Spin>
  );
};

export default BenefitEntitlementTable;
