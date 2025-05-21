import React, { useState } from 'react';
import { Progress, Card, Avatar, Menu, Dropdown } from 'antd';
import { PiCalendarPlus } from 'react-icons/pi';
import KeyResultMetrics from '../keyresultmetrics';
import EditObjective from '../editObjective';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import {
  defaultObjective,
  ObjectiveProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { MoreOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const ObjectiveCard: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const { setObjectiveValue, objectiveValue, keyResultId, objectiveId } =
    useOKRStore();
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { mutate: deleteObjective } = useDeleteObjective();
  const { isMobile, isTablet } = useIsMobile();
  const showDeleteModal = () => {
    setOpenDeleteModal(true);
    setObjectiveValue(objective);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setObjectiveValue(defaultObjective);
  };

  const showDrawer = () => {
    setOpen(true);
    setObjectiveValue(objective);
  };

  const onClose = () => {
    setOpen(false);
    setObjectiveValue(defaultObjective);
  };

  const completedKeyResults =
    objective?.keyResults?.filter((kr: any) => kr.progress === 100).length || 0;
  const totalKeyResults = objective?.keyResults?.length || 0;
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
  function handleDeleteObjective(id: string) {
    deleteObjective(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }

  // ==========> Deleting Key result and distributing weight Section <===============
  const selectedObjective = objective?.id === objectiveId ? objective : null;

  const relatedKeyResults =
    (selectedObjective &&
      selectedObjective?.keyResults?.filter(
        (kr: any) => kr.objectiveId === objectiveId,
      )) ||
    [];
  const remainingKeyResults = relatedKeyResults?.filter(
    (kr: any) => kr?.id !== keyResultId,
  );

  const keyResultToDelete = relatedKeyResults.find(
    (kr: any) => kr.id === keyResultId,
  );

  const redistributedWeight =
    parseFloat(keyResultToDelete?.weight) / remainingKeyResults.length;

  const updatedKeyResults = remainingKeyResults.map((kr: any) => ({
    id: kr.id,
    weight: parseFloat(kr.weight) + redistributedWeight,
  }));

  return (
    <div className={`${isMobile ? 'p-0 grid gap-0' : 'p-2 grid gap-0'}`}>
      <div className="flex justify-center">
        <Card
          className={`bg-white shadow-sm rounded-lg w-full mb-3 ${isMobile ? 'p-0' : 'p-6'}`}
        >
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div
              className={`flex justify-between items-start ${isMobile ? 'mb-1' : 'mb-4'}`}
            >
              <div className="flex flex-col">
                <h2
                  className={`font-bold text-black ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  {objective?.title}
                </h2>
              </div>
              {objective?.isClosed === false ? (
                <Dropdown
                  overlay={menu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <MoreOutlined className="text-gray-500 text-lg cursor-pointer" />
                </Dropdown>
              ) : null}
            </div>

            <div
              className={`flex ${isMobile ? 'flex-col gap-4' : isTablet ? 'flex-col sm:flex-row gap-6' : 'flex-col sm:flex-row'} justify-between items-${isMobile ? 'start' : 'center'}`}
            >
              {/* Progress and Metrics Section */}
              <div
                className={`${isMobile ? 'flex justify-between items-center gap-2 w-full' : 'flex items-center gap-2 w-full sm:gap-8'}`}
              >
                {/* Objective Progress */}
                <div className={`${isMobile ? 'w-full' : 'grid items-center'}`}>
                  <div className="text-xs text-gray-600">
                    <span
                      className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue`}
                    >
                      {Number(objective?.objectiveProgress)?.toLocaleString()}%
                    </span>{' '}
                    Objective Progress
                  </div>
                  <Progress
                    percent={objective?.objectiveProgress}
                    showInfo={false}
                    strokeColor="#3636f0"
                    trailColor="#EDEDF6"
                    className={`${isMobile ? 'w-full' : 'w-full sm:w-32'}`}
                  />
                  <div className="text-xs text-gray-600">
                    {completedKeyResults}/{totalKeyResults} Key Result Done
                  </div>
                </div>

                {/* Key Result Section */}
                <div
                  className={`${isMobile ? 'gap-2 items-center justify-between w-full' : 'grid items-center gap-0'}`}
                >
                  <div className="flex items-center">
                    <PiCalendarPlus className="text-blue mt-1" />
                    <div
                      className={`font-bold text-[#3636f0] ${isMobile ? 'text-lg ml-2' : 'text-2xl'}`}
                    >
                      {objective?.daysLeft}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 ">Days left</div>
                </div>
              </div>

              {!myOkr && (
                <div
                  className={`flex items-center gap-1 ${isMobile ? 'mt-2' : 'mt-4 sm:mt-0'}`}
                >
                  <div className="flex flex-col gap-0">
                    <span className="text-xs text-normal">{`${objective?.user?.firstName} ${objective?.user?.middleName}  ${objective?.user?.lastName} `}</span>
                    <span className="text-xs text-normal">
                      {objective?.user?.email}
                    </span>
                  </div>
                  {objective?.user?.profileImage ? (
                    <Avatar
                      size={isMobile ? 32 : 40}
                      src={objective?.user?.profileImage}
                    />
                  ) : (
                    <Avatar size={isMobile ? 32 : 40}>
                      {objective?.user?.firstName[0]?.toUpperCase()}{' '}
                      {objective?.user?.middleName[0]?.toUpperCase()}
                      {objective?.user?.lastName[0]?.toUpperCase()}
                    </Avatar>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      {objective.keyResults?.map((keyResult: any) => (
        <KeyResultMetrics
          myOkr={myOkr}
          keyResult={keyResult}
          key={keyResult.id}
          updatedKeyResults={updatedKeyResults}
          objectiveId={objectiveId}
        />
      ))}
      <EditObjective
        objective={objectiveValue}
        open={open}
        onClose={onClose}
        isClosed={objective?.isClosed}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDeleteObjective(objectiveValue.id as string)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default ObjectiveCard;
