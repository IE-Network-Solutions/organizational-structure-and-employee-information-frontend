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
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

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
      searchParams?.byRecognition || '',
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
  const { isMobile, isTablet } = useIsMobile();

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
                className=" flex-col flex-wrap inline-block space-x-1 space-y-2"
                key={criterion?.criterionKey || index}
              >
                <span className="inline-block flex-col flex-wrap space-x-1 space-y-1 rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1 my-1">
                  {criterion?.criterionKey}
                </span>
              </div>
            )),
            bonus: (
              <div>
                {item?.amount} {''}ETB
              </div>
            ),
            status: (
              <div className="inline-block">
                {item?.isPaid ? (
                  <div className="rounded-lg bg-[#55C79033] py-1 px-6">
                    <span className="text-[#0CAF60] font-semibold text-md">
                      Paid
                    </span>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[#FFEDEC] py-1 px-4">
                    <span className="text-[#E03137] font-semibold text-md">
                      Not Paid
                    </span>
                  </div>
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
        pagination={false}
        loading={responseLoading}
        scroll={{ x: 1000 }}
        onRow={(record) => ({
          onClick: () => {
            router.push(`/incentives/detail/${record?.id}`);
          },
        })}
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={dynamicRecognitionData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={currentPage}
          total={dynamicRecognitionData?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      )}
    </div>
  );
};

export default IncentiveTableAfterGenerate;
