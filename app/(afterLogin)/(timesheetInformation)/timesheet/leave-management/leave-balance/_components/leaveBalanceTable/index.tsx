'use client';

import { Avatar, Table, TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';

type NewUserData = {
  key: number;
  leaveType: string;
  accrued: number;
  balance: number;
  carriedOver: number;
  totalBalance: number;
  utilizedLeave: number;
  cashValue: number;
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
  const { selectedUserId, leaveTypeId } = useLeaveBalanceStore();
  const { data: leaveBalanceData, isLoading: leaveBalanceIsLoading } =
    useGetLeaveBalance(selectedUserId, leaveTypeId);
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
    {
      title: 'Utilized Leave',
      dataIndex: 'utilizedLeave',
      key: 'utilizedLeave',
    },
    {
      title: 'Cash Value',
      dataIndex: 'cashValue',
      key: 'cashValue',
    },
  ];

  let itemsArray: any[] = [];
  if (Array.isArray(leaveBalanceData?.items)) {
    itemsArray = leaveBalanceData.items;
  } else if (
    leaveBalanceData?.items &&
    typeof leaveBalanceData.items === 'object' &&
    Array.isArray((leaveBalanceData.items as any)?.items)
  ) {
    itemsArray = (leaveBalanceData.items as any).items;
  }
  const dataSource = itemsArray.map((item, index) => {
    // Get cash value directly from the item
    const cashValue = item?.cashValue || 0;
    return {
      key: index,
      leaveType: item?.leaveType?.title || '-',
      accrued: parseFloat(item?.accrued.toFixed(1)) || 0,
      balance: parseFloat(item?.balance.toFixed(1)) || 0,
      carriedOver: parseFloat(item?.carriedOver.toFixed(1)) || 0,
      totalBalance: parseFloat(item?.totalBalance.toFixed(1)) || 0,
      utilizedLeave: parseFloat(item?.utilizedLeave.toFixed(1)) || 0,
      cashValue,
    };
  });

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
          emptyText: selectedUserId ? undefined : <h3>Please Select User</h3>,
        }}
      />
    </>
  );
};

export default LeaveBalanceTable;
