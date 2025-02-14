'use client';
import React, { useState } from 'react';
import { Table, Tag, Button, Space, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import Filters from './_components/filters';
import { useRouter } from 'next/navigation';
import Drawer from './_components/drawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetEmployeeInfo } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';

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
}

interface DataSource {
  key: string;
  name: string;
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
  const [searchText, setSearchText] = useState('');

  const router = useRouter();
  const {
    openDrawer,
    setSelectedPayrollData,
    setSelectedAllowance,
    setIsEditMode,
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
        name: `${employee.firstName} ${employee.middleName || ''} ${employee.lastName}`.trim(),
        job: `${position}`,
        salary: `${activeSalary} ETB`,
        allowances: allowanceMap?.[employee.id] || ['Not Specified'],
        bank:
          employee.employeeInformation.bankInformation?.bankName ||
          'Not Available',
        account:
          employee.employeeInformation.bankInformation?.accountNumber ||
          'Not Available',
      };
    }) || [];

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
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
          const color = item === 'Not Entitled' ? 'red' : 'blue';
          return (
            <Tag color={color} key={item}>
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

  return (
    <div className="p-5">
      <h2 className="py-4">Employees Payroll Information</h2>
      <Filters onSearch={handleSearch} />
      <Spin spinning={responseLoading || Loading}>
        <Table
          dataSource={dataSource.filter((item) =>
            searchText ? item.key === searchText : true,
          )}
          columns={columns}
          onRow={(record) => ({
            onClick: () => handleDetail(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Spin>
      <Drawer />
    </div>
  );
};

export default EmployeeInformation;
