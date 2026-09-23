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
import { CalendarDays, Ellipsis, ListChecks, Target } from 'lucide-react';
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
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import {
  useUpdateKeyResult,
  useUpdateObjective,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import EditKeyResult from '../editKeyResult';
import EditObjective from '../editObjective';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { hasAnyProgress } from '../../../_utils/keyResultGuards';

const ObjectiveBasic: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const {
    setObjectiveValue,
    setObjective,
    setDeletedKeyResultIds,
    setDeletedMilestoneIds,
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
    editObjectiveModalObjectiveId,
    openEditObjective,
    closeEditObjective,
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
  const objectiveProgressPercent = Math.min(
    100,
    Math.max(0, Number(objective?.objectiveProgress ?? 0) || 0),
  );
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const { data: metrics } = useGetMetrics();
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
  const [editableMetricTypeId, setEditableMetricTypeId] = useState<
    string | null
  >(objective?.metricTypeId || null);
  const canEditMetricType = Number(objective?.objectiveProgress ?? 0) === 0;

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

  // Editing (add/edit/delete key results) is only allowed while the objective has no progress.
  const objectiveHasProgress =
    Number(objective?.objectiveProgress ?? 0) > 0 ||
    hasAnyProgress(objective?.keyResults ?? []);
  const isEditModalOpen = editObjectiveModalObjectiveId === objectiveIdStr;

  // Open the Create-OKR-style modal pre-filled with this objective's data.
  const showEditModal = () => {
    setObjectiveValue({
      ...objective,
      keyResults: (objective?.keyResults ?? []).map((kr: any) => ({
        ...kr,
        milestones: Array.isArray(kr?.milestones)
          ? kr.milestones.map((m: any) => ({ ...m }))
          : [],
      })),
    });
    // Reset the "new key results" container and any pending deletions.
    setObjective({ ...defaultObjective, keyResults: [] });
    setDeletedKeyResultIds([]);
    setDeletedMilestoneIds([]);
    openEditObjective(objectiveIdStr);
  };

  const onCancelInlineEdit = () => {
    setEditableTitle(objective?.title || '');
    setEditableDeadline(objective?.deadline || null);
    setEditableAlignmentId(objective?.allignedKeyResultId || null);
    setEditableMetricTypeId(objective?.metricTypeId || null);
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
    if (!editableMetricTypeId) {
      message.warning('Metric type is required.');
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
        metricTypeId: editableMetricTypeId,
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
      setEditableMetricTypeId(objective?.metricTypeId || null);
    }
  }, [
    objective?.title,
    objective?.deadline,
    objective?.allignedKeyResultId,
    objective?.metricTypeId,
    isInlineEditing,
  ]);

  const canManageOkr =
    AccessGuard.checkAccess({ permissions: [Permissions.UpdateObjectives] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.DeleteObjectives] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.UpdateKeyResults] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.DeleteKeyResults] });

  // Owner-only menu - only show if objective is in active session
  const menu =
    isOwner && isInActiveSession && !hideOwnTeamOkrActions && canManageOkr ? (
      <Menu
        className="okr-actions-menu"
        items={[
          {
            key: '1',
            icon: <EditOutlinedIcon className="text-gray-700" />,
            label: 'Edit OKR',
            disabled: objectiveHasProgress,
            onClick: showEditModal,
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
    const canUpdateKeyResult = AccessGuard.checkAccess({
      permissions: [Permissions.UpdateKeyResults],
    });

    if (!canShowKeyResultActions || !canUpdateKeyResult) return null;

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
      className={`border-b border-shell-line ${
        isMobile || isTablet ? 'mb-5 pb-5' : 'mb-7 pb-7'
      }`}
    >
      <div
        id={`objective-basic-card-container-${objective?.id}`}
        data-cy={`okr-objective-basic-card-container-${objective?.id}`}
        className="bg-white"
      >
        <div
          className="mb-4 flex items-start gap-3"
          data-cy={`okr-objective-basic-card-body-${objective?.id}`}
        >
          <span
            className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-md bg-shell-tint text-primary sm:flex"
            aria-hidden
            data-cy={`okr-objective-basic-card-icon-${objective?.id}`}
          >
            <Target size={18} strokeWidth={2.1} />
          </span>
          <div
            className="flex min-w-0 flex-1 items-start justify-between gap-3"
            data-cy={`okr-objective-basic-title-actions-row-${objective?.id}`}
          >
            <div
              className="flex min-w-0 flex-1 flex-col gap-1.5"
              data-cy={`okr-objective-basic-title-wrapper-${objective?.id}`}
            >
              <div
                className={
                  isInlineEditing
                    ? 'flex w-full flex-col items-stretch gap-3 lg:flex-row lg:items-end lg:gap-3'
                    : 'min-w-0'
                }
                data-cy={`okr-objective-basic-title-row-${objective?.id}`}
              >
                <h2
                  id={`objective-basic-title-${objective?.id}`}
                  data-cy={`okr-objective-basic-title-${objective?.id}`}
                  className={`m-0 min-w-0 text-base font-semibold leading-6 text-shell-ink sm:text-[17px] ${
                    isInlineEditing ? 'w-full lg:flex-1' : ''
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
                        className="text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
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
                      className="flex min-w-0 w-full shrink-0 flex-col gap-1 sm:w-[220px]"
                      data-cy={`okr-objective-basic-inline-metric-type-wrap-${objective?.id}`}
                    >
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
                        data-cy={`okr-objective-basic-inline-metric-type-label-${objective?.id}`}
                      >
                        Metric Type
                      </span>
                      <Select
                        allowClear
                        value={editableMetricTypeId ?? undefined}
                        placeholder="Select metric type"
                        size="middle"
                        disabled={!canEditMetricType}
                        className="w-full [&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!items-center md:[&_.ant-select-selector]:!h-8"
                        status={!editableMetricTypeId ? 'error' : ''}
                        onChange={(value) =>
                          setEditableMetricTypeId(value ?? null)
                        }
                        options={(metrics?.items || []).map((metric: any) => ({
                          value: metric.id,
                          label: metric.name,
                        }))}
                        data-cy={`okr-objective-basic-inline-metric-type-${objective?.id}`}
                      />
                    </div>
                    <div
                      className="flex min-w-0 w-full shrink-0 flex-col gap-1 sm:w-[180px]"
                      data-cy={`okr-objective-basic-inline-deadline-wrap-${objective?.id}`}
                    >
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
                        data-cy={`okr-objective-basic-inline-deadline-label-${objective?.id}`}
                      >
                        Deadline
                      </span>
                      <DatePicker
                        value={
                          editableDeadline ? dayjs(editableDeadline) : null
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
                          !editableDeadline ||
                          !editableMetricTypeId
                        }
                        data-cy={`okr-objective-basic-inline-save-${objective?.id}`}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                id={`okr-objective-basic-header-${objective?.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] leading-5 text-shell-text"
                data-cy={`okr-objective-basic-header-${objective?.id}`}
              >
                <span
                  className="inline-flex items-center gap-2"
                  data-cy={`okr-objective-progress-badge-${objective?.id}`}
                >
                  <span
                    className="block h-1.5 w-20 overflow-hidden rounded-full bg-shell-band"
                    data-cy={`okr-objective-basic-progress-track-${objective?.id}`}
                  >
                    <span
                      className={`block h-full rounded-full ${
                        objectiveProgressPercent >= 100
                          ? 'bg-success'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${objectiveProgressPercent}%` }}
                      data-cy={`okr-objective-basic-progress-fill-${objective?.id}`}
                    />
                  </span>
                  <span
                    className="font-semibold tabular-nums text-shell-ink"
                    data-cy={`okr-objective-basic-progress-value-${objective?.id}`}
                  >
                    {Number(objective?.objectiveProgress)?.toLocaleString()}%
                  </span>
                </span>
                <span
                  className="inline-flex items-center gap-1.5"
                  data-cy={`okr-objective-basic-kr-count-badge-${objective?.id}`}
                >
                  <ListChecks
                    size={14}
                    className="text-shell-muted"
                    aria-hidden
                  />
                  {completedKeyResults} of {totalKeyResults} key results done
                </span>
                <span
                  className="inline-flex items-center gap-1.5"
                  id={`objective-basic-status-${objective?.id}`}
                  data-cy={`okr-objective-basic-days-left-badge-${objective?.id}`}
                >
                  <CalendarDays
                    size={14}
                    className="text-shell-muted"
                    aria-hidden
                  />
                  {objective?.daysLeft ?? '—'} days left
                </span>
              </div>
            </div>
            <div
              className="flex shrink-0 items-center gap-3"
              data-cy={`okr-objective-basic-actions-cell-${objective?.id}`}
            >
              {!myOkr && objective?.user && (
                <div
                  className="flex items-center gap-2.5"
                  data-cy={`okr-objective-basic-assignee-${objective?.id}`}
                >
                  <Avatar
                    size={36}
                    src={objective.user.profileImage}
                    className="border border-shell-line bg-shell-tint text-primary"
                  >
                    {!objective.user.profileImage &&
                      `${objective.user.firstName?.[0] || ''}${objective.user.lastName?.[0] || ''}`.toUpperCase()}
                  </Avatar>
                  <div
                    className="text-left sm:text-right"
                    data-cy={`okr-objective-basic-assignee-info-${objective?.id}`}
                  >
                    <p
                      className="m-0 text-[13px] font-semibold leading-5 text-shell-ink"
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
                      className="m-0 text-xs leading-4 text-shell-muted"
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
                          job?.department?.name || job?.position?.name || '-'
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
                  <Dropdown
                    data-cy={`okr-objective-basic-actions-dropdown-desktop-${objective?.id}`}
                    overlay={menu}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="okr-actions-dropdown"
                  >
                    <button
                      type="button"
                      aria-label="Objective actions"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-shell-muted transition-colors hover:bg-shell-tint hover:text-primary"
                      id={`objective-basic-menu-button-${objective?.id}`}
                      data-cy={`okr-objective-basic-menu-button-desktop-${objective?.id}`}
                    >
                      <Ellipsis size={18} aria-hidden />
                    </button>
                  </Dropdown>
                )}
            </div>
          </div>
        </div>

        {(objective?.keyResults?.length ?? 0) > 0 && (
          <div
            id={`okr-objective-basic-key-results-${objective?.id}`}
            data-cy={`okr-objective-basic-key-results-${objective?.id}`}
            className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
          >
            <div
              className="min-w-0 sm:min-w-[520px]"
              data-cy={`okr-objective-basic-key-results-table-${objective?.id}`}
            >
              <div
                className="bg-shell-band px-3 py-2.5 sm:px-4"
                data-cy={`okr-objective-basic-key-results-header-${objective?.id}`}
              >
                <div
                  className="text-[13px] font-semibold text-shell-text"
                  data-cy={`okr-objective-basic-key-results-header-label-${objective?.id}`}
                >
                  Key Result
                </div>
              </div>
              <div
                className="divide-y divide-shell-line bg-white"
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
                      className={`group relative flex flex-col gap-3 px-3 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5 ${
                        isAchieved
                          ? 'bg-green-50/80 hover:bg-green-100/60'
                          : isFailed
                            ? 'bg-red-50/80 hover:bg-red-100/60'
                            : 'hover:bg-[#F7F8FF]'
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
                                : 'border-[#C9CDEA] hover:border-primary'
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
                                  : 'text-shell-ink'
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
                          className="shrink-0 whitespace-nowrap rounded bg-shell-tint px-2 py-0.5 text-xs font-medium text-shell-text"
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
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-shell-muted transition-colors hover:bg-shell-tint hover:text-primary"
                                  data-cy={`okr-key-result-basic-actions-button-${keyResult.id}`}
                                >
                                  <MoreHorizIcon
                                    sx={{
                                      width: 18,
                                      height: 18,
                                      color: 'currentColor',
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
          objectiveKeyResults={objective?.keyResults ?? []}
        />
      )}

      {isEditModalOpen && (
        <EditObjective
          open={isEditModalOpen}
          onClose={closeEditObjective}
          objective={objective}
          isClosed={Boolean(objective?.isClosed)}
        />
      )}
    </div>
  );
};

export default ObjectiveBasic;
