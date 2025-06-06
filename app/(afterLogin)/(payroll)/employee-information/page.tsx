'use client';
import { Table, Tag, Button, Space, Spin, Avatar } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import Filters from './_components/filters';
import { useRouter } from 'next/navigation';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetEmployeeInfo } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';

interface Employee {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  basicSalaries: { status: boolean; basicSalary: number }[];
  employeeJobInformation: {
    position: {
      name: string;
    };
  }[];
  employeeInformation: {
    bankInformation: {
      bankName?: string;
      accountNumber?: string;
    };
  };
  profileImage?: string;
}

interface DataSource {
  key: string;
  name: string;
  profileImage?: string;
  job: string;
  salary: string;
  allowances: string[];
  bank: string;
  account: string;
}

interface CompensationItemEntitlement {
  id: string;
  employeeId: string;
  active: boolean;
}

interface AllowanceDataItem {
  type: string;
  name: string;
  id: string;
  applicableTo?: string;
  compensationItmeEntitlement?: CompensationItemEntitlement[];
}

interface AllowanceMap {
  [key: string]: any[];
}

const EmployeeInformation = () => {
  const router = useRouter();
  const { searchValue } = useEmployeeManagementStore();
  const { pageSize, currentPage, setCurrentPage, setPageSize } =
    usePayrollStore();
  const {
    openDrawer,
    setSelectedPayrollData,
    setSelectedAllowance,
    setIsEditMode,
    setSearchText,
  } = useDrawerStore();
  const {
    data: EmployeeData,
    isLoading: responseLoading,
    refetch,
  } = useGetEmployeeInfo();
  const { data: AllowanceData, isLoading: Loading } = useGetAllowance();

  const handleEdit = (record: any) => {
    setSelectedPayrollData(record);
    setSelectedAllowance(record);
    openDrawer();
    setIsEditMode(true);
  };
  const employeeIds = EmployeeData?.map((item: Employee) => item.id) ?? [];

  const allowanceMap: AllowanceMap = (AllowanceData ?? [])
    .filter(
      (item: AllowanceDataItem) =>
        item?.type === 'ALLOWANCE' || item?.applicableTo === 'GLOBAL',
    )
    .reduce((acc: AllowanceMap, item: AllowanceDataItem) => {
      if (item?.applicableTo === 'GLOBAL') {
        employeeIds.forEach((employeeId: string) => {
          acc[employeeId] = acc[employeeId] || [];
          acc[employeeId].push({ name: item.name, id: item.id });
        });
      } else {
        item?.compensationItmeEntitlement?.forEach(
          (entitlement: CompensationItemEntitlement) => {
            if (entitlement.active) {
              acc[entitlement.employeeId] = acc[entitlement.employeeId] || [];
              acc[entitlement.employeeId].push({
                entitlementId: entitlement.id,
                name: item.name,
                id: item.id,
              });
            }
          },
        );
      }

      return acc;
    }, {} as AllowanceMap);

  const dataSource: DataSource[] =
    EmployeeData?.map((employee: Employee) => {
      const activeSalary =
        employee.basicSalaries.find((salary) => salary.status === true)
          ?.basicSalary || 'Not Available';
      const position =
        employee.employeeJobInformation[0]?.position?.name || 'Not Available';

      return {
        key: employee.id,
        name: `${employee?.firstName} ${employee?.middleName || ''} ${employee?.lastName}`.trim(),
        profileImage: employee.profileImage,
        job: `${position}`,
        salary: `${activeSalary} ETB`,
        allowances: allowanceMap?.[employee?.id] || ['Not Specified'],
        bank:
          employee.employeeInformation?.bankInformation?.bankName ||
          'Not Available',
        account:
          employee.employeeInformation?.bankInformation?.accountNumber ||
          'Not Available',
      };
    }) || [];

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} src={record.profileImage} icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Job Information',
      dataIndex: 'job',
      key: 'job',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: 'Entitled Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (allowances: any) =>
        allowances.map((item: any) => {
          const color = item === 'Not Entitled' ? 'red' : 'gray-300';
          return (
            <Tag className={`${color} text-sm text-black`} key={item}>
              {item.name}
            </Tag>
          );
        }),
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
      render: (text: any) => (
        <span style={{ color: text === 'Not Available' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Account Number',
      dataIndex: 'account',
      key: 'account',
      render: (text: any) => (
        <span style={{ color: text === 'Not Available' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <Space size="middle">
          <AccessGuard permissions={[Permissions.UpdateAllowanceEntitlement]}>
            <Button
              type="primary"
              icon={
                <EditOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(record);
                  }}
                />
              }
            />
          </AccessGuard>
        </Space>
      ),
    },
  ];

  const handleDetail = (value: any) => {
    router.push(`/employee-information/${value.key}`);
  };

  const handleSearch = (searchValues: any) => {
    if (searchValues?.employeeId) {
      setSearchText(searchValues.employeeId);
    } else {
      setSearchText('');
    }
    refetch();
  };

  const { isMobile, isTablet } = useIsMobile();

  const filteredData = dataSource.filter((item) =>
    searchValue ? item.key === searchValue : true,
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  return (
    <div className={isMobile ? 'p-1' : 'p-5'}>
      <div className="flex justify-start items-center bg-gray-100 -mx-1">
        <span className="py-4 my-4 px-2 text-lg font-bold">
          Employees Payroll Information
        </span>
      </div>
      <Filters onSearch={handleSearch} />

      <Spin spinning={responseLoading || Loading}>
        <Table
          dataSource={paginatedData}
          columns={columns}
          onRow={(record) => ({
            onClick: () => handleDetail(record),
            style: { cursor: 'pointer' },
          })}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={filteredData?.length || 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
          />
        ) : (
          <CustomPagination
            current={currentPage}
            total={filteredData?.length || 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
          />
        )}
      </Spin>
      <Drawer />
    </div>
  );
};

export default EmployeeInformation;
