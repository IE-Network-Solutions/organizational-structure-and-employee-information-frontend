import React, { useEffect } from 'react';
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
import { EditOutlined } from '@ant-design/icons';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { defaultObjective } from '@/store/uistate/features/okrplanning/okr/interface';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import KeyResultForm from '../../keyresultForm';
import {
  KeyResultSelectedBadge,
  KeyResultFieldLabel,
  KEY_RESULT_TOOLTIP,
  WEIGHT_TOOLTIP,
  DEADLINE_TOOLTIP,
} from '../../keyresultForm/_ui';
import {
  useUpdateObjective,
  useDeleteKeyResult,
  useDeleteMilestone,
} from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { hasAnyProgress } from '../../../_utils/keyResultGuards';

interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
  objective: any;
  isClosed: boolean;
}

// Convert the component to TypeScript
const EditObjective: React.FC<OkrDrawerProps> = (props) => {
  const {
    setObjectiveValue,
    setObjective,
    objectiveValue,
    objective,
    addKeyResult,
    updateKeyResult,
    removeKeyResult,
    addKeyResultValue,
    setAlignment,
    deletedKeyResultIds,
    setDeletedKeyResultIds,
    deletedMilestoneIds,
    setDeletedMilestoneIds,
    handleKeyResultChange,
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.delegatedTo?.id || userData?.reportingTo?.id;
  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const [form] = Form.useForm();
  const { mutate: updateObjective, isLoading } = useUpdateObjective();
  const { mutate: deleteKeyResult } = useDeleteKeyResult();
  const { mutate: deleteMilestone } = useDeleteMilestone();
  const { isMobile } = useIsMobile();
  const { data: metrics } = useGetMetrics();
  const isBasic = useIsBasicOkr();
  /** Advanced mode: show inline metric type pills (same as Create OKR) instead of dropdown. */
  const [showMetricSelector, setShowMetricSelector] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  /** Advanced mode: index in merged KR list being edited (null = no inline edit). */
  const [editingKeyResultIndex, setEditingKeyResultIndex] = React.useState<number | null>(null);
  /** Basic mode: show inline form for adding new KR (form first, then save to add card). */
  const [showAddKrForm, setShowAddKrForm] = React.useState(false);
  const [krForm] = Form.useForm();

  const isEditDisabled = hasAnyProgress(objectiveValue?.keyResults || []);
  const objectiveValueNew = { ...objectiveValue }; // Create a copy of objectiveValue
  delete objectiveValueNew.daysLeft;
  delete objectiveValueNew.completedKeyResults;
  delete objectiveValueNew.objectiveProgress;

  // Validation function that can be reused
  const validateKeyResults = () => {
    const existingKeyResults = objectiveValue?.keyResults || [];
    const newKeyResults = objective?.keyResults || [];
    const allKeyResults = [...existingKeyResults, ...newKeyResults];

    if (allKeyResults && allKeyResults.length > 0) {
      const keyResultSum = allKeyResults.reduce(
        (sum: number, keyResult: Record<string, number>) =>
          sum + Number(keyResult.weight || 0),
        0,
      );

      if (keyResultSum !== 100) {
        return false;
      }

      for (const keyResult of allKeyResults) {
        const keyType = keyResult?.metricType?.name || keyResult?.key_type;

        if (keyType === 'Milestone') {
          if (!keyResult.milestones || keyResult.milestones.length === 0) {
            return false;
          }

          for (const milestone of keyResult.milestones) {
            if (!milestone?.title || milestone.title.trim() === '') {
              return false;
            }
          }

          const milestoneSum = keyResult.milestones.reduce(
            (sum: number, milestone: Record<string, number>) =>
              sum + Number(milestone.weight),
            0,
          );

          if (milestoneSum !== 100) {
            return false;
          }
        }

        if (
          keyType === 'Currency' ||
          keyType === 'Numeric' ||
          keyType === 'Percentage'
        ) {
          if (keyResult?.initialValue > keyResult?.targetValue) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleModalClose = () => {
    // Close modal immediately without validation when Cancel is clicked
    setHasUnsavedChanges(false);
    setShowMetricSelector(false);
    setEditingKeyResultIndex(null);
    setShowAddKrForm(false);
    krForm.resetFields();
    form.resetFields(); // Reset all form fields
    setObjectiveValue(defaultObjective); // Reset the objectiveValue state
    setObjective(defaultObjective); // Reset the objective state (which contains keyResults)
    setDeletedKeyResultIds([]); // Clear deleted key result IDs when canceling
    setDeletedMilestoneIds([]); // Clear deleted milestone IDs when canceling
    props.onClose(); // Close the modal
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        // Combine existing key results with newly added key results
        const existingKeyResults = objectiveValue?.keyResults || [];
        const newKeyResults = objective?.keyResults || [];
        const allKeyResults = [...existingKeyResults, ...newKeyResults];

        const keyResultSum = allKeyResults.reduce(
          (sum: number, keyResult: Record<string, number>) =>
            sum + Number(keyResult.weight || 0),
          0,
        );
        if (keyResultSum !== 100) {
          NotificationMessage.warning({
            message: `The sum of key result should equal to 100. Current sum: ${keyResultSum}%`,
          });
          return;
        }
        if (allKeyResults && allKeyResults.length !== 0) {
          for (const [index, keyResult] of allKeyResults.entries()) {
            const keyType = keyResult?.metricType?.name || keyResult?.key_type;
            if (keyType === 'Milestone') {
              if (!keyResult.milestones || keyResult.milestones.length === 0) {
                NotificationMessage.warning({
                  message:
                    'Please add at least one milestone for each milestone key result.',
                });
                return;
              }
              for (const [
                mIndex,
                milestone,
              ] of keyResult.milestones.entries()) {
                if (!milestone?.title || milestone.title.trim() === '') {
                  NotificationMessage.warning({
                    message: `On Number: ${index + 1} Title:${keyResult.title} Milestone ${mIndex + 1} must have a name.`,
                  });
                  return; // Stop submission if any milestone name is empty
                }
              }

              // Calculate the sum of milestone values
              const milestoneSum = keyResult.milestones.reduce(
                (sum: number, milestone: Record<string, number>) =>
                  sum + Number(milestone.weight),
                0,
              );

              // Check if the sum of milestone values equals 100
              if (milestoneSum !== 100) {
                NotificationMessage.warning({
                  message: `On Number: ${index + 1} Title:${keyResult.title} key result sum of milestones should equal to 100.`,
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

          // If all checks pass, proceed with the objective creation
          // First, delete any milestones that were marked for deletion
          // Then, delete any key results that were marked for deletion
          // Finally, update the objective with remaining data

          const deleteOperations: Promise<void>[] = [];

          // Delete milestones first (if any)
          if (deletedMilestoneIds && deletedMilestoneIds.length > 0) {
            deletedMilestoneIds.forEach((id) => {
              deleteOperations.push(
                new Promise<void>((resolve, reject) => {
                  deleteMilestone(id, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                  });
                }),
              );
            });
          }

          // Delete key results (if any)
          if (deletedKeyResultIds && deletedKeyResultIds.length > 0) {
            deletedKeyResultIds.forEach((id) => {
              deleteOperations.push(
                new Promise<void>((resolve, reject) => {
                  deleteKeyResult(id, {
                    onSuccess: () => resolve(),
                    onError: (error) => reject(error),
                  });
                }),
              );
            });
          }

          // If there are any deletions, wait for them to complete
          if (deleteOperations.length > 0) {
            Promise.all(deleteOperations)
              .then(() => {
                // After all deletions complete, update objective with remaining key results
                const submissionData = {
                  ...objectiveValueNew,
                  keyResults: allKeyResults,
                };

                updateObjective(submissionData, {
                  onSuccess: () => {
                    setDeletedKeyResultIds([]); // Clear deleted key result IDs
                    setDeletedMilestoneIds([]); // Clear deleted milestone IDs
                    setHasUnsavedChanges(false);
                    handleModalClose();
                  },
                });
              })
              //eslint-disable-next-line @typescript-eslint/no-unused-vars
              .catch((error) => {
                NotificationMessage.error({
                  message: 'Error',
                  description: 'Failed to delete items. Please try again.',
                });
              });
          } else {
            // No deletions, just update normally
            const submissionData = {
              ...objectiveValueNew,
              keyResults: allKeyResults,
            };

            updateObjective(submissionData, {
              onSuccess: () => {
                setHasUnsavedChanges(false);
                handleModalClose();
              },
            });
          }
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

  const modalHeader = (
    <div
      id="okr-edit-objective-modal-header"
      data-cy="okr-edit-objective-modal-header"
      className="flex justify-center text-2xl font-extrabold text-gray-800 p-4"
    >
      Edit OKR
    </div>
  );

  const footer = (
    <div
      id="okr-edit-objective-modal-footer"
      data-cy="okr-edit-objective-modal-footer"
      className="w-full flex justify-center items-center pt-2 bottom-8 space-x-5"
    >
      <CustomButton
        id="okr-edit-objective-cancel-button"
        data-cy="okr-edit-objective-cancel-button"
        type="default"
        title="Cancel"
        onClick={handleModalClose}
        style={{ marginRight: 8, height: '40px' }}
      />
      <CustomButton
        id="okr-edit-objective-save-button"
        data-cy="okr-edit-objective-save-button"
        loading={isLoading}
        title={'Save'}
        type="primary"
        onClick={onSubmit}
        style={{ height: '40px' }}
      />
    </div>
  );

  const handleObjectiveChange = (value: any, field: string) => {
    const latest = useOKRStore.getState().objectiveValue;
    setObjectiveValue({
      ...latest,
      userId: userId,
      [field]: value,
    });
  };
  useEffect(() => {
    setAlignment(Boolean(objectiveValue?.allignedKeyResultId));
  }, [objectiveValue?.allignedKeyResultId]);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (props.open && objectiveValue) {
      form.setFieldsValue({
        title: objectiveValue.title || '',
        allignedKeyResultId: objectiveValue.allignedKeyResultId || null,
        ObjectiveDeadline: objectiveValue.deadline
          ? dayjs(objectiveValue.deadline)
          : null,
      });
    }
  }, [props.open, objectiveValue, form]);

  // Add beforeunload event listener to prevent page refresh when there are validation errors
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !validateKeyResults()) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes with validation errors. Are you sure you want to leave?';
        return 'You have unsaved changes with validation errors. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Track changes to set unsaved changes state
  useEffect(() => {
    if (props.open) {
      setHasUnsavedChanges(true);
    }
  }, [objectiveValue, objective, props.open]);

  const keyResultTypes = [
    { label: 'Milestone', value: 'Milestone' },
    { label: 'Currency', value: 'Currency' },
    { label: 'Numerics', value: 'Numeric' },
    { label: 'Percentage', value: 'Percentage' },
    { label: 'Achieved or Not', value: 'Achieved' },
  ];

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
    // Open the form for the newly added KR so user can enter title/weight (like Create modal)
    const newIndex =
      (objectiveValue?.keyResults ?? []).length +
      (objective?.keyResults ?? []).length;
    setEditingKeyResultIndex(newIndex);
  };

  /** Basic mode: show inline form to add new KR. User fills and saves, then card appears. */
  const handleAddBasicKeyResult = () => {
    setShowAddKrForm(true);
  };

  /** Basic mode: save from add-KR form to local state, then show card. */
  const handleSaveAddKrForm = () => {
    const metricType = metrics?.items?.find(
      (metric: any) => metric.name === 'Achieve',
    );
    const metricTypeId = metricType?.id || '';
    krForm
      .validateFields(['krTitle', 'krWeight', 'krDeadline'])
      .then((values) => {
        const deadline =
          values.krDeadline != null
            ? dayjs(values.krDeadline).format('YYYY-MM-DD')
            : null;
        const title = (values.krTitle ?? '').toString().trim();
        const weight = Number(values.krWeight) ?? 0;
        addKeyResult('Achieved', metricTypeId, { title, weight, deadline });
        krForm.resetFields(['krTitle', 'krWeight', 'krDeadline']);
        setShowAddKrForm(false);
      })
      .catch(() => {});
  };

  /** Advanced mode: merged list (existing first, then new). */
  const existingKRs = objectiveValue?.keyResults ?? [];
  const newKRs = objective?.keyResults ?? [];
  const mergedKRs = [...existingKRs, ...newKRs];
  const existingKRCount = existingKRs.length;

  const getMetricLabel = (kr: any) => {
    const name = kr?.metricType?.name || kr?.key_type || '';
    if (name === 'Achieve') return 'Achieve or not';
    if (name === 'Achieved') return 'Achieve or not';
    return name || 'Key Result';
  };

  /** Normalize key result for KeyResultForm (ensure key_type set from metricType, weight as number). Basic mode: force Achieve. */
  const normalizeKeyItemForForm = (kr: any) => ({
    ...kr,
    key_type: isBasic
      ? kr?.key_type || kr?.metricType?.name || 'Achieve'
      : kr?.key_type || kr?.metricType?.name || '',
    weight: kr?.weight != null && kr?.weight !== '' ? Number(kr.weight) : kr?.weight,
  });

  return (
    <Modal
      data-cy="okr-edit-objective-modal"
      open={props?.open}
      onCancel={handleModalClose}
      footer={footer}
      title={modalHeader}
      centered={!isMobile}
      width={isMobile ? '100%' : 1200}
      wrapClassName={isMobile ? 'okr-mobile-bottom-sheet' : ''}
      bodyStyle={{
        padding: isMobile ? 12 : 32,
        maxHeight: isMobile ? 'calc(100vh - 150px)' : '80vh',
        overflowY: 'auto',
      }}
      style={{ padding: 0, maxHeight: isMobile ? '100vh' : '90vh' }}
      maskClosable={false}
      destroyOnClose
      closable={isMobile}
    >
      <Form
        id="edit-objective-form"
        data-cy="okr-edit-objective-form"
        form={form}
        layout="vertical"
        className="w-full"
        initialValues={{
          title: objectiveValue?.title || '',
          allignedKeyResultId: objectiveValue?.allignedKeyResultId || null,
          ObjectiveDeadline: objectiveValue?.deadline
            ? dayjs(objectiveValue.deadline)
            : null,
        }}
      >
        {/* OKR Section Title - same style for Basic and Advanced */}
        <div
          id="objective-section-header"
          data-cy="okr-edit-objective-section-header"
          className="mb-6"
        >
          <h2
            id="okr-edit-objective-section-title"
            data-cy="okr-edit-objective-section-title"
            className="text-base font-bold text-gray-900"
          >
            Set your Objective
          </h2>
          <p
            id="okr-edit-objective-section-subtitle"
            data-cy="okr-edit-objective-section-subtitle"
            className="text-sm text-gray-500 mt-1"
          >
            Please select objective alignment to add objective.
          </p>
          <div className="border-b border-gray-200 mt-4" data-cy="okr-edit-objective-section-divider" />
        </div>

        {isMobile ? (
          <div
            id="mobile-objective-form"
            data-cy="okr-edit-objective-mobile-form"
            className="flex flex-col w-full"
          >
            <Form.Item
              id="mobile-title-input"
              data-cy="okr-edit-objective-mobile-title-input"
              className="h-11 mb-10"
              name="title"
              label="Objective"
              rules={[
                {
                  required: true,
                  message: 'Please enter the Objective name',
                },
              ]}
            >
              <Input
                id="mobile-title-input-field"
                data-cy="okr-edit-objective-mobile-title-input-field"
                allowClear
                disabled={isEditDisabled}
                className="h-11 w-full"
                style={{ fontSize: '14px', height: '44px' }}
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
              />
            </Form.Item>
            <div
              id="okr-edit-objective-mobile-alignment-select-container"
              data-cy="okr-edit-objective-mobile-alignment-select-container"
              className="flex w-full gap-4 mb-10"
            >
              <Form.Item
                id="mobile-alignment-select"
                data-cy="okr-edit-objective-mobile-alignment-select"
                className="h-11 w-1/2 mb-0"
                name="allignedKeyResultId"
                label="Alignment"
                rules={[
                  {
                    required: reportsToId ? true : false,
                    message: 'Please select a Supervisor Key Result',
                  },
                ]}
              >
                <Select
                  id="mobile-alignment-select-dropdown"
                  data-cy="okr-edit-objective-mobile-alignment-select-dropdown"
                  className="h-11"
                  showSearch
                  disabled={isEditDisabled}
                  placeholder="Search and select a Key Result"
                  filterOption={(input: string, option: any) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                  onChange={(value) =>
                    handleObjectiveChange(value, 'allignedKeyResultId')
                  }
                >
                  {keyResultByUser?.items?.map((keyResult: any) => (
                    <Select.Option
                      data-cy="okr-edit-objective-mobile-alignment-option"
                      key={keyResult.id}
                      value={keyResult.id}
                    >
                      {keyResult.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                id="mobile-deadline-picker"
                data-cy="okr-edit-objective-mobile-deadline-picker"
                className="h-11 w-1/2 mb-0"
                name="ObjectiveDeadline"
                label="Objective Deadline"
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
              >
                <DatePicker
                  id="mobile-deadline-picker-field"
                  data-cy="okr-edit-objective-mobile-deadline-picker-field"
                  className="w-full h-11"
                  format="YYYY-MM-DD"
                  disabled={isEditDisabled}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                  onChange={(date) => {
                    handleObjectiveChange(
                      date?.format('YYYY-MM-DD'),
                      'deadline',
                    );
                  }}
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          <div
            id="desktop-objective-form"
            data-cy="okr-edit-objective-desktop-form"
            className="flex gap-4 w-full"
          >
            <Form.Item
              id="desktop-title-input"
              data-cy="okr-edit-objective-desktop-title-input"
              className="h-11 mb-10 flex-1"
              name="title"
              label="Objective"
              rules={[
                {
                  required: true,
                  message: 'Please enter the Objective name',
                },
              ]}
            >
              <Input
                id="desktop-title-input-field"
                data-cy="okr-edit-objective-desktop-title-input-field"
                allowClear
                disabled={isEditDisabled}
                className="h-11 w-full"
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
              />
            </Form.Item>
            <Form.Item
              id="desktop-alignment-select"
              data-cy="okr-edit-objective-desktop-alignment-select"
              className="h-11 mb-10 w-1/4"
              name="allignedKeyResultId"
              label="Alignment"
              rules={[
                {
                  required: reportsToId ? true : false,
                  message: 'Please select a Supervisor Key Result',
                },
              ]}
            >
              <Select
                id="desktop-alignment-select-dropdown"
                data-cy="okr-edit-objective-desktop-alignment-dropdown"
                className="h-11 w-full"
                showSearch
                disabled={isEditDisabled}
                placeholder="Search and select a Key Result"
                filterOption={(input: string, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
                onChange={(value) =>
                  handleObjectiveChange(value, 'allignedKeyResultId')
                }
              >
                {keyResultByUser?.items?.map((keyResult: any) => (
                  <Select.Option
                    data-cy="okr-edit-objective-desktop-alignment-option"
                    key={keyResult.id}
                    value={keyResult.id}
                  >
                    {keyResult.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="desktop-deadline-picker"
              data-cy="okr-edit-objective-desktop-deadline-picker"
              className="h-11 mb-10 w-1/4"
              name="ObjectiveDeadline"
              label="Objective Deadline"
              rules={[{ required: true, message: 'Please select a deadline' }]}
            >
              <DatePicker
                id="desktop-deadline-picker-field"
                data-cy="okr-edit-objective-desktop-deadline-picker-field"
                className="w-full h-11"
                format="YYYY-MM-DD"
                disabled={isEditDisabled}
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
                onChange={(date) => {
                  handleObjectiveChange(date?.format('YYYY-MM-DD'), 'deadline');
                }}
              />
            </Form.Item>
          </div>
        )}

        {/* Key Result Section with inline title and buttons */}
        <div
          id="key-result-section-header"
          data-cy="okr-edit-objective-key-result-section-header"
          className="mt-8 mb-4"
        >
          <div className="flex justify-between items-center" data-cy="okr-edit-objective-key-result-header-row">
            <div data-cy="okr-edit-objective-key-result-header-text">
              <h2
                id="okr-edit-objective-key-result-section-title"
                data-cy="okr-edit-objective-key-result-section-title"
                className="text-base font-bold text-gray-900"
              >
                Set your Key Result
              </h2>
              <p
                id="okr-edit-objective-key-result-section-subtitle"
                data-cy="okr-edit-objective-key-result-section-subtitle"
                className="text-sm text-gray-500 mt-1"
              >
                Please add your key results.
              </p>
            </div>
            <div
              id="okr-edit-objective-key-result-actions"
              data-cy="okr-edit-objective-key-result-actions"
              className="flex gap-2"
            >
              {isBasic ? (
                <Button
                  type="default"
                  id="desktop-add-keyresult-button"
                  data-cy="okr-edit-objective-desktop-add-keyresult-button"
                  disabled={isEditDisabled}
                  className={isMobile
                    ? 'bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none flex items-center justify-center text-sm h-11 w-11 p-0 rounded-lg'
                    : 'bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center gap-2 text-sm px-4 py-2 rounded-lg'}
                  aria-label="Add Key Result"
                  onClick={handleAddBasicKeyResult}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                    data-cy="okr-edit-objective-add-keyresult-icon"
                  >
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      data-cy="okr-edit-objective-add-keyresult-path"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {!isMobile && 'Add key Result'}
                </Button>
              ) : (
                <Button
                  type="default"
                  id="desktop-add-keyresult-button"
                  data-cy="okr-edit-objective-desktop-add-keyresult-button"
                  disabled={isEditDisabled}
                  className={isMobile
                    ? 'bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none flex items-center justify-center text-sm h-11 w-11 p-0 rounded-lg'
                    : 'bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center gap-2 text-sm px-4 py-2 rounded-lg'}
                  aria-label="Add Key Result"
                  onClick={() => setShowMetricSelector(!showMetricSelector)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                    data-cy="okr-edit-objective-add-keyresult-icon"
                  >
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      data-cy="okr-edit-objective-add-keyresult-path"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {!isMobile && 'Add key Result'}
                </Button>
              )}
            </div>
          </div>
          <div className="border-b border-gray-200 mt-4" data-cy="okr-edit-objective-key-result-section-divider" />
        </div>

        {/* Basic mode: inline add-KR form (same layout as Create modal) */}
        {isBasic && showAddKrForm && (
          <Form
            form={krForm}
            layout="vertical"
            requiredMark={false}
            className="mt-5"
          >
            <div
              id="okr-edit-objective-add-kr-inline-form"
              data-cy="okr-edit-objective-add-kr-inline-form"
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex flex-row flex-wrap gap-4 items-end" data-cy="okr-edit-objective-add-kr-form-row">
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
                    <KeyResultFieldLabel
                      label="Weight"
                      tooltip={WEIGHT_TOOLTIP}
                    />
                  }
                  rules={[
                    { required: true, message: 'Please enter the Weight' },
                    {
                      type: 'number',
                      min: 0,
                      max: 100,
                      transform: (v: any) => (v != null && v !== '' ? Number(v) : v),
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
                    <KeyResultFieldLabel
                      label="Deadline"
                      tooltip={DEADLINE_TOOLTIP}
                    />
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
                  <Button
                    type="primary"
                    htmlType="button"
                    onClick={handleSaveAddKrForm}
                    className="h-10 px-6 rounded-lg bg-okr-primary border-okr-primary"
                    data-cy="okr-edit-objective-save-add-kr"
                  >
                    Save
                  </Button>
                </Form.Item>
              </div>
            </div>
          </Form>
        )}

        {/* Metric type pill selector – same as Create OKR modal (Advanced only) */}
        {!isBasic && showMetricSelector && (
          <div
            id="okr-edit-objective-metric-selector"
            data-cy="okr-edit-objective-metric-selector"
            className="border border-gray-200 rounded-lg p-4 mb-6 flex flex-nowrap md:flex-wrap items-center gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0"
          >
            <span className="text-sm text-gray-600 mr-2 flex-shrink-0 whitespace-nowrap" data-cy="okr-edit-objective-metric-selector-label">
              Please Select a Key Result Metric :
            </span>
            <div className="flex flex-nowrap items-center gap-3 flex-shrink-0" data-cy="okr-edit-objective-metric-selector-pills">
              {keyResultTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  id={`okr-edit-objective-metric-pill-${type.value}`}
                  data-cy={`okr-edit-objective-metric-pill-${type.value}`}
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

        {/* Key Results Section - scrollable when many items, like Create modal */}
        <div
          id="key-results-container"
          data-cy="okr-edit-objective-key-results-container"
          className={`rounded-lg mt-5 w-full ${
            mergedKRs.length > 2 ? 'max-h-96 overflow-y-auto' : ''
          }`}
        >
          <div
            id="key-results-list"
            data-cy="okr-edit-objective-key-results-list"
            className="space-y-4"
          >
            {mergedKRs.map((kr: any, listIndex: number) => {
                const isEditing = editingKeyResultIndex === listIndex;
                const isExisting = listIndex < existingKRCount;
                const normalizedKr = normalizeKeyItemForForm(kr);
                const updateForMerged =
                  (idx: number, field: keyof typeof kr, value: any) => {
                    if (idx < existingKRCount) {
                      handleKeyResultChange(value, idx, field as string);
                    } else {
                      updateKeyResult(idx - existingKRCount, field as any, value);
                    }
                  };
                const removeForMerged = (idx: number) => {
                  if (idx < existingKRCount) {
                    const id = mergedKRs[idx]?.id;
                    if (id) setDeletedKeyResultIds([...deletedKeyResultIds, id]);
                    setObjectiveValue({
                      ...objectiveValue,
                      keyResults: objectiveValue.keyResults.filter(
                        (_: any, i: number) => i !== idx,
                      ),
                    });
                  } else {
                    removeKeyResult(idx - existingKRCount);
                  }
                  setEditingKeyResultIndex(null);
                };
                if (isEditing) {
                  return (
                    <div
                      key={isExisting ? `existing-${listIndex}` : `new-${listIndex}`}
                      className="mb-4"
                      data-cy={`okr-edit-objective-inline-kr-form-${listIndex}`}
                    >
                      <KeyResultForm
                        data-cy="okr-edit-objective-key-result-form"
                        keyItem={normalizedKr}
                        index={listIndex}
                        updateKeyResult={updateForMerged}
                        removeKeyResult={removeForMerged}
                        addKeyResultValue={addKeyResultValue}
                        embedInOkrSheet={isMobile}
                        onSaveSuccess={() => setEditingKeyResultIndex(null)}
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={isExisting ? `existing-${listIndex}` : `new-${listIndex}`}
                    id={`okr-edit-objective-kr-card-${listIndex}`}
                    data-cy={`okr-edit-objective-kr-card-${listIndex}`}
                    className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm p-4"
                  >
                    <KeyResultSelectedBadge
                      label={getMetricLabel(kr)}
                      data-cy={`okr-edit-objective-kr-card-badge-${listIndex}`}
                    />
                    <div className="flex flex-wrap gap-2 mb-2" data-cy={`okr-edit-objective-kr-card-meta-${listIndex}`}>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" data-cy={`okr-edit-objective-kr-card-weight-${listIndex}`}>
                        Weight {kr?.weight ?? 0}%
                      </span>
                      {(kr?.metricType?.name === 'Numeric' ||
                        kr?.metricType?.name === 'Currency' ||
                        kr?.metricType?.name === 'Percentage' ||
                        kr?.key_type === 'Numeric' ||
                        kr?.key_type === 'Currency' ||
                        kr?.key_type === 'Percentage') && (
                        <>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" data-cy={`okr-edit-objective-kr-card-initial-${listIndex}`}>
                            Initial Value : {kr?.initialValue ?? 0}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" data-cy={`okr-edit-objective-kr-card-target-${listIndex}`}>
                            Target Value : {kr?.targetValue ?? 0}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3" data-cy={`okr-edit-objective-kr-card-content-${listIndex}`}>
                      <p className="text-base font-bold text-gray-900 leading-snug break-words flex-1 min-w-0" data-cy={`okr-edit-objective-kr-card-title-${listIndex}`}>
                        {kr?.title?.trim() ? (
                          kr.title
                        ) : (
                          <span className="text-gray-400 italic font-normal" data-cy={`okr-edit-objective-kr-card-untitled-${listIndex}`}>
                            Untitled key result
                          </span>
                        )}
                      </p>
                      <Tooltip title="Edit">
                        <button
                          type="button"
                          onClick={() => setEditingKeyResultIndex(listIndex)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                          aria-label="Edit key result"
                          data-cy={`okr-edit-objective-kr-card-edit-${listIndex}`}
                        >
                          <EditOutlined className="text-sm" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Total Key Results Weight */}
          {(objectiveValue.keyResults?.length > 0 ||
            objective?.keyResults?.length > 0) && (
            <div
              id="total-weight-display"
              data-cy="okr-edit-objective-total-weight"
              className="flex justify-end mt-4 mb-4"
            >
              <span
                id="total-weight-text"
                data-cy="okr-edit-objective-total-weight-text"
                className="text-sm text-gray-500"
              >
                Total Key Results Weight:{' '}
                <strong data-cy="okr-edit-objective-total-weight-value">
                  {[
                    ...(objectiveValue.keyResults || []),
                    ...(objective?.keyResults || []),
                  ].reduce(
                    (sum: number, kr: any) => sum + Number(kr?.weight || 0),
                    0,
                  )}{' '}
                  %
                </strong>
              </span>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditObjective;
