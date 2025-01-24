import IncentivePagination from '@/app/(afterLogin)/(incentive)/_components/incentivePagination';
import { useRecognitionById } from '@/store/server/features/incentive/other/queries';
import {
  IncentiveRecognition,
  IncentiveRecognitionParams,
  RecognitionCriteria,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Table, TableColumnsType } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';

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

const columns: TableColumnsType = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Recognition Criteria',
    dataIndex: 'recognition_criteria',
    sorter: (a, b) => {
      const aValue =
        typeof a.recognition_criteria === 'string'
          ? a.recognition_criteria
          : '';
      const bValue =
        typeof b.recognition_criteria === 'string'
          ? b.recognition_criteria
          : '';
      return aValue.localeCompare(bValue);
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];

interface IncentiveSettingsTableParams {
  recognitionId: string | string[];
}
const IncentiveSettingsTable: React.FC<IncentiveSettingsTableParams> = ({
  recognitionId,
}) => {
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

  const { data: recognitionData, isLoading: responseLoading } =
    useRecognitionById(recognitionId);

  console.log(recognitionData, 'recognitionData');

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleProjectIncentiveEdit = (value: IncentiveRecognition) => {
    setProjectIncentive(value);
    setProjectIncentiveDrawer(true);
  };

  const handleDeleteProjectIncentive = (value: IncentiveRecognitionParams) => {
    setDeleteIncentiveDrawer(false);
    setProjectIncentiveId(value?.id ?? '');
  };

  const projectIncentiveTableData = recognitionData?.items?.map((item: any) => {
    return {
      key: item?.id,
      // name: {item?.recognitionType?.name},
      name: 'Name',
      recognition_criteria: (
        <span className="rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1">
          {item?.recognitionType?.recognitionCriteria?.map(
            (criterion: RecognitionCriteria) => {
              criterion?.criterionKey;
            },
          )}
        </span>
      ),
      action: (
        <div className="flex items-center justify-start gap-2">
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
  });
  return (
    <div>
      <Table
        columns={columns}
        dataSource={projectIncentiveTableData}
        pagination={false}
        loading={responseLoading}
      />
      <IncentivePagination
        current={currentPage}
        total={10}
        // total={jobList?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={onPageChange}
        onShowSizeChange={onPageChange}
      />
    </div>
  );
};

export default IncentiveSettingsTable;
