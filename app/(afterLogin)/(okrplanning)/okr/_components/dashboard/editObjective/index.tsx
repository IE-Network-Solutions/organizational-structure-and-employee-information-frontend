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
import { useUpdateObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.reportingTo?.id;
  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const [form] = Form.useForm();
  const { mutate: updateObjective, isLoading } = useUpdateObjective();
  const { isMobile } = useIsMobile();
  const { data: metrics } = useGetMetrics();

  const isEditDisabled =
    objectiveValue && Number(objectiveValue?.objectiveProgress) > 0;
  const objectiveValueNew = { ...objectiveValue }; // Create a copy of objectiveValue
  delete objectiveValueNew.daysLeft;
  delete objectiveValueNew.completedKeyResults;
  delete objectiveValueNew.objectiveProgress;

  const handleModalClose = () => {
    form.resetFields(); // Reset all form fields
    setObjectiveValue(defaultObjective); // Reset the objectiveValue state
    setObjective(defaultObjective); // Reset the objective state (which contains keyResults)
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
          // Combine existing and new key results for submission
          const submissionData = {
            ...objectiveValueNew,
            keyResults: allKeyResults,
          };

          updateObjective(submissionData, {
            onSuccess: () => {
              handleModalClose();
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

  const modalHeader = (
    <div className="flex justify-center text-2xl font-extrabold text-gray-800 p-4">
      Edit OKR
    </div>
  );

  const footer = (
    <div className="w-full flex justify-center items-center pt-2 bottom-8 space-x-5">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleModalClose}
        style={{ marginRight: 8, height: '40px' }}
      />
      <CustomButton
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

  const keyResultMenu = (
    <Menu onClick={handleAddKeyResultType}>
      {keyResultTypes.map((type) => (
        <Menu.Item key={type.value}>{type.label}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Modal
      open={props?.open}
      onCancel={handleModalClose}
      footer={footer}
      title={modalHeader}
      centered
      width={isMobile ? '100vw' : 1200}
      bodyStyle={{
        padding: isMobile ? 12 : 32,
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
      style={{ top: isMobile ? 0 : 32, padding: 0 }}
      maskClosable={false}
      destroyOnClose
      closable={false}
    >
      <Form
        id="edit-objective-form"
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
        <div id="objective-section-header" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Objective
          </h2>
        </div>

        {isMobile ? (
          <div id="mobile-objective-form" className="flex flex-col w-full">
            <Form.Item
              id="mobile-title-input"
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
                allowClear
                disabled={isEditDisabled}
                className="h-11 w-full"
                style={{ fontSize: '14px', height: '44px' }}
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
              />
            </Form.Item>
            <div className="flex w-full gap-4 mb-10">
              <Form.Item
                id="mobile-alignment-select"
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
                    <Select.Option key={keyResult.id} value={keyResult.id}>
                      {keyResult.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                id="mobile-deadline-picker"
                className="h-11 w-1/2 mb-0"
                name="ObjectiveDeadline"
                label="Objective Deadline"
                rules={[
                  { required: true, message: 'Please select a deadline' },
                ]}
              >
                <DatePicker
                  id="mobile-deadline-picker-field"
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
            <div className="w-full flex justify-end mb-10">
              <Dropdown
                overlay={keyResultMenu}
                trigger={['click']}
                className=""
              >
                <Button
                  type="default"
                  id="mobile-add-keyresult-button"
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
          <div id="desktop-objective-form" className="flex gap-4 w-full">
            <Form.Item
              id="desktop-title-input"
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
                  <Select.Option key={keyResult.id} value={keyResult.id}>
                    {keyResult.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="desktop-deadline-picker"
              className="h-11 mb-10 w-1/4"
              name="ObjectiveDeadline"
              label="Objective Deadline"
              rules={[{ required: true, message: 'Please select a deadline' }]}
            >
              <DatePicker
                id="desktop-deadline-picker-field"
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

        {/* Key Result Section with inline title and button */}
        <div
          id="key-result-section-header"
          className="flex justify-between items-center mb-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-800">Key Result</h2>
          <Dropdown overlay={keyResultMenu} trigger={['click']}>
            <Button
              type="default"
              id="desktop-add-keyresult-button"
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
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add key Result
            </Button>
          </Dropdown>
        </div>

        {/* Key Results Section */}
        <div
          id="key-results-container"
          className="bg-white rounded-lg mt-5 w-full h-96 overflow-y-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div id="key-results-list" className="space-y-4">
            {objectiveValue.keyResults?.map((keyValue: any, index: number) => (
              <KeyResultView
                key={index}
                objective={objective}
                keyValue={keyValue}
                index={index}
                isEdit={false}
              />
            ))}
            {objective?.keyResults?.map((keyItem: any, index: number) => (
              <KeyResultForm
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
              className="flex justify-end mt-4 mb-4"
            >
              <span className="text-sm text-gray-500">
                Total Key Results Weight:{' '}
                <strong>
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
