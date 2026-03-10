import React, { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Modal,
  Dropdown,
  Menu,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { defaultObjective } from '@/store/uistate/features/okrplanning/okr/interface';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import KeyResultView from '../../keyresultView';
import KeyResultForm from '../../keyresultForm';
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
import OKRInlineSuggestions from '@/components/ai/OKRInlineSuggestions';

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
  const [showAISuggestions, setShowAISuggestions] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const isEditDisabled =
    objectiveValue && Number(objectiveValue?.objectiveProgress) > 0;
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

  const objectiveTitle = keyResultByUser?.items?.find(
    (i: any) => i.id === objectiveValue?.allignedKeyResultId,
  )?.title;
  const handleObjectiveChange = (value: any, field: string) => {
    const newObjectiveName = value;
    setObjectiveValue({
      ...objectiveValue,
      userId: userId,
      [field]: newObjectiveName,
    });
  };

  useEffect(() => {
    setObjectiveValue({
      ...objectiveValue,
      title: objectiveTitle || '',
    });
  }, [objectiveTitle, objectiveValue?.allignedKeyResultId]);
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
  };

  const getCurrentTotalWeight = () => {
    const existingWeight =
      objectiveValue.keyResults?.reduce(
        (sum: number, kr: any) => sum + Number(kr?.weight || 0),
        0,
      ) || 0;
    const newWeight =
      objective?.keyResults?.reduce(
        (sum: number, kr: any) => sum + Number(kr?.weight || 0),
        0,
      ) || 0;
    return existingWeight + newWeight;
  };

  const keyResultMenu = (
    <Menu
      data-cy="okr-edit-objective-key-result-menu"
      onClick={handleAddKeyResultType}
    >
      {keyResultTypes.map((type) => (
        <Menu.Item
          data-cy="okr-edit-objective-key-result-menu-item"
          key={type.value}
        >
          {type.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Modal
      data-cy="okr-edit-objective-modal"
      open={props?.open}
      onCancel={handleModalClose}
      footer={footer}
      title={modalHeader}
      centered
      width={isMobile ? '100vw' : 1200}
      styles={{
        body: {
          padding: isMobile ? 12 : 32,
          maxHeight: '80vh',
          overflow: 'hidden',
        },
      }}
      style={{ top: isMobile ? 0 : 32, padding: 0 }}
      maskClosable={false}
      destroyOnHidden
      closable={false}
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
        {/* OKR Section Title */}
        <div
          id="objective-section-header"
          data-cy="okr-edit-objective-section-header"
          className="mb-6"
        >
          <h2
            id="okr-edit-objective-section-title"
            data-cy="okr-edit-objective-section-title"
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            Objective
          </h2>
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
            <div
              id="okr-edit-objective-mobile-add-keyresult-container"
              data-cy="okr-edit-objective-mobile-add-keyresult-container"
              className="w-full flex justify-end mb-10"
            >
              <Dropdown
                overlay={keyResultMenu}
                trigger={['click']}
                className=""
                data-cy="okr-edit-objective-mobile-add-keyresult-dropdown"
              >
                <Button
                  type="default"
                  id="mobile-add-keyresult-button"
                  data-cy="okr-edit-objective-mobile-add-keyresult-button"
                  disabled={isEditDisabled}
                  className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center justify-center text-sm h-11 w-11 p-0"
                  aria-label="Add Key Result"
                >
                  <GoPlus size={24} />
                </Button>
              </Dropdown>
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
          className="flex justify-between items-center mb-6 mt-8"
        >
          <h2
            id="okr-edit-objective-key-result-section-title"
            data-cy="okr-edit-objective-key-result-section-title"
            className="text-xl font-semibold text-gray-800"
          >
            Key Result
          </h2>
          <div
            id="okr-edit-objective-key-result-actions"
            data-cy="okr-edit-objective-key-result-actions"
            className="flex gap-2"
          >
            <Button
              id="okr-edit-ai-inline-suggestions-toggle-button"
              data-cy="okr-edit-ai-inline-suggestions-toggle-button"
              type="primary"
              ghost
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              disabled={
                !objectiveValue?.title ||
                objectiveValue.title.trim() === '' ||
                isEditDisabled
              }
              className="flex items-center gap-1 border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-600"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                data-cy="okr-edit-objective-ai-suggestions-icon"
              >
                <path
                  d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                  data-cy="okr-edit-objective-ai-suggestions-path"
                />
              </svg>
              AI Suggestions
            </Button>
            <Dropdown
              overlay={keyResultMenu}
              trigger={['click']}
              data-cy="okr-edit-objective-add-keyresult-dropdown"
            >
              <Button
                type="default"
                id="desktop-add-keyresult-button"
                data-cy="okr-edit-objective-desktop-add-keyresult-button"
                disabled={isEditDisabled}
                className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
                aria-label="Add Key Result"
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
                Add key Result
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* AI Inline Suggestions */}
        <OKRInlineSuggestions
          data-cy="okr-edit-objective-ai-suggestions"
          objectiveTitle={objectiveValue?.title || ''}
          addKeyResult={addKeyResult}
          getCurrentTotalWeight={getCurrentTotalWeight}
          metrics={metrics}
          isVisible={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
        />

        {/* Key Results Section */}
        <div
          id="key-results-container"
          data-cy="okr-edit-objective-key-results-container"
          className="bg-white rounded-lg mt-5 w-full h-96 overflow-y-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div
            id="key-results-list"
            data-cy="okr-edit-objective-key-results-list"
            className="space-y-4"
          >
            {objectiveValue?.keyResults?.map((keyValue: any, index: number) => (
              <KeyResultView
                data-cy="okr-edit-objective-key-result-view"
                key={index}
                objective={objective}
                keyValue={keyValue}
                index={index}
                isEdit={false}
              />
            ))}
            {objective?.keyResults?.map((keyItem: any, index: number) => (
              <KeyResultForm
                data-cy="okr-edit-objective-key-result-form"
                key={index}
                keyItem={keyItem}
                index={index}
                updateKeyResult={updateKeyResult}
                removeKeyResult={removeKeyResult}
                addKeyResultValue={addKeyResultValue}
              />
            ))}
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
