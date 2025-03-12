'use client'

import TabLandingLayout from '@/components/tabLanding'
import { Card, Typography, Table, Input, DatePicker, Select, Tag, Button, Space, Spin, Popconfirm } from 'antd'
import { TeamOutlined, CalculatorOutlined, CheckCircleOutlined, DollarOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries'
import { useDeleteSettlementTrackingByEmployeeId } from '@/store/server/features/payroll/settlementTracking/mutation'
import useSettlementTrackingStore from '@/store/uistate/features/payroll/settlementTracking'
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries'
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries'
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries'

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

// Define interface for the table data
interface EmployeeData {
  key: string;
  avatar: string;
  name: string;
  payPeriod: string;
  totalAmount: string;
  totalPaid: string;
  compensation: string[];
}

interface ProcessedEmployeeData {
  key: string;
  employeeId: string;
  employeeName: string;
  payPeriodId: string;
  payPeriod: string;
  amount: number;
  compensationIds: string[];
  compensationNames: string[];
  isPaid: boolean;
}

function Page() {
  const router = useRouter();
  const { 
    currentPage, 
    pageSize, 
    setPageSize,
    setCurrentPage,
    searchParams,
    setSearchParams
} = useSettlementTrackingStore();
  const { data:settlementTrackingData, isLoading,refetch } = useGetSettlementTracking(searchParams);
  const { data:compensationData, isLoading:compensationLoading } = useGetAllowance();
  const { data:employeeData, isLoading:employeeLoading } = useGetAllUsers();
  const {mutate:deleteSettlementTracking,isLoading:deleteLoading} = useDeleteSettlementTrackingByEmployeeId();
  const {data:payPeriodData, isLoading:payPeriodLoading} = useGetPayPeriod();


  useEffect(()=>{
    refetch();
  },[searchParams])

  const groupByEmployeeId = (data:any) => {
    return data && data.reduce((acc:any, item:any) => {
      const employeeId = item.compensationItemEntitlement.employeeId;
      if (!acc[employeeId]) {
        acc[employeeId] = [];
      }
      acc[employeeId].push(item);
      return acc;
    }, {});
  };
  
  const totalEmployee = new Set(settlementTrackingData?.map((item:any) => 
    item.compensationItemEntitlement.employeeId
  )).size;

  const totalCompensation = new Set(settlementTrackingData?.map((item:any) => 
    item.compensationItemId
  )).size;

  const totalPaidAmount = settlementTrackingData?.reduce((acc:any, item:any) => 
    item.isPaid ? acc + Number(item.amount) : acc, 0
  ) ?? 0;

  const totalDueAmount = settlementTrackingData?.reduce((acc:any, item:any) => 
    !item.isPaid ? acc + Number(item.amount) : acc, 0
  ) ?? 0;

  // Usage
  const grouped = groupByEmployeeId(settlementTrackingData ?? []);
  const dataSource = Object.entries(grouped).map(([key, value]) => ({
    employeeId: key,
    payPeriodId: Array.isArray(value) ? value.map((item:any) => item.payPeriodId) : [],
    amount: Array.isArray(value) ? value.reduce((acc, item) => acc + (Number(item.amount) || 0), 0) : 0,
    totalPaid: Array.isArray(value) ? value.filter((item:any) => item.isPaid)?.reduce((acc:any, item:any) => acc + (Number(item.amount) || 0), 0) : 0,
    compensationIds: Array.isArray(value) ? value.map((item:any) => item.compensationItemId) : [],
    compensationNames: Array.isArray(value) ? value.map(item => item.compensationItemEntitlement.name) : []
  }))

  console.log(grouped,'processSettlementData')
  // Handle delete
  const handleDelete = async (id: string) => {
      await deleteSettlementTracking(id);
  };
  // Pagination state

const getCompensationName = (compensationId:any) => {
  const compensation = compensationData?.find((item:any)=>item.id === compensationId);
  return compensation?.name;
}

const getEmployeeName = (employeeId:any) => {
  const employee = employeeData?.items?.find((item:any)=>item.id === employeeId);
  return `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`;
}
  // Add function to handle row click
  const handleRowClick = (record: any) => {
    router.push(`/settlement-tracking/${record.key}`);
  };


  console.log(dataSource,'dataSource')
  // Table columns configuration
  const columns:any = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (text: any, record: any) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
            {record.avatar}
          </div>
          <span className="text-gray-900 font-medium">{getEmployeeName(record.employeeId)}</span>
        </Space>
      ),
    },
    {
      title: 'Pay Period',
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (payPeriodIds: any) => {
        if (!Array.isArray(payPeriodIds) || payPeriodIds.length === 0) return null;
        
        const periods = payPeriodIds
          .map(id => payPeriodData?.find((item:any) => item.id === id))
          .filter(Boolean);
        
          const startDates = periods.map((p:any) => new Date(p.startDate).getTime());
          const endDates = periods.map((p:any) => new Date(p.endDate).getTime());
        
        const earliestStart = new Date(Math.min(...startDates)).toLocaleDateString();
        const latestEnd = new Date(Math.max(...endDates)).toLocaleDateString();
        
        return (
          <span className="text-gray-900 text-sm">
            {earliestStart} - {latestEnd}
          </span>
        );
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: any) => (
        <span className="text-gray-900 font-medium">{text}</span>
      ),
    },
    {
      title: 'Total Paid',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (text: any) => (
        <span className="text-gray-900 font-medium">{text}</span>
      ),
    },
    {
      title: 'Compensation',
      key: 'compensationIds',
      dataIndex: 'compensationIds',
      render: (tags: any) => {
        const uniqueTags = Array.from(new Set(tags));
        return (
          <>
            {uniqueTags.map((tag:any) => (
              <Tag 
                key={tag} 
                className="mr-1 mb-1 text-xs font-medium"
                style={{ 
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  color: '#595959',
                  border: '1px solid #d9d9d9'
                }}
              >
                {getCompensationName(tag)}
              </Tag>
            ))}
          </>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (notused: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/settlement-tracking/${record.employeeId}`);
            }}
          />
          <Popconfirm
            title="Delete Settlement"
            description="Are you sure you want to delete this settlement?"
            onConfirm={(e) => {
              handleDelete(record.employeeId);
            }}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              className="hover:bg-red-50"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];


  return (
    <TabLandingLayout
      id="conversationLayoutId"
      onClickHandler={() => {}}
      title="Hi, Admin"
      subtitle="This is your HR Report so far"
      allowSearch={false}
    >
      <div className="flex gap-4 w-full">
        <Card 
          className="flex-1" 
          bodyStyle={{ padding: '16px' }}
          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <TeamOutlined className="text-purple-600" />
            </div>
            <Text className="text-gray-600 text-sm">Total Employees</Text>
          </div>
          <Title level={3} style={{ margin: 0 }}>{totalEmployee}</Title>
        </Card>

        <Card 
          className="flex-1" 
          bodyStyle={{ padding: '16px' }}
          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <CalculatorOutlined className="text-purple-600" />
            </div>
            <Text className="text-gray-600 text-sm">Total Compensation</Text>
          </div>
          <Title level={3} style={{ margin: 0 }}>{totalCompensation}</Title>
        </Card>

        <Card 
          className="flex-1" 
          bodyStyle={{ padding: '16px' }}
          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleOutlined className="text-green-600" />
            </div>
            <Text className="text-gray-600 text-sm">Paid</Text>
          </div>
          <Title level={3} style={{ margin: 0 }}>${totalPaidAmount.toLocaleString()}</Title>
        </Card>

        <Card 
          className="flex-1" 
          bodyStyle={{ padding: '16px' }}
          style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
              <DollarOutlined className="text-yellow-600" />
            </div>
            <Text className="text-gray-600 text-sm">Amount Due</Text>
          </div>
          <Title level={3} style={{ margin: 0, color: '#faad14' }}>${totalDueAmount.toLocaleString()}</Title>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg mt-6">
        <div className="flex justify-between mb-4">
        <Select
            allowClear
            loading={employeeLoading}
            showSearch
            placeholder="Search Employee"
            style={{ width: 300 }}
            className="mr-4"
            options={
              employeeData?.items?.map((item:any)=>({
                value:item.id,
                label:`${item.firstName} ${item.middleName} ${item.lastName}`
              })) ?? []
            }
            onChange={(value:any) => {
              setSearchParams({key:"employeeId", value: value || ''})
            }}
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toString().toLowerCase())
            }
          />
          <Space>
            {/* <RangePicker 
              placeholder={['Start Date', 'End Date']} 
              onChange={(e)=>{
                    e?.[0] &&  setSearchParams({key:"startDate",value:e[0].format("YYYY-MM-DD")})
                    e?.[1] &&  setSearchParams({key:"endDate",value:e[1].format("YYYY-MM-DD")})
              }}
            /> */}
            <Select
              loading={compensationLoading}
              placeholder="Filter by compensation"
              style={{ width: 200 }}
              allowClear
              options={
                compensationData?.filter((item:any)=>item.type === 'DEDUCTION').map((item:any)=>({
                  value:item.id,
                  label:item.name
                })) ?? []
              }
              onChange={(e)=>{
                setSearchParams({key:"compensationId",value:e})
              }}
            />
          </Space>
        </div>

        {/* Table */}
        <Spin spinning={deleteLoading}>
          <Table
            loading={isLoading || deleteLoading}
            columns={columns}
            dataSource={dataSource ?? []}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: settlementTrackingData?.total,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              showSizeChanger: true,
              onShowSizeChange: (current, size) => {
                setPageSize(size);
              },
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
            }}
            className="mt-4"
            onRow={(record) => ({
              style: { cursor: 'pointer' }
            })}
            rowClassName={() => 'hover:bg-gray-50 transition-colors text-sm'}
          />
        </Spin>

      </div>
    </TabLandingLayout>
  );
}

export default Page