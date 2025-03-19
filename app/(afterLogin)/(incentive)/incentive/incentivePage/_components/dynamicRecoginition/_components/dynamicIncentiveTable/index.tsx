import { useGetProjectIncentiveData } from '@/store/server/features/incentive/other/queries';
import {
  ProjectIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Table, TableColumnsType } from 'antd';
import React, { useMemo } from 'react';

const incentiveData = [
  {
    recognition: 'Outstanding Performance',
    employee_name: 'John Doe',
    criteria: 'Exceeding project goals',
    milestone_amount: 5000,
    project: 'Project Alpha',
    earned_scheduled: '2025-03-15',
    at: 'Q1 2025',
    spi: 1.2,
  },
  {
    recognition: 'Team Excellence',
    employee_name: 'Jane Smith',
    criteria: 'Exceptional teamwork',
    milestone_amount: 3000,
    project: 'Project Beta',
    earned_scheduled: '2025-04-10',
    at: 'Q2 2025',
    spi: 1.1,
  },
  {
    recognition: 'Innovation Award',
    employee_name: 'Michael Johnson',
    criteria: 'Creative problem-solving',
    milestone_amount: 4500,
    project: 'Project Gamma',
    earned_scheduled: '2025-05-20',
    at: 'Q3 2025',
    spi: 1.3,
  },
  {
    recognition: 'Customer Impact',
    employee_name: 'Emily Brown',
    criteria: 'High client satisfaction',
    milestone_amount: 2500,
    project: 'Project Delta',
    earned_scheduled: '2025-06-05',
    at: 'Q4 2025',
    spi: 1.0,
  },
  {
    recognition: 'Efficiency Master',
    employee_name: 'David Wilson',
    criteria: 'Process optimization',
    milestone_amount: 4000,
    project: 'Project Epsilon',
    earned_scheduled: '2025-07-12',
    at: 'Q1 2026',
    spi: 1.5,
  },
];

const staticColumns: TableColumnsType<ProjectIncentiveData> = [
  {
    title: 'Recognition',
    dataIndex: 'recognition',
    sorter: (a, b) => a.recognition.localeCompare(b.recognition),
  },
  {
    title: 'Employees',
    dataIndex: 'employee_name',
    sorter: (a, b) => a.employee_name.localeCompare(b.employee_name),
  },
  {
    title: 'Criteria',
    dataIndex: 'criteria',
    sorter: (a, b) => a.criteria.localeCompare(b.criteria),
  },
  {
    title: 'Milestone Amount',
    dataIndex: 'milestone_amount',
    sorter: (a, b) => a.milestone_amount - b.milestone_amount,
  },
];
const DynamicIncentiveTable: React.FC = () => {
  const { searchParams, currentPage, pageSize, setCurrentPage, setPageSize } =
    useIncentiveStore();

  const { data: DynamicIncentiveData, isLoading: responseLoading } =
    useGetProjectIncentiveData(
      searchParams?.employee_name || '',
      searchParams?.byProject || '',
      searchParams?.byRecognition || '',
      searchParams?.byYear || '',
      searchParams?.bySession || '',
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const dynamicIncentiveTableData = DynamicIncentiveData?.map(
    (item: ProjectIncentiveData) => {
      return {
        recognition: item?.recognition,
        employee_name: item?.recognition,
        criteria: item?.criteria,
        milestone_amount: item?.milestone_amount,
        project: item?.project,
        earned_scheduled: item?.earned_scheduled,
        at: item?.at,
        spi: item?.spi,
      };
    },
  );

  const dynamicColumns = useMemo(() => {
    if (!incentiveData || !incentiveData.length) return [];

    const sampleItem = incentiveData[0];
    const excludedKeys = [
      'recognition',
      'employee_name',
      'criteria',
      'milestone_amount',
    ];

    return Object.keys(sampleItem)
      .filter((key) => !excludedKeys.includes(key))
      .map((key) => ({
        title: key.replace(/_/g, ' ').toUpperCase(),
        dataIndex: key,
        sorter: (a: any, b: any) =>
          typeof a[key] === 'number'
            ? a[key] - b[key]
            : String(a[key]).localeCompare(String(b[key])),
      }));
  }, [incentiveData]);

  const columns = [...staticColumns, ...dynamicColumns];

  return (
    <div>
      <Table
        className="w-full cursor-pointer"
        columns={columns}
        dataSource={dynamicIncentiveTableData}
        pagination={{
          total: DynamicIncentiveData?.meta?.totalItems,
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

export default DynamicIncentiveTable;
