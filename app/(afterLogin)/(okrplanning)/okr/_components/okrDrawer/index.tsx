'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import React, { useEffect } from 'react';
import { Button, DatePicker, Form, Input, Row, Col, Select } from 'antd';
import { GoPlus } from 'react-icons/go';
import KeyResultForm from '../keyresultForm';
import KeyResultView from '../keyresultView';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreateObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { defaultObjective } from '@/store/uistate/features/okrplanning/okr/interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';

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
  } = useOKRStore();

  const [form] = Form.useForm();
  const { mutate: createObjective, isLoading } = useCreateObjective();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Objective
    </div>
  );

  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.reportingTo?.id;

  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
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
  }, [objectiveTitle]);
  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    setObjectiveValue(defaultObjective); // Reset the objective state
    props?.onClose(); // Close the drawer
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResults = objectiveValue?.keyResults;
        const keyResultSum = keyResults?.reduce(
          (sum: number, keyResult: Record<string, number>) =>
            sum + keyResult.weight,
          0,
        );
        if (keyResultSum !== 100) {
          NotificationMessage.warning({
            message: `The sum of key result should equal to 100.`,
          });
          return; // Stop submission if the sum is not 100
        }
        if (keyResults && keyResults.length !== 0) {
          // Iterate over each keyResult to validate all milestone key types
          for (const [index, keyResult] of keyResults.entries()) {
            const keyType = keyResult?.metricType?.name || keyResult?.key_type;
            if (keyType === 'Milestone') {
              // Check if at least one milestone is added
              if (!keyResult.milestones || keyResult.milestones.length === 0) {
                NotificationMessage.warning({
                  message: `On Number: ${index + 1} Title:${keyResult.title} Please add at least one milestone`,
                });
                return; // Stop submission if no milestone is added
              }

              // Calculate the sum of milestone values
              const milestoneSum = keyResult.milestones.reduce(
                (sum: number, milestone: Record<string, number>) =>
                  sum + milestone.weight,
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
          createObjective(objectiveValue, {
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
  useEffect(() => {
    if (objectiveValue) {
      form.setFieldsValue(objectiveValue); // Set form fields with appType values
    } else {
      form.resetFields(); // Reset form if appType is null
    }
  }, [objectiveValue, form]);
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        id="cancel-button"
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton
        id="save-button"
        title={'Save'}
        type="primary"
        onClick={onSubmit}
        loading={isLoading}
      />
    </div>
  );
  return (
    <CustomDrawerLayout
      open={props?.open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width={'50%'}
    >
      <Form
        id="okr-form"
        form={form}
        layout="vertical"
        initialValues={objectiveValue}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            {keyResultByUser?.items?.length ? (
              <Form.Item
                id="alignment-select"
                className="font-bold text-xs w-full mb-2"
                name="allignedKeyResultId"
                label="Objective/Alignment"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Objective name',
                  },
                ]}
              >
                {/* Search and select a key result by user */}
                <Select
                  id="alignment-select-dropdown"
                  showSearch
                  placeholder="Search and select a Key Result"
                  value={objectiveValue?.title || ''}
                  onChange={
                    (value, option) =>
                      handleObjectiveChange(option?.key, 'allignedKeyResultId') // Update the alignment ID with the selected key
                  }
                  filterOption={(input: any, option: any) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {keyResultByUser?.items.map((keyResult) => (
                    <Select.Option key={keyResult.id} value={keyResult.title}>
                      {keyResult.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                id="title-input"
                className="font-bold text-xs w-full mb-2"
                name="title"
                label="Objective/Alignment"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the Objective name',
                  },
                ]}
              >
                <Input
                  id="title-input-field"
                  allowClear
                  value={objectiveValue?.title || ''}
                  onChange={(e) => {
                    handleObjectiveChange(e.target.value, 'title');
                  }}
                />
              </Form.Item>
            )}
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              id="deadline-picker"
              className="font-bold text-xs w-full"
              name="ObjectiveDeadline"
              label="Objective Deadline"
              rules={[{ required: true, message: 'Please select a deadline' }]}
            >
              <DatePicker
                id="deadline-picker-field"
                value={
                  objectiveValue.deadline
                    ? dayjs(objectiveValue.deadline)
                    : null
                }
                onChange={(date) => {
                  handleObjectiveChange(date?.format('YYYY-MM-DD'), 'deadline');
                }}
                className="w-full"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="border border-gray-300 rounded-lg p-4 mt-5 ">
          <div className="flex justify-between items-center">
            <p className="font-bold text-xs h-6">Set Key Result</p>
            <Button
              id="add-keyresult-button"
              disabled={objective?.keyResults?.length == 1}
              onClick={addKeyResult}
              className="border-none shadow-none bg-none text-xs"
              icon={<GoPlus size={16} />}
            >
              Add Key Result
            </Button>
          </div>
          {objectiveValue?.keyResults?.map((keyValue: any, index: number) => (
            <KeyResultView
              key={index}
              objective={objectiveValue}
              keyValue={keyValue}
              index={index}
              isEdit={false}
              form={form}
            />
          ))}
          {objective?.keyResults.map((keyItem: any, index: number) => (
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
      </Form>
    </CustomDrawerLayout>
  );
};

export default OkrDrawer;
