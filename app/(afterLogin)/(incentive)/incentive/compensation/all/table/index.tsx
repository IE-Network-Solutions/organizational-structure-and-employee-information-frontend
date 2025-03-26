'use client';
import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Avatar, Table, TableColumnsType, Tooltip } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useRouter } from 'next/navigation';

const columns: TableColumnsType<any> = [
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
  const router = useRouter();
  const { searchParams, currentPage, pageSize, setCurrentPage, setPageSize } =
    useIncentiveStore();
  const { data: incentiveData, isLoading: responseLoading } =
    useGetAllIncentiveData(
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession,
      searchParams?.byMonth || '',
      pageSize,
      currentPage,
    );
  const { data: employeeData } = useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const allIncentiveTableData =
    responseLoading || incentiveData?.items?.length < 0
      ? []
      : incentiveData?.items?.map((item: AllIncentiveData) => {
          return {
            id: item?.id,
            userId: item?.userId,
            recognition: item?.recognitionType || '--',
            employee_name: (
              <Tooltip>
                <div className="flex flex-wrap items-center justify-start gap-3">
                  <Avatar icon={<UserOutlined />} />
                  <span>
                    {getEmployeeInformation(item?.userId)?.firstName +
                      '  ' +
                      getEmployeeInformation(item?.userId)?.middleName}
                  </span>
                </div>
              </Tooltip>
            ),
            role: getEmployeeInformation(item?.userId)?.role?.name,
            criteria: item?.breakdown?.map((criterion, index) => (
              <div
                key={criterion?.criterionKey || index}
                className="rounded-xl p-3 mx-2 bg-[#D3E4F0] text-[#1D9BF0] font-semibold inline-block flex-wrap"
              >
                {criterion?.criterionKey}
              </div>
            )),
            bonus: (
              <div>
                {item?.amount} {''}ETB
              </div>
            ),
            status: (
              <div className="rounded-lg px-3 py-2 mx-2 bg-[#D3E4F0] text-[#1D9BF0] font-semibold inline-block">
                {item?.isPaid ? (
                  <span className="font-semibold text-md">Paid</span>
                ) : (
                  <span className="text-[#E03137] font-semibold text-md">
                    Not Paid
                  </span>
                )}
              </div>
            ),
          };
        });

  return (
    <div className="m-1">
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
        onRow={(record) => ({
          onClick: () => {
            router.push(`/incentive/detail/${record?.id}`);
          },
        })}
      />
    </div>
  );
};

export default AllIncentiveTable;
