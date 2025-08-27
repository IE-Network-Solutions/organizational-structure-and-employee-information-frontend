import { Select, Input, Button, Table, Avatar, Pagination, Spin } from 'antd';
import React, { useState, useMemo } from 'react';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetReporting } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface EmployeeData {
  key: string;
  employee: {
    name: string;
    avatar: string;
  };
  performanceData: Record<string, string>; // Dynamic performance data based on planning periods
}

const EmployeePerformanceTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const pageSize = 3;

  // Get current user and planning periods
  const { userId } = useAuthenticationStore();
  const { data: assignedPeriods, isLoading: periodsLoading } = useGetAssignedPlanningPeriodForUserId();
  const { data: employeeData, isLoading: employeesLoading } = useGetAllUsers();

  // Get available planning periods for the current user
  const availablePeriods = useMemo(() => {
    if (!assignedPeriods) return [];
    return assignedPeriods.map((p: any) => ({
      id: p.planningPeriodId,
      name: p.planningPeriod?.name || 'Unknown',
      intervalType: p.planningPeriod?.intervalType || 'unknown'
    }));
  }, [assignedPeriods]);

  // Get reporting data for each planning period - moved to top level to follow Rules of Hooks
  const dailyPeriodId = availablePeriods.find(p => p.intervalType === 'day' || p.name?.toLowerCase().includes('day'))?.id;
  const weeklyPeriodId = availablePeriods.find(p => p.intervalType === 'week' || p.name?.toLowerCase().includes('week'))?.id;
  const monthlyPeriodId = availablePeriods.find(p => p.intervalType === 'month' || p.name?.toLowerCase().includes('month'))?.id;

  const { data: dailyReports, isLoading: dailyLoading } = useGetReporting({
    userId: employeeData?.items?.map((emp: any) => emp.id) || [],
    planPeriodId: dailyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  const { data: weeklyReports, isLoading: weeklyLoading } = useGetReporting({
    userId: employeeData?.items?.map((emp: any) => emp.id) || [],
    planPeriodId: weeklyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  const { data: monthlyReports, isLoading: monthlyLoading } = useGetReporting({
    userId: employeeData?.items?.map((emp: any) => emp.id) || [],
    planPeriodId: monthlyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  // Transform backend data to match our interface
  const transformedEmployeeData: EmployeeData[] = useMemo(() => {
    if (!employeeData?.items || !availablePeriods.length) return [];

    return employeeData.items.map((emp: any) => {
      const performanceData: Record<string, string> = {};

      // Get performance data for each planning period
      availablePeriods.forEach((period) => {
        let reportData;
        
        // Map period IDs to the correct report data
        if (period.id === dailyPeriodId) {
          reportData = dailyReports?.items;
        } else if (period.id === weeklyPeriodId) {
          reportData = weeklyReports?.items;
        } else if (period.id === monthlyPeriodId) {
          reportData = monthlyReports?.items;
        }

        const employeeReport = reportData?.find((report: any) => report.userId === emp.id);
        
        // Extract and format score
        const getScore = (report: any) => {
          if (!report?.reportScore) return '0%';
          const scoreStr = report.reportScore;
          const numericScore = parseFloat(scoreStr.replace('%%', ''));
          return isNaN(numericScore) ? '0%' : `${numericScore.toFixed(1)}%`;
        };

        performanceData[period.id] = getScore(employeeReport);
      });

      return {
        key: emp.id,
        employee: {
          name: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.email || 'Unknown',
          avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName || emp.email}`
        },
        performanceData
      };
    });
  }, [employeeData, availablePeriods, dailyReports, weeklyReports, monthlyReports, dailyPeriodId, weeklyPeriodId, monthlyPeriodId]);

  // Filter data based on search query and selected period
  const filteredData = transformedEmployeeData.filter(employee =>
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

  // Check if any data is loading
  const isLoading = employeesLoading || periodsLoading || dailyLoading || weeklyLoading || monthlyLoading;

  // Get table headers based on selected period and available planning periods
  const getTableHeaders = () => {
    if (selectedPeriod === 'All') {
      return (
        <div className="flex items-center gap-10">
          {availablePeriods.map((period) => (
            <div key={period.id} className="text-right w-18 text-gray-600 font-medium">
              {period.name}
            </div>
          ))}
        </div>
      );
    } else {
      const selectedPeriodData = availablePeriods.find(p => p.id === selectedPeriod);
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18 text-gray-600 font-medium">
            {selectedPeriodData?.name || 'Unknown'}
          </div>
        </div>
      );
    }
  };

  // Get performance data based on selected period
  const getPerformanceData = (employee: EmployeeData) => {
    if (selectedPeriod === 'All') {
      return (
        <div className="flex items-center gap-10">
          {availablePeriods.map((period) => (
            <div key={period.id} className="text-right w-18">
              <div className="text-gray-800 font-medium text-sm">
                {employee.performanceData[period.id] || '0%'}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-10">
          <div className="text-right w-18">
            <div className="text-gray-800 font-medium text-sm">
              {employee.performanceData[selectedPeriod] || '0%'}
            </div>
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
            {availablePeriods.map((period) => (
              <Select.Option key={period.id} value={period.id}>
                {period.name}
              </Select.Option>
            ))}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
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
          )}
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
