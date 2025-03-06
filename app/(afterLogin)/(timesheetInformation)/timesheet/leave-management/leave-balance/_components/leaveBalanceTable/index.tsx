'use client';

import { Avatar, Table, TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';

type NewUserData = {
  leaveType: string;
  accrued: number | null;
  balance: number | null;
  carriedOver: number | null;
  totalBalance: number | null;
};

const EmpRender: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    isLoading,
    data: employeeData,
    isError,
  } = useGetSimpleEmployee(userId);

  if (isLoading) return <div>...</div>;
  if (isError || !employeeData) return <>-</>;

  return (
    <div className="flex items-center gap-1.5">
      <Avatar size={24} icon={<UserOutlined />} />
      <div className="flex-1">
        <div className="text-xs text-gray-900 flex gap-2">
          {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
          {employeeData?.lastName || '-'}
        </div>
        <div className="text-[10px] leading-4 text-gray-600">
          {employeeData?.email || '-'}
        </div>
      </div>
    </div>
  );
};

const LeaveBalanceTable: React.FC = () => {
  const { userId } = useLeaveBalanceStore();
  const { data: leaveBalanceData, isLoading: leaveBalanceIsLoading } =
    useGetLeaveBalance(userId);

  const columns: TableColumnsType<NewUserData> = [
    {
      title: 'Leave Name',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Accrued',
      dataIndex: 'accrued',
      key: 'accrued',
    },
    {
      title: 'Entitled Balance',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: 'Carried Over',
      dataIndex: 'carriedOver',
      key: 'carriedOver',
    },
    {
      title: 'Total Balance',
      dataIndex: 'totalBalance',
      key: 'totalBalance',
    },
  ];

  const dataSource =
    leaveBalanceData?.items?.map((item, index) => ({
      key: index,
      leaveType: item?.leaveType?.title || '-',
      accrued: item?.accrued || 0,
      balance: item?.balance || 0,
      carriedOver: item?.carriedOver || 0,
      totalBalance: item?.totalBalance || 0,
    })) || [];

  return (
    <>
      {leaveBalanceData && (
        <EmpRender userId={leaveBalanceData?.items?.[0]?.userId} />
      )}
      <Table
        className="mt-6"
        columns={columns}
        dataSource={dataSource}
        loading={leaveBalanceIsLoading}
        locale={{
          emptyText: userId ? undefined : <h3>Please Select User</h3>,
        }}
      />
    </>
  );
};

export default LeaveBalanceTable;
