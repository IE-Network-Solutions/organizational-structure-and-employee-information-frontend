import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import AllowanceEntitlementSideBar from './allowanceEntitlementSidebar';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useDeleteAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const AllowanceEntitlementTable = () => {
  const { currentPage, pageSize, setCurrentPage, searchQuery, setPageSize } =
    useAllowanceEntitlementStore();
  const { isMobile, isTablet } = useIsMobile();
  const { mutate: deleteAllowanceEntitlement } =
    useDeleteAllowanceEntitlement();
  const { id } = useParams();
  const {
    data: allowanceEntitlementData,
    isLoading: fiscalActiveYearFetchLoading,
  } = useFetchAllowanceEntitlements(id);
  const EmployeeBasicSalary = ({
    id,
    amount,
  }: {
    id: string;
    amount: string;
  }) => {
    const { data, error } = useGetBasicSalaryById(id);
    if (error || !data) {
      return (
        <span
          data-testid="basic-salary-error"
          id="compensation-allowance-basic-salary-error-text"
          data-cy="compensation-allowance-basic-salary-error-text"
        >
          --
        </span>
      );
    }
    const employeeBasicSalary =
      Number(data.find((item: any) => item.status)?.basicSalary) || '--';
    const calculatedSalary =
      typeof employeeBasicSalary === 'number'
        ? (employeeBasicSalary * Number(amount)) / 100
        : '--';
    return (
      <span
        data-testid={`basic-salary-${id}`}
        id={`compensation-allowance-basic-salary-value-${id}`}
        data-cy={`compensation-allowance-basic-salary-value-${id}`}
      >
        {calculatedSalary}
      </span>
    );
  };

  const transformedData =
    allowanceEntitlementData?.map((item: any) => ({
      id: item.id,
      userId: item.employeeId,
      isRate: item.compensationItem.isRate,
      Amount: item.totalAmount,
      defaultAmount: item.compensationItem?.defaultAmount,
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
      render: (userId: string) => (
        <div
          data-testid={`entitlement-employee-${userId}`}
          id={`compensation-allowance-entitlement-employee-${userId}`}
          data-cy={`compensation-allowance-entitlement-employee-${userId}`}
        >
          <EmployeeDetails data-cy="compensation-allowance-entitlement-employee-details" empId={userId} />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => (
        <div
          data-testid="entitlement-type"
          id="compensation-allowance-entitlement-type-display"
          data-cy="compensation-allowance-entitlement-type-display"
        >
          {isRate ? 'Rate' : 'Fixed'}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string, record: any) =>
        !record.isRate ? (
          <div
            data-testid={`entitlement-amount-${record.id}`}
            id={`compensation-allowance-entitlement-amount-${record.id}`}
            data-cy={`compensation-allowance-entitlement-amount-${record.id}`}
          >
            {text ? `${text} ETB` : '-'}
          </div>
        ) : (
          <EmployeeBasicSalary
            data-cy="compensation-allowance-entitlement-basic-salary"
            id={record?.userId}
            amount={record?.defaultAmount}
          />
        ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (rule: any, record: any) => (
        <AccessGuard data-cy="compensation-allowance-entitlement-actions-access-guard" permissions={[Permissions.DeleteAllowanceEntitlement]}>
          <div
            data-testid={`entitlement-actions-${record.id}`}
            id={`compensation-allowance-entitlement-actions-${record.id}`}
            data-cy={`compensation-allowance-entitlement-actions-${record.id}`}
          >
            <ActionButtons
              data-cy="compensation-allowance-entitlement-actions-button"
              id={record?.id ?? null}
              onDelete={() => handleDelete(record.id)}
            />
          </div>
        </AccessGuard>
      ),
    },
  ];

  const filteredDataSource = searchQuery
    ? transformedData.filter(
        (employee: any) =>
          employee.userId?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : transformedData;

  const paginatedData = filteredDataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div
      data-testid="allowance-entitlement-table-container"
      id="compensation-allowance-table-container"
      data-cy="compensation-allowance-table-container"
    >
      <Spin
        spinning={fiscalActiveYearFetchLoading}
        data-testid="entitlement-table-loading"
        data-cy="compensation-allowance-entitlement-table-loading"
      >
        <div
          className="overflow-x-auto"
          id="compensation-allowance-table-scroll-container"
          data-cy="compensation-allowance-table-scroll-container"
        >
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="entitlement-table"
            id="compensation-allowance-table-display"
            data-cy="compensation-allowance-table-display"
          />
        </div>
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="compensation-allowance-entitlement-mobile-pagination"
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
            data-cy="compensation-allowance-entitlement-pagination"
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

        <AllowanceEntitlementSideBar data-cy="compensation-allowance-entitlement-sidebar" />
      </Spin>
    </div>
  );
};

export default AllowanceEntitlementTable;
