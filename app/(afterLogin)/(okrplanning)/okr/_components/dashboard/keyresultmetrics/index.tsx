
import { Dropdown, Menu, Progress, Select } from 'antd';
import { FC } from 'react';
import { MdKey } from 'react-icons/md';
import EditKeyResult from '../editKeyResult';
import { useOKRStore, useKeyResultMetricsStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { IoIosMore } from 'react-icons/io';
import {
  useUpdateObjectiveNestedDelete,
  useUpdateKeyResult,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { DownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import RecentModesTimelineModal from '../../recentModesTimelineModal';

interface KPIMetricsProps {
  keyResult: any;
  myOkr: boolean;
  updatedKeyResults: any;
  objectiveId: string;
  objectiveUserId?: string;
  isInActiveSession?: boolean;
}

const { Option } = Select;

const KeyResultMetrics: FC<KPIMetricsProps> = ({
  keyResult,
  myOkr,
  updatedKeyResults,
  objectiveId,
  objectiveUserId,
  isInActiveSession = true,
}) => {
  const {
    editModalKeyResultId,
    deleteModalKeyResultId,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openTimelineModal,
    setOpenTimelineModal,
  } = useKeyResultMetricsStore();

  const { mutate: updateAndDelete } = useUpdateObjectiveNestedDelete();

  const isEditModalOpen = editModalKeyResultId === String(keyResult?.id ?? '');
  const isDeleteModalOpen = deleteModalKeyResultId === String(keyResult?.id ?? '');
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const { userId } = useAuthenticationStore();
  const isBasicOkr = useIsBasicOkr();

  const { keyResultValue, setKeyResultValue, setKeyResultId, setObjectiveId } =
    useOKRStore();

  const { isMobile } = useIsMobile();

  // Only owner can edit/delete key results (check if objective belongs to current user)
  const canEditDelete =
    (myOkr || objectiveUserId === userId) && isInActiveSession;
  const showDeleteModal = () => {
    openDeleteModal(String(keyResult?.id ?? ''));
    setKeyResultValue(keyResult);
    setKeyResultId(keyResult?.id);
    setObjectiveId(keyResult?.objectiveId);
  };

  const onCloseDeleteModal = () => {
    closeDeleteModal();
    setKeyResultValue([]);
  };

  const showDrawer = () => {
    openEditModal(String(keyResult?.id ?? ''));
    setKeyResultValue(keyResult);
  };

  const onClose = () => {
    closeEditModal();
  };

  // Only show edit/delete menu if user can edit/delete this key result
  const menu = canEditDelete ? (
    <Menu
      className="okr-actions-menu"
      items={[
        {
          key: '1',
          icon: <EditOutlined className="text-gray-700" />,
          label: 'Edit Key Result',
          onClick: showDrawer,
        },
        {
          key: '2',
          icon: <DeleteOutlined className="text-red-500" />,
          label: 'Delete Key Result',
          danger: true,
          onClick: showDeleteModal,
        },
      ]}
    />
  ) : null;

  function handleKeyResultDelete(id: string) {
    updateAndDelete({
      toBeUpdated: updatedKeyResults,
      toBeDeleted: id,
      objectiveId,
    });
  }
  function getMetricName(metricType: string): string {
    switch (metricType) {
      case 'Milestone':
        return isMobile ? '#' : '';
      case 'Achieve':
        return isMobile ? '🏆' : '';
      case 'Percentage':
        return isMobile ? '%' : '';
      case 'Numeric':
        return isMobile ? '🔢' : '';
      case 'Currency':
        return isMobile ? '$' : '';
      default:
        return isMobile ? metricType : '';
    }
  }

  // Get status display value and color for key result (Basic OKR mode)
  const getKeyResultStatus = () => {
    // Check status field first, then fall back to progress
    if (
      keyResult?.status === 'achieved' ||
      Number(keyResult?.progress) === 100
    ) {
      return { value: 'achieved', label: 'Achieved', color: 'green' };
    } else if (keyResult?.status === 'failed') {
      return { value: 'failed', label: 'Failed', color: 'red' };
    }
    return { value: 'pending', label: 'Pending', color: 'yellow' };
  };

  // Handle status change for key result (Basic OKR mode)
  const handleStatusChange = (newStatus: string) => {
    let progressValue = 0;
    if (newStatus === 'achieved') {
      progressValue = 100;
    } else if (newStatus === 'failed') {
      progressValue = 0;
    } else {
      progressValue = 0;
    }

    const updatedKeyResult = {
      ...keyResult,
      progress: progressValue,
      status: newStatus, // Set status field
    };

    updateKeyResult(updatedKeyResult, {
      onSuccess: () => {
        // Refetch will happen automatically via query invalidation
      },
    });
  };

  // Check if this is Basic OKR mode with AchieveOrNot metric
  const isBasicAchieveOrNot =
    isBasicOkr && keyResult?.metricType?.name === 'Achieve';
  return (
    <div
      id={`key-result-metrics-${keyResult?.id}`}
      data-cy={`okr-key-result-metrics-${keyResult?.id}`}
      className={`${isMobile ? 'py-2 px-3' : 'py-3 px-4 sm:px-8'} bg-white shadow-sm rounded-lg border relative`}
    >
      {/* Title Section */}
      <div
        id={`okr-key-result-title-section-${keyResult?.id}`}
        data-cy={`okr-key-result-title-section-${keyResult?.id}`}
        className="flex items-start gap-2 mb-3"
      >
        <MdKey
          id={`key-result-icon-${keyResult?.id}`}
          data-cy={`okr-key-result-icon-${keyResult?.id}`}
          size={isMobile ? 20 : 24}
          className="text-blue text-xl w-8 sm:w-10"
        />
        <h2
          id={`key-result-title-${keyResult?.id}`}
          data-cy={`okr-key-result-title-${keyResult?.id}`}
          className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} font-normal`}
        >
          {`${keyResult?.title} ${getMetricName(keyResult.metricType.name)}`}
        </h2>
        {keyResult?.previousMetricTypeId && (
          <Tooltip title="Recent modes timeline">
            <InfoCircleOutlined
              className="text-blue-500 cursor-pointer hover:text-blue-600"
              onClick={() => setOpenTimelineModal(true)}
              data-cy={`okr-key-result-timeline-info-${keyResult?.id}`}
            />
          </Tooltip>
        )}
        {keyResult?.isClosed === false &&
          Number(keyResult?.progress) === 0 &&
          menu && (
            <Dropdown
              data-cy={`okr-key-result-actions-dropdown-${keyResult?.id}`}
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="okr-actions-dropdown"
            >
              <IoIosMore
                id={`key-result-menu-button-${keyResult?.id}`}
                data-cy={`okr-key-result-menu-button-${keyResult?.id}`}
                className="text-gray-500 text-lg cursor-pointer ml-auto"
              />
            </Dropdown>
          )}
      </div>

      {/* Content Section */}
      <div
        id={`okr-key-result-content-section-${keyResult?.id}`}
        data-cy={`okr-key-result-content-section-${keyResult?.id}`}
        className="flex flex-wrap gap-2"
      >
        {/* Metric and Weight */}
        <div
          id={`okr-key-result-metric-weight-section-${keyResult?.id}`}
          data-cy={`okr-key-result-metric-weight-section-${keyResult?.id}`}
          className="flex flex-wrap gap-2"
        >
          {!isMobile && (
            <div
              id={`okr-key-result-metric-type-wrapper-${keyResult?.id}`}
              data-cy={`okr-key-result-metric-type-wrapper-${keyResult?.id}`}
              className="flex items-center gap-1"
            >
              <div
                id={`key-result-metric-type-${keyResult?.id}`}
                data-cy={`okr-key-result-metric-type-${keyResult?.id}`}
                className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1' : 'text-xs p-2'} flex items-center rounded-lg`}
              >
                {keyResult?.metricType?.name}
              </div>
              <div
                id={`okr-key-result-metric-label-wrapper-${keyResult?.id}`}
                data-cy={`okr-key-result-metric-label-wrapper-${keyResult?.id}`}
                className="flex items-center gap-1"
              >
                <div
                  id={`okr-key-result-metric-label-bullet-${keyResult?.id}`}
                  data-cy={`okr-key-result-metric-label-bullet-${keyResult?.id}`}
                  className="text-[#3636f0] text-xl"
                >
                  &#x2022;
                </div>
                <div
                  id={`okr-key-result-metric-label-${keyResult?.id}`}
                  data-cy={`okr-key-result-metric-label-${keyResult?.id}`}
                  className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
                >
                  Metric
                </div>
              </div>
            </div>
          )}

          <div
            id={`okr-key-result-weight-wrapper-${keyResult?.id}`}
            data-cy={`okr-key-result-weight-wrapper-${keyResult?.id}`}
            className="flex items-center gap-1"
          >
            <div
              id={`key-result-weight-${keyResult?.id}`}
              data-cy={`okr-key-result-weight-${keyResult?.id}`}
              className={`bg-light_purple text-[#3636f0] font-bold ${isMobile ? 'text-[6px] p-2' : 'text-xs p-2'} flex items-center rounded-lg`}
            >
              {keyResult?.weight}
            </div>
            <div
              id={`okr-key-result-weight-label-wrapper-${keyResult?.id}`}
              data-cy={`okr-key-result-weight-label-wrapper-${keyResult?.id}`}
              className="flex items-center gap-1"
            >
              <div
                id={`okr-key-result-weight-label-bullet-${keyResult?.id}`}
                data-cy={`okr-key-result-weight-label-bullet-${keyResult?.id}`}
                className="text-[#3636f0] text-xl"
              >
                &#x2022;
              </div>
              <div
                id={`okr-key-result-weight-label-${keyResult?.id}`}
                data-cy={`okr-key-result-weight-label-${keyResult?.id}`}
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
              >
                Weight
              </div>
            </div>
          </div>
        </div>

        {/* Achieved and Target */}
        <div
          id={`okr-key-result-achieved-target-section-${keyResult?.id}`}
          data-cy={`okr-key-result-achieved-target-section-${keyResult?.id}`}
          className="flex flex-wrap gap-2"
        >
          <div
            id={`okr-key-result-achieved-wrapper-${keyResult?.id}`}
            data-cy={`okr-key-result-achieved-wrapper-${keyResult?.id}`}
            className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}
          >
            <div
              id={`key-result-achieved-${keyResult?.id}`}
              data-cy={`okr-key-result-achieved-${keyResult?.id}`}
              className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-2 w-auto' : 'text-sm p-1 w-16 sm:w-20'} text-center rounded-lg`}
            >
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.filter(
                    (e: any) => e.status === 'Completed',
                  )?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? keyResult?.progress
                  : (
                      Number(keyResult?.currentValue) +
                      Number(keyResult?.initialValue)
                    )?.toLocaleString() || 0}
            </div>
            <div
              id={`okr-key-result-achieved-label-wrapper-${keyResult?.id}`}
              data-cy={`okr-key-result-achieved-label-wrapper-${keyResult?.id}`}
              className="flex items-center gap-0"
            >
              <div
                id={`okr-key-result-achieved-label-bullet-${keyResult?.id}`}
                data-cy={`okr-key-result-achieved-label-bullet-${keyResult?.id}`}
                className="text-[#3636f0] text-xl"
              >
                &#x2022;
              </div>
              <div
                id={`okr-key-result-achieved-label-${keyResult?.id}`}
                data-cy={`okr-key-result-achieved-label-${keyResult?.id}`}
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
              >
                Achieved
              </div>
            </div>
          </div>
          <div
            id={`okr-key-result-target-wrapper-${keyResult?.id}`}
            data-cy={`okr-key-result-target-wrapper-${keyResult?.id}`}
            className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}
          >
            <div
              id={`key-result-target-${keyResult?.id}`}
              data-cy={`okr-key-result-target-${keyResult?.id}`}
              className={`bg-light_purple text-blue font-semibold ${isMobile ? 'text-[6px] p-2 w-auto' : 'text-sm p-1 min-w-16 sm:min-w-20'} text-center rounded-lg`}
            >
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? '100'
                  : Number(keyResult?.targetValue)?.toLocaleString() || 0}
            </div>
            <div
              id={`okr-key-result-target-label-wrapper-${keyResult?.id}`}
              data-cy={`okr-key-result-target-label-wrapper-${keyResult?.id}`}
              className="flex items-center gap-1"
            >
              <div
                id={`okr-key-result-target-label-bullet-${keyResult?.id}`}
                data-cy={`okr-key-result-target-label-bullet-${keyResult?.id}`}
                className="text-[#3636f0] text-xl"
              >
                &#x2022;
              </div>
              <div
                id={`okr-key-result-target-label-${keyResult?.id}`}
                data-cy={`okr-key-result-target-label-${keyResult?.id}`}
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
              >
                {keyResult?.metricType?.name === 'Milestone'
                  ? 'Milestones'
                  : 'Target'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section - Bottom Right */}
      <div
        id={`key-result-progress-section-${keyResult?.id}`}
        data-cy={`okr-key-result-progress-section-${keyResult?.id}`}
        className="absolute bottom-2 right-2 flex items-center gap-2"
      >
        {isBasicAchieveOrNot ? (
          <Select
            value={getKeyResultStatus().value}
            onChange={handleStatusChange}
            disabled={!canEditDelete || keyResult?.isClosed}
            suffixIcon={<DownOutlined className="text-gray-400" />}
            className={`min-w-[120px] ${
              getKeyResultStatus().color === 'yellow'
                ? '[&_.ant-select-selector]:!bg-yellow-100 [&_.ant-select-selector]:!text-yellow-800 [&_.ant-select-selector]:!border-yellow-300'
                : getKeyResultStatus().color === 'red'
                  ? '[&_.ant-select-selector]:!bg-red-100 [&_.ant-select-selector]:!text-red-800 [&_.ant-select-selector]:!border-red-300'
                  : '[&_.ant-select-selector]:!bg-green-100 [&_.ant-select-selector]:!text-green-800 [&_.ant-select-selector]:!border-green-300'
            }`}
            size={isMobile ? 'small' : 'middle'}
            data-cy={`okr-key-result-status-dropdown-${keyResult?.id}`}
          >
            <Option value="pending">Pending</Option>
            <Option value="failed">Failed</Option>
            <Option value="achieved">Achieved</Option>
          </Select>
        ) : (
          <>
            <Progress
              data-cy={`okr-key-result-progress-indicator-${keyResult?.id}`}
              type="circle"
              showInfo={false}
              percent={keyResult?.progress}
              size={isMobile ? 16 : 20}
            />
            <span
              id={`key-result-progress-text-${keyResult?.id}`}
              data-cy={`okr-key-result-progress-text-${keyResult?.id}`}
              className={`${isMobile ? 'text-base' : 'text-lg'}`}
            >
              {keyResult?.progress || 0}%
            </span>
          </>
        )}
      </div>

      <EditKeyResult
        data-cy={`okr-key-result-metrics-edit-key-result-${keyResult?.id}`}
        open={isEditModalOpen}
        onClose={onClose}
        keyResult={keyResultValue}
      />
      <RecentModesTimelineModal
        open={openTimelineModal}
        onClose={() => setOpenTimelineModal(false)}
        keyResult={keyResult}
        onRestoreSuccess={() => {
          queryClient.invalidateQueries('ObjectiveInformation');
          queryClient.refetchQueries('ObjectiveDashboard');
        }}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onConfirm={() => handleKeyResultDelete(keyResultValue.id)}
        onCancel={onCloseDeleteModal}
        data-cy={`okr-key-result-delete-modal-${keyResult?.id}`}
      />
    </div>
  );
};

export default KeyResultMetrics;
