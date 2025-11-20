import { Dropdown, Menu, Progress } from 'antd';
import { FC, useState } from 'react';
import type { ReactNode } from 'react';
import { MdKey } from 'react-icons/md';
import EditKeyResult from '../editKeyResult';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { IoIosMore } from 'react-icons/io';
import { useUpdateObjectiveNestedDelete } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { VscSymbolNumeric } from 'react-icons/vsc';
import { IoTrophyOutline } from 'react-icons/io5';
interface KPIMetricsProps {
  keyResult: any;
  myOkr: boolean;
  updatedKeyResults: any;
  objectiveId: string;
  objectiveUserId?: string;
  isInActiveSession?: boolean;
}

const KeyResultMetrics: FC<KPIMetricsProps> = ({
  keyResult,
  updatedKeyResults,
  objectiveId,
}) => {
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { mutate: updateAndDelete } = useUpdateObjectiveNestedDelete();

  const { keyResultValue, setKeyResultValue, setKeyResultId, setObjectiveId } =
    useOKRStore();

  const { isMobile } = useIsMobile();
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

  const onClose = () => {
    setOpen(false);
  };

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: 'Edit',
          onClick: showDrawer,
        },
        {
          key: '2',
          label: 'Delete',
          onClick: showDeleteModal,
        },
      ]}
    />
  );

  function handleKeyResultDelete(id: string) {
    updateAndDelete({
      toBeUpdated: updatedKeyResults,
      toBeDeleted: id,
      objectiveId,
    });
  }
  function getMetricName(metricType: string): ReactNode {
    switch (metricType) {
      case 'Milestone':
        return isMobile ? '' : '';
      case 'Achieve':
        return isMobile ? <IoTrophyOutline /> : '';
      case 'Percentage':
        return isMobile ? '%' : '';
      case 'Numeric':
        return isMobile ? <VscSymbolNumeric /> : '';
      case 'Currency':
        return isMobile ? '$' : '';
      default:
        return isMobile ? metricType : '';
    }
  }
  return (
    <div
      id={`key-result-metrics-${keyResult?.id}`}
      className={`${isMobile ? 'py-2 px-3' : 'py-3 px-4 sm:px-8 pr-10 pb-8 mb-2 '} bg-white shadow-sm rounded-lg border relative`}
    >
      {/* Title Section */}
      <div className="flex items-start gap-2 mb-3">
        <MdKey
          id={`key-result-icon-${keyResult?.id}`}
          size={isMobile ? 24 : 28}
          className="text-blue text-xl w-8 sm:w-10"
        />
        <h2
          id={`key-result-title-${keyResult?.id}`}
          className={`flex items-center gap-1 ${isMobile ? 'text-sm' : 'text-base'} font-normal`}
        >
          {keyResult?.title} {getMetricName(keyResult.metricType.name)}
        </h2>
        {keyResult?.isClosed === false && Number(keyResult?.progress) === 0 && (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <IoIosMore
              id={`key-result-menu-button-${keyResult?.id}`}
              className="text-gray-500 text-lg cursor-pointer ml-auto"
            />
          </Dropdown>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap gap-2">
        {/* Metric and Weight */}
        <div className="flex flex-wrap gap-2">
          {!isMobile && (
            <div className="flex items-center gap-1">
              <div
                id={`key-result-metric-type-${keyResult?.id}`}
                className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[10px] p-1.5' : 'text-sm p-2'} flex items-center rounded-lg`}
              >
                {keyResult?.metricType?.name}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-[#3636f0] text-xl">&#x2022;</div>
                <div
                  className={`text-[#687588] mt-1 ${isMobile ? 'text-[10px]' : 'text-sm'} flex items-center rounded-lg`}
                >
                  Metric
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <div
              id={`key-result-weight-${keyResult?.id}`}
              className={`bg-light_purple text-[#3636f0] font-bold ${isMobile ? 'text-[10px] p-2' : 'text-sm p-2'} flex items-center rounded-lg`}
            >
              {keyResult?.weight}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[10px]' : 'text-sm'} flex items-center rounded-lg`}
              >
                Weight
              </div>
            </div>
          </div>
        </div>

        {/* Achieved and Target */}
        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-3'}`}>
            <div
              id={`key-result-achieved-${keyResult?.id}`}
              className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-xs p-2 w-auto' : 'text-base p-2 w-20 sm:w-24'} text-center rounded-lg`}
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
            <div className="flex items-center gap-0">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[10px]' : 'text-sm'} flex items-center rounded-lg`}
              >
                Achieved
              </div>
            </div>
          </div>
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-3'}`}>
            <div
              id={`key-result-target-${keyResult?.id}`}
              className={`bg-light_purple text-blue font-semibold ${isMobile ? 'text-xs p-2 w-auto' : 'text-base p-2 min-w-20 sm:min-w-24'} text-center rounded-lg`}
            >
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? '100'
                  : Number(keyResult?.targetValue)?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[10px]' : 'text-sm'} flex items-center rounded-lg`}
              >
                {keyResult?.metricType?.name === 'Milestone'
                  ? 'Milestones'
                  : 'Target'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section - responsive: stacked on mobile, absolute on desktop */}
      <div
        id={`key-result-progress-section-${keyResult?.id}`}
        className={`${isMobile ? 'mt-3 flex justify-end items-center gap-2' : 'absolute bottom-2 right-2 flex items-center gap-2'}`}
      >
        <Progress
          type="circle"
          showInfo={false}
          percent={keyResult?.progress}
          size={isMobile ? 22 : 28}
        />
        <span
          id={`key-result-progress-text-${keyResult?.id}`}
          className={`${isMobile ? 'text-lg' : 'text-2xl'}`}
        >
          {keyResult?.progress || 0}%
        </span>
      </div>

      <EditKeyResult open={open} onClose={onClose} keyResult={keyResultValue} />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleKeyResultDelete(keyResultValue.id)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default KeyResultMetrics;
