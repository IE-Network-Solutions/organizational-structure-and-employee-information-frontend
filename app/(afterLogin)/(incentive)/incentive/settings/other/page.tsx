'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import {
  OtherIncentiveSettingParams,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Button, Table, TableColumnsType } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import RockStartOfTheWeek from './_components/rockStar';

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
const columns: TableColumnsType<OtherIncentiveSettingParams> = [
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
const OtherIncentiveSetting: React.FC = () => {
  const {
    setProjectIncentiveDrawer,
    setDeleteIncentiveDrawer,
    setProjectIncentiveId,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setRockStarDrawer,
  } = useIncentiveStore();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleProjectIncentiveEdit = (value: OtherIncentiveSettingParams) => {
    setProjectIncentiveDrawer(true);
  };

  const handleDeleteProjectIncentive = (value: OtherIncentiveSettingParams) => {
    setDeleteIncentiveDrawer(false);
    setProjectIncentiveId(value?.id ?? '');
  };

  const otherIncentiveSettings: OtherIncentiveSettingParams[] = data.map(
    (item) => {
      return {
        name: 'Project Incentive',
        recognition_criteria: 'Project Incentive',
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
        <PageHeader title="Other Incentive Formulas">
          <Button
            onClick={() => setRockStarDrawer(true)}
            type="primary"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus size={13} className="mr-2" />
            RockStar of the week
          </Button>
        </PageHeader>
      </div>
      <Table
        columns={columns}
        dataSource={otherIncentiveSettings}
        pagination={{
          total: data?.meta?.totalItems,
          current: currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
      />
      <RockStartOfTheWeek />
    </div>
  );
};

export default OtherIncentiveSetting;
