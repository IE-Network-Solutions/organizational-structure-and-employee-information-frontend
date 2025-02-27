import { useRecognitionById } from '@/store/server/features/incentive/other/queries';
import {
  IncentiveRecognitionParams,
  IncentiveSettingParams,
  RecognitionCriteria,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Table, TableColumnsType } from 'antd';
import { Pencil } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

const columns: TableColumnsType<IncentiveSettingParams> = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Recognition Criteria',
    dataIndex: 'recognition_criteria',
    render: (value) => value,
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
    render: (value) => value,
  },
];

type Params = {
  id: string;
};

const IncentiveSettingsTable: React.FC = () => {
  const { id } = useParams<Params>();
  const recognitionId = id;

  const { setOpenIncentiveDrawer, setIncentiveId, setIncentive } =
    useIncentiveStore();

  const { data: recognitionData, isLoading: responseLoading } =
    useRecognitionById(recognitionId);

  const handleProjectIncentiveEdit = (value: IncentiveRecognitionParams) => {
    setIncentive(value);
    setOpenIncentiveDrawer(true);
    setIncentiveId(value?.id ?? '');
  };

  const incentiveTableData = {
    id: recognitionData?.id,
    name: recognitionData?.recognitionType?.name,
    recognition_criteria:
      recognitionData?.recognitionType?.recognitionCriteria?.map(
        (criterion: RecognitionCriteria, index: string) => (
          <span
            key={index}
            className="rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1"
          >
            {criterion?.criterionKey}
          </span>
        ),
      ),
    action: (
      <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
        <Pencil
          size={15}
          className="text-white cursor-pointer"
          onClick={() => handleProjectIncentiveEdit(recognitionData)}
        />
      </div>
    ),
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={[incentiveTableData]}
        pagination={false}
        loading={responseLoading}
      />
    </div>
  );
};

export default IncentiveSettingsTable;
