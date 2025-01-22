import React, { useEffect, useState } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const AllAllowanceTable = ({ searchQuery }: { searchQuery: string }) => {
  const { data: allCompensationsData, isLoading } = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useAllAllowanceStore();

  const [employeeNameMap, setEmployeeNameMap] = useState<{
    [key: string]: string;
  }>({});

  // Extract and process data
  const allAllowanceEntitlementData = Array.isArray(allCompensationsData)
    ? allCompensationsData.filter(
        (allowanceEntitlement: any) =>
          allowanceEntitlement.type === 'ALLOWANCE',
      )
    : [];

  const allEntitlementData = Array.isArray(allAllowanceEntitlementData)
    ? allAllowanceEntitlementData.reduce(
        (acc: any, benefit: any) =>
          acc.concat(benefit.compensationItmeEntitlement),
        [],
      )
    : [];

  const groupByEmployeeId = allEntitlementData.reduce((acc: any, item: any) => {
    if (!acc[item.employeeId]) {
      acc[item.employeeId] = { employeeId: item.employeeId, allowance: [] };
    }
    acc[item.employeeId].allowance.push({
      compensationItemId: item?.compensationItemId,
      totalAmount: item?.totalAmount,
    });
    return acc;
  }, {});

  const result = Object.values(groupByEmployeeId ?? {});

  const dataSource = result.map((employee: any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
    };
    employee.allowance.forEach((allowance: any) => {
      dataRow[allowance.compensationItemId] = allowance.totalAmount;
    });
    return dataRow;
  });

  // Fetch and map employee names for filtering
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      const nameMap: { [key: string]: string } = {};
      for (const row of dataSource) {
        const employeeId = row.employeeId;
        const { data: employeeName } = useGetEmployee(employeeId); // Assuming EmployeeDetails has a method to fetch the name
        nameMap[employeeId] = employeeName;
      }
      setEmployeeNameMap(nameMap);
    };

    fetchEmployeeNames();
  }, [dataSource]);

  const filteredDataSource = dataSource.filter((employee: any) => {
    const name = employeeNameMap[employee.employeeId]?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (notused: any, record: any) => (
        <EmployeeDetails empId={record?.employeeId} />
      ),
    },
    ...(Array.isArray(allAllowanceEntitlementData)
      ? allAllowanceEntitlementData.map((item: any) => ({
          title: item?.name,
          dataIndex: item?.id,
          key: item?.id,
          render: (text: string) => <div>{text || '-'}</div>,
        }))
      : []),
  ];

  return (
    <Spin spinning={isLoading}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={filteredDataSource}
        pagination={{
          current: currentPage,
          pageSize,
          total: dataSource.length,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default AllAllowanceTable;
