'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import {
  ProjectIncentiveSettingParams,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Button, Table, TableColumnsType } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import IncentivePagination from '../../../_components/incentivePagination';

const data = [
  {
    id: '1',
    name: 'Project Incentive',
    recognition_criteria: 'Project Incentive',
  },
  {
    id: '2',
    name: 'Project Incentive',
    recognition_criteria: 'Project Incentive',
  },
];
const columns: TableColumnsType<ProjectIncentiveSettingParams> = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Recognition Criteria',
    dataIndex: 'recognition_criteria',
    sorter: (a, b) =>
      a.recognition_criteria.localeCompare(b.recognition_criteria),
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];
const IncentiveProjectSetting: React.FC = () => {
  const {
    setProjectIncentiveDrawer,
    setDeleteIncentiveDrawer,
    setProjectIncentiveId,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setProjectIncentive,
  } = useIncentiveStore();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleProjectIncentiveEdit = (value: ProjectIncentiveSettingParams) => {
    setProjectIncentive(value);
    setProjectIncentiveDrawer(true);
  };

  const handleDeleteProjectIncentive = (
    value: ProjectIncentiveSettingParams,
  ) => {
    setDeleteIncentiveDrawer(false);
    setProjectIncentiveId(value?.id ?? '');
  };

  const projectIncentiveTableData: ProjectIncentiveSettingParams[] = data.map(
    (item) => {
      return {
        name: 'Project Incentive',
        recognition_criteria: (
          <span className="rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1">
            Project Incentive
          </span>
        ),
        action: (
          <div className="flex items-center justify-center gap-2">
            <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
              <Pencil
                size={15}
                className="text-white cursor-pointer"
                onClick={() => handleProjectIncentiveEdit(item)}
              />
            </div>
            <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
              <Trash2
                size={15}
                className="text-white cursor-pointer"
                onClick={() => handleDeleteProjectIncentive(item)}
              />
            </div>
          </div>
        ),
      };
    },
  );
  return (
    <div>
      <div className="mb-6">
        <PageHeader title="Project Incentive Formulas">
          <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
            <FaPlus size={13} className="mr-2" />
            Create Formula
          </Button>
        </PageHeader>
      </div>
      <Table
        columns={columns}
        dataSource={projectIncentiveTableData}
        pagination={false}
      />
      <IncentivePagination
        current={currentPage}
        total={10}
        // total={jobList?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default IncentiveProjectSetting;
