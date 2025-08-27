import { Select, Input, Button, Table, Avatar, Pagination } from 'antd';
import React, { useState } from 'react';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

interface EmployeeData {
  key: string;
  employee: {
    name: string;
    avatar: string;
  };
  monthly: string;
  weekly: string;
  daily: string;
}

const EmployeePerformanceTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const pageSize = 3; // Reduced from 5 to 3 to show scrollable effect

  // Mock employee data for the table
  const employeeData: EmployeeData[] = [
    {
      key: '1',
      employee: {
        name: 'Pristia Abraham',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pristia'
      },
      monthly: '75.6%',
      weekly: '75.6%',
      daily: '75.6%'
    },
    {
      key: '2',
      employee: {
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      },
      monthly: '82.3%',
      weekly: '78.9%',
      daily: '85.1%'
    },
    {
      key: '3',
      employee: {
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
      },
      monthly: '68.7%',
      weekly: '71.2%',
      daily: '69.8%'
    },
    {
      key: '4',
      employee: {
        name: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
      },
      monthly: '91.2%',
      weekly: '88.5%',
      daily: '92.1%'
    },
    {
      key: '5',
      employee: {
        name: 'Sarah Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
      },
      monthly: '74.3%',
      weekly: '76.8%',
      daily: '73.9%'
    },
    {
      key: '6',
      employee: {
        name: 'David Brown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
      },
      monthly: '85.7%',
      weekly: '83.2%',
      daily: '87.4%'
    },
    {
      key: '7',
      employee: {
        name: 'Lisa Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
      },
      monthly: '79.1%',
      weekly: '81.6%',
      daily: '78.3%'
    },
    {
      key: '8',
      employee: {
        name: 'Tom Anderson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom'
      },
      monthly: '88.9%',
      weekly: '86.7%',
      daily: '90.2%'
    }
  ];

  // Filter data based on search query and selected period
  const filteredData = employeeData.filter(employee =>
    employee.employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    setCurrentPage(1); // Reset to first page when period changes
  };

  // Get table headers based on selected period
  const getTableHeaders = () => {
    if (selectedPeriod === 'All') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18 text-gray-600 font-medium">Monthly</div>
          <div className="text-right w-18 text-gray-600 font-medium">Weekly</div>
          <div className="text-right w-18 text-gray-600 font-medium">Daily</div>
        </div>
      );
    } else if (selectedPeriod === 'Monthly') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18 text-gray-600 font-medium">Monthly</div>
        </div>
      );
    } else if (selectedPeriod === 'Weekly') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18 text-gray-600 font-medium">Weekly</div>
        </div>
      );
    } else if (selectedPeriod === 'Daily') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18 text-gray-600 font-medium">Daily</div>
        </div>
      );
    }
  };

  // Get performance data based on selected period
  const getPerformanceData = (employee: EmployeeData) => {
    if (selectedPeriod === 'All') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.monthly}</div>
          </div>
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.weekly}</div>
          </div>
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.daily}</div>
          </div>
        </div>
      );
    } else if (selectedPeriod === 'Monthly') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.monthly}</div>
          </div>
        </div>
      );
    } else if (selectedPeriod === 'Weekly') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.weekly}</div>
          </div>
        </div>
      );
    } else if (selectedPeriod === 'Daily') {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">{employee.daily}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold text-gray-800">Employee Performance</div>
        <div className="flex items-center gap-3">
          <Select
            placeholder="Period"
            allowClear={false}
            className="w-28 h-9 rounded-md text-base font-normal"
            value={selectedPeriod}
            onChange={handlePeriodChange}
          >
            <Select.Option key="All" value="All">
              All
            </Select.Option>
            <Select.Option key="Daily" value="Daily">
              Daily
            </Select.Option>
            <Select.Option key="Weekly" value="Weekly">
              Weekly
            </Select.Option>
            <Select.Option key="Monthly" value="Monthly">
              Monthly
            </Select.Option>
          </Select>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            className="bg-blue-500 border-blue-500 hover:bg-blue-600"
          >
            Export
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Search employee"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Employee Performance Table */}
      <div className="mb-6">
        {/* Table Header */}
        <div className="bg-gray-50 rounded-t-lg p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 font-medium">Employee</div>
            {getTableHeaders()}
          </div>
        </div>

        {/* Table Body - Scrollable */}
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          <div className="space-y-3">
            {currentData.map((employee) => (
              <div 
                key={employee.key}
                className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Employee Info */}
                  <div className="flex items-center gap-3">
                    <Avatar src={employee.employee.avatar} size={32} />
                    <span className="text-gray-800 font-medium text-sm">{employee.employee.name}</span>
                  </div>
                  
                  {/* Performance Data */}
                  {getPerformanceData(employee)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
          showTotal={() => null}
          className="custom-pagination"
        />
      </div>
    </div>
  );
};

export default EmployeePerformanceTable;
