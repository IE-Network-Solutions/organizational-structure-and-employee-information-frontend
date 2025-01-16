import { useGetAllIncentiveData } from '@/store/server/features/incentive/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Table, TableColumnsType } from 'antd';
import React from 'react';

const columns: TableColumnsType<AllIncentiveData> = [
  {
    title: 'Recognition',
    dataIndex: 'recognition',
    sorter: (a, b) => a.recognition.localeCompare(b.recognition),
  },
  {
    title: 'Employees',
    dataIndex: 'employee_name',
    sorter: (a, b) => a.recognition.localeCompare(b.employee_name),
  },
  {
    title: 'Role',
    dataIndex: 'role',
    sorter: (a, b) => a.recognition.localeCompare(b.role),
  },
  {
    title: 'Criteria',
    dataIndex: 'criteria',
    sorter: (a, b) => a.recognition.localeCompare(b.criteria),
  },
  {
    title: 'Bonus',
    dataIndex: 'bonus',
    sorter: (a, b) => a.recognition.localeCompare(b.bonus),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.recognition.localeCompare(b.status),
  },
];
const AllIncentiveTable: React.FC = () => {
  const { searchParams, currentPage, pageSize, setCurrentPage, setPageSize } =
    useIncentiveStore();
  const { data: incentiveData, isLoading: responseLoading } =
    useGetAllIncentiveData(
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession || '',
      searchParams?.byMonth || '',
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const allIncentiveTableData = incentiveData?.map((item: AllIncentiveData) => {
    return {
      recognition: item?.recognition,
      employee_name: item?.employee_name,
      role: item?.role,
      criteria: item?.criteria,
      bonus: item?.bonus,
      status: item?.status,
    };
  });

  return (
    <div>
      <Table
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={allIncentiveTableData}
        pagination={{
          total: incentiveData?.meta?.totalItems,
          current: currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={responseLoading}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default AllIncentiveTable;
