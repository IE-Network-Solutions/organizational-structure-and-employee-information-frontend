import {
  useIncentiveFormulaByRecognitionId,
  useRecognitionById,
} from '@/store/server/features/incentive/other/queries';
import {
  IncentiveRecognitionParams,
  IncentiveSettingParams,
  RecognitionCriteria,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Skeleton, Table, TableColumnsType } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const { setOpenIncentiveDrawer, setIncentiveId, setIncentive } =
    useIncentiveStore();

  const { mutate: deleteRecognitionType } = useDeleteRecognitionType();

  const { data: recognitionData, isLoading: responseLoading } =
    useRecognitionById(recognitionId);
  const { data: formulaById } =
    useIncentiveFormulaByRecognitionId(recognitionId);
  const handleProjectIncentiveEdit = (value: IncentiveRecognitionParams) => {
    setIncentive(value);
    setOpenIncentiveDrawer(true);
    setIncentiveId(value?.id ?? '');
  };

  const handleDelete = (id: string) => {
    deleteRecognitionType(id, {
      onSuccess: () => {
        router.push('/incentives/settings');
      },
    });
  };

  const incentiveTableData = {
    id: recognitionData?.id,
    name: recognitionData?.name,
    recognition_criteria:
      formulaById?.expression !== null ? (
        recognitionData?.recognitionCriteria?.map(
          (criterion: RecognitionCriteria, index: string) => (
            <Skeleton
              data-cy={`incentive-settings-table-criterion-skeleton-${index}`}
              active
              loading={responseLoading}
              key={index}
            >
              <div
                id={`incentive-settings-table-criterion-wrapper-${index}`}
                data-cy={`incentive-settings-table-criterion-wrapper-${index}`}
                className=" flex-col flex-wrap inline-block space-x-1 space-y-2"
              >
                <span
                  id={`incentive-settings-table-criterion-${index}`}
                  data-cy={`incentive-settings-table-criterion-${index}`}
                  key={index}
                  className="inline-block flex-col flex-wrap space-x-1 space-y-1 rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1 my-1"
                >
                  {criterion?.criteria?.criteriaName || '--'}
                </span>{' '}
              </div>
            </Skeleton>
          ),
        )
      ) : (
        <Skeleton
          data-cy="incentive-settings-table-empty-skeleton"
          active
          loading={responseLoading}
        >
          {' '}
          <>-</>
        </Skeleton>
      ),
    action: (
      <div
        id="incentive-settings-table-action-wrapper"
        data-cy="incentive-settings-table-action-wrapper"
        className="flex items-center gap-2"
      >
        <div
          className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center"
          data-cy="incentive-settings-table-action-edit-wrapper"
        >
          <Pencil
            id="incentive-settings-table-action-pencil"
            data-cy="incentive-settings-table-action-pencil"
            size={15}
            className="text-white cursor-pointer"
            onClick={() => handleProjectIncentiveEdit(recognitionData)}
          />
        </div>
        <DeletePopover
          onDelete={() => handleDelete(recognitionData?.id)}
          data-cy="incentive-settings-table-delete-popover"
        >
          <div
            className="bg-red-500 w-7 h-7 rounded-md flex items-center justify-center"
            data-cy="incentive-settings-table-action-delete-wrapper"
          >
            <Trash2
              id="incentive-settings-table-action-delete"
              data-cy="incentive-settings-table-action-delete"
              size={15}
              className="text-white cursor-pointer"
            />
          </div>
        </DeletePopover>
      </div>
    ),
  };

  return (
    <div
      id="incentive-settings-table-container"
      data-cy="incentive-settings-table-container"
    >
      {responseLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          id="incentive-settings-table"
          data-cy="incentive-settings-table"
          columns={columns}
          dataSource={[incentiveTableData]}
          pagination={false}
        />
      )}
    </div>
  );
};

export default IncentiveSettingsTable;
