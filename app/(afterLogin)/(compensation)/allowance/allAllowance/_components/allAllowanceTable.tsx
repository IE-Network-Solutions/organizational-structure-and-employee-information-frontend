import React, { useState } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';

const AllAllowanceTable = () => {
  const {data: allCompensationsData} = useFetchAllowances();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  const allEntitlementData = Array.isArray(allCompensationsData)
  ? allCompensationsData.reduce(
      (acc: any, benefit: any) => acc.concat(benefit.compensationItmeEntitlement),
      []
    )
  : [];


  const groupByEmployeeId = allEntitlementData?.reduce((acc: any, item: any) => {
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

  const dataSource = result.map((employee:any) => {
    const dataRow: any = {
      key: employee.employeeId,
      employeeId: employee.employeeId,
    };
    employee.allowance.forEach((allowance:any) => {
      dataRow[allowance.compensationItemId] = allowance.totalAmount;
    });
    return dataRow;
  });

  const paginatedData = dataSource.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'dateNaming',
      sorter: true,
      render: (notused:any,record: any) => <EmployeeDetails empId= {record?.employeeId} />,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
  // Dynamically adding columns if allCompensationsData is an array
  ...(Array.isArray(allCompensationsData)
    ? allCompensationsData.map((item: any) => ({
        title: item?.name,
        dataIndex: item?.id,
        key: item?.id,
        render: (text: string) => <div>{text || '-'}</div>,
      }))
    : []),
  ];

  return (
    <Spin spinning={false}>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={paginatedData}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: dataSource.length,
          showSizeChanger: true,
          onChange: handleTableChange,
          showQuickJumper: true,
        }}
      />
    </Spin>
  );
};

export default AllAllowanceTable;