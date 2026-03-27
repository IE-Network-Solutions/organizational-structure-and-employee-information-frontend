'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  Tooltip,
} from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons';
import KeyResultForm from '../keyresultForm';
import {
  KeyResultFieldLabel,
  KEY_RESULT_TOOLTIP,
  WEIGHT_TOOLTIP,
  DEADLINE_TOOLTIP,
} from '../keyresultForm/_ui';
import {
  useOKRStore,
  useAchieveOrNotStore,
  useMilestoneFormStore,
  useKeyResultFormStore,
} from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreateObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { defaultObjective } from '@/store/uistate/features/okrplanning/okr/interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import OKRInlineSuggestions from '@/components/ai/OKRInlineSuggestions';
import { useIsBasicOkr } from '../../_utils/okrMode';

interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
}

const OkrDrawer: React.FC<OkrDrawerProps> = (props) => {
  const {
    setObjectiveValue,
    objectiveValue,
    objective,
    addKeyResult,
    updateKeyResult,
    updateKeyResultFields,
    removeKeyResult,
    addKeyResultValue,
    setObjective,
    fiscalYearId,
    sessionIds,
  } = useOKRStore();

  const [form] = Form.useForm();
  const [krForm] = Form.useForm();
  const { mutate: createObjective, isLoading } = useCreateObjective();
  const { isMobile } = useIsMobile();
  const [showAISuggestions, setShowAISuggestions] = React.useState(false);
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showInlineKeyResultForm, setShowInlineKeyResultForm] = useState(false);
  const [editingKeyResultIndex, setEditingKeyResultIndex] = useState<
    number | null
  >(null);
  const isBasic = useIsBasicOkr();
  const resetAchieveOrNot = useAchieveOrNotStore((s) => s.resetAchieveOrNot);
  const resetMilestoneForm = useMilestoneFormStore((s) => s.resetMilestoneForm);
  const resetKeyResultForm = useKeyResultFormStore((s) => s.resetKeyResultForm);

  const modalHeader = (
    <div
      id="okr-drawer-modal-header"
      data-cy="okr-drawer-modal-header"
      className="text-lg font-semibold text-gray-900"
    >
      Create Objective
    </div>
  );

  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.delegatedTo?.id || userData?.reportingTo?.id;

  const sessionId = sessionIds?.[0];
  const { data: keyResultByUser } = useGetUserKeyResult(
    reportsToId,
    fiscalYearId,
    sessionId,
  );
  // Use same query as edit form for alignment dropdown so options load on mobile (edit form uses reportsToId only)
  const { data: keyResultByUserForAlignment } =
    useGetUserKeyResult(reportsToId);
  const alignmentOptions =
    keyResultByUserForAlignment?.items ?? keyResultByUser?.items ?? [];
  const objectiveTitle = objectiveValue?.title
    ? objectiveValue?.title
    : alignmentOptions.find(
        (i: any) => i.id === objectiveValue?.allignedKeyResultId,
      )?.title;

  const buildEmptyObjective = () => ({
    ...defaultObjective,
    keyResults: [],
    keyResultValue: [],
  });

  useEffect(() => {
    // Only auto-fill title from alignment in Basic mode; in Advanced mode, user types their own title
    const currentTitle = objectiveValue?.title?.trim() || '';
    const newTitle = objectiveTitle?.trim() || '';
    if (isBasic && !currentTitle && newTitle) {
      setObjectiveValue({
        ...objectiveValue,
        title: newTitle,
      });
      form.setFieldsValue({ title: newTitle });
    }
  }, [objectiveTitle, objectiveValue?.title, form, setObjectiveValue, isBasic]);

  const resetDrawerState = () => {
    form.resetFields();
    krForm.resetFields();
    setShowAISuggestions(false);
    setShowMetricSelector(false);
    setShowInlineKeyResultForm(false);
    setEditingKeyResultIndex(null);
    resetAchieveOrNot();
    resetMilestoneForm();
    resetKeyResultForm();
    setObjectiveValue(buildEmptyObjective());
    setObjective(buildEmptyObjective());
  };

  useEffect(() => {
    if (!props.open) {
      resetDrawerState();
    }
  }, [props.open]);

  const handleDrawerClose = () => {
    resetDrawerState();
    props?.onClose();
  };
  const handleObjectiveChange = (value: any, field: string) => {
    const latest = useOKRStore.getState().objectiveValue;
    setObjectiveValue({
      ...latest,
      userId: userId,
      [field]: value,
    });
  };
  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResults = objective?.keyResults || [];
        const keyResultSum = keyResults.reduce(
          (sum: number, keyResult: Record<string, any>) =>
            sum + Number(keyResult?.weight ?? 0),
          0,
        );
        if (keyResultSum !== 100) {
          NotificationMessage.warning({
            message: `The sum of key result should equal to 100. Current sum: ${keyResultSum}`,
          });
          return; // Stop submission if the sum is not 100
        }

        if (keyResults && keyResults.length !== 0) {
          // Iterate over each keyResult to validate all milestone key types
          for (const [index, keyResult] of keyResults.entries()) {
            const keyType = keyResult?.metricType?.name || keyResult?.key_type;
            if (
              keyResult?.title == '' ||
              keyResult?.title == null ||
              keyResult?.title == undefined
            ) {
              NotificationMessage.warning({
                message: `Please Enter Number ${index + 1} Key Result Name`,
              });
              return; // Stop submission if the sum is not 100
            }
            if (keyType === 'Milestone') {
              // Check if at least one milestone is added
              if (
                !keyResult?.milestones ||
                !Array.isArray(keyResult.milestones) ||
                keyResult.milestones.length === 0
              ) {
                NotificationMessage.warning({
                  message: `On Number: ${index + 1} Title:${keyResult.title} Please add at least one milestone`,
                });
                return; // Stop submission if no milestone is added
              }

              const hasEmptyMilestoneTitle = keyResult.milestones.some(
                (milestone: Record<string, any>) =>
                  !String(milestone?.title ?? '').trim(),
              );

              if (hasEmptyMilestoneTitle) {
                NotificationMessage.warning({
                  message: `On Number: ${index + 1} Title:${keyResult.title} Please enter all milestone names before creating objective.`,
                });
                return;
              }

              // Calculate the sum of milestone values
              const milestoneSum = keyResult.milestones.reduce(
                (sum: number, milestone: Record<string, any>) =>
                  sum + Number(milestone?.weight ?? 0),
                0,
              );

              // Check if the sum of milestone values equals 100
              if (milestoneSum !== 100) {
                NotificationMessage.warning({
                  message: `On Number: ${index + 1} Title:${keyResult.title} key result sum of milestones should equal to 100. Current sum: ${milestoneSum}`,
                });
                return; // Stop submission if the sum is not 100
              }
            }
            if (
              keyType === 'Currency' ||
              keyType === 'Numeric' ||
              keyType === 'Percentage'
            ) {
              // Check if at least one milestone is added

              if (keyResult?.initialValue > keyResult?.targetValue) {
                NotificationMessage.warning({
                  message: `On number:${index + 1} title:${keyResult.title} key result initialValue should be less than or equal to the target value.`,
                });
                return; // Stop submission if the sum is not 100
              }
            }
          }

          // Transfer key results from objective to objectiveValue for submission
          const formValues = form.getFieldsValue();
          const modifiedObjectiveValue = {
            ...objectiveValue,
            keyResults: keyResults,
            // Merge form values as safety net (form holds user's latest input)
            title: formValues.title ?? objectiveValue?.title,
            allignedKeyResultId:
              formValues.allignedKeyResultId ??
              objectiveValue?.allignedKeyResultId,
            deadline: formValues.ObjectiveDeadline
              ? dayjs(formValues.ObjectiveDeadline).format('YYYY-MM-DD')
              : objectiveValue?.deadline,
          };

          if (
            modifiedObjectiveValue?.allignedKeyResultId === '' ||
            modifiedObjectiveValue?.allignedKeyResultId === null
          ) {
            delete modifiedObjectiveValue.allignedKeyResultId;
          }
          // If all checks pass, proceed with the objective creation
          createObjective(modifiedObjectiveValue, {
            onSuccess: () => {
              handleDrawerClose();
            },
          });
        } else {
          // Show an error message if keyResults is empty
          NotificationMessage.warning({
            message: 'Please add at least one key result before submitting.',
          });
        }
      })
      .catch(() => {
        // Validation failed
      });
  };

  // Calculate total weight (sum of key result weights only)
  const calculateTotalWeight = () => {
    const keyResults = objective?.keyResults || [];
    let totalWeight = 0;

    if (Array.isArray(keyResults)) {
      keyResults.forEach((keyResult: any) => {
        // Add key result weight only
        totalWeight += keyResult?.weight || 0;
      });
    }

    return totalWeight;
  };

  const totalWeight = calculateTotalWeight();

  const footer = (
    <div
      id="okr-drawer-modal-footer"
      data-cy="okr-drawer-modal-footer"
      className="w-full flex justify-end items-center pt-2 gap-3"
    >
      <Button
        id="okr-drawer-cancel-button"
        data-cy="okr-drawer-cancel-button"
        onClick={handleDrawerClose}
        className="px-6 h-10 rounded-lg text-sm border-gray-300 text-gray-700"
      >
        Cancel
      </Button>
      <Button
        id="okr-drawer-save-button"
        data-cy="okr-drawer-save-button"
        type="primary"
        onClick={onSubmit}
        loading={isLoading}
        disabled={
          !objectiveValue?.title ||
          !objectiveValue?.deadline ||
          !objective?.keyResults?.length
        }
        className="px-6 h-10 rounded-lg text-sm bg-okr-primary border-okr-primary"
      >
        Create
      </Button>
    </div>
  );

  const keyResultTypes = [
    { label: 'Milestone', value: 'Milestone' },
    { label: 'Currency', value: 'Currency' },
    { label: 'Numerics', value: 'Numeric' },
    { label: 'Percentage', value: 'Percentage' },
    { label: 'Achieved or Not', value: 'Achieved' },
  ];

  const { data: metrics } = useGetMetrics();

  const handleAddKeyResultType = ({ key }: { key: string }) => {
    // Create a mapping for the dropdown values to actual metric names
    const metricNameMapping: { [key: string]: string } = {
      Milestone: 'Milestone',
      Currency: 'Currency',
      Numeric: 'Numeric',
      Percentage: 'Percentage',
      Achieved: 'Achieve', // Map "Achieved" to "Achieve"
    };

    // Find the metric type ID for the selected key type
    const actualMetricName = metricNameMapping[key] || key;
    const metricType = metrics?.items?.find(
      (metric: any) => metric.name === actualMetricName,
    );
    const metricTypeId = metricType?.id || '';

    // Add key result with the correct metricTypeId
    addKeyResult(key, metricTypeId);
  };

  /** Pre-fill inline form when opening for edit (basic mode). */
  useEffect(() => {
    if (!isBasic || !showInlineKeyResultForm || editingKeyResultIndex == null)
      return;
    const item = objective?.keyResults?.[editingKeyResultIndex];
    if (!item) return;
    krForm.setFieldsValue({
      krTitle: item.title ?? '',
      krWeight: item.weight ?? 0,
      krDeadline: item.deadline ? dayjs(item.deadline) : null,
    });
  }, [isBasic, showInlineKeyResultForm, editingKeyResultIndex]);

  /** Save key result from inline form to local state only (basic mode). Add new or update existing when editing. */
  const handleSaveKeyResultLocal = () => {
    const metricType = metrics?.items?.find(
      (metric: any) => metric.name === 'Achieve',
    );
    const metricTypeId = metricType?.id || '';
    krForm
      .validateFields(['krTitle', 'krWeight', 'krDeadline'])
      .then((values) => {
        const rawDeadline = values.krDeadline;
        const deadline =
          rawDeadline != null && rawDeadline !== ''
            ? dayjs(rawDeadline).format('YYYY-MM-DD')
            : null;
        const title = values.krTitle?.trim() ?? '';
        const weight = Number(values.krWeight) ?? 0;

        if (editingKeyResultIndex != null) {
          updateKeyResultFields(editingKeyResultIndex, {
            title,
            weight,
            deadline,
          });
        } else {
          addKeyResult('Achieved', metricTypeId, {
            title,
            weight,
            deadline,
          });
        }

        krForm.resetFields(['krTitle', 'krWeight', 'krDeadline']);
        setShowInlineKeyResultForm(false);
        setEditingKeyResultIndex(null);
      })
      .catch(() => {});
  };

  const getCurrentTotalWeight = () => {
    return (
      objective?.keyResults?.reduce(
        (sum: number, kr: any) => sum + Number(kr?.weight || 0),
        0,
      ) || 0
    );
  };

  /** Basic mode: shared KR form body (add new at top, or in-place edit in list). */
  const renderBasicKrFormContent = () => (
    <div
      id="okr-drawer-key-result-inline-form"
      data-cy="okr-drawer-key-result-inline-form"
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <div
        className="flex flex-row flex-wrap gap-4 items-end"
        data-cy="okr-drawer-key-result-inline-form-row"
      >
        <Form.Item
          name="krTitle"
          label={
            <KeyResultFieldLabel
              label="Key Result"
              tooltip={KEY_RESULT_TOOLTIP}
            />
          }
          rules={[
            {
              required: true,
              message: 'Please enter the Key Result name',
            },
          ]}
          className="flex-1 min-w-[200px] mb-0"
        >
          <Input
            placeholder="Input"
            className="h-10 rounded-lg"
            aria-label="Key Result"
          />
        </Form.Item>
        <Form.Item
          name="krWeight"
          label={
            <KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />
          }
          rules={[
            { required: true, message: 'Please enter the Weight' },
            {
              type: 'number',
              min: 0,
              max: 100,
              message: 'Weight must be between 0 and 100',
            },
          ]}
          className="w-28 mb-0"
        >
          <InputNumber
            placeholder="Input"
            min={0}
            max={100}
            suffix="%"
            className="w-full h-10 rounded-lg"
            aria-label="Weight"
          />
        </Form.Item>
        <Form.Item
          name="krDeadline"
          label={
            <KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />
          }
          rules={[
            {
              required: true,
              message: 'Please select a deadline',
            },
          ]}
          className="w-44 mb-0"
        >
          <DatePicker
            placeholder="Select date"
            format="YYYY-MM-DD"
            className="w-full h-10 rounded-lg"
            disabledDate={(current) => {
              if (!current) return false;
              if (current < dayjs().startOf('day')) return true;
              if (
                objectiveValue?.deadline &&
                current > dayjs(objectiveValue.deadline).endOf('day')
              )
                return true;
              return false;
            }}
            aria-label="Deadline"
          />
        </Form.Item>
        <Form.Item className="mb-0 flex gap-2 items-center">
          {editingKeyResultIndex != null && (
            <Button
              type="default"
              htmlType="button"
              onClick={() => {
                krForm.resetFields(['krTitle', 'krWeight', 'krDeadline']);
                setShowInlineKeyResultForm(false);
                setEditingKeyResultIndex(null);
              }}
              className="h-10 px-6 rounded-lg"
              data-cy="okr-drawer-cancel-key-result-edit"
            >
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            htmlType="button"
            onClick={handleSaveKeyResultLocal}
            className="h-10 px-6 rounded-lg bg-okr-primary border-okr-primary"
            data-cy="okr-drawer-save-key-result"
          >
            Save
          </Button>
        </Form.Item>
      </div>
    </div>
  );

  return (
    <Modal
      data-cy="okr-drawer-modal"
      open={props.open}
      onCancel={handleDrawerClose}
      footer={footer}
      title={modalHeader}
      centered={!isMobile}
      width={isMobile ? '100%' : 1200}
      zIndex={12000}
      wrapClassName={isMobile ? 'okr-mobile-bottom-sheet' : 'okr-objective-modal'}
      bodyStyle={{
        padding: isMobile ? 12 : 24,
        maxHeight: isMobile ? 'calc(100vh - 150px)' : undefined,
        overflowY: isMobile ? 'auto' : undefined,
      }}
      style={{ padding: 0, maxHeight: isMobile ? '100vh' : '90vh' }}
      maskClosable={false}
      destroyOnClose
      closable
    >
      <Form
        id="okr-drawer-form"
        data-cy="okr-drawer-form"
        form={form}
        layout="vertical"
        className="w-full"
        requiredMark={false}
      >
        {/* OKR Section Title - same for basic and advanced */}
        <div
          id="okr-drawer-objective-section-header"
          data-cy="okr-drawer-objective-section-header"
          className="mb-6"
        >
          <h2
            id="okr-drawer-objective-section-title"
            data-cy="okr-drawer-objective-section-title"
            className="text-base font-bold text-gray-900"
          >
            Set your Objective
          </h2>
          <p
            id="okr-drawer-objective-section-subtitle"
            data-cy="okr-drawer-objective-section-subtitle"
            className="text-sm text-gray-500 mt-1"
          >
            Please select objective alignment to add objective
          </p>
        </div>

        {isMobile ? (
          <div
            id="okr-drawer-mobile-form"
            data-cy="okr-drawer-mobile-form"
            className="flex flex-col w-full gap-0"
          >
            <Form.Item
              id="okr-drawer-mobile-title-input"
              data-cy="okr-drawer-mobile-title-input"
              className="h-11 mb-8"
              name="title"
              label={
                <span
                  className="text-sm font-medium text-gray-700"
                  data-cy="okr-drawer-mobile-objective-label"
                >
                  Objective{' '}
                  <span
                    className="text-red-500"
                    data-cy="okr-drawer-mobile-objective-required"
                  >
                    *
                  </span>{' '}
                  <Tooltip
                    title={
                      <div
                        className="py-1"
                        data-cy="okr-drawer-objective-tooltip"
                      >
                        <div
                          className="font-bold text-gray-900 mb-1"
                          data-cy="okr-drawer-objective-tooltip-title"
                        >
                          Objective name
                        </div>
                        <div
                          className="text-sm text-gray-700 leading-relaxed"
                          data-cy="okr-drawer-objective-tooltip-content"
                        >
                          These are objective names they can be given or are
                          automatically selected when you select your alignment
                        </div>
                      </div>
                    }
                    overlayClassName="okr-tooltip-custom"
                    placement="topLeft"
                  >
                    <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the Objective name',
                },
              ]}
            >
              <Input
                id="okr-drawer-mobile-title-input-field"
                data-cy="okr-drawer-mobile-title-input-field"
                allowClear
                placeholder="Input"
                className="h-11 w-full rounded-lg"
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
                style={{ fontSize: '14px', height: '44px' }}
              />
            </Form.Item>
            <div
              id="okr-drawer-mobile-form-alignment-select"
              data-cy="okr-drawer-mobile-form-alignment-select"
              className="flex flex-col w-full gap-6 mb-6"
            >
              <Form.Item
                id="okr-drawer-mobile-alignment-select"
                data-cy="okr-drawer-mobile-alignment-select"
                className="h-11 w-full mb-0"
                name="allignedKeyResultId"
                label={
                  <span
                    className="text-sm font-medium text-gray-700"
                    data-cy="okr-drawer-mobile-alignment-label"
                  >
                    Alignment{' '}
                    <span
                      className="text-red-500"
                      data-cy="okr-drawer-mobile-alignment-required"
                    >
                      *
                    </span>{' '}
                    <Tooltip
                      title={
                        <div
                          className="py-1"
                          data-cy="okr-drawer-alignment-tooltip"
                        >
                          <div
                            className="font-bold text-gray-900 mb-1"
                            data-cy="okr-drawer-alignment-tooltip-title"
                          >
                            Alignment
                          </div>
                          <div
                            className="text-sm text-gray-700 leading-relaxed"
                            data-cy="okr-drawer-alignment-tooltip-content"
                          >
                            These are objectives of your direct supervisor it
                            mandatory you align with your direct supervisor
                          </div>
                        </div>
                      }
                      overlayClassName="okr-tooltip-custom"
                      placement="topLeft"
                    >
                      <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                    </Tooltip>
                    {!reportsToId && (
                      <span
                        className="text-gray-400 text-xs ml-1"
                        data-cy="okr-drawer-alignment-optional"
                      >
                        (optional)
                      </span>
                    )}
                  </span>
                }
                rules={[
                  {
                    required: reportsToId ? true : false,
                    message: 'Please enter the Objective name',
                  },
                ]}
              >
                <Select
                  id="okr-drawer-mobile-alignment-select-dropdown"
                  data-cy="okr-drawer-mobile-alignment-select-dropdown"
                  className="h-11 w-full rounded-lg"
                  showSearch
                  placeholder="Select"
                  value={objectiveValue?.allignedKeyResultId}
                  onChange={(value) =>
                    handleObjectiveChange(value, 'allignedKeyResultId')
                  }
                  filterOption={(input: string, option: any) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                >
                  {alignmentOptions.map((keyResult: any) => (
                    <Select.Option
                      id="okr-drawer-mobile-alignment-select-option"
                      data-cy="okr-drawer-mobile-alignment-select-option"
                      key={keyResult.id}
                      value={keyResult.id}
                    >
                      {keyResult.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                id="okr-drawer-mobile-deadline-picker"
                data-cy="okr-drawer-mobile-deadline-picker"
                className="h-11 w-full mb-0"
                name="ObjectiveDeadline"
                label={
                  <span
                    className="text-sm font-medium text-gray-700"
                    data-cy="okr-drawer-mobile-deadline-label"
                  >
                    Deadline{' '}
                    <span
                      className="text-red-500"
                      data-cy="okr-drawer-mobile-deadline-required"
                    >
                      *
                    </span>{' '}
                    <Tooltip title="Set the objective deadline">
                      <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
              >
                <DatePicker
                  id="okr-drawer-mobile-deadline-picker-field"
                  data-cy="okr-drawer-mobile-deadline-picker-field"
                  value={
                    objectiveValue.deadline
                      ? dayjs(objectiveValue.deadline)
                      : null
                  }
                  onChange={(date) => {
                    handleObjectiveChange(
                      date?.format('YYYY-MM-DD'),
                      'deadline',
                    );
                  }}
                  className="w-full h-11 rounded-lg"
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          <div
            id="okr-drawer-desktop-form"
            data-cy="okr-drawer-desktop-form"
            className="grid grid-cols-12 gap-4 w-full mt-0 items-start"
          >
            <Form.Item
              id="okr-drawer-desktop-title-input"
              data-cy="okr-drawer-desktop-title-input"
              className="col-span-12 lg:col-span-6 mb-6"
              name="title"
              label={
                <span
                  className="text-sm font-medium text-gray-700"
                  data-cy="okr-drawer-desktop-objective-label"
                >
                  Objective{' '}
                  <span
                    className="text-red-500"
                    data-cy="okr-drawer-desktop-objective-required"
                  >
                    *
                  </span>{' '}
                  <Tooltip
                    title={
                      <div
                        className="py-1"
                        data-cy="okr-drawer-desktop-objective-tooltip"
                      >
                        <div
                          className="font-bold text-gray-900 mb-1"
                          data-cy="okr-drawer-desktop-objective-tooltip-title"
                        >
                          Objective name
                        </div>
                        <div
                          className="text-sm text-gray-700 leading-relaxed"
                          data-cy="okr-drawer-desktop-objective-tooltip-content"
                        >
                          These are objective names they can be given or are
                          automatically selected when you select your alignment
                        </div>
                      </div>
                    }
                    overlayClassName="okr-tooltip-custom"
                    placement="topLeft"
                  >
                    <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                  </Tooltip>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the Objective name',
                },
              ]}
            >
              <Input
                id="okr-drawer-desktop-title-input-field"
                data-cy="okr-drawer-desktop-title-input-field"
                allowClear
                placeholder="Input"
                className="h-11 w-full rounded-lg"
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
                style={{ fontSize: '14px', height: '44px' }}
              />
            </Form.Item>
            <Form.Item
              id="okr-drawer-desktop-alignment-select"
              data-cy="okr-drawer-desktop-alignment-select"
              className="col-span-12 lg:col-span-3 mb-6"
              name="allignedKeyResultId"
              label={
                <span
                  className="text-sm font-medium text-gray-700"
                  data-cy="okr-drawer-desktop-alignment-label"
                >
                  Alignment{' '}
                  <span
                    className="text-red-500"
                    data-cy="okr-drawer-desktop-alignment-required"
                  >
                    *
                  </span>{' '}
                  <Tooltip
                    title={
                      <div
                        className="py-1"
                        data-cy="okr-drawer-desktop-alignment-tooltip"
                      >
                        <div
                          className="font-bold text-gray-900 mb-1"
                          data-cy="okr-drawer-desktop-alignment-tooltip-title"
                        >
                          Alignment
                        </div>
                        <div
                          className="text-sm text-gray-700 leading-relaxed"
                          data-cy="okr-drawer-desktop-alignment-tooltip-content"
                        >
                          These are objectives of your direct supervisor it
                          mandatory you align with your direct supervisor
                        </div>
                      </div>
                    }
                    overlayClassName="okr-tooltip-custom"
                    placement="topLeft"
                  >
                    <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                  </Tooltip>
                  {!reportsToId && (
                    <span
                      className="text-gray-400 text-xs ml-1"
                      data-cy="okr-drawer-desktop-alignment-optional"
                    >
                      (optional)
                    </span>
                  )}
                </span>
              }
              rules={[
                {
                  required: reportsToId ? true : false,
                  message: 'Please select alignment',
                },
              ]}
            >
              <Select
                id="okr-drawer-desktop-alignment-select-dropdown"
                data-cy="okr-drawer-desktop-alignment-select-dropdown"
                className="h-11 w-full"
                showSearch
                placeholder="Select"
                value={objectiveValue?.allignedKeyResultId}
                onChange={(value) =>
                  handleObjectiveChange(value, 'allignedKeyResultId')
                }
                filterOption={(input: string, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                style={{ fontSize: '14px', height: '44px' }}
              >
                {alignmentOptions.map((keyResult: any) => (
                  <Select.Option
                    id="okr-drawer-desktop-alignment-select-option"
                    data-cy="okr-drawer-desktop-alignment-select-option"
                    key={keyResult.id}
                    value={keyResult.id}
                  >
                    {keyResult.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="okr-drawer-desktop-deadline-picker"
              data-cy="okr-drawer-desktop-deadline-picker"
              className="col-span-12 lg:col-span-3 mb-6"
              name="ObjectiveDeadline"
              label={
                <span
                  className="text-sm font-medium text-gray-700"
                  data-cy="okr-drawer-desktop-deadline-label"
                >
                  Deadline{' '}
                  <span
                    className="text-red-500"
                    data-cy="okr-drawer-desktop-deadline-required"
                  >
                    *
                  </span>{' '}
                  <Tooltip title="Set the objective deadline">
                    <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: 'Please select a deadline' }]}
            >
              <DatePicker
                id="okr-drawer-desktop-deadline-picker-field"
                data-cy="okr-drawer-desktop-deadline-picker-field"
                value={
                  objectiveValue.deadline
                    ? dayjs(objectiveValue.deadline)
                    : null
                }
                placeholder="Select date"
                onChange={(date) => {
                  handleObjectiveChange(date?.format('YYYY-MM-DD'), 'deadline');
                }}
                className="w-full h-11 rounded-lg"
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
                style={{ fontSize: '14px', height: '44px' }}
              />
            </Form.Item>
          </div>
        )}

        {/* Key Result Section - same format for basic and advanced; basic uses Achieve-only (no metric selector) */}
        <>
          <div
            id="okr-drawer-key-result-section-header"
            data-cy="okr-drawer-key-result-section-header"
            className="mt-8 mb-6"
          >
            <div
              className="flex justify-between items-start"
              data-cy="okr-drawer-key-result-section-header-row"
            >
              <div data-cy="okr-drawer-key-result-section-header-text">
                <h2
                  id="okr-drawer-key-result-section-title"
                  data-cy="okr-drawer-key-result-section-title"
                  className="text-base font-bold text-gray-900"
                >
                  Set your Key Result
                </h2>
                <p
                  id="okr-drawer-key-result-section-subtitle"
                  data-cy="okr-drawer-key-result-section-subtitle"
                  className="text-sm text-gray-500 mt-1"
                >
                  {isMobile
                    ? 'Please select objective alignment.'
                    : 'Please add your key results'}
                </p>
              </div>
              {isMobile ? (
                <Button
                  type="default"
                  id="okr-drawer-desktop-add-keyresult-button"
                  data-cy="okr-drawer-desktop-add-keyresult-button"
                  className={`w-10 h-10 flex items-center justify-center p-0 rounded-full ${
                    objectiveValue?.title && objectiveValue.title.trim() !== ''
                      ? 'bg-okr-primary border-okr-primary text-white hover:bg-blue-800'
                      : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Add Key Result"
                  onClick={
                    isBasic
                      ? () => {
                          setEditingKeyResultIndex(null);
                          setShowInlineKeyResultForm(true);
                        }
                      : () => setShowMetricSelector(!showMetricSelector)
                  }
                  disabled={
                    !objectiveValue?.title || objectiveValue.title.trim() === ''
                  }
                  icon={<PlusOutlined />}
                />
              ) : (
                <Button
                  type="default"
                  id="okr-drawer-desktop-add-keyresult-button"
                  data-cy="okr-drawer-desktop-add-keyresult-button"
                  className={`flex items-center gap-2 text-sm font-medium rounded-lg ${
                    objectiveValue?.title && objectiveValue.title.trim() !== ''
                      ? 'bg-okr-primary border-okr-primary text-white hover:bg-blue-800'
                      : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Add Key Result"
                  onClick={
                    isBasic
                      ? () => {
                          setEditingKeyResultIndex(null);
                          setShowInlineKeyResultForm(true);
                        }
                      : () => setShowMetricSelector(!showMetricSelector)
                  }
                  disabled={
                    !objectiveValue?.title || objectiveValue.title.trim() === ''
                  }
                  icon={<PlusOutlined />}
                >
                  Add Key Result
                </Button>
              )}
            </div>
          </div>

          {/* Basic mode: inline form at top only when ADDING a new KR (not when editing) */}
          {isBasic &&
            showInlineKeyResultForm &&
            editingKeyResultIndex == null && (
              <div data-cy="okr-drawer-inline-key-result-form-wrapper">
                <Form
                  form={krForm}
                  layout="vertical"
                  requiredMark={false}
                  className="mt-5"
                  data-cy="okr-drawer-inline-key-result-form"
                >
                  <div data-cy="okr-drawer-inline-key-result-form-content">
                    {renderBasicKrFormContent()}
                  </div>
                </Form>
              </div>
            )}

          {/* Metric type pill selector – only for advanced; basic uses Achieve-only */}
          {!isBasic && showMetricSelector && (
            <div
              id="okr-drawer-metric-selector"
              data-cy="okr-drawer-metric-selector"
              className="border border-gray-200 rounded-lg p-4 mb-6 flex flex-nowrap md:flex-wrap items-center gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0"
            >
              <span
                className="text-sm text-gray-600 mr-2 flex-shrink-0 whitespace-nowrap"
                data-cy="okr-drawer-metric-selector-label"
              >
                Please Select a Key Result Metric :
              </span>
              <div
                className="flex flex-nowrap items-center gap-3 flex-shrink-0"
                data-cy="okr-drawer-metric-selector-pills"
              >
                {keyResultTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    id={`okr-drawer-metric-pill-${type.value}`}
                    data-cy={`okr-drawer-metric-pill-${type.value}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-okr-primary hover:text-okr-primary transition-colors flex-shrink-0 whitespace-nowrap"
                    onClick={() => {
                      handleAddKeyResultType({ key: type.value });
                      setShowMetricSelector(false);
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>

        {/* AI Inline Suggestions */}
        <OKRInlineSuggestions
          data-cy="okr-drawer-inline-suggestions"
          objectiveTitle={objectiveValue?.title || ''}
          addKeyResult={addKeyResult}
          getCurrentTotalWeight={getCurrentTotalWeight}
          metrics={metrics}
          isVisible={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
        />

        <div
          id="okr-drawer-key-results-container"
          data-cy="okr-drawer-key-results-container"
          className={`rounded-lg mt-5 w-full ${
            !isMobile && objective?.keyResults?.length > 2
              ? 'max-h-96 overflow-y-auto'
              : ''
          }`}
        >
          {/* Show forms for key results; basic mode: saved cards (Weight + title + Edit) with optional expand to form */}
          <div
            id="okr-drawer-key-results-list"
            data-cy="okr-drawer-key-results-list"
          >
            {objective?.keyResults?.length > 0 &&
              objective?.keyResults.map((keyItem: any, index: number) =>
                isBasic ? (
                  index === editingKeyResultIndex ? (
                    <Form
                      key={index}
                      form={krForm}
                      layout="vertical"
                      requiredMark={false}
                      className="mb-3"
                      data-cy={`okr-drawer-edit-key-result-form-${index}`}
                    >
                      <div
                        data-cy={`okr-drawer-edit-key-result-form-content-${index}`}
                      >
                        {renderBasicKrFormContent()}
                      </div>
                    </Form>
                  ) : (
                    <div
                      key={index}
                      id={`okr-drawer-saved-kr-${index}`}
                      data-cy={`okr-drawer-saved-kr-${index}`}
                      className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm p-4"
                    >
                      <div
                        className="flex items-start justify-between gap-3 mb-2"
                        data-cy={`okr-drawer-saved-kr-header-${index}`}
                      >
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 shrink-0"
                          data-cy={`okr-drawer-saved-kr-weight-${index}`}
                        >
                          Weight {keyItem?.weight ?? 0}%
                        </span>
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKeyResultIndex(index);
                              setShowInlineKeyResultForm(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                            aria-label="Edit key result"
                            data-cy={`okr-drawer-saved-kr-edit-${index}`}
                          >
                            <EditOutlined className="text-sm" />
                          </button>
                        </Tooltip>
                      </div>
                      <p
                        className="text-base font-bold text-gray-900 leading-snug break-words"
                        data-cy={`okr-drawer-saved-kr-title-${index}`}
                      >
                        {keyItem?.title?.trim() ? (
                          keyItem.title
                        ) : (
                          <span
                            className="text-gray-400 italic font-normal"
                            data-cy={`okr-drawer-saved-kr-untitled-${index}`}
                          >
                            Untitled key result
                          </span>
                        )}
                      </p>
                    </div>
                  )
                ) : (
                  <KeyResultForm
                    data-cy="okr-drawer-key-result-form"
                    key={index}
                    keyItem={keyItem}
                    index={index}
                    updateKeyResult={updateKeyResult}
                    removeKeyResult={removeKeyResult}
                    addKeyResultValue={addKeyResultValue}
                    embedInOkrSheet={isMobile}
                  />
                ),
              )}
          </div>

          {/* Total Weight Display */}
          {objective?.keyResults?.length > 0 && (
            <div
              id="okr-drawer-total-weight-display"
              data-cy="okr-drawer-total-weight-display"
              className="flex justify-end mt-4 mb-4"
            >
              <div
                id="okr-drawer-total-weight-display-text"
                data-cy="okr-drawer-total-weight-display-text"
                className="text-sm text-gray-600 font-bold"
              >
                Total Weight:{' '}
                <span
                  id="okr-drawer-total-weight-display-text-span"
                  data-cy="okr-drawer-total-weight-display-text-span"
                  className={`font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {totalWeight}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default OkrDrawer;
