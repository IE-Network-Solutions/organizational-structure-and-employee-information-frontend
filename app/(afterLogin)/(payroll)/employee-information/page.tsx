'use client';
import {
  Table,
  Tag,
  Button,
  Space,
  Spin,
  Avatar,
  Typography,
  Breadcrumb,
  Card,
  Divider,
  Pagination,
  Dropdown,
} from 'antd';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import { MdOutlineEdit } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';
import Filters from './_components/filters';
import { useRouter } from 'next/navigation';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetEmployeeInfo } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';

const { Title, Text } = Typography;

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
        salary:
          typeof activeSalary === 'number'
            ? activeSalary.toLocaleString()
            : activeSalary,
        allowances: allowanceMap?.[employee?.id] || [],
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
      width: 250,
      render: (text: string, record: any) => (
        <Space
          data-cy={`payroll-employee-card-view-space-${record.key}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Avatar
            data-cy={`payroll-employee-avatar-view-component-${record.key}`}
            size={32}
            src={record.profileImage}
            icon={<UserOutlined />}
          />
          <Text
            id={`payroll-employee-name-view-text-${record.key}`}
            data-cy={`payroll-employee-name-view-text-${record.key}`}
            style={{ fontSize: '14px', color: '#262626' }}
          >
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Job Information',
      dataIndex: 'job',
      key: 'job',
      width: 400,
      render: (text: string) => (
        <Text
          style={{ fontSize: '14px', color: '#595959', whiteSpace: 'nowrap' }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'Basic Salary',
      dataIndex: 'salary',
      key: 'salary',
      width: 150,
    },
    {
      title: 'Entitled Allowance',
      dataIndex: 'allowances',
      key: 'allowances',
      width: 300,
      render: (allowances: any, record: any) => (
        <Space wrap size={[4, 4]}>
          {allowances.map((item: any, idx: number) => (
            <Tag
              key={`${record.key}-${item.id || idx}`}
              id={`payroll-allowance-${item?.id}-view-tag`}
              data-cy={`payroll-allowance-${item?.id}-view-tag`}
              style={{
                borderRadius: '4px',
                margin: 0,
                fontSize: '13px',
                color: '#595959',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                fontWeight: 500,
              }}
            >
              {item.name || item}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
      width: 150,
      render: (text: any) => (
        <span
          id={`payroll-bank-name-view-text-${text}`}
          data-cy={`payroll-bank-name-view-text-${text}`}
          style={{ color: text === 'Not Available' ? 'red' : 'black' }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Account Number',
      dataIndex: 'account',
      key: 'account',
      width: 180,
      render: (text: any) => (
        <span
          id={`payroll-bank-account-view-text-${text}`}
          data-cy={`payroll-bank-account-view-text-${text}`}
          style={{ color: text === 'Not Available' ? 'red' : 'black' }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (record: any) => (
        <Space
          id={`payroll-action-controls-view-space-${record.key}`}
          data-cy={`payroll-action-controls-view-space-${record.key}`}
          size="middle"
        >
          <AccessGuard
            id={`payroll-edit-guard-view-component-${record.key}`}
            data-cy={`payroll-edit-guard-view-component-${record.key}`}
            permissions={[Permissions.UpdateAllowanceEntitlement]}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              data-cy="payroll-employee-row-actions-dropdown-wrapper"
            >
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'view',
                      label: (
                        <span
                          style={{ fontSize: '14px', color: '#262626' }}
                          data-cy="payroll-employee-row-action-view"
                        >
                          View Detail
                        </span>
                      ),
                      icon: (
                        <EyeOutlined
                          style={{ fontSize: '16px', color: '#595959' }}
                        />
                      ),
                      onClick: () => handleDetail(record),
                    },
                    {
                      key: 'edit',
                      label: (
                        <span
                          style={{ fontSize: '14px', color: '#262626' }}
                          data-cy="payroll-employee-row-action-edit"
                        >
                          Edit
                        </span>
                      ),
                      icon: (
                        <MdOutlineEdit
                          style={{ fontSize: '16px', color: '#595959' }}
                        />
                      ),
                      onClick: () => handleEdit(record),
                    },
                  ],
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  id={`payroll-edit-allowance-click-button-${record.key}`}
                  data-cy={`payroll-edit-allowance-click-button-${record.key}`}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    padding: 0,
                  }}
                  icon={
                    <BsThreeDots
                      style={{
                        color: '#000',
                        fontSize: '20px',
                        transform: 'translateY(1px)', // Fine-tune vertical centering
                      }}
                    />
                  }
                />
              </Dropdown>
            </div>
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

  return (
    <div
      className="responsive-container"
      style={{
        padding: '24px 0',
        backgroundColor: '#fff',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
      id="payroll-employee-information-view-container"
      data-cy="payroll-employee-information-view-container"
    >
      <style data-cy="payroll-employee-information-page-styles">{`
        .page-title { font-size: 20px !important; margin-bottom: 4px !important; }
        .responsive-container .ant-card-body { padding: 24px !important; }
        
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          color: #8c8c8c !important;
          font-weight: 500 !important;
          font-size: 13px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .table-row-gray {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #f0f5ff !important;
        }

        /* Hide horizontal scrollbar while keeping scroll functionality */
        .ant-table-content::-webkit-scrollbar {
          display: none;
        }
        .ant-table-content {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        @media (max-width: 768px) {
          .page-title { font-size: 18px !important; }
          .responsive-container { padding: 16px !important; }
          .responsive-container .ant-card-body { padding: 16px 0 !important; }
          .breadcrumb-container { padding: 0 !important; }
          .filter-container { padding: 0 16px !important; }
          .pagination-container { padding: 0 16px !important; }
        }

        .custom-pagination {
          display: flex !important;
          width: 100% !important;
          justify-content: flex-start !important;
          align-items: center !important;
        }
        .custom-pagination .ant-pagination-options {
          margin-left: auto !important;
          display: flex;
          align-items: center;
        }
        .custom-pagination .ant-pagination-options-quick-jumper {
          color: #8c8c8c;
          font-size: 13px;
        }
        .custom-pagination .ant-pagination-options-quick-jumper input {
          border-radius: 4px;
        }
      `}</style>

      <Title
        level={2}
        className="page-title"
        style={{ fontWeight: 600 }}
        data-cy="payroll-employee-information-title"
      >
        Employee Payroll Information
      </Title>

      <div className="breadcrumb-container" data-cy="payroll-employee-information-breadcrumb-container">
        <Breadcrumb
          style={{ marginBottom: '20px', fontSize: '13px' }}
          data-cy="payroll-employee-information-breadcrumb"
        >
          <Breadcrumb.Item>Payroll</Breadcrumb.Item>
          <Breadcrumb.Item>Employee Payroll Information</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <Divider
        style={{ margin: '0 0 24px 0', borderColor: '#f0f0f0' }}
        data-cy="payroll-employee-information-header-divider"
      />

      <Card
        bordered
        style={{
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          boxShadow: 'none',
        }}
        bodyStyle={{ padding: '24px' }}
        data-cy="payroll-employee-information-card"
      >
        <div className="filter-container" data-cy="payroll-employee-information-filter-container">
          <Filters
            data-cy="payroll-employee-information-filter-interact-component"
            onSearch={handleSearch}
          />
        </div>

        <Spin
          spinning={responseLoading || Loading}
          data-cy="payroll-employee-information-loading-view-spin"
        >
          <Table
            id="payroll-employee-information-view-table"
            data-cy="payroll-employee-information-view-table"
            dataSource={paginatedData}
            columns={columns}
            rowClassName={(record, index) =>
              index % 2 !== 0 ? 'table-row-gray' : ''
            }
            onRow={(record) => ({
              onClick: () => handleDetail(record),
              style: { cursor: 'pointer' },
            })}
            pagination={false}
            scroll={{ x: 'max-content' }}
            style={{ marginBottom: '24px' }}
          />

          <div
            className="pagination-container"
            style={{ marginTop: '24px' }}
            data-cy="payroll-employee-information-pagination-wrapper"
          >
            <Pagination
              className="custom-pagination"
              current={currentPage}
              total={filteredData?.length || 0}
              pageSize={pageSize}
              onChange={onPageChange}
              showSizeChanger={false}
              showQuickJumper
              itemRender={(page, type, originalElement) => {
                if (type === 'jump-prev' || type === 'jump-next') return '...';
                return originalElement;
              }}
              data-cy="payroll-employee-information-pagination"
            />
          </div>
        </Spin>
      </Card>
      <Drawer data-cy="payroll-employee-information-drawer-view-component" />
    </div>
  );
};

export default EmployeeInformation;
