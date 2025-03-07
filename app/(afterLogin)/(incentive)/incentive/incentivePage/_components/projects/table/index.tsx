import { useGetProjectIncentiveData } from '@/store/server/features/incentive/other/queries';
import {
  ProjectIncentiveData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Table, TableColumnsType } from 'antd';
import React, { useMemo } from 'react';

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
  // {
  //   title: 'Project',
  //   dataIndex: 'project',
  //   sorter: (a, b) => a.project.localeCompare(b.project),
  // },
  // {
  //   title: 'Earned Schedule',
  //   dataIndex: 'earned_scheduled',
  //   sorter: (a, b) => a.earned_scheduled - b.earned_scheduled,
  // },
  // {
  //   title: 'AT',
  //   dataIndex: 'at',
  //   sorter: (a, b) => a.at - b.at,
  // },
  // {
  //   title: 'SPI',
  //   dataIndex: 'spi',
  //   sorter: (a, b) => a.spi - b.spi,
  // },
];
const ProjectIncentiveTable: React.FC = () => {
  const { searchParams, currentPage, pageSize, setCurrentPage, setPageSize } =
    useIncentiveStore();

  const { data: ProjectIncentiveData, isLoading: responseLoading } =
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

  const projectIncentiveTableData = ProjectIncentiveData?.map(
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
        dataSource={projectIncentiveTableData}
        pagination={{
          total: ProjectIncentiveData?.meta?.totalItems,
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

export default ProjectIncentiveTable;
