import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Avatar, Table, TableColumnsType, Tooltip } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';

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
const IncentiveTableAfterGenerate: React.FC = () => {
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
      employee_name: (
        <Tooltip>
          <div className="flex flex-wrap items-center justify-start gap-3">
            <Avatar icon={<UserOutlined />} />
            <span>{item?.employee_name}</span>
          </div>
        </Tooltip>
      ),
      role: item?.role,
      criteria: (
        <div className="rounded-xl p-3 mx-2 bg-[#D3E4F0] text-[#1D9BF0] font-semibold inline-block">
          {item?.criteria}
        </div>
      ),
      bonus: (
        <div>
          {item?.bonus} {''}ETB
        </div>
      ),
      status: (
        <div className="rounded-xl p-1 mx-2 bg-[#D3E4F0] text-[#1D9BF0] font-semibold inline-block">
          {item?.status}
        </div>
      ),
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

export default IncentiveTableAfterGenerate;
