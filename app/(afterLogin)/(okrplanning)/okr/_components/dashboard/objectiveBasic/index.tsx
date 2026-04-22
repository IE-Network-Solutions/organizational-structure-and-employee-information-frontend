import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  DatePicker,
  Dropdown,
  Input,
  Menu,
  Select,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PiCalendarBold } from 'react-icons/pi';
import {
  useOKRStore,
  useObjectiveBasicStore,
} from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import {
  defaultObjective,
  ObjectiveProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useUpdateKeyResult,
  useUpdateObjective,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import EditKeyResult from '../editKeyResult';
import dayjs from 'dayjs';

const ObjectiveBasic: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const {
    setObjectiveValue,
    objectiveValue,
    keyResultValue,
    setKeyResultValue,
    okrTab,
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.delegatedTo?.id || userData?.reportingTo?.id;
  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const {
    deleteModalObjectiveId,
    editKeyResultModalKeyResultId,
    openDeleteModal,
    closeDeleteModal,
    openEditKeyResult,
    closeEditKeyResult,
  } = useObjectiveBasicStore();
  const { mutate: deleteObjective, isLoading: isDeletingObjective } =
    useDeleteObjective();
  const { mutate: updateObjective, isLoading: isUpdatingObjective } =
    useUpdateObjective();

  const objectiveIdStr = String(objective?.id ?? '');
  const isDeleteModalOpen = deleteModalObjectiveId === objectiveIdStr;
  const openKeyResultEdit =
    editKeyResultModalKeyResultId !== null &&
    (objective?.keyResults?.some(
      (kr: any) => String(kr?.id) === editKeyResultModalKeyResultId,
    ) ??
      false);

  const completedKeyResults =
    objective?.keyResults?.filter((kr: any) => kr.progress === 100).length || 0;
  const totalKeyResults = objective?.keyResults?.length || 0;
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const { isMobile, isTablet } = useIsMobile();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(objective?.title || '');
  const [editableDeadline, setEditableDeadline] = useState(
    objective?.deadline || null,
  );
  const [editableAlignmentId, setEditableAlignmentId] = useState<string | null>(
    objective?.allignedKeyResultId || null,
  );

  // Get active session ID
  const activeSessionId = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active,
  )?.id;

  // Only owner can edit/delete
  const isOwner = objective?.userId === userId;

  // Check if objective is part of the active session
  const isInActiveSession =
    !activeSessionId || objective?.sessionId === activeSessionId;
  const hideOwnTeamOkrActions = String(okrTab) === '2' && isOwner;

  const showDeleteModal = () => {
    openDeleteModal(objectiveIdStr);
    setObjectiveValue(objective);
  };

  const onCloseDeleteModal = () => {
    closeDeleteModal();
    setObjectiveValue(defaultObjective);
  };

  const showDrawer = () => {
    setEditableTitle(objective?.title || '');
    setEditableDeadline(objective?.deadline || null);
    setEditableAlignmentId(objective?.allignedKeyResultId || null);
    setIsInlineEditing(true);
  };

  const onCancelInlineEdit = () => {
    setEditableTitle(objective?.title || '');
    setEditableDeadline(objective?.deadline || null);
    setEditableAlignmentId(objective?.allignedKeyResultId || null);
    setIsInlineEditing(false);
  };

  const onSaveInlineEdit = () => {
    const trimmedTitle = editableTitle.trim();
    if (!trimmedTitle) return;
    if (!editableAlignmentId) {
      message.warning('Alignment is required.');
      return;
    }
    if (!editableDeadline) {
      message.warning('Deadline is required.');
      return;
    }
    const {
      daysLeft,
      completedKeyResults,
      objectiveProgress,
      ...objectivePayload
    } = objective as any;
    void daysLeft;
    void completedKeyResults;
    void objectiveProgress;
    updateObjective(
      {
        ...objectivePayload,
        title: trimmedTitle,
        deadline: editableDeadline,
        allignedKeyResultId: editableAlignmentId,
      },
      {
        onSuccess: () => setIsInlineEditing(false),
      },
    );
  };

  useEffect(() => {
    if (!isInlineEditing) {
      setEditableTitle(objective?.title || '');
      setEditableDeadline(objective?.deadline || null);
      setEditableAlignmentId(objective?.allignedKeyResultId || null);
    }
  }, [
    objective?.title,
    objective?.deadline,
    objective?.allignedKeyResultId,
    isInlineEditing,
  ]);

  // Owner-only menu - only show if objective is in active session
  const menu =
    isOwner && isInActiveSession && !hideOwnTeamOkrActions ? (
      <Menu
        className="okr-actions-menu"
        items={[
          {
            key: '1',
            icon: <EditOutlinedIcon className="text-gray-700" />,
            label: 'Edit OKR',
            onClick: showDrawer,
          },
          {
            key: '2',
            icon: <DeleteOutlined className="text-red-500" />,
            label: 'Delete OKR',
            danger: true,
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
    const canShowKeyResultActions = canEditDelete && !hideOwnTeamOkrActions;

    if (!canShowKeyResultActions) return null;

    return (
      <Menu
        className="okr-actions-menu"
        items={[
          {
            key: '1',
            icon: <EditOutlinedIcon className="text-gray-700" />,
            label: 'Edit Key Result',
            onClick: () => {
              setKeyResultValue(keyResult);
              openEditKeyResult(String(keyResult?.id ?? ''));
            },
          },
        ]}
      />
    );
  };

  const handleCloseKeyResultEdit = () => {
    closeEditKeyResult();
    setKeyResultValue([]);
  };

  return (
    <div
      id={`objective-basic-card-${objective?.id}`}
      data-cy={`okr-objective-basic-card-${objective?.id}`}
      className={isMobile || isTablet ? 'mb-4' : 'mb-6'}
    >
      <div
        id={`objective-basic-card-container-${objective?.id}`}
        data-cy={`okr-objective-basic-card-container-${objective?.id}`}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      >
        <div
          className="p-4 pb-2 sm:p-6"
          data-cy={`okr-objective-basic-card-body-${objective?.id}`}
        >
          <div
            className="flex items-start justify-between"
            data-cy={`okr-objective-basic-card-inner-${objective?.id}`}
          >
            <div
              className="w-full"
              data-cy={`okr-objective-basic-card-main-${objective?.id}`}
            >
              <div
                className="flex-1 min-w-0"
                data-cy={`okr-objective-basic-card-content-${objective?.id}`}
              >
                <div
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  data-cy={`okr-objective-basic-title-actions-row-${objective?.id}`}
                >
                  <div
                    className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5"
                    data-cy={`okr-objective-basic-title-block-${objective?.id}`}
                  >
                    <div
                      className="flex min-w-0 flex-1 flex-col gap-y-1"
                      data-cy={`okr-objective-basic-title-wrapper-${objective?.id}`}
                    >
                      <div
                        id={`okr-objective-basic-header-${objective?.id}`}
                        className="flex flex-wrap items-center gap-x-0 gap-y-2"
                        data-cy={`okr-objective-basic-header-${objective?.id}`}
                      >
                        <div
                          className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2"
                          data-cy={`okr-objective-basic-progress-cell-container-${objective?.id}`}
                        >
                          <div
                            className="min-w-0 shrink-0"
                            data-cy={`okr-objective-basic-progress-cell-${objective?.id}`}
                          >
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#DBEAFE] text-blue-700 border border-[#BFDBFE] whitespace-nowrap"
                              data-cy={`okr-objective-progress-badge-${objective?.id}`}
                            >
                              {Number(
                                objective?.objectiveProgress,
                              )?.toLocaleString()}
                              % Objective Progress
                            </span>
                          </div>
                          <div
                            className="min-w-0 flex flex-wrap items-center justify-start gap-2"
                            data-cy={`okr-objective-basic-kr-count-cell-${objective?.id}`}
                          >
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                              data-cy={`okr-objective-basic-kr-count-badge-${objective?.id}`}
                            >
                              {completedKeyResults} - {totalKeyResults} Key
                              Results Done
                            </span>
                            <span
                              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                              id={`objective-basic-status-${objective?.id}`}
                              data-cy={`okr-objective-basic-days-left-badge-${objective?.id}`}
                            >
                              {objective?.daysLeft ?? '—'} Days Left
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`min-h-8 gap-2 ${
                          isInlineEditing
                            ? 'flex w-full flex-col items-stretch gap-3 lg:flex-row lg:items-end lg:gap-3'
                            : 'flex items-end justify-between'
                        }`}
                        data-cy={`okr-objective-basic-title-row-${objective?.id}`}
                      >
                        <h2
                          id={`objective-basic-title-${objective?.id}`}
                          data-cy={`okr-objective-basic-title-${objective?.id}`}
                          className={`text-base sm:text-lg font-bold text-gray-900 m-0 min-w-0 leading-7 sm:leading-8 ${
                            isInlineEditing ? 'w-full min-w-0 lg:flex-1' : ''
                          }`}
                        >
                          {isInlineEditing ? (
                            <Input
                              value={editableTitle}
                              onChange={(e) => setEditableTitle(e.target.value)}
                              maxLength={500}
                              autoFocus
                              size="middle"
                              placeholder="Update objective title"
                              className="h-9 w-full"
                              data-cy={`okr-objective-basic-title-inline-input-${objective?.id}`}
                            />
                          ) : (
                            objective?.title
                          )}
                        </h2>
                        {isInlineEditing ? (
                          <div
                            className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:shrink lg:flex-nowrap"
                            data-cy={`okr-objective-basic-inline-edit-row-${objective?.id}`}
                          >
                            <div
                              className="flex min-w-0 w-full flex-col gap-1 sm:w-[260px] sm:max-w-full"
                              data-cy={`okr-objective-basic-inline-alignment-wrap-${objective?.id}`}
                            >
                              <span
                                className="text-xs font-medium uppercase tracking-wide text-slate-500"
                                data-cy={`okr-objective-basic-inline-alignment-label-${objective?.id}`}
                              >
                                Alignment
                              </span>
                              <Select
                                allowClear
                                value={editableAlignmentId ?? undefined}
                                placeholder="Select alignment"
                                size="middle"
                                className="w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!items-center md:[&_.ant-select-selector]:!h-8"
                                status={!editableAlignmentId ? 'error' : ''}
                                onChange={(value) =>
                                  setEditableAlignmentId(value ?? null)
                                }
                                options={(keyResultByUser?.items || []).map(
                                  (keyResult: any) => ({
                                    value: keyResult.id,
                                    label: keyResult.title,
                                  }),
                                )}
                                data-cy={`okr-objective-basic-inline-alignment-${objective?.id}`}
                              />
                            </div>
                            <div
                              className="flex min-w-0 w-full shrink-0 flex-col gap-1 sm:w-[180px]"
                              data-cy={`okr-objective-basic-inline-deadline-wrap-${objective?.id}`}
                            >
                              <span
                                className="text-xs font-medium uppercase tracking-wide text-slate-500"
                                data-cy={`okr-objective-basic-inline-deadline-label-${objective?.id}`}
                              >
                                Deadline
                              </span>
                              <DatePicker
                                value={
                                  editableDeadline
                                    ? dayjs(editableDeadline)
                                    : null
                                }
                                format="YYYY-MM-DD"
                                size="middle"
                                className="h-9 w-full sm:h-8 sm:w-[180px]"
                                status={!editableDeadline ? 'error' : ''}
                                disabledDate={(current) =>
                                  current && current < dayjs().startOf('day')
                                }
                                onChange={(date) =>
                                  setEditableDeadline(
                                    date ? date.format('YYYY-MM-DD') : null,
                                  )
                                }
                                data-cy={`okr-objective-basic-inline-deadline-${objective?.id}`}
                              />
                            </div>
                            <div
                              className="flex items-center justify-end gap-2 pb-[1px] sm:justify-start"
                              data-cy={`okr-objective-basic-inline-actions-${objective?.id}`}
                            >
                              <Button
                                size="small"
                                onClick={onCancelInlineEdit}
                                disabled={isUpdatingObjective}
                                icon={<CloseOutlined />}
                                className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                                aria-label="Cancel objective edit"
                                data-cy={`okr-objective-basic-inline-cancel-${objective?.id}`}
                              />
                              <Button
                                type="primary"
                                size="small"
                                onClick={onSaveInlineEdit}
                                loading={isUpdatingObjective}
                                icon={<CheckOutlined />}
                                className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                                aria-label="Save objective edit"
                                disabled={
                                  !editableTitle.trim() ||
                                  !editableAlignmentId ||
                                  !editableDeadline
                                }
                                data-cy={`okr-objective-basic-inline-save-${objective?.id}`}
                              />
                            </div>
                          </div>
                        ) : null}
                        {!isInlineEditing &&
                          objective?.isClosed === false &&
                          Number(objective?.objectiveProgress ?? 0) !== 100 &&
                          menu && (
                            <Dropdown
                              data-cy={`okr-objective-basic-actions-dropdown-${objective?.id}`}
                              overlay={menu}
                              trigger={['click']}
                              placement="bottomRight"
                              overlayClassName="okr-actions-dropdown"
                            >
                              <span
                                className="inline-flex h-6 max-h-6 items-center leading-none sm:hidden"
                                data-cy={`okr-objective-basic-menu-trigger-mobile-${objective?.id}`}
                              >
                                <button
                                  type="button"
                                  className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151]"
                                  data-cy={`okr-objective-basic-menu-button-mobile-${objective?.id}`}
                                >
                                  <MoreHorizIcon
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      color: '#374151',
                                    }}
                                    data-cy={`okr-objective-basic-menu-icon-mobile-${objective?.id}`}
                                  />
                                </button>
                              </span>
                            </Dropdown>
                          )}
                      </div>
                      <div
                        className="flex items-center text-sm text-gray-500 sm:hidden"
                        data-cy={`okr-objective-basic-days-left-mobile-${objective?.id}`}
                      >
                        <PiCalendarBold className="mr-2 flex-shrink-0 text-lg text-gray-400" />
                        <span
                          data-cy={`okr-objective-basic-days-left-mobile-text-${objective?.id}`}
                        >
                          {objective?.daysLeft ?? '—'} Days Left
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 items-center justify-end gap-3 sm:ml-auto"
                    data-cy={`okr-objective-basic-actions-cell-${objective?.id}`}
                  >
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
                        <div
                          className="text-left sm:text-right"
                          data-cy={`okr-objective-basic-assignee-info-${objective?.id}`}
                        >
                          <p
                            className="text-xs sm:text-sm font-semibold text-gray-900"
                            data-cy={`okr-objective-basic-assignee-name-${objective?.id}`}
                          >
                            {[
                              objective.user.firstName,
                              objective.user.middleName,
                              objective.user.lastName,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          </p>
                          <p
                            className="text-[11px] sm:text-xs text-gray-500"
                            data-cy={`okr-objective-basic-assignee-dept-${objective?.id}`}
                          >
                            {(() => {
                              const job = objective.user
                                ?.employeeJobInformation?.[0] as
                                | {
                                    department?: { name: string };
                                    position?: { name: string };
                                  }
                                | undefined;
                              return (
                                job?.department?.name ||
                                job?.position?.name ||
                                '-'
                              );
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                    {!isInlineEditing &&
                      objective?.isClosed === false &&
                      Number(objective?.objectiveProgress ?? 0) !== 100 &&
                      menu && (
                        <div
                          className="hidden shrink-0 sm:flex sm:min-w-[56px] sm:flex-col sm:items-end sm:justify-center"
                          data-cy={`okr-objective-basic-menu-desktop-column-${objective?.id}`}
                        >
                          <Dropdown
                            data-cy={`okr-objective-basic-actions-dropdown-desktop-${objective?.id}`}
                            overlay={menu}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="okr-actions-dropdown"
                          >
                            <span
                              className="inline-flex h-6 max-h-6 items-center leading-none"
                              data-cy={`okr-objective-basic-menu-trigger-desktop-${objective?.id}`}
                            >
                              <button
                                type="button"
                                className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151]"
                                id={`objective-basic-menu-button-${objective?.id}`}
                                data-cy={`okr-objective-basic-menu-button-desktop-${objective?.id}`}
                              >
                                <MoreHorizIcon
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    color: '#374151',
                                  }}
                                  data-cy={`okr-objective-basic-menu-icon-desktop-${objective?.id}`}
                                />
                              </button>
                            </span>
                          </Dropdown>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(objective?.keyResults?.length ?? 0) > 0 && (
          <div
            id={`okr-objective-basic-key-results-${objective?.id}`}
            data-cy={`okr-objective-basic-key-results-${objective?.id}`}
            className="mt-0 border-t border-gray-200 overflow-x-auto [-webkit-overflow-scrolling:touch]"
          >
            <div
              className="min-w-0 sm:min-w-[520px]"
              data-cy={`okr-objective-basic-key-results-table-${objective?.id}`}
            >
              <div
                className="bg-gray-50 px-4 py-2.5 sm:px-6 sm:py-3"
                data-cy={`okr-objective-basic-key-results-header-${objective?.id}`}
              >
                <div
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  data-cy={`okr-objective-basic-key-results-header-label-${objective?.id}`}
                >
                  Key Result
                </div>
              </div>
              <div
                className="divide-y divide-gray-200 bg-white"
                data-cy={`okr-objective-basic-key-results-list-${objective?.id}`}
              >
                {objective?.keyResults?.map((keyResult: any) => {
                  const statusInfo = getKeyResultStatus(keyResult);
                  const keyResultMenu = getKeyResultMenu(keyResult);
                  const isAchieved = statusInfo.value === 'Achieved';
                  const isFailed = statusInfo.value === 'Failed';
                  const isPending =
                    statusInfo.value === 'Pending' ||
                    statusInfo.value === 'pending';
                  const isResolved = isAchieved || isFailed;
                  const canToggle =
                    isOwner &&
                    isInActiveSession &&
                    !objective?.isClosed &&
                    (isPending || isAchieved || isFailed);

                  const handleCheckboxClick = () => {
                    if (!canToggle) return;
                    if (isAchieved) {
                      handleStatusChange(keyResult, 'Pending');
                    } else if (isFailed) {
                      handleStatusChange(keyResult, 'Pending');
                    } else {
                      handleStatusChange(keyResult, 'Achieved');
                    }
                  };

                  return (
                    <div
                      key={keyResult.id}
                      id={`key-result-basic-${keyResult.id}`}
                      data-cy={`okr-key-result-basic-${keyResult.id}`}
                      className={`relative flex flex-col gap-3 px-4 py-3 transition-colors group sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4 ${
                        isAchieved
                          ? 'bg-green-50/80 hover:bg-green-100/60'
                          : isFailed
                            ? 'bg-red-50/80 hover:bg-red-100/60'
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="flex min-w-0 flex-1 items-start gap-3"
                        data-cy={`okr-key-result-basic-title-and-checkbox-${keyResult.id}`}
                      >
                        <button
                          type="button"
                          onClick={handleCheckboxClick}
                          disabled={!canToggle}
                          data-cy={`okr-key-result-basic-checkbox-${keyResult.id}`}
                          className={`relative z-10 mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            canToggle ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            isAchieved
                              ? 'border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600'
                              : isFailed
                                ? 'border-red-500 bg-red-500 text-white hover:border-red-600 hover:bg-red-600'
                                : 'border-gray-300 hover:border-blue-600'
                          }`}
                          aria-label={
                            isAchieved
                              ? 'Mark as pending'
                              : isFailed
                                ? 'Mark as pending'
                                : 'Mark as achieved'
                          }
                        >
                          {isAchieved && <CheckOutlined className="text-xs" />}
                          {isFailed && <CloseOutlined className="text-xs" />}
                        </button>
                        <div
                          className="min-w-0 flex-1 flex items-center gap-0"
                          data-cy={`okr-key-result-basic-title-wrapper-${keyResult.id}`}
                        >
                          <span
                            className={`text-sm font-medium min-w-0 break-words ${
                              isAchieved
                                ? 'line-through text-gray-500 decoration-green-500 decoration-2'
                                : isFailed
                                  ? 'line-through text-gray-500 decoration-red-500 decoration-2'
                                  : 'text-gray-900'
                            }`}
                            data-cy={`okr-key-result-basic-title-${keyResult.id}`}
                          >
                            {keyResult?.title}
                          </span>
                          {isResolved && (
                            <div
                              className={`hidden h-0.5 min-w-[24px] flex-1 shrink basis-0 sm:block ${
                                isAchieved ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              aria-hidden
                              data-cy={`okr-key-result-basic-strikethrough-${keyResult.id}`}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        className="flex w-full flex-shrink-0 flex-wrap items-center justify-between gap-2 pl-8 sm:w-auto sm:justify-end sm:pl-0"
                        data-cy={`okr-key-result-basic-details-${keyResult.id}`}
                      >
                        <span
                          className="shrink-0 whitespace-nowrap text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded bg-white group-hover:border-gray-300"
                          data-cy={`okr-key-result-basic-weight-${keyResult.id}`}
                        >
                          Weight: {keyResult?.weight ?? '—'}
                        </span>
                        <div
                          className="flex min-h-6 min-w-[56px] w-[56px] shrink-0 items-center justify-end"
                          data-cy={`okr-key-result-basic-actions-column-${keyResult.id}`}
                        >
                          {keyResultMenu &&
                            Number(keyResult?.progress ?? 0) === 0 && (
                              <Dropdown
                                data-cy={`okr-key-result-basic-actions-dropdown-${keyResult.id}`}
                                overlay={keyResultMenu}
                                trigger={['click']}
                                placement="bottomRight"
                                overlayClassName="okr-actions-dropdown"
                              >
                                <button
                                  type="button"
                                  className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151] transition-colors hover:bg-gray-50"
                                  data-cy={`okr-key-result-basic-actions-button-${keyResult.id}`}
                                >
                                  <MoreHorizIcon
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      color: '#374151',
                                    }}
                                    id={`key-result-basic-menu-button-${keyResult.id}`}
                                    data-cy={`okr-key-result-basic-menu-button-${keyResult.id}`}
                                  />
                                </button>
                              </Dropdown>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        data-cy={`okr-objective-basic-delete-modal-${objective?.id}`}
        open={isDeleteModalOpen}
        onConfirm={() => handleDeleteObjective(objectiveValue.id as string)}
        onCancel={onCloseDeleteModal}
        loading={isDeletingObjective}
      />

      {openKeyResultEdit && (
        <EditKeyResult
          data-cy={`okr-key-result-basic-edit-${keyResultValue?.id ?? editKeyResultModalKeyResultId}`}
          open={openKeyResultEdit}
          onClose={handleCloseKeyResultEdit}
          keyResult={keyResultValue}
        />
      )}
    </div>
  );
};

export default ObjectiveBasic;
