import React from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import DeductionEntitlementSideBar from './deductionEntitlementSidebar';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';

const AllowanceEntitlementTable = () => {
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllowanceEntitlementStore();
  const { isMobile, isTablet } = useIsMobile();
  const { mutate: deleteAllowanceEntitlement } =
    useDeleteAllowanceEntitlement();
  const { id } = useParams();
  const {
    data: allowanceEntitlementData,
    isLoading: fiscalActiveYearFetchLoading,
  } = useFetchAllowanceEntitlements(id);

  const transformedData =
    allowanceEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      ApplicableTo: item.compensationItem.applicableTo,
    })) || [];

  const handleDelete = (id: string) => {
    deleteAllowanceEntitlement(id);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      render: (userId: string) => <EmployeeDetails empId={userId} />,
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => <div>{isRate ? 'Rate' : 'Fixed'}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string) => <div>{text ? `${text}` : '-'}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceEntitlement,
            Permissions.DeleteAllowanceEntitlement,
          ]}
        >
          <ActionButtons
            id={record?.id ?? null}
            onEdit={() => {}}
            disableEdit
            onDelete={() => handleDelete(record.id)}
          />
        </AccessGuard>
      ),
    },
  ];

  return (
    <Spin spinning={fiscalActiveYearFetchLoading}>
      <div className="overflow-x-auto scrollbar-hide">
        <Table
          className="mt-6"
          columns={columns}
          dataSource={transformedData}
          pagination={false}
        />
      </div>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={transformedData.length}
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
          total={transformedData.length}
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
      <DeductionEntitlementSideBar />
    </Spin>
  );
};

export default AllowanceEntitlementTable;
