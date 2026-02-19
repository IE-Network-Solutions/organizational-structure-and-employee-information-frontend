'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Dropdown,
  Menu,
  Modal,
  Tooltip,
} from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
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
    removeKeyResult,
    addKeyResultValue,
    setObjective,
  } = useOKRStore();

  const [form] = Form.useForm();
  const { mutate: createObjective, isLoading } = useCreateObjective();
  const { isMobile } = useIsMobile();
  const [showAISuggestions, setShowAISuggestions] = React.useState(false);
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const isBasic = useIsBasicOkr();

  const modalHeader = isBasic ? (
    <div
      id="okr-drawer-modal-header"
      data-cy="okr-drawer-modal-header"
      className="flex justify-center text-2xl font-extrabold text-gray-800 p-4"
    >
      OKR
    </div>
  ) : (
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

  const footer = isBasic ? (
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
  ) : (
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

  const handleAddKeyResult = () => {
    // If isBasic is true, directly add "Achieve or Not" metric type
    if (isBasic) {
      const metricType = metrics?.items?.find(
        (metric: any) => metric.name === 'Achieve',
      );
      const metricTypeId = metricType?.id || '';
      addKeyResult('Achieved', metricTypeId);
    }
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
      centered={!isMobile}
      width={isMobile ? '100%' : 1200}
      wrapClassName={isMobile ? 'okr-mobile-bottom-sheet' : ''}
      bodyStyle={{
        padding: isMobile ? 12 : isBasic ? 32 : 24,
        maxHeight: isMobile ? 'calc(100vh - 150px)' : undefined,
        overflowY: isMobile ? 'auto' : undefined,
      }}
      style={{ padding: 0, maxHeight: isMobile ? '100vh' : '90vh' }}
      maskClosable={false}
      destroyOnClose
      closable={!isBasic}
    >
      <Form
        id="okr-drawer-form"
        data-cy="okr-drawer-form"
        form={form}
        layout="vertical"
        className="w-full"
        requiredMark={false}
      >
        {/* OKR Section Title */}
        {isBasic ? (
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
        ) : (
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
            <div className="border-b border-gray-200 mt-4" />
          </div>
        )}

        {isMobile ? (
          <div
            id="okr-drawer-mobile-form"
            data-cy="okr-drawer-mobile-form"
            className="flex flex-col w-full"
          >
            <Form.Item
              id="okr-drawer-mobile-title-input"
              data-cy="okr-drawer-mobile-title-input"
              className="h-11 mb-6"
              name="title"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Objective <span className="text-red-500">*</span>{' '}
                  <Tooltip
                    title={
                      <div className="py-1">
                        <div className="font-bold text-gray-900 mb-1">Objective name</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          These are objective names they can be given or are automatically selected when you select your alignment
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
              className="flex flex-col w-full gap-4 mb-6"
            >
              <Form.Item
                id="okr-drawer-mobile-alignment-select"
                data-cy="okr-drawer-mobile-alignment-select"
                className="h-11 w-full mb-0"
                name="allignedKeyResultId"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Alignment <span className="text-red-500">*</span>{' '}
                    <Tooltip
                      title={
                        <div className="py-1">
                          <div className="font-bold text-gray-900 mb-1">Alignment</div>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            These are objectives of your direct supervisor it mandatory you align with your direct supervisor
                          </div>
                        </div>
                      }
                      overlayClassName="okr-tooltip-custom"
                      placement="topLeft"
                    >
                      <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                    </Tooltip>
                    {!reportsToId && (
                      <span className="text-gray-400 text-xs ml-1">(optional)</span>
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
                className="h-11 w-full mb-0"
                name="ObjectiveDeadline"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Deadline <span className="text-red-500">*</span>{' '}
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
        ) : isBasic ? (
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
                style={{ fontSize: '12px', height: '44px' }}
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
                style={{ fontSize: '12px', height: '44px' }}
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
                style={{ fontSize: '12px', height: '44px' }}
              />
            </Form.Item>
          </div>
        ) : (
          /* Advanced mode desktop form */
          <div
            id="okr-drawer-desktop-form"
            data-cy="okr-drawer-desktop-form"
            className="flex gap-4 w-full mt-4"
          >
            <Form.Item
              id="okr-drawer-desktop-title-input"
              data-cy="okr-drawer-desktop-title-input"
              className="h-11 mb-10 flex-1"
              name="title"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Objective <span className="text-red-500">*</span>{' '}
                  <Tooltip
                    title={
                      <div className="py-1">
                        <div className="font-bold text-gray-900 mb-1">Objective name</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          These are objective names they can be given or are automatically selected when you select your alignment
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
              className="h-11 mb-10 w-1/4"
              name="allignedKeyResultId"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Alignment <span className="text-red-500">*</span>{' '}
                  <Tooltip
                    title={
                      <div className="py-1">
                        <div className="font-bold text-gray-900 mb-1">Alignment</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          These are objectives of your direct supervisor it mandatory you align with your direct supervisor
                        </div>
                      </div>
                    }
                    overlayClassName="okr-tooltip-custom"
                    placement="topLeft"
                  >
                    <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                  </Tooltip>
                  {!reportsToId && (
                    <span className="text-gray-400 text-xs ml-1">(optional)</span>
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
              className="h-11 mb-10 w-1/5"
              name="ObjectiveDeadline"
              label={
                <span className="text-sm font-medium text-gray-700">
                  Deadline <span className="text-red-500">*</span>{' '}
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

        {/* Key Result Section */}
        {isBasic ? (
          <>
            {/* Basic mode: original KR section header */}
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
              <div
                data-cy="okr-components-okrdrawer-index-tsx-index-div-623"
                className="flex gap-2"
              >
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
                    data-cy="okr-drawer-ai-suggestions-icon"
                  >
                    <path
                      data-cy="okr-components-okrdrawer-index-tsx-index-path-643"
                      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                    />
                  </svg>
                  <span
                    className="hidden sm:inline"
                    data-cy="okr-drawer-ai-suggestions-text"
                  >
                    AI Suggestions
                  </span>
                </Button>
                <Button
                  type="default"
                  id="okr-drawer-desktop-add-keyresult-button"
                  data-cy="okr-drawer-desktop-add-keyresult-button"
                  className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white border-none shadow-none bg-none flex items-center gap-2 text-sm"
                  aria-label="Add Key Result"
                  onClick={handleAddKeyResult}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                    data-cy="okr-components-okrdrawer-index-tsx-svg-667"
                  >
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-cy="okr-components-okrdrawer-index-tsx-path-675"
                    />
                  </svg>
                  <span
                    data-cy="okr-components-okrdrawer-index-tsx-index-span-677"
                    className="hidden sm:inline"
                  >
                    Key Result
                  </span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Advanced mode: new KR section header */}
            <div
              id="okr-drawer-key-result-section-header"
              data-cy="okr-drawer-key-result-section-header"
              className="mt-8 mb-6"
            >
              <div className="flex justify-between items-start">
                <div>
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
                    onClick={() => setShowMetricSelector(!showMetricSelector)}
                    disabled={!objectiveValue?.title || objectiveValue.title.trim() === ''}
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
                    onClick={() => setShowMetricSelector(!showMetricSelector)}
                    disabled={!objectiveValue?.title || objectiveValue.title.trim() === ''}
                    icon={<PlusOutlined />}
                  >
                    Add Key Result
                  </Button>
                )}
              </div>
              <div className="border-b border-gray-200 mt-4" />
            </div>

            {/* Metric type pill selector */}
            {showMetricSelector && (
              <div
                id="okr-drawer-metric-selector"
                data-cy="okr-drawer-metric-selector"
                className="border border-gray-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3"
              >
                <span className="text-sm text-gray-600 mr-2">Please Select a Key Result Metric :</span>
                {keyResultTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    id={`okr-drawer-metric-pill-${type.value}`}
                    data-cy={`okr-drawer-metric-pill-${type.value}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-okr-primary hover:text-okr-primary transition-colors"
                    onClick={() => {
                      handleAddKeyResultType({ key: type.value });
                      setShowMetricSelector(false);
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

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
          className={`rounded-lg mt-5 w-full ${isBasic ? 'min-h-64' : ''} ${
            !isMobile && objective?.keyResults?.length > 2
              ? 'max-h-96 overflow-y-auto'
              : ''
          }`}
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
                  embedInOkrSheet={isMobile}
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
