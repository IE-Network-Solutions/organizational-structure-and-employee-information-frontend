import React, { useState } from 'react';
import { Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useFetchAllowances } from '@/store/server/features/compensation/allowance/queries';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation';

const AllAllowanceTable = () => {
  const {data: allCompensationsData} = useFetchAllowances();
  const { currentPage, pageSize, setCurrentPage, setPageSize} = useAllAllowanceStore();
  
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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
        dataSource={dataSource}
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