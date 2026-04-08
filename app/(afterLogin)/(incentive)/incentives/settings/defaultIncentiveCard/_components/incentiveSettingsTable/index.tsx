import { useAllChildrenRecognition } from '@/store/server/features/incentive/other/queries';
import {
  IncentiveRecognitionParams,
  IncentiveSettingParams,
  RecognitionCriteria,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { Skeleton, Table, TableColumnsType } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { useDeleteRecognitionType } from '@/store/server/features/CFR/recognition/mutation';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { TableSkeleton } from '@/components/tableSkeleton';
import { useRouter } from 'next/navigation';

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

interface IncentiveSettingsTableProps {
  recognitionData: any;
  responseLoading: boolean;
}
const DefaultIncentiveSettingsTable: React.FC<IncentiveSettingsTableProps> = ({
  recognitionData,
  responseLoading,
}) => {
  const router = useRouter();
  const { setOpenIncentiveDrawer, setIncentiveId, setIncentive } =
    useIncentiveStore();
  const { data: recognitionDataIndexed } = useAllChildrenRecognition();
  const { mutate: deleteRecognitionType } = useDeleteRecognitionType();

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
    id: recognitionData?.[0]?.id,
    name: recognitionData?.[0]?.name,
    recognition_criteria: recognitionData?.[0]?.recognitionCriteria?.map(
      (criterion: RecognitionCriteria, index: string) => (
        <Skeleton
          data-cy={`default-incentive-settings-table-criterion-skeleton-${index}`}
          active
          loading={responseLoading}
          key={index}
        >
          <div
            id={`default-incentive-settings-table-criterion-wrapper-${index}`}
            data-cy={`default-incentive-settings-table-criterion-wrapper-${index}`}
            className=" flex-col flex-wrap inline-block space-x-1 space-y-2"
          >
            <span
              id={`default-incentive-settings-table-criterion-${index}`}
              data-cy={`default-incentive-settings-table-criterion-${index}`}
              key={index}
              className="inline-block flex-col flex-wrap space-x-1 space-y-1 rounded-xl bg-[#D3E4F0] text-[#1D9BF0] p-2 mx-1 my-1"
            >
              {criterion?.criteria?.criteriaName || '--'}
            </span>{' '}
          </div>
        </Skeleton>
      ),
    ),
    action: (
      <div
        id="default-incentive-settings-table-action-wrapper"
        data-cy="default-incentive-settings-table-action-wrapper"
        className="flex items-center gap-2"
      >
        <div
          className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center"
          data-cy="default-incentive-settings-table-action-edit-wrapper"
        >
          <Pencil
            id="default-incentive-settings-table-action-pencil"
            data-cy="default-incentive-settings-table-action-pencil"
            size={15}
            className="text-white cursor-pointer"
            onClick={() =>
              handleProjectIncentiveEdit(recognitionDataIndexed?.[0])
            }
          />
        </div>
        <DeletePopover
          onDelete={() => handleDelete(recognitionDataIndexed?.[0]?.id)}
          data-cy="default-incentive-settings-table-delete-popover"
        >
          <div
            className="bg-red-500 w-7 h-7 rounded-md flex items-center justify-center"
            data-cy="default-incentive-settings-table-action-delete-wrapper"
          >
            <Trash2
              id="default-incentive-settings-table-action-delete"
              data-cy="default-incentive-settings-table-action-delete"
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
      id="default-incentive-settings-table-container"
      data-cy="default-incentive-settings-table-container"
    >
      {responseLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          id="default-incentive-settings-table"
          data-cy="default-incentive-settings-table"
          columns={columns}
          dataSource={[incentiveTableData]}
          pagination={false}
        />
      )}
    </div>
  );
};

export default DefaultIncentiveSettingsTable;
