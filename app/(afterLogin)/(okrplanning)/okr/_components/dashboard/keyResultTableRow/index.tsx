/* eslint-disable local-rules/data-cy-required */
import {
  DatePicker,
  Dropdown,
  Button,
  Input,
  InputNumber,
  Menu,
  Modal,
  Popconfirm,
  message,
} from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import EditKeyResult from '../editKeyResult';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteMilestone,
  useUpdateObjectiveNestedDelete,
  useUpdateKeyResult,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { useIsMobile } from '@/hooks/useIsMobile';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IoCheckmarkCircle } from 'react-icons/io5';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined,
  DownOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  PercentageOutlined,
  TagOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Select } from 'antd';
import dayjs from 'dayjs';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';

const { Option } = Select;

interface KeyResultTableRowProps {
  keyResult: any;
  myOkr: boolean;
  updatedKeyResults: any;
  objectiveId: string;
  objectiveUserId?: string;
  isInActiveSession?: boolean;
  objectiveEditMode?: boolean;
  editableKeyResult?: any;
  onInlineObjectiveKeyResultChange?: (
    keyResultId: string,
    field: string,
    value: any,
  ) => void;
  rowInlineEdit?: boolean;
  onRequestInlineEdit?: (keyResultId: string) => void;
  onCancelRowInlineEdit?: () => void;
  onFinishRowInlineEdit?: () => void;
}

const KeyResultTableRow: FC<KeyResultTableRowProps> = ({
  keyResult,
  myOkr,
  updatedKeyResults,
  objectiveId,
  objectiveUserId,
  isInActiveSession = true,
  objectiveEditMode = false,
  editableKeyResult,
  onInlineObjectiveKeyResultChange,
  rowInlineEdit = false,
  onRequestInlineEdit,
  onCancelRowInlineEdit,
  onFinishRowInlineEdit,
}) => {
  const [open, setOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openMilestoneModal, setOpenMilestoneModal] = useState(false);
  const [editableMilestones, setEditableMilestones] = useState<any[]>([]);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<
    number | null
  >(null);
  const [isSavingMilestones, setIsSavingMilestones] = useState(false);
  /** Server milestone IDs present when the milestones modal was opened (for DELETE before PUT). */
  const baselineMilestoneIdsRef = useRef<Set<string>>(new Set());
  const { mutate: updateAndDelete, isLoading: isDeletingKeyResult } =
    useUpdateObjectiveNestedDelete();
  const { mutate: updateKeyResult, mutateAsync: updateKeyResultAsync } =
    useUpdateKeyResult();
  const { mutateAsync: deleteMilestoneById } = useDeleteMilestone();
  const { userId } = useAuthenticationStore();
  const { data: metrics } = useGetMetrics();
  const isBasicOkr = useIsBasicOkr();
  const { isMobile, isTablet } = useIsMobile();
  const { setKeyResultValue, setKeyResultId, setObjectiveId, okrTab } =
    useOKRStore();

  const canEditDelete =
    (myOkr || objectiveUserId === userId) && isInActiveSession;
  const hideOwnTeamOkrActions =
    String(okrTab) === '2' && objectiveUserId === userId;
  const canShowActionsMenu = canEditDelete && !hideOwnTeamOkrActions;

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
    if (onRequestInlineEdit) {
      onRequestInlineEdit(String(keyResult?.id));
      return;
    }
    setOpen(true);
    setKeyResultValue(keyResult);
  };

  const onClose = () => setOpen(false);
  const [rowEditableKeyResult, setRowEditableKeyResult] =
    useState<any>(keyResult);

  useEffect(() => {
    if (rowInlineEdit) {
      setRowEditableKeyResult({ ...keyResult });
    }
  }, [rowInlineEdit, keyResult]);

  // Seed only when the modal opens. Do not depend on milestone arrays while open;
  // a new parent reference would reset local edits before Save.
  useEffect(() => {
    if (!openMilestoneModal) return;
    const initial = (rowKeyResult?.milestones || []).map((milestone: any) => ({
      ...milestone,
    }));
    baselineMilestoneIdsRef.current = new Set(
      initial
        .map((m: any) => m?.id)
        .filter((id: unknown) => id != null && String(id).trim() !== '')
        .map((id: unknown) => String(id)),
    );
    setEditableMilestones(initial);
    setEditingMilestoneIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot milestones at open time only
  }, [openMilestoneModal]);

  const closeMilestoneModal = () => {
    setOpenMilestoneModal(false);
    setEditingMilestoneIndex(null);
  };

  const distributeMilestoneWeights = (list: any[]) => {
    if (list.length === 0) return [];
    const baseWeight = Math.floor(100 / list.length);
    const remainder = 100 - baseWeight * list.length;
    return list.map((milestone: any, idx: number) => ({
      ...milestone,
      weight: baseWeight + (idx < remainder ? 1 : 0),
    }));
  };

  const removeMilestoneAt = (index: number) => {
    setEditableMilestones((prev) => {
      const remaining = prev.filter((milestoneItem, i) => {
        void milestoneItem;
        return i !== index;
      });
      return distributeMilestoneWeights(remaining);
    });
    setEditingMilestoneIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const addMilestoneInModal = () => {
    const hasBlankTitle = editableMilestones.some(
      (m: any) => !m?.title || !String(m.title).trim(),
    );
    if (editableMilestones.length > 0 && hasBlankTitle) {
      message.warning('Give every milestone a title before adding another.');
      return;
    }
    const next = [...editableMilestones, { title: '', weight: 0 }];
    const distributed = distributeMilestoneWeights(next);
    setEditableMilestones(distributed);
    setEditingMilestoneIndex(distributed.length - 1);
  };

  const menu = canShowActionsMenu ? (
    <Menu
      className="okr-actions-menu"
      items={[
        {
          key: '1',
          icon: <EditOutlinedIcon className="text-gray-700" />,
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

  const handleKeyResultDelete = (id: string) => {
    updateAndDelete({
      toBeUpdated: updatedKeyResults,
      toBeDeleted: id,
      objectiveId,
    });
  };

  const getKeyResultStatus = () => {
    if (
      keyResult?.status === 'achieved' ||
      Number(keyResult?.progress) === 100
    ) {
      return { value: 'achieved', label: 'Achieved', color: 'green' };
    }
    if (keyResult?.status === 'failed') {
      return { value: 'failed', label: 'Failed', color: 'red' };
    }
    return { value: 'pending', label: 'Pending', color: 'yellow' };
  };

  const handleStatusChange = (newStatus: string) => {
    const progressValue =
      newStatus === 'achieved' ? 100 : newStatus === 'failed' ? 0 : 0;
    updateKeyResult(
      { ...keyResult, progress: progressValue, status: newStatus },
      {},
    );
  };

  const rowKeyResult =
    objectiveEditMode && editableKeyResult
      ? editableKeyResult
      : rowInlineEdit
        ? rowEditableKeyResult
        : keyResult;
  const isBasicAchieveOrNot =
    isBasicOkr && rowKeyResult?.metricType?.name === 'Achieve';
  const metricName = rowKeyResult?.metricType?.name || 'N/A';
  const progress = Number(rowKeyResult?.progress) || 0;
  const canInlineEditFromObjective =
    objectiveEditMode &&
    canShowActionsMenu &&
    rowKeyResult?.isClosed === false &&
    Number(rowKeyResult?.progress ?? 0) === 0;
  const canInlineEditFromRowAction =
    rowInlineEdit &&
    canShowActionsMenu &&
    rowKeyResult?.isClosed === false &&
    Number(rowKeyResult?.progress ?? 0) === 0;
  const canInlineEditNow =
    canInlineEditFromObjective || canInlineEditFromRowAction;
  const inlineMetricType = rowKeyResult?.metricType?.name || '';
  const isMilestoneMetric = inlineMetricType === 'Milestone';
  const hasMilestones = (rowKeyResult?.milestones?.length || 0) > 0;
  const showNumericFieldsInInline =
    inlineMetricType === 'Numeric' ||
    inlineMetricType === 'Currency' ||
    inlineMetricType === 'Percentage';
  const metricIcon =
    metricName === 'Milestone' ? (
      <UnorderedListOutlined className="text-[12px]" />
    ) : metricName === 'Percentage' ? (
      <PercentageOutlined className="text-[12px]" />
    ) : metricName === 'Currency' ? (
      <DollarOutlined className="text-[12px]" />
    ) : metricName === 'Numeric' ? (
      <span className="text-[12px] font-semibold leading-none">#</span>
    ) : metricName === 'Achieve' ? (
      <CheckCircleOutlined className="text-[12px]" />
    ) : (
      <TagOutlined className="text-[12px]" />
    );

  const setRowField = (field: string, value: any) => {
    if (objectiveEditMode) {
      onInlineObjectiveKeyResultChange?.(
        String(rowKeyResult?.id),
        field,
        value,
      );
      return;
    }
    setRowEditableKeyResult((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateRowInlineEdit = () => {
    if (
      !rowEditableKeyResult?.title ||
      !String(rowEditableKeyResult.title).trim()
    ) {
      message.warning('Key Result title is required.');
      return false;
    }
    if (!rowEditableKeyResult?.deadline) {
      message.warning('Deadline is required.');
      return false;
    }
    const metric =
      rowEditableKeyResult?.metricType?.name || rowEditableKeyResult?.key_type;
    if (
      metric === 'Milestone' &&
      (!rowEditableKeyResult?.milestones ||
        rowEditableKeyResult.milestones.length === 0)
    ) {
      message.warning('At least one milestone is required.');
      return false;
    }
    if (
      (metric === 'Numeric' ||
        metric === 'Currency' ||
        metric === 'Percentage') &&
      Number(rowEditableKeyResult?.initialValue) >=
        Number(rowEditableKeyResult?.targetValue)
    ) {
      message.warning('Target value must be greater than the initial value.');
      return false;
    }
    return true;
  };

  const onSaveRowInlineEdit = () => {
    if (!validateRowInlineEdit()) return;
    updateKeyResult(rowEditableKeyResult, {
      onSuccess: () => onFinishRowInlineEdit?.(),
    });
  };

  const onMilestoneFieldChange = (
    index: number,
    field: 'title' | 'weight',
    value: any,
  ) => {
    setEditableMilestones((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const onSaveMilestones = async () => {
    if (editableMilestones.length === 0) {
      message.warning('At least one milestone is required.');
      return;
    }
    const hasEmptyTitle = editableMilestones.some(
      (milestone: any) => !milestone?.title || !String(milestone.title).trim(),
    );
    if (hasEmptyTitle) {
      message.warning('All milestone titles are required.');
      return;
    }

    const totalWeight = editableMilestones.reduce(
      (sum: number, milestone: any) => sum + Number(milestone?.weight || 0),
      0,
    );
    if (totalWeight !== 100) {
      message.warning('Milestone weights must total 100.');
      return;
    }

    if (objectiveEditMode || rowInlineEdit) {
      setRowField('milestones', editableMilestones);
      closeMilestoneModal();
      return;
    }

    const currentIdSet = new Set(
      editableMilestones
        .map((m: any) => m?.id)
        .filter((id: unknown) => id != null && String(id).trim() !== '')
        .map((id: unknown) => String(id)),
    );
    const removedServerIds = [...baselineMilestoneIdsRef.current].filter(
      (id) => !currentIdSet.has(id),
    );

    setIsSavingMilestones(true);
    try {
      await Promise.all(removedServerIds.map((id) => deleteMilestoneById(id)));
      await updateKeyResultAsync({
        ...rowKeyResult,
        milestones: editableMilestones,
      });
      closeMilestoneModal();
    } catch {
      message.error(
        'Could not save milestones. If a milestone was removed, try again.',
      );
    } finally {
      setIsSavingMilestones(false);
    }
  };
  const canOpenMilestoneModal =
    isMilestoneMetric && hasMilestones && !objectiveEditMode && !rowInlineEdit;

  return (
    <>
      <tr
        className={`transition-colors ${
          canOpenMilestoneModal
            ? 'cursor-pointer hover:bg-blue-50'
            : 'hover:bg-gray-50'
        }`}
        data-cy={`okr-key-result-table-row-${keyResult?.id}`}
        onClick={() => {
          if (canOpenMilestoneModal) setOpenMilestoneModal(true);
        }}
      >
        <td
          className="px-3 py-3 text-sm font-normal text-gray-900 break-normal whitespace-normal align-top min-w-[180px] sm:px-6 sm:py-4 sm:min-w-[220px] md:min-w-[260px]"
          data-cy={`okr-key-result-table-row-title-${keyResult?.id}`}
        >
          {canInlineEditNow ? (
            <Input
              value={rowKeyResult?.title || ''}
              onChange={(e) => setRowField('title', e.target.value)}
              placeholder="Key Result"
              size="middle"
              className="h-9 min-w-0 w-full max-w-full"
              disabled={!canInlineEditNow}
            />
          ) : (
            keyResult?.title
          )}
        </td>
        {objectiveEditMode || rowInlineEdit ? (
          <td
            className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4"
            data-cy={`okr-key-result-table-row-metric-type-inline-${keyResult?.id}`}
          >
            <Select
              value={rowKeyResult?.metricTypeId ?? undefined}
              placeholder="Metric type"
              size="middle"
              className="h-9 w-[160px] min-w-[160px]"
              disabled={!canInlineEditNow}
              onChange={(value) => {
                const selectedMetric = metrics?.items?.find(
                  (metric: any) => metric.id === value,
                );
                setRowField('metricTypeId', value);
                if (selectedMetric) {
                  setRowField('key_type', selectedMetric.name);
                  setRowField('metricType', selectedMetric);
                }
              }}
            >
              {metrics?.items?.map((metric: any) => (
                <Option key={metric?.id} value={metric?.id}>
                  {metric?.name}
                </Option>
              ))}
            </Select>
          </td>
        ) : (
          <td
            className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4"
            data-cy={`okr-key-result-table-row-metric-${keyResult?.id}`}
          >
            <span
              className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600"
              data-cy={`okr-key-result-table-row-metric-badge-${keyResult?.id}`}
              title={metricName}
            >
              <span className="inline-flex items-center gap-1">
                {isMobile ? metricIcon : metricName}
                {!isMobile &&
                canOpenMilestoneModal &&
                metricName === 'Milestone' ? (
                  <EyeOutlined className="text-[11px] text-blue-600" />
                ) : null}
              </span>
            </span>
          </td>
        )}
        {(objectiveEditMode || rowInlineEdit) && (
          <td
            className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4"
            data-cy={`okr-key-result-table-row-deadline-inline-${keyResult?.id}`}
          >
            <DatePicker
              value={
                rowKeyResult?.deadline ? dayjs(rowKeyResult.deadline) : null
              }
              format="YYYY-MM-DD"
              size="middle"
              status={!rowKeyResult?.deadline ? 'error' : ''}
              onChange={(date) =>
                setRowField('deadline', date ? date.format('YYYY-MM-DD') : null)
              }
              className="h-9 w-full max-w-[11rem] min-w-0 sm:w-[160px] sm:max-w-none"
              disabled={!canInlineEditNow}
            />
          </td>
        )}
        <td
          className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 sm:px-6 sm:py-4"
          data-cy={`okr-key-result-table-row-weight-${keyResult?.id}`}
        >
          {objectiveEditMode || rowInlineEdit ? (
            <InputNumber
              value={Number(rowKeyResult?.weight ?? 0)}
              size="middle"
              disabled
              className="h-9 w-full max-w-[6.5rem] sm:w-[100px] sm:max-w-none"
            />
          ) : (
            rowKeyResult?.weight
          )}
        </td>
        <td
          className="min-w-[140px] px-3 py-3 whitespace-nowrap sm:min-w-[180px] sm:px-6 sm:py-4"
          data-cy={
            objectiveEditMode || rowInlineEdit
              ? `okr-key-result-table-row-values-inline-${keyResult?.id}`
              : `okr-key-result-table-row-status-${keyResult?.id}`
          }
        >
          {objectiveEditMode || rowInlineEdit ? (
            showNumericFieldsInInline ? (
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <InputNumber
                  value={Number(rowKeyResult?.initialValue ?? 0)}
                  onChange={(value) =>
                    setRowField('initialValue', Number(value ?? 0))
                  }
                  size="middle"
                  className="h-9 w-full max-w-[7.5rem] sm:w-[130px] sm:max-w-none"
                  placeholder="Initial"
                  disabled={!canInlineEditNow}
                />
                <InputNumber
                  value={Number(rowKeyResult?.targetValue ?? 0)}
                  onChange={(value) =>
                    setRowField('targetValue', Number(value ?? 0))
                  }
                  size="middle"
                  className="h-9 w-full max-w-[7.5rem] sm:w-[130px] sm:max-w-none"
                  placeholder="Target"
                  disabled={!canInlineEditNow}
                />
              </div>
            ) : isMilestoneMetric ? (
              <Button
                type="default"
                size="middle"
                icon={<PlusOutlined />}
                className="h-9 whitespace-nowrap"
                disabled={!canInlineEditNow}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMilestoneModal(true);
                }}
                data-cy={`okr-key-result-table-row-add-milestone-${keyResult?.id}`}
              >
                Add Milestone
              </Button>
            ) : (
              <span className="text-gray-400">-</span>
            )
          ) : (
            <div
              className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center"
              data-cy={`okr-key-result-table-row-status-wrap-${keyResult?.id}`}
            >
              {isBasicAchieveOrNot ? (
                <Select
                  value={getKeyResultStatus().value}
                  onChange={handleStatusChange}
                  disabled={!canEditDelete || keyResult?.isClosed}
                  size="small"
                  suffixIcon={
                    <DownOutlined className="text-[#374151] text-[14px]" />
                  }
                  className="min-w-0 w-full max-w-[12rem] sm:min-w-[100px] sm:max-w-none [&_.ant-select-suffix]:text-[14px]"
                >
                  <Option value="pending">Pending</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="achieved">Achieved</Option>
                </Select>
              ) : progress >= 100 ? (
                <div
                  className="flex min-w-0 w-full max-w-[200px] items-center gap-1 sm:max-w-none"
                  data-cy={`okr-key-result-table-row-progress-100-${keyResult?.id}`}
                >
                  <div
                    className="min-w-0 flex-1 max-w-[140px] rounded-full bg-gray-200 h-2 overflow-hidden sm:max-w-[140px] sm:flex-none sm:w-[140px]"
                    data-cy={`okr-key-result-table-row-progress-bar-bg-${keyResult?.id}`}
                  >
                    <div
                      className="bg-success h-2 rounded-full w-full"
                      data-cy={`okr-key-result-table-row-progress-bar-fill-${keyResult?.id}`}
                    />
                  </div>
                  <IoCheckmarkCircle className="text-success text-lg" />
                </div>
              ) : (
                <div
                  className="flex min-w-0 w-full max-w-[200px] items-center sm:max-w-none"
                  data-cy={`okr-key-result-table-row-progress-partial-${keyResult?.id}`}
                >
                  <div
                    className="mr-2 min-w-0 flex-1 max-w-[140px] overflow-hidden rounded-full bg-gray-200 h-2 sm:mr-3 sm:max-w-[140px] sm:flex-none sm:w-[140px]"
                    data-cy={`okr-key-result-table-row-progress-bar-bg-${keyResult?.id}`}
                  >
                    <div
                      className="bg-okr-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                      data-cy={`okr-key-result-table-row-progress-bar-fill-${keyResult?.id}`}
                    />
                  </div>
                  <span
                    className="text-gray-500 text-xs"
                    data-cy={`okr-key-result-table-row-progress-text-${keyResult?.id}`}
                  >
                    {progress}%
                  </span>
                </div>
              )}
            </div>
          )}
        </td>
        <td
          className="min-w-[52px] px-3 py-3 text-right whitespace-nowrap sm:min-w-[56px] sm:px-6 sm:py-4"
          data-cy={`okr-key-result-table-row-actions-${keyResult?.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          {!objectiveEditMode &&
          !rowInlineEdit &&
          canShowActionsMenu &&
          keyResult?.isClosed === false &&
          Number(keyResult?.progress ?? 0) === 0 &&
          menu ? (
            <div
              className="flex min-w-[56px] justify-end"
              data-cy={`okr-key-result-table-row-actions-dropdown-container-${keyResult?.id}`}
            >
              <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomRight"
                overlayClassName="okr-actions-dropdown"
                data-cy={`okr-key-result-table-row-actions-dropdown-${keyResult?.id}`}
              >
                <button
                  type="button"
                  className="flex h-6 w-6 min-h-6 min-w-6 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 p-0 text-[#374151] transition-colors hover:bg-gray-50"
                  data-cy={`okr-key-result-table-row-actions-button-${keyResult?.id}`}
                >
                  <MoreHorizIcon
                    sx={{ width: 14, height: 14, color: '#374151' }}
                    data-cy={`okr-key-result-table-row-actions-icon-${keyResult?.id}`}
                  />
                </button>
              </Dropdown>
            </div>
          ) : null}
          {rowInlineEdit ? (
            <div className="flex min-w-[56px] justify-end gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 sm:h-8 sm:w-8"
                onClick={() => onCancelRowInlineEdit?.()}
                aria-label="Cancel key result edit"
              >
                <CloseOutlined />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded bg-okr-primary text-white hover:bg-blue-800 sm:h-8 sm:w-8"
                onClick={onSaveRowInlineEdit}
                aria-label="Save key result edit"
              >
                <CheckOutlined />
              </button>
            </div>
          ) : null}
        </td>
      </tr>
      {!objectiveEditMode ? (
        <EditKeyResult open={open} onClose={onClose} keyResult={keyResult} />
      ) : null}
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleKeyResultDelete(keyResult?.id)}
        onCancel={onCloseDeleteModal}
        loading={isDeletingKeyResult}
      />
      <Modal
        open={openMilestoneModal}
        onCancel={closeMilestoneModal}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button key="cancel" onClick={closeMilestoneModal} block={isMobile}>
              Cancel
            </Button>
            <Button
              key="save"
              type="primary"
              onClick={() => void onSaveMilestones()}
              loading={isSavingMilestones}
              disabled={editableMilestones.length === 0}
              block={isMobile}
            >
              Save Milestones
            </Button>
          </div>
        }
        width={isMobile ? 'min(100%, 400px)' : isTablet ? 560 : 640}
        centered
        styles={{
          body: { maxHeight: isMobile ? '70vh' : undefined, overflowY: 'auto' },
        }}
        title={
          <div>
            <p className="m-0 text-xs font-medium uppercase tracking-wide text-gray-500">
              Key Result
            </p>
            <div>
              <p className="m-0 text-sm font-semibold text-gray-900">
                {rowKeyResult?.title || 'Key Result'}
              </p>
            </div>
          </div>
        }
      >
        <div className="pl-2 sm:pl-3">
          <div className="divide-y divide-gray-100">
            {editableMilestones.map((milestone: any, index: number) => {
              const rowKey = `milestone-${rowKeyResult?.id ?? 'kr'}-${index}-${
                milestone?.id ?? 'new'
              }`;
              const statusStr = String(milestone?.status ?? '').trim();
              const isMilestoneCompleted =
                statusStr === 'Completed' ||
                statusStr.toLowerCase() === 'completed';
              const isEditing =
                editingMilestoneIndex === index && !isMilestoneCompleted;

              return (
                <div
                  key={rowKey}
                  className={`flex flex-col items-stretch gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:gap-3 ${
                    isMilestoneCompleted ? 'rounded-md bg-emerald-50/50' : ''
                  }`}
                  data-cy={`okr-milestone-modal-row-${rowKey}`}
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={milestone?.title || ''}
                        onChange={(e) =>
                          onMilestoneFieldChange(index, 'title', e.target.value)
                        }
                        placeholder={`Milestone ${index + 1} title`}
                        className="h-9 min-w-0 w-full flex-1 sm:flex-1"
                      />
                      <div className="flex items-center justify-end gap-2 sm:shrink-0">
                        <InputNumber
                          min={0}
                          max={100}
                          value={Number(milestone?.weight || 0)}
                          onChange={(value) =>
                            onMilestoneFieldChange(
                              index,
                              'weight',
                              Number(value || 0),
                            )
                          }
                          className="h-9 w-full max-w-[7rem] sm:w-[100px] sm:max-w-none"
                          formatter={(value) => `${value}%`}
                          parser={(value) =>
                            Number((value || '').replace('%', ''))
                          }
                        />
                        <Button
                          type="text"
                          size="small"
                          className="shrink-0 text-gray-600"
                          icon={<CheckOutlined />}
                          aria-label="Done editing milestone"
                          onClick={() => setEditingMilestoneIndex(null)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="m-0 text-sm font-medium text-gray-900">
                            {milestone?.title?.trim()
                              ? milestone.title
                              : `Milestone ${index + 1}`}
                          </p>
                          {isMilestoneCompleted ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800"
                              data-cy={`okr-milestone-modal-completed-${rowKey}`}
                            >
                              <CheckOutlined className="text-[10px]" />
                              Completed
                            </span>
                          ) : null}
                        </div>
                        {milestone?.status && !isMilestoneCompleted ? (
                          <p className="m-0 mt-0.5 text-xs text-gray-500">
                            {milestone.status}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
                        <span className="shrink-0 text-sm tabular-nums text-gray-600">
                          {Number(milestone?.weight || 0)}%
                        </span>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            type="text"
                            size="small"
                            className="text-gray-600"
                            icon={<EditOutlined />}
                            aria-label="Edit milestone"
                            disabled={isMilestoneCompleted}
                            title={
                              isMilestoneCompleted
                                ? 'Completed milestones cannot be edited'
                                : undefined
                            }
                            onClick={() =>
                              setEditingMilestoneIndex((cur) =>
                                cur === index ? null : index,
                              )
                            }
                          />
                          {isMilestoneCompleted ? (
                            <Button
                              type="text"
                              size="small"
                              className="text-gray-400"
                              icon={<CloseOutlined />}
                              aria-label="Remove milestone"
                              disabled
                              title="Completed milestones cannot be removed"
                            />
                          ) : (
                            <Popconfirm
                              title="Remove this milestone?"
                              description="You can undo by closing the dialog without saving."
                              okText="Remove"
                              cancelText="Cancel"
                              onConfirm={() => removeMilestoneAt(index)}
                            >
                              <Button
                                type="text"
                                size="small"
                                className="text-gray-500 hover:text-red-600"
                                icon={<CloseOutlined />}
                                aria-label="Remove milestone"
                              />
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            data-cy={`okr-milestone-modal-add-${rowKeyResult?.id}`}
            onClick={addMilestoneInModal}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-slate-50 hover:text-blue-700"
          >
            <PlusOutlined className="text-base" />
            Add milestone
          </button>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Total weight</span>
            <span
              className={
                editableMilestones.reduce(
                  (s: number, m: any) => s + Number(m?.weight || 0),
                  0,
                ) === 100
                  ? 'font-medium text-emerald-600'
                  : 'font-medium text-amber-700'
              }
            >
              {editableMilestones.reduce(
                (s: number, m: any) => s + Number(m?.weight || 0),
                0,
              )}
              % / 100%
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KeyResultTableRow;
