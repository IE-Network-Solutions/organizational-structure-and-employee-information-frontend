'use client';
import { useGetIncentiveDataByRecognitionId } from '@/store/server/features/incentive/other/queries';
import {
  AllIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Avatar, Table, TableColumnsType, Tooltip } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useRouter } from 'next/navigation';

export type IncentiveTableDataParams = {
  recognition: string;
  employee_name: React.ReactNode;
  criteria: React.ReactNode;
  bonus: React.ReactNode;
  status: React.ReactNode;
  id: string;
};

const columns: TableColumnsType<IncentiveTableDataParams> = [
  {
    title: 'Recognition',
    dataIndex: 'recognition',
    sorter: (a, b) => a.recognition.localeCompare(b.recognition),
  },
  {
    title: 'Employees',
    dataIndex: 'employee_name',
    sorter: (a, b) =>
      String(a.employee_name).localeCompare(String(b.employee_name)),
  },
  {
    title: 'Criteria',
    dataIndex: 'criteria',
    sorter: (a, b) => String(a.criteria).localeCompare(String(b.criteria)),
  },
  {
    title: 'Bonus',
    dataIndex: 'bonus',
    sorter: (a, b) => String(a.bonus).localeCompare(String(b.bonus)),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => String(a.status).localeCompare(String(b.status)),
  },
];

interface IncentiveTableDetailsProps {
  id: string;
}

const IncentiveTableAfterGenerate: React.FC<IncentiveTableDetailsProps> = ({
  id,
}) => {
  const router = useRouter();

  const {
    searchParams,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useIncentiveStore();

  const recognitionsTypeId = id;

  const { data: dynamicRecognitionData, isLoading: responseLoading } =
    useGetIncentiveDataByRecognitionId(
      recognitionsTypeId,
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession,
      searchParams?.byMonth || '',
      pageSize,
      currentPage,
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const { data: employeeData } = useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const IncentiveByRecognitionTypeTableData =
    responseLoading || dynamicRecognitionData?.items?.length < 0
      ? []
      : dynamicRecognitionData?.items?.map((item: AllIncentiveData) => {
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
                className="rounded-xl p-3 mx-2 bg-[#D3E4F0] text-[#1D9BF0] font-semibold inline-block"
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
    <div>
      <Table
        rowSelection={{ type: 'checkbox', ...rowSelection }}
        rowKey="id"
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={IncentiveByRecognitionTypeTableData}
        pagination={{
          total: dynamicRecognitionData?.meta?.totalItems,
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

export default IncentiveTableAfterGenerate;
