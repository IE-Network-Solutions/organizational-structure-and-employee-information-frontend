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
      return <span data-testid="basic-salary-error">--</span>;
    }
    const employeeBasicSalary =
      Number(data.find((item: any) => item.status)?.basicSalary) || '--';
    const calculatedSalary =
      typeof employeeBasicSalary === 'number'
        ? (employeeBasicSalary * Number(amount)) / 100
        : '--';
    return <span data-testid={`basic-salary-${id}`}>{calculatedSalary}</span>;
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
        <div data-testid={`entitlement-employee-${userId}`}>
          <EmployeeDetails empId={userId} />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isRate',
      key: 'isRate',
      sorter: true,
      render: (isRate: string) => (
        <div data-testid="entitlement-type">{isRate ? 'Rate' : 'Fixed'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      sorter: true,
      render: (text: string, record: any) =>
        !record.isRate ? (
          <div data-testid={`entitlement-amount-${record.id}`}>
            {text ? `${text} ETB` : '-'}
          </div>
        ) : (
          <EmployeeBasicSalary
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
        <AccessGuard
          permissions={[
            Permissions.UpdateAllowanceEntitlement,
            Permissions.DeleteAllowanceEntitlement,
          ]}
        >
          <div data-testid={`entitlement-actions-${record.id}`}>
            <ActionButtons
              id={record?.id ?? null}
              onEdit={() => {}}
              disableEdit
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
    <div data-testid="allowance-entitlement-table-container">
      <Spin
        spinning={fiscalActiveYearFetchLoading}
        data-testid="entitlement-table-loading"
      >
        <div className="overflow-x-auto">
          <Table
            className="mt-6"
            columns={columns}
            dataSource={paginatedData}
            pagination={false}
            data-testid="entitlement-table"
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

        <AllowanceEntitlementSideBar />
      </Spin>
    </div>
  );
};

export default AllowanceEntitlementTable;
