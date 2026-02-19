import React, { useState } from 'react';
import { Avatar, Card, Menu, Dropdown, Select } from 'antd';
import { MdKey } from 'react-icons/md';
import { MoreOutlined, DownOutlined } from '@ant-design/icons';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import {
  defaultObjective,
  ObjectiveProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import EditKeyResult from '../editKeyResult';
import EditObjective from '../editObjective';

const { Option } = Select;

const ObjectiveBasic: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const {
    setObjectiveValue,
    objectiveValue,
    keyResultValue,
    setKeyResultValue,
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openKeyResultEdit, setOpenKeyResultEdit] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<any>(null);
  const { mutate: deleteObjective } = useDeleteObjective();
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const { isMobile } = useIsMobile();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  // Get active session ID
  const activeSessionId = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active,
  )?.id;

  // Only owner can edit/delete
  const isOwner = objective?.userId === userId;

  // Check if objective is part of the active session
  const isInActiveSession =
    !activeSessionId || objective?.sessionId === activeSessionId;

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

  // Calculate objective progress based on key result statuses
  const calculateObjectiveProgress = (): {
    progress: number;
    status: string;
  } => {
    const objectiveProgress = Number(objective?.objectiveProgress) || 0;

    if (objectiveProgress === 0) {
      return { progress: 0, status: '0% On Progress' };
    }

    if (objectiveProgress === 100) {
      return { progress: 100, status: 'Completed' };
    }

    if (objectiveProgress > 0 && objectiveProgress < 100) {
      return {
        progress: objectiveProgress,
        status: `${objectiveProgress}% On Progress`,
      };
    }

    // Default fallback
    return { progress: 0, status: '0% On Progress' };
  };

  const { status } = calculateObjectiveProgress();

  // Owner-only menu - only show if objective is in active session
  const menu =
    isOwner && isInActiveSession ? (
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
    ) : null;

  function handleDeleteObjective(id: string) {
    deleteObjective(id, {
      onSuccess: () => {
        onCloseDeleteModal();
      },
    });
  }

  // Get status display value and color for key result
  const getKeyResultStatus = (keyResult: any) => {
    // Check status field first, then fall back to progress
    if (keyResult?.keyResultCompletionStatus === 'Achieved') {
      return { value: 'Achieved', label: 'Achieved', color: 'green' };
    } else if (keyResult?.keyResultCompletionStatus === 'Failed') {
      return { value: 'Failed', label: 'Failed', color: 'red' };
    } else if (keyResult?.keyResultCompletionStatus === 'Pending') {
      return { value: 'Pending', label: 'Pending', color: 'yellow' };
    }
    return { value: 'pending', label: 'Pending', color: 'yellow' };
  };

  // Handle status change for key result
  const handleStatusChange = (keyResult: any, value: string) => {
    let progressValue = 0;
    if (value === 'Achieved') {
      progressValue = 100;
    } else if (value === 'Failed') {
      progressValue = 0;
    } else if (value === 'Pending') {
      progressValue = 0;
    }

    const updatedKeyResult = {
      ...keyResult,
      progress: progressValue,
      keyResultCompletionStatus: value, // Set status field
    };

    updateKeyResult(updatedKeyResult, {
      onSuccess: () => {
        // Refetch will happen automatically via query invalidation
      },
    });
  };

  // Key result menu
  const getKeyResultMenu = (keyResult: any) => {
    const canEditDelete =
      (myOkr || objective?.userId === userId) && isInActiveSession;

    if (!canEditDelete) return null;

    return (
      <Menu
        items={[
          {
            key: '1',
            label: 'Edit',
            onClick: () => {
              setSelectedKeyResult(keyResult);
              setKeyResultValue(keyResult);
              setOpenKeyResultEdit(true);
            },
          },
        ]}
      />
    );
  };

  const handleCloseKeyResultEdit = () => {
    setOpenKeyResultEdit(false);
    setSelectedKeyResult(null);
    setKeyResultValue([]);
  };

  return (
    <div
      id={`objective-basic-card-${objective?.id}`}
      data-cy={`okr-objective-basic-card-${objective?.id}`}
      className={`${isMobile ? 'p-0 mb-4' : 'p-2 mb-4'}`}
    >
      <Card
        id={`objective-basic-card-container-${objective?.id}`}
        data-cy={`okr-objective-basic-card-container-${objective?.id}`}
        className="bg-white shadow-sm rounded-lg w-full"
        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
        title={
          <div
            id={`okr-objective-basic-header-${objective?.id}`}
            data-cy={`okr-objective-basic-header-${objective?.id}`}
            className={`flex justify-between items-start gap-2 ${isMobile ? 'flex-row py-3' : 'py-4'}`}
          >
            <div
              className={`flex  ${isMobile ? 'flex-col' : 'items-center justify-between'} flex-1 min-w-0`}
              data-cy={`okr-objective-basic-title-wrapper-${objective?.id}`}
            >
              <h2
                id={`objective-basic-title-${objective?.id}`}
                data-cy={`okr-objective-basic-title-${objective?.id}`}
                className={`font-bold text-black ${isMobile ? 'text-sm truncate' : 'text-base text-wrap'}`}
              >
                {objective?.title}
              </h2>
              <span
                id={`objective-basic-status-${objective?.id}`}
                data-cy={`okr-objective-basic-status-${objective?.id}`}
                className={`font-semibold mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
                style={{
                  color: status === 'Completed' ? '#2563eb' : '#16a34a',
                }}
              >
                {status}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {!myOkr && objective?.user && (
                <div
                  className="flex items-center gap-3"
                  data-cy={`okr-objective-basic-assignee-${objective?.id}`}
                >
                  <Avatar
                    size={40}
                    src={objective.user.profileImage}
                    className="border border-gray-200"
                  >
                    {!objective.user.profileImage &&
                      `${objective.user.firstName?.[0] || ''}${objective.user.lastName?.[0] || ''}`.toUpperCase()}
                  </Avatar>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {[objective.user.firstName, objective.user.middleName, objective.user.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {objective.user?.employeeJobInformation?.[0]?.department?.name ||
                        objective.user?.employeeJobInformation?.[0]?.position?.name ||
                        '-'}
                    </p>
                  </div>
                </div>
              )}
              {objective?.isClosed === false && menu && (
                <Dropdown
                  data-cy={`okr-objective-basic-actions-dropdown-${objective?.id}`}
                  overlay={menu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <MoreOutlined
                    id={`objective-basic-menu-button-${objective?.id}`}
                    data-cy={`okr-objective-basic-menu-button-${objective?.id}`}
                    className="text-gray-500 text-lg cursor-pointer"
                  />
                </Dropdown>
              )}
            </div>
          </div>
        }
      >
        {/* Key Results List */}
        <div
          id={`okr-objective-basic-key-results-${objective?.id}`}
          data-cy={`okr-objective-basic-key-results-${objective?.id}`}
          className="space-y-4"
        >
          {objective?.keyResults?.map((keyResult: any) => {
            const statusInfo = getKeyResultStatus(keyResult);
            const keyResultMenu = getKeyResultMenu(keyResult);

            const statusSelectClass = `${
              statusInfo.color === 'yellow'
                ? '[&_.ant-select-selector]:!bg-yellow-100 [&_.ant-select-selector]:!text-yellow-800 [&_.ant-select-selector]:!border-yellow-300 [&_.ant-select-selector]:!rounded-md'
                : statusInfo.color === 'red'
                  ? '[&_.ant-select-selector]:!bg-red-100 [&_.ant-select-selector]:!text-red-800 [&_.ant-select-selector]:!border-red-300 [&_.ant-select-selector]:!rounded-md'
                  : '[&_.ant-select-selector]:!bg-green-100 [&_.ant-select-selector]:!text-green-800 [&_.ant-select-selector]:!border-green-300 [&_.ant-select-selector]:!rounded-md'
            }`;

            return (
              <div
                key={keyResult.id}
                id={`key-result-basic-${keyResult.id}`}
                data-cy={`okr-key-result-basic-${keyResult.id}`}
                className={`flex gap-2 ${isMobile ? 'flex-col' : 'items-center justify-between'}`}
              >
                <div
                  className={`flex gap-2 flex-1 min-w-0 ${isMobile ? 'items-start' : 'items-center'}`}
                  data-cy={`okr-key-result-basic-content-${keyResult.id}`}
                >
                  <MdKey
                    size={isMobile ? 18 : 20}
                    className="text-blue flex-shrink-0 mt-0.5"
                  />
                  <div
                    className={`flex-1 min-w-0 flex ${isMobile ? 'flex-col gap-1' : 'items-center justify-between'}`}
                    data-cy={`okr-key-result-basic-details-${keyResult.id}`}
                  >
                    <div
                      className="flex items-center justify-between gap-2 min-w-0 flex-1"
                      data-cy={`okr-key-result-basic-title-wrapper-${keyResult.id}`}
                    >
                      <span
                        className={`text-gray-800 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}
                        data-cy={`okr-key-result-basic-title-${keyResult.id}`}
                      >
                        {keyResult?.title}
                      </span>
                      {!isMobile && (
                        <div
                          className="flex items-center gap-2 flex-shrink-0"
                          data-cy={`okr-key-result-basic-status-wrapper-${keyResult.id}`}
                        >
                          <Select
                            value={statusInfo.value}
                            onChange={(value) =>
                              handleStatusChange(keyResult, value)
                            }
                            disabled={
                              !isOwner ||
                              !isInActiveSession ||
                              objective?.isClosed
                            }
                            suffixIcon={
                              <DownOutlined className="text-gray-400" />
                            }
                            className={`min-w-[120px] ${statusSelectClass}`}
                            size="middle"
                            dropdownStyle={{ zIndex: 1050 }}
                          >
                            <Option value="Pending">Pending</Option>
                            <Option value="Failed">Failed</Option>
                            <Option value="Achieved">Achieved</Option>
                          </Select>
                          {keyResultMenu && (
                            <Dropdown
                              data-cy={`okr-key-result-basic-actions-dropdown-${keyResult.id}`}
                              overlay={keyResultMenu}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <MoreOutlined
                                id={`key-result-basic-menu-button-${keyResult.id}`}
                                data-cy={`okr-key-result-basic-menu-button-${keyResult.id}`}
                                className="text-gray-500 text-lg cursor-pointer"
                              />
                            </Dropdown>
                          )}
                        </div>
                      )}
                      {isMobile && keyResultMenu && (
                        <Dropdown
                          data-cy={`okr-key-result-basic-actions-dropdown-${keyResult.id}`}
                          overlay={keyResultMenu}
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <MoreOutlined
                            id={`key-result-basic-menu-button-${keyResult.id}`}
                            data-cy={`okr-key-result-basic-menu-button-${keyResult.id}`}
                            className="text-gray-500 text-lg cursor-pointer flex-shrink-0"
                          />
                        </Dropdown>
                      )}
                    </div>
                    {isMobile && (
                      <Select
                        value={statusInfo.value}
                        onChange={(value) =>
                          handleStatusChange(keyResult, value)
                        }
                        disabled={
                          !isOwner || !isInActiveSession || objective?.isClosed
                        }
                        suffixIcon={
                          <DownOutlined className="text-gray-400 text-xs" />
                        }
                        className={`w-fit min-w-[100px] ${statusSelectClass}`}
                        size="small"
                        dropdownStyle={{ zIndex: 1050 }}
                      >
                        <Option value="Pending">Pending</Option>
                        <Option value="Failed">Failed</Option>
                        <Option value="Achieved">Achieved</Option>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <DeleteModal
        data-cy={`okr-objective-basic-delete-modal-${objective?.id}`}
        open={openDeleteModal}
        onConfirm={() => handleDeleteObjective(objectiveValue.id as string)}
        onCancel={onCloseDeleteModal}
      />

      <EditObjective
        data-cy={`okr-objective-basic-edit-objective-${objective?.id}`}
        objective={objectiveValue}
        open={open}
        onClose={onClose}
        isClosed={objective?.isClosed}
      />

      {selectedKeyResult && (
        <EditKeyResult
          data-cy={`okr-key-result-basic-edit-${selectedKeyResult.id}`}
          open={openKeyResultEdit}
          onClose={handleCloseKeyResultEdit}
          keyResult={keyResultValue}
        />
      )}
    </div>
  );
};

export default ObjectiveBasic;
