import { Dropdown, Menu, Progress } from 'antd';
import { FC, useState } from 'react';
import { MdKey } from 'react-icons/md';
import EditKeyResult from '../editKeyResult';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { IoIosMore } from 'react-icons/io';
import { useUpdateObjectiveNestedDelete } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { HiOutlineHashtag } from 'react-icons/hi';
import { AiOutlineDollar, AiOutlinePercentage } from 'react-icons/ai';
import { GiAchievement } from 'react-icons/gi';
import { BsSortNumericUpAlt } from 'react-icons/bs';

interface KPIMetricsProps {
  keyResult: any;
  myOkr: boolean;
  updatedKeyResults: any;
  objectiveId: string;
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
  function getMetricName(metricType: string) {
    switch (metricType) {
      case 'Milestone':
        return <HiOutlineHashtag />;
      case 'Achieve':
        return <GiAchievement />;
      case 'Percentage':
        return <AiOutlinePercentage />;
      case 'Numeric':
        return <BsSortNumericUpAlt />;
      case 'Currency':
        return <AiOutlineDollar />;
      default:
        return null; // Or <span>{metricType}</span> if you want to show the string
    }
  }
  return (
    <div
      className={`${isMobile ? 'py-2 px-3' : 'py-3 px-4 sm:px-8'} bg-white shadow-sm rounded-lg border relative`}
    >
      {/* Title Section */}
      <div className="flex items-start gap-2 mb-3">
        <MdKey
          size={isMobile ? 20 : 24}
          className="text-blue text-xl w-8 sm:w-10"
        />
        <h2
          className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'} font-normal`}
        >
          {keyResult?.title}
          {isMobile && keyResult?.metricType?.name && (
            <span className="inline-flex items-center -mt-3">
              {getMetricName(keyResult.metricType.name)}
            </span>
          )}
        </h2>
        {keyResult?.isClosed === false && Number(keyResult?.progress) === 0 && (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <IoIosMore className="text-gray-500 text-lg cursor-pointer ml-auto" />
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
                className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1' : 'text-xs p-2'} flex items-center rounded-lg`}
              >
                {keyResult?.metricType?.name}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-[#3636f0] text-xl">&#x2022;</div>
                <div
                  className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
                >
                  Metric
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <div
              className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1' : 'text-xs p-2'} flex items-center rounded-lg`}
            >
              {keyResult?.weight}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
              >
                Weight
              </div>
            </div>
          </div>
        </div>

        {/* Achieved and Target */}
        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <div
              className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1 w-14' : 'text-sm p-1 w-16 sm:w-20'} text-center rounded-lg`}
            >
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.filter(
                    (e: any) => e.status === 'Completed',
                  )?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? keyResult?.progress
                  : Number(keyResult?.currentValue)?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-0">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div
                className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}
              >
                Achieved
              </div>
            </div>
          </div>
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <div
              className={`bg-light_purple text-blue font-semibold ${isMobile ? 'text-[6px] p-1 min-w-14' : 'text-sm p-1 min-w-16 sm:min-w-20'} text-center rounded-lg`}
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
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <Progress
          type="circle"
          showInfo={false}
          percent={keyResult?.progress}
          size={isMobile ? 16 : 20}
        />
        <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>
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
