import { Table, Select, Pagination, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Card } from 'antd';
import React from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';

const { Option } = Select;

interface PaymentData {
  key: string;
  date: string;
  amount: string;
  payPeriod: string;
}

const dataSource: PaymentData[] = [
  {
    key: '1',
    date: 'Jan-28-2024',
    amount: '10,000 ETB',
    payPeriod: '10,000',
  },
  {
    key: '2',
    date: 'Feb-28-2024',
    amount: '20,000 ETB',
    payPeriod: '10,000',
  },
  {
    key: '3',
    date: 'Mar-28-2024',
    amount: '20,000 ETB',
    payPeriod: '10,000',
  },
  {
    key: '4',
    date: 'Apr-28-2024',
    amount: '20,000 ETB',
    payPeriod: '10,000',
  },
];

const columns: ColumnsType<PaymentData> = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Paid Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Pay Period',
    dataIndex: 'payPeriod',
    key: 'payPeriod',
    render: () => (
      <Select defaultValue="10,000" className="w-[100px]">
        <Option value="10000">10,000</Option>
        <Option value="1500">1,500</Option>
      </Select>
    ),
  },
];

const BenefitTracking = () => {
    const {
        setEmployeeBenefitData,
        employeeBenefitData
      } = useBenefitEntitlementStore();
    const handleBackData = () => {
        setEmployeeBenefitData(null); 
    }
  return (
    <Card bodyStyle={{padding:0}} title={<div className='flex items-center gap-3 cursor-pointer'><FiChevronLeft onClick={()=>handleBackData()} size={20} />Loan Tracking</div>} className="px-4 max-w-5xl mx-auto bg-white">

      <div className="grid  gap-4 text-sm my-3">
        <div  className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Full Name</span>
          <div className="font-medium"><EmployeeDetails empId={employeeBenefitData?.userId} /></div>
        </div>
        <div  className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Total Amount Take</span>
          <div className="font-medium">10,000</div>
        </div>
        <div  className="grid grid-cols-2 items-center gap-2">
          <span className="text-gray-500">Expected pay per period</span>
          <div className="font-medium">1500</div>
        </div>
        <div  className="grid grid-cols-2 items-center gap-2">

          <span className="text-gray-500">Period</span>
          <div className="font-medium">10 months</div>
        </div>
        <div  className="grid grid-cols-2 items-center gap-2">

          <span className="text-gray-500">Total paid amount</span>
          <div className="text-green-600 font-medium">10,000</div>
        </div>
        <div  className="grid grid-cols-2 items-center gap-2">

          <span className="text-gray-500">Remaining amount</span>
          <div className="text-yellow-500 font-medium">3000</div>
        </div>
      </div>
      <Divider className="my-4" />

      <h3 className="text-sm font-light mb-2">Paid Back</h3>

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-4">
        <Pagination
          current={1}
          total={50}
          pageSize={8}
          showSizeChanger={false}
          showQuickJumper={false}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <Select defaultValue="8" size="small" className="w-16">
            <Option value="8">8</Option>
            <Option value="10">10</Option>
            <Option value="20">20</Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default BenefitTracking;
