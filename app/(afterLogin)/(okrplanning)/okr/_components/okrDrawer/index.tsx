'use client';
import React, { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Dropdown,
  Menu,
  Modal,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import KeyResultForm from '../keyresultForm';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreateObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { defaultObjective } from '@/store/uistate/features/okrplanning/okr/interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import OKRInlineSuggestions from '@/components/ai/OKRInlineSuggestions';

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
    removeKeyResult,
    addKeyResultValue,
    setObjective,
  } = useOKRStore();

  const [form] = Form.useForm();
  const { mutate: createObjective, isLoading } = useCreateObjective();
  const { isMobile } = useIsMobile();
  const [showAISuggestions, setShowAISuggestions] = React.useState(false);
  const modalHeader = (
    <div
      id="okr-drawer-modal-header"
      data-cy="okr-drawer-modal-header"
      className="flex justify-center text-2xl font-extrabold text-gray-800 p-4"
    >
      OKR
    </div>
  );

  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.delegatedTo?.id || userData?.reportingTo?.id;

  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const objectiveTitle = objectiveValue?.title
    ? objectiveValue?.title
    : keyResultByUser?.items?.find(
        (i: any) => i.id === objectiveValue?.allignedKeyResultId,
      )?.title;

  useEffect(() => {
    // Only update if title is empty and we have a new objectiveTitle to set
    // Also check if the title would actually change to prevent infinite loops
    const currentTitle = objectiveValue?.title?.trim() || '';
    const newTitle = objectiveTitle?.trim() || '';
    if (!currentTitle && newTitle) {
      setObjectiveValue({
        ...objectiveValue,
        title: newTitle,
      });
      form.setFieldsValue({ title: newTitle });
    }
  }, [objectiveTitle, objectiveValue?.title, form, setObjectiveValue]);
  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    setObjectiveValue(defaultObjective); // Reset the objectiveValue state
    setObjective(defaultObjective); // Reset the objective state (which contains keyResults)
    props?.onClose(); // Close the drawer
  };
  const handleObjectiveChange = (value: any, field: string) => {
    const newObjectiveName = value;
    setObjectiveValue({
      ...objectiveValue,
      userId: userId,
      [field]: newObjectiveName,
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
          const modifiedObjectiveValue = {
            ...objectiveValue,
            keyResults: keyResults,
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
      className="w-full flex justify-center items-center pt-2 bottom-8 space-x-5"
    >
      <CustomButton
        id="okr-drawer-cancel-button"
        data-cy="okr-drawer-cancel-button"
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8, height: '40px' }}
      />
      <CustomButton
        id="okr-drawer-save-button"
        data-cy="okr-drawer-save-button"
        title={'Save'}
        type="primary"
        onClick={onSubmit}
        loading={isLoading}
        disabled={
          !objectiveValue?.title ||
          !objectiveValue?.deadline ||
          !objective?.keyResults?.length
        }
        style={{ height: '40px' }}
      />
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

  const getCurrentTotalWeight = () => {
    return (
      objective?.keyResults?.reduce(
        (sum: number, kr: any) => sum + Number(kr?.weight || 0),
        0,
      ) || 0
    );
  };

  const keyResultMenu = (
    <Menu
      id="okr-drawer-keyresult-menu"
      data-cy="okr-drawer-keyresult-menu"
      onClick={handleAddKeyResultType}
    >
      {keyResultTypes.map((type) => (
        <Menu.Item
          id="okr-drawer-keyresult-menu-item"
          data-cy="okr-drawer-keyresult-menu-item"
          key={type.value}
        >
          {type.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Modal
      data-cy="okr-drawer-modal"
      open={props.open}
      onCancel={handleDrawerClose}
      footer={footer}
      title={modalHeader}
      centered
      width={isMobile ? '100vw' : 1200}
      bodyStyle={{ padding: isMobile ? 12 : 32 }}
      style={{ top: isMobile ? 0 : 32, padding: 0, maxHeight: '95vh' }}
      maskClosable={false}
      destroyOnClose
      closable={false}
    >
      <Form
        id="okr-drawer-form"
        data-cy="okr-drawer-form"
        form={form}
        layout="vertical"
        className="w-full"
      >
        {/* OKR Section Title */}
        <div
          id="okr-drawer-objective-section-header"
          data-cy="okr-drawer-objective-section-header"
          className="mb-6"
        >
          <h2
            id="okr-drawer-objective-section-title"
            data-cy="okr-drawer-objective-section-title"
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            Objective
          </h2>
        </div>

        {isMobile ? (
          <div
            id="okr-drawer-mobile-form"
            data-cy="okr-drawer-mobile-form"
            className="flex flex-col w-full"
          >
            <Form.Item
              id="okr-drawer-mobile-title-input"
              data-cy="okr-drawer-mobile-title-input"
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
                id="okr-drawer-mobile-title-input-field"
                data-cy="okr-drawer-mobile-title-input-field"
                allowClear
                className="h-11 w-full"
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
                style={{ fontSize: '14px', height: '44px' }}
              />
            </Form.Item>
            <div
              id="okr-drawer-mobile-form-alignment-select"
              data-cy="okr-drawer-mobile-form-alignment-select"
              className="flex w-full gap-4 mb-10"
            >
              <Form.Item
                id="okr-drawer-mobile-alignment-select"
                data-cy="okr-drawer-mobile-alignment-select"
                className="h-11 w-1/2 mb-0"
                name="allignedKeyResultId"
                label="Alignment"
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
                  className="h-11"
                  showSearch
                  placeholder="Search and select a Key Result"
                  value={objectiveValue?.allignedKeyResultId}
                  onChange={(value) =>
                    handleObjectiveChange(value, 'allignedKeyResultId')
                  }
                  filterOption={(input: string, option: any) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                >
                  {keyResultByUser?.items?.map((keyResult: any) => (
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
                className="h-11 w-1/2 mb-0"
                name="ObjectiveDeadline"
                label="Objective Deadline"
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
                  className="w-full h-11"
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                  style={{ fontSize: '14px', height: '44px' }}
                />
              </Form.Item>
            </div>
            <div
              id="okr-drawer-mobile-form-add-keyresult-button"
              data-cy="okr-drawer-mobile-form-add-keyresult-button"
              className="w-full flex justify-end mb-10"
            >
              <Dropdown
                data-cy="okr-drawer-mobile-form-add-keyresult-button-dropdown"
                overlay={keyResultMenu}
                trigger={['click']}
                className=""
              >
                <Button
                  type="default"
                  id="okr-drawer-mobile-add-keyresult-button"
                  data-cy="okr-drawer-mobile-add-keyresult-button"
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
            id="okr-drawer-desktop-form"
            data-cy="okr-drawer-desktop-form"
            className="flex gap-4 w-full"
          >
            <Form.Item
              id="okr-drawer-desktop-title-input"
              data-cy="okr-drawer-desktop-title-input"
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
                id="okr-drawer-desktop-title-input-field"
                data-cy="okr-drawer-desktop-title-input-field"
                allowClear
                className="h-11 w-full"
                onChange={(e) => {
                  handleObjectiveChange(e.target.value, 'title');
                }}
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
              />
            </Form.Item>
            <Form.Item
              id="okr-drawer-desktop-alignment-select"
              data-cy="okr-drawer-desktop-alignment-select"
              className="h-11 mb-10 w-1/4"
              name="allignedKeyResultId"
              label="Alignment"
              rules={[
                {
                  required: reportsToId ? true : false,
                  message: 'Please enter the Objective name',
                },
              ]}
            >
              <Select
                id="okr-drawer-desktop-alignment-select-dropdown"
                data-cy="okr-drawer-desktop-alignment-select-dropdown"
                className="h-11 w-full"
                showSearch
                placeholder="Search and select a Key Result"
                value={objectiveValue?.allignedKeyResultId}
                onChange={(value) =>
                  handleObjectiveChange(value, 'allignedKeyResultId')
                }
                filterOption={(input: string, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
              >
                {keyResultByUser?.items?.map((keyResult: any) => (
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
              className="h-11 mb-10 w-1/4"
              name="ObjectiveDeadline"
              label="Objective Deadline"
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
                onChange={(date) => {
                  handleObjectiveChange(date?.format('YYYY-MM-DD'), 'deadline');
                }}
                className="w-full h-11"
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
                style={{
                  fontSize: isMobile ? '14px' : '12px',
                  height: '44px',
                }}
              />
            </Form.Item>
          </div>
        )}

        {/* Key Result Section with inline title and buttons */}
        <div
          id="okr-drawer-key-result-section-header"
          data-cy="okr-drawer-key-result-section-header"
          className="flex justify-between items-center mb-6 mt-8"
        >
          <h2
            id="okr-drawer-key-result-section-title"
            data-cy="okr-drawer-key-result-section-title"
            className="text-xl font-semibold text-gray-800"
          >
            Key Result
          </h2>
          <div className="flex gap-2">
            <Button
              type="primary"
              id="okr-ai-inline-suggestions-toggle-button"
              data-cy="okr-ai-inline-suggestions-toggle-button"
              ghost
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              disabled={
                !objectiveValue?.title || objectiveValue.title.trim() === ''
              }
              className="flex items-center gap-1 border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-600"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
              AI Suggestions
            </Button>
            <Dropdown
              data-cy="okr-drawer-desktop-add-keyresult-button-dropdown"
              overlay={keyResultMenu}
              trigger={['click']}
            >
              <Button
                type="default"
                id="okr-drawer-desktop-add-keyresult-button"
                data-cy="okr-drawer-desktop-add-keyresult-button"
                className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center gap-2 text-sm"
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
                Key Result
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </Dropdown>
          </div>
        </div>

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
          className={`rounded-lg mt-5 w-full min-h-64 ${objective?.keyResults?.length > 2 ? 'max-h-96 overflow-y-auto' : ''}`}
        >
          {/* Show forms for key results */}
          <div
            id="okr-drawer-key-results-list"
            data-cy="okr-drawer-key-results-list"
          >
            {objective?.keyResults?.length > 0 &&
              objective?.keyResults.map((keyItem: any, index: number) => (
                <KeyResultForm
                  data-cy="okr-drawer-key-result-form"
                  key={index}
                  keyItem={keyItem}
                  index={index}
                  updateKeyResult={updateKeyResult}
                  removeKeyResult={removeKeyResult}
                  addKeyResultValue={addKeyResultValue}
                />
              ))}
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
