import { Progress } from 'antd';
import { FC, useState } from 'react';
import { MdKey } from 'react-icons/md';
import EditKeyResult from '../editKeyResult';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useDeleteKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import DeleteModal from '@/components/common/deleteConfirmationModal';

interface KPIMetricsProps {
  keyResult: any;
  myOkr: boolean;
}

const KeyResultMetrics: FC<KPIMetricsProps> = ({ keyResult }) => {
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { mutate: deleteKeyResult } = useDeleteKeyResult();
  const { keyResultValue, setKeyResultValue } = useOKRStore();

  // const showDeleteModal = () => {
  //   setOpenDeleteModal(true);
  //   setKeyResultValue(keyResult);
  // };

  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setKeyResultValue([]);
  };

  // const showDrawer = () => {
  //   setOpen(true);
  //   setKeyResultValue(keyResult);
  // };

  const onClose = () => {
    setOpen(false);
  };

  // const menu = (
  //   <Menu
  //     items={[
  //       {
  //         key: '1',
  //         label: 'Edit',
  //         onClick: showDrawer,
  //       },
  //       {
  //         key: '2',
  //         label: 'Delete',
  //         onClick: showDeleteModal,
  //       },
  //     ]}
  //   />
  // );
  function handleKeyResultDelete(id: string) {
    deleteKeyResult(id, {
      onSuccess: () => {
        setOpenDeleteModal(false);
        setKeyResultValue([]);
      },
    });
  }
  return (
    <div className="py-3 px-4 sm:px-8 bg-white shadow-sm rounded-lg border">
      <div className="grid grid-cols-12 sm:justify-between mb-5 items-start">
        <div className="flex items-start gap-4 col-span-12 sm:col-span-8">
          <MdKey size={24} className="text-blue text-xl w-10" />
          <h2 className="text-sm font-normal">{keyResult?.title}</h2>
        </div>
        <div className="flex flex-col items-end justify-end col-span-12 sm:col-span-4 mt-3 sm:mt-0">
          <div className="flex items-center justify-end gap-2">
            <Progress
              type="circle"
              showInfo={false}
              percent={keyResult?.progress}
              size={20}
            />
            <span className="text-lg">{keyResult?.progress || 0}%</span>
            {/* {myOkr && (
              <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomRight"
              >
                <IoIosMore className="text-gray-500 text-lg cursor-pointer" />
              </Dropdown>
            )} */}
          </div>
        </div>
      </div>

      <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div className="flex gap-4 ml-0 sm:ml-10">
          <div className="flex items-center gap-2">
            <div className="bg-light_purple text-blue font-semibold text-xs flex items-center p-2 rounded-lg">
              {keyResult?.metricType?.name}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-blue mt-1 text-xs flex items-center rounded-lg">
                Metric
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-light_purple text-blue font-semibold text-xs flex items-center p-2 rounded-lg">
              {keyResult?.weight}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-blue mt-1 text-xs flex items-center rounded-lg">
                Weight
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mt-3 sm:mt-0">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-light_purple text-blue font-semibold text-sm p-1 w-16 sm:w-20 text-center rounded-lg">
                {keyResult?.metricType?.name === 'Milestone'
                  ? keyResult?.milestones?.filter(
                      (e: any) => e.status === 'Completed',
                    )?.length || 0
                  : keyResult?.metricType?.name === 'Achieve'
                    ? keyResult?.progress
                    : Number(keyResult?.currentValue)?.toLocaleString() || 0}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-blue text-xl">&#x2022;</div>
                <div className="text-blue mt-1 text-xs flex items-center rounded-lg">
                  Achieved
                </div>
              </div>
            </div>
            <div className="text-xl">|</div>
            <div className="flex items-center gap-2">
              <div className="bg-light_purple text-blue font-semibold text-sm p-1 min-w-16 sm:min-w-20 text-center rounded-lg">
                {keyResult?.metricType?.name === 'Milestone'
                  ? keyResult?.milestones?.length || 0
                  : keyResult?.metricType?.name === 'Achieve'
                    ? '100'
                    : Number(keyResult?.targetValue)?.toLocaleString() || 0}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-blue text-xl">&#x2022;</div>
                <div className="text-blue mt-1 text-xs flex items-center rounded-lg">
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
