import {
  IncentiveRecognitionParams,
  IncentiveSettingParams,
  RecognitionCriteria,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Skeleton, Table, TableColumnsType } from 'antd';
import { Pencil } from 'lucide-react';

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

interface tableParams {
  recognitionData: any;
  responseLoading: boolean;
}

const DefaultIncentiveSettingsTable: React.FC<tableParams> = ({
  recognitionData,
  responseLoading,
}) => {
  const { setOpenIncentiveDrawer, setIncentiveId, setIncentive } =
    useIncentiveStore();

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
      <div className="flex items-center justify-start gap-2">
        <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
          <Pencil
            size={15}
            className="text-white cursor-pointer"
            onClick={() => handleProjectIncentiveEdit(recognitionData)}
          />
        </div>
      </div>
    ),
  };

  return (
    <div>
      {responseLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={[incentiveTableData]}
          pagination={false}
        />
      )}
    </div>
  );
};

export default DefaultIncentiveSettingsTable;
