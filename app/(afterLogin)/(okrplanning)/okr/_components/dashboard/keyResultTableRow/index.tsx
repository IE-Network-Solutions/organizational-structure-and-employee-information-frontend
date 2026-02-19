import { Dropdown, Menu, Progress } from 'antd';
import { FC, useState } from 'react';
import EditKeyResult from '../editKeyResult';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useUpdateObjectiveNestedDelete,
  useUpdateKeyResult,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { IoIosMore } from 'react-icons/io';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { DownOutlined } from '@ant-design/icons';
import { Select } from 'antd';

const { Option } = Select;

interface KeyResultTableRowProps {
  keyResult: any;
  myOkr: boolean;
  updatedKeyResults: any;
  objectiveId: string;
  objectiveUserId?: string;
  isInActiveSession?: boolean;
}

const KeyResultTableRow: FC<KeyResultTableRowProps> = ({
  keyResult,
  myOkr,
  updatedKeyResults,
  objectiveId,
  objectiveUserId,
  isInActiveSession = true,
}) => {
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { mutate: updateAndDelete } = useUpdateObjectiveNestedDelete();
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const { userId } = useAuthenticationStore();
  const isBasicOkr = useIsBasicOkr();
  const { setKeyResultValue, setKeyResultId, setObjectiveId } = useOKRStore();

  const canEditDelete =
    (myOkr || objectiveUserId === userId) && isInActiveSession;

  const showDeleteModal = () => {
    setOpenDeleteModal(true);
    setKeyResultValue(keyResult);
    setKeyResultId(keyResult?.id);
    setObjectiveId(keyResult?.objectiveId);
  };

  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setKeyResultValue([]);
  };

  const showDrawer = () => {
    setOpen(true);
    setKeyResultValue(keyResult);
  };

  const onClose = () => setOpen(false);

  const menu = canEditDelete ? (
    <Menu
      items={[
        { key: '1', label: 'Edit', onClick: showDrawer },
        { key: '2', label: 'Delete', onClick: showDeleteModal },
      ]}
    />
  ) : null;

  const handleKeyResultDelete = (id: string) => {
    updateAndDelete({
      toBeUpdated: updatedKeyResults,
      toBeDeleted: id,
      objectiveId,
    });
  };

  const getKeyResultStatus = () => {
    if (
      keyResult?.status === 'achieved' ||
      Number(keyResult?.progress) === 100
    ) {
      return { value: 'achieved', label: 'Achieved', color: 'green' };
    }
    if (keyResult?.status === 'failed') {
      return { value: 'failed', label: 'Failed', color: 'red' };
    }
    return { value: 'pending', label: 'Pending', color: 'yellow' };
  };

  const handleStatusChange = (newStatus: string) => {
    const progressValue =
      newStatus === 'achieved' ? 100 : newStatus === 'failed' ? 0 : 0;
    updateKeyResult(
      { ...keyResult, progress: progressValue, status: newStatus },
      {}
    );
  };

  const isBasicAchieveOrNot =
    isBasicOkr && keyResult?.metricType?.name === 'Achieve';
  const metricName = keyResult?.metricType?.name || 'N/A';
  const completedMilestones =
    keyResult?.milestones?.filter((e: any) => e.status === 'Completed')
      ?.length || 0;
  const totalMilestones = keyResult?.milestones?.length || 0;
  const progress = Number(keyResult?.progress) || 0;

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors"
        data-cy={`okr-key-result-table-row-${keyResult?.id}`}
      >
        <td className="px-6 py-4 text-sm text-gray-900 font-normal whitespace-normal break-normal min-w-[280px] align-top">
          {keyResult?.title}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600">
            {metricName}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {keyResult?.weight}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-1">
            {keyResult?.metricType?.name === 'Milestone' &&
              Array.from({ length: totalMilestones }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < completedMilestones ? 'bg-okr-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            {keyResult?.metricType?.name !== 'Milestone' && (
              <div className="w-2 h-2 rounded-full bg-okr-primary" />
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
          <div className="flex items-center">
            {isBasicAchieveOrNot ? (
              <Select
                value={getKeyResultStatus().value}
                onChange={handleStatusChange}
                disabled={!canEditDelete || keyResult?.isClosed}
                size="small"
                suffixIcon={<DownOutlined className="text-gray-400" />}
                className="min-w-[100px]"
              >
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
                <Option value="achieved">Achieved</Option>
              </Select>
            ) : progress >= 100 ? (
              <div className="flex items-center gap-1">
                <div className="w-[140px] bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-success h-2 rounded-full w-full" />
                </div>
                <IoCheckmarkCircle className="text-success text-lg" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-[140px] bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                  <div
                    className="bg-okr-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-gray-500 text-xs">{progress}%</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap min-w-[56px]">
          {canEditDelete && keyResult?.isClosed === false && menu ? (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1"
              >
                <IoIosMore size={16} />
              </button>
            </Dropdown>
          ) : null}
        </td>
      </tr>
      <EditKeyResult
        open={open}
        onClose={onClose}
        keyResult={keyResult}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleKeyResultDelete(keyResult?.id)}
        onCancel={onCloseDeleteModal}
      />
    </>
  );
};

export default KeyResultTableRow;
