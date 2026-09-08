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
import KeyResultTableRow from '../keyResultTableRow';
import EditObjective from '../editObjective';
import {
  useOKRStore,
  useObjectiveBasicStore,
} from '@/store/uistate/features/okrplanning/okr';
import { hasAnyProgress } from '../../../_utils/keyResultGuards';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteObjective,
  useUpdateObjective,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import {
  defaultObjective,
  ObjectiveProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { PiCalendarBold } from 'react-icons/pi';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const ObjectiveCard: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const {
    setObjectiveValue,
    setObjective,
    setDeletedKeyResultIds,
    setDeletedMilestoneIds,
    objectiveValue,
    keyResultId,
    objectiveId,
    okrTab,
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.delegatedTo?.id || userData?.reportingTo?.id;
  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const {
    deleteModalObjectiveId,
    openDeleteModal,
    closeDeleteModal,
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
  const [editableKeyResults, setEditableKeyResults] = useState<any[]>([]);
  const [activeInlineKeyResultId, setActiveInlineKeyResultId] = useState<
    string | null
  >(null);

  const activeSessionId = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active,
  )?.id;

  const isOwner = objective?.userId === userId;
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
    setActiveInlineKeyResultId(null);
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
    setEditableKeyResults(
      (objective?.keyResults || []).map((kr: any) => ({ ...kr })),
    );
    setIsInlineEditing(false);
  };

  const onRequestInlineKeyResultEdit = (keyResultId: string) => {
    setIsInlineEditing(false);
    setActiveInlineKeyResultId(String(keyResultId));
  };

  const onCancelInlineKeyResultEdit = () => {
    setActiveInlineKeyResultId(null);
  };

  const onFinishInlineKeyResultEdit = () => {
    setActiveInlineKeyResultId(null);
  };

  const validateInlineKeyResults = () => {
    for (const kr of editableKeyResults) {
      if (!kr?.title || String(kr.title).trim() === '') {
        message.warning('Key Result title is required.');
        return false;
      }
      if (!kr?.deadline) {
        message.warning(
          `Deadline is required for "${kr?.title || 'Key Result'}".`,
        );
        return false;
      }
      const metric = kr?.metricType?.name || kr?.key_type;
      if (metric === 'Milestone') {
        if (!kr?.milestones || kr.milestones.length === 0) {
          message.warning(
            `Milestones are required for "${kr?.title || 'Key Result'}".`,
          );
          return false;
        }
        const hasEmptyMilestoneTitle = kr.milestones.some(
          (m: any) => !m?.title || String(m.title).trim() === '',
        );
        if (hasEmptyMilestoneTitle) {
          message.warning(
            `All milestone titles are required for "${kr?.title || 'Key Result'}".`,
          );
          return false;
        }
        const milestoneSum = kr.milestones.reduce(
          (sum: number, m: any) => sum + Number(m?.weight || 0),
          0,
        );
        if (milestoneSum !== 100) {
          message.warning(
            `Milestone weights must total 100 for "${kr?.title || 'Key Result'}".`,
          );
          return false;
        }
      }
      if (
        metric === 'Numeric' ||
        metric === 'Currency' ||
        metric === 'Percentage'
      ) {
        if (Number(kr?.initialValue) >= Number(kr?.targetValue)) {
          message.warning(
            `Target value must be greater than the initial value for "${kr?.title || 'Key Result'}".`,
          );
          return false;
        }
      }
    }
    const weightSum = editableKeyResults.reduce(
      (sum: number, kr: any) => sum + Number(kr?.weight || 0),
      0,
    );
    if (weightSum !== 100) {
      message.warning(
        `The sum of key result weights must equal 100%. Current sum: ${weightSum}%`,
      );
      return false;
    }
    return true;
  };

  const hasMissingInlineKeyResultDeadline = editableKeyResults.some(
    (kr: any) => !kr?.deadline,
  );

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
    if (!validateInlineKeyResults()) return;
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
        keyResults: editableKeyResults,
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
      setEditableKeyResults(
        (objective?.keyResults || []).map((kr: any) => ({ ...kr })),
      );
    }
  }, [
    objective?.title,
    objective?.deadline,
    objective?.allignedKeyResultId,
    objective?.keyResults,
    isInlineEditing,
  ]);

  const handleInlineObjectiveKeyResultChange = (
    keyResultId: string,
    field: string,
    value: any,
  ) => {
    setEditableKeyResults((prev) =>
      prev.map((kr: any) =>
        String(kr?.id) === String(keyResultId) ? { ...kr, [field]: value } : kr,
      ),
    );
  };

  const isAnyKeyResultInlineEditActive = Boolean(activeInlineKeyResultId);

  const completedKeyResults =
    objective?.keyResults?.filter((kr: any) => kr.progress === 100).length || 0;
  const totalKeyResults = objective?.keyResults?.length || 0;

  const canManageOkr =
    AccessGuard.checkAccess({ permissions: [Permissions.UpdateObjectives] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.DeleteObjectives] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.UpdateKeyResults] }) ||
    AccessGuard.checkAccess({ permissions: [Permissions.DeleteKeyResults] });

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
    parseFloat(keyResultToDelete?.weight) / (remainingKeyResults.length || 1);
  const updatedKeyResults = remainingKeyResults.map((kr: any) => ({
    id: kr.id,
    weight: parseFloat(kr.weight) + redistributedWeight,
  }));

  const handleDeleteObjective = (id: string) => {
    deleteObjective(id, { onSuccess: () => onCloseDeleteModal() });
  };

  return (
    <div
      id={`objective-card-${objective?.id}`}
      data-cy={`okr-objective-card-${objective?.id}`}
      className={`${isMobile || isTablet ? 'mb-4' : 'mb-6'}`}
    >
      <div
        data-cy={`okr-objective-card-wrapper-${objective?.id}`}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      >
        <div
          className="p-4 pb-2 sm:p-6"
          data-cy={`okr-objective-card-body-${objective?.id}`}
        >
          <div
            className="flex items-start justify-between"
            data-cy={`okr-objective-card-inner-${objective?.id}`}
          >
            <div
              className="w-full"
              data-cy={`okr-objective-card-main-${objective?.id}`}
            >
              <div
                className="flex-1 min-w-0"
                data-cy={`okr-objective-card-content-${objective?.id}`}
              >
                <div
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  data-cy={`okr-objective-card-row-${objective?.id}`}
                >
                  <div
                    className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5"
                    data-cy={`okr-objective-card-title-block-${objective?.id}`}
                  >
                    <div
                      className="flex min-w-0 flex-1 flex-col gap-y-1"
                      data-cy={`okr-objective-card-title-section-${objective?.id}`}
                    >
                      <div
                        className="flex flex-wrap items-center gap-x-0 gap-y-2"
                        data-cy={`okr-objective-card-header-${objective?.id}`}
                      >
                        <div
                          className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2"
                          data-cy={`okr-objective-card-progress-cell-container-${objective?.id}`}
                        >
                          <div
                            className="min-w-0 shrink-0"
                            data-cy={`okr-objective-card-progress-cell-${objective?.id}`}
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
                            data-cy={`okr-objective-card-kr-count-cell-${objective?.id}`}
                          >
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                              data-cy={`okr-objective-card-kr-count-badge-${objective?.id}`}
                            >
                              {completedKeyResults} - {totalKeyResults} Key
                              Results Done
                            </span>
                            <span
                              className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                              data-cy={`okr-objective-card-days-left-badge-${objective?.id}`}
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
                        data-cy={`okr-objective-card-title-row-${objective?.id}`}
                      >
                        <h2
                          id={`objective-title-${objective?.id}`}
                          data-cy={`okr-objective-title-${objective?.id}`}
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
                              data-cy={`okr-objective-title-inline-input-${objective?.id}`}
                            />
                          ) : (
                            objective?.title
                          )}
                        </h2>
                        {isInlineEditing ? (
                          <div
                            className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto lg:shrink lg:flex-nowrap"
                            data-cy={`okr-objective-inline-edit-row-${objective?.id}`}
                          >
                            <div
                              className="flex min-w-0 w-full flex-col gap-1 sm:w-[260px] sm:max-w-full"
                              data-cy={`okr-objective-inline-alignment-wrap-${objective?.id}`}
                            >
                              <span
                                className="text-xs font-medium uppercase tracking-wide text-slate-500"
                                data-cy={`okr-objective-inline-alignment-label-${objective?.id}`}
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
                                data-cy={`okr-objective-inline-alignment-${objective?.id}`}
                              />
                            </div>
                            <div
                              className="flex min-w-0 w-full shrink-0 flex-col gap-1 sm:w-[180px]"
                              data-cy={`okr-objective-inline-deadline-wrap-${objective?.id}`}
                            >
                              <span
                                className="text-xs font-medium uppercase tracking-wide text-slate-500"
                                data-cy={`okr-objective-inline-deadline-label-${objective?.id}`}
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
                                data-cy={`okr-objective-inline-deadline-${objective?.id}`}
                              />
                            </div>
                            <div
                              className="flex items-center justify-end gap-2 pb-[1px] sm:justify-start"
                              data-cy={`okr-objective-inline-actions-${objective?.id}`}
                            >
                              <Button
                                size="small"
                                onClick={onCancelInlineEdit}
                                disabled={isUpdatingObjective}
                                icon={<CloseOutlined />}
                                className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                                aria-label="Cancel objective edit"
                                data-cy={`okr-objective-inline-cancel-${objective?.id}`}
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
                                  hasMissingInlineKeyResultDeadline
                                }
                                data-cy={`okr-objective-inline-save-${objective?.id}`}
                              />
                            </div>
                          </div>
                        ) : null}
                        {!isInlineEditing &&
                          objective?.isClosed === false &&
                          Number(objective?.objectiveProgress ?? 0) !== 100 &&
                          menu && (
                            <Dropdown
                              overlay={menu}
                              trigger={['click']}
                              placement="bottomRight"
                              overlayClassName="okr-actions-dropdown"
                              data-cy={`okr-objective-menu-dropdown-mobile-${objective?.id}`}
                            >
                              <span
                                className="inline-flex h-6 max-h-6 items-center leading-none sm:hidden"
                                data-cy={`okr-objective-menu-trigger-mobile-${objective?.id}`}
                              >
                                <button
                                  type="button"
                                  className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151]"
                                  data-cy={`okr-objective-menu-button-${objective?.id}`}
                                >
                                  <MoreHorizIcon
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      color: '#374151',
                                    }}
                                    data-cy={`okr-objective-menu-icon-mobile-${objective?.id}`}
                                  />
                                </button>
                              </span>
                            </Dropdown>
                          )}
                      </div>
                      <div
                        className="flex items-center text-sm text-gray-500 sm:hidden"
                        data-cy={`okr-objective-card-days-left-mobile-${objective?.id}`}
                      >
                        <PiCalendarBold className="mr-2 flex-shrink-0 text-lg text-gray-400" />
                        <span
                          data-cy={`okr-objective-card-days-left-mobile-text-${objective?.id}`}
                        >
                          {objective?.daysLeft ?? '—'} Days Left
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 items-center justify-end gap-3 sm:ml-auto"
                    data-cy={`okr-objective-card-actions-${objective?.id}`}
                  >
                    {!myOkr && objective?.user && (
                      <div
                        className="flex items-center gap-3"
                        data-cy={`okr-objective-assignee-${objective?.id}`}
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
                          data-cy={`okr-objective-card-assignee-info-${objective?.id}`}
                        >
                          <p
                            className="text-xs sm:text-sm font-semibold text-gray-900"
                            data-cy={`okr-objective-card-assignee-name-${objective?.id}`}
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
                            data-cy={`okr-objective-card-assignee-dept-${objective?.id}`}
                          >
                            {objective.user?.employeeJobInformation?.[0]
                              ?.department?.name ||
                              objective.user?.employeeJobInformation?.[0]
                                ?.position?.name ||
                              '-'}
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
                          data-cy={`okr-objective-menu-desktop-column-${objective?.id}`}
                        >
                          <Dropdown
                            overlay={menu}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="okr-actions-dropdown"
                            data-cy={`okr-objective-menu-dropdown-desktop-${objective?.id}`}
                          >
                            <span
                              className="inline-flex h-6 max-h-6 items-center leading-none"
                              data-cy={`okr-objective-menu-trigger-desktop-${objective?.id}`}
                            >
                              <button
                                type="button"
                                className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151]"
                                data-cy={`okr-objective-menu-button-desktop-${objective?.id}`}
                              >
                                <MoreHorizIcon
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    color: '#374151',
                                  }}
                                  data-cy={`okr-objective-menu-icon-desktop-${objective?.id}`}
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

        {objective?.keyResults?.length > 0 && (
          <div
            className="mt-3 border-t border-gray-200 overflow-x-auto [-webkit-overflow-scrolling:touch] sm:mt-4"
            data-cy={`okr-objective-card-key-results-${objective?.id}`}
          >
            <table
              className="w-full min-w-[720px] table-auto divide-y divide-gray-200 md:min-w-[900px]"
              data-cy={`okr-objective-card-key-results-table-${objective?.id}`}
            >
              <thead
                className="bg-gray-50"
                data-cy={`okr-objective-card-key-results-thead-${objective?.id}`}
              >
                <tr
                  data-cy={`okr-objective-card-key-results-header-row-${objective?.id}`}
                >
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900 tracking-wider min-w-[200px] sm:px-6 sm:py-3 sm:min-w-[240px] md:min-w-[280px]"
                    data-cy={`okr-objective-card-th-key-result-${objective?.id}`}
                  >
                    Key Result
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[100px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[120px]"
                    data-cy={`okr-objective-card-th-metrics-${objective?.id}`}
                  >
                    {isInlineEditing || isAnyKeyResultInlineEditActive
                      ? 'Metric Type'
                      : 'Metrics'}
                  </th>
                  {(isInlineEditing || isAnyKeyResultInlineEditActive) && (
                    <th
                      scope="col"
                      className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[120px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[160px]"
                      data-cy={`okr-objective-card-th-deadline-${objective?.id}`}
                    >
                      Deadline
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider w-[80px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[90px]"
                    data-cy={`okr-objective-card-th-weight-${objective?.id}`}
                  >
                    Weight
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 tracking-wider min-w-[160px] whitespace-nowrap sm:px-6 sm:py-3 sm:w-[220px]"
                    data-cy={`okr-objective-card-th-progress-${objective?.id}`}
                  >
                    {isInlineEditing || isAnyKeyResultInlineEditActive
                      ? 'Values'
                      : 'Progress'}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 w-[52px] whitespace-nowrap text-right sm:px-6 sm:py-3 sm:w-[56px]"
                    data-cy={`okr-objective-card-th-actions-${objective?.id}`}
                  />
                </tr>
              </thead>
              <tbody
                className="bg-white divide-y divide-gray-200 text-sm"
                data-cy={`okr-objective-card-key-results-tbody-${objective?.id}`}
              >
                {(isInlineEditing
                  ? editableKeyResults
                  : objective.keyResults
                ).map((keyResult: any) => (
                  <KeyResultTableRow
                    key={keyResult.id}
                    keyResult={keyResult}
                    myOkr={myOkr}
                    updatedKeyResults={updatedKeyResults}
                    objectiveId={objective?.id ?? ''}
                    objectiveUserId={objective?.userId}
                    objectiveKeyResults={
                      isInlineEditing
                        ? editableKeyResults
                        : objective?.keyResults
                    }
                    isInActiveSession={isInActiveSession}
                    objectiveEditMode={isInlineEditing}
                    editableKeyResult={keyResult}
                    onInlineObjectiveKeyResultChange={
                      handleInlineObjectiveKeyResultChange
                    }
                    rowInlineEdit={
                      !isInlineEditing &&
                      String(activeInlineKeyResultId) === String(keyResult.id)
                    }
                    onRequestInlineEdit={onRequestInlineKeyResultEdit}
                    onCancelRowInlineEdit={onCancelInlineKeyResultEdit}
                    onFinishRowInlineEdit={onFinishInlineKeyResultEdit}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        data-cy={`okr-objective-card-delete-modal-${objective?.id}`}
        open={isDeleteModalOpen}
        onConfirm={() => handleDeleteObjective(objectiveValue.id as string)}
        onCancel={onCloseDeleteModal}
        loading={isDeletingObjective}
      />

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

export default ObjectiveCard;
