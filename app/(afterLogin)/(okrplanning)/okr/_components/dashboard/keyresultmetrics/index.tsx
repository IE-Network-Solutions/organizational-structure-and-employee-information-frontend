import { Dropdown, Menu, Progress } from 'antd';
import { FC, useState } from 'react';
import { MdKey } from 'react-icons/md';
import EditKeyResult from '../editKeyResult';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { IoIosMore } from 'react-icons/io';
import { useUpdateObjectiveNestedDelete } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';

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

    const {isMobile, isTablet} = useIsMobile();
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
  return (
    <div className={`${isMobile ? 'py-2 px-3' : 'py-3 px-4 sm:px-8'} bg-white shadow-sm rounded-lg border`}>
      <div className={`grid ${isMobile ? 'gap-3' : 'grid-cols-12'} sm:justify-between ${isMobile ? 'mb-3' : 'mb-5'} items-start`}>
        <div className={`flex items-start gap-2 ${isMobile ? '' : 'col-span-6 sm:col-span-8'}`}>
          <MdKey size={isMobile ? 20 : 24} className="text-blue text-xl w-8 sm:w-10" />
          <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-normal`}>{keyResult?.title}</h2>
        </div>
        <div className={`flex flex-col items-end justify-end ${isMobile ? '' : 'col-span-12 sm:col-span-4'} ${isMobile ? 'mt-2' : 'mt-3 sm:mt-0'}`}>
          <div className="flex items-center justify-end gap-2">
            <Progress
              type="circle"
              showInfo={false}
              percent={keyResult?.progress}
              size={isMobile ? 16 : 20}
            />
            <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>{keyResult?.progress || 0}%</span>
            {keyResult?.isClosed === false &&
              Number(keyResult?.progress) === 0 && (
                <Dropdown
                  overlay={menu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <IoIosMore className="text-gray-500 text-lg cursor-pointer" />
                </Dropdown>
              )}
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'mb-2' : 'mb-2'} flex flex-col ${isMobile ? 'gap-3' : isTablet ? 'sm:flex-row gap-4' : 'sm:flex-row'} justify-between items-start sm:items-end`}>
        <div className={`flex justify-between`}>
          <div className={`flex justify-between items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <div className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1' : 'text-xs p-2'} flex items-center rounded-lg`}>
              {keyResult?.metricType?.name}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}>
                Metric
              </div>
            </div>
          </div>

          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <div className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1' : 'text-xs p-2'} flex items-center rounded-lg`}>
              {keyResult?.weight}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-[#3636f0] text-xl">&#x2022;</div>
              <div className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}>
                Weight
              </div>
            </div>
          </div>
        </div>

        <div className={`grid ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'mt-2' : 'mt-3 sm:mt-0'}`}>
          <div className={`flex ${isMobile ? 'gap-2' : 'gap-4'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              <div className={`bg-light_purple text-[#3636f0] font-semibold ${isMobile ? 'text-[6px] p-1 w-14' : 'text-sm p-1 w-16 sm:w-20'} text-center rounded-lg`}>
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
                <div className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}>
                  Achieved
                </div>
              </div>
            </div>
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              <div className={`bg-light_purple text-blue font-semibold ${isMobile ? 'text-[6px] p-1 min-w-14' : 'text-sm p-1 min-w-16 sm:min-w-20'} text-center rounded-lg`}>
                {keyResult?.metricType?.name === 'Milestone'
                  ? keyResult?.milestones?.length || 0
                  : keyResult?.metricType?.name === 'Achieve'
                    ? '100'
                    : Number(keyResult?.targetValue)?.toLocaleString() || 0}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-[#3636f0] text-xl">&#x2022;</div>
                <div className={`text-[#687588] mt-1 ${isMobile ? 'text-[6px]' : 'text-xs'} flex items-center rounded-lg`}>
                  {keyResult?.metricType?.name === 'Milestone'
                    ? 'Milestones'
                    : 'Target'}
                </div>
              </div>
            </div>
          </div>
        </div>
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
