import CustomDrawerLayout from '@/components/common/customDrawer';
import React, { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  Select,
  Checkbox,
} from 'antd';
import { GoPlus } from 'react-icons/go';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import KeyResultView from '../../keyresultView';
import KeyResultForm from '../../keyresultForm';
import { useUpdateObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserKeyResult } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
  objective: any;
}

// Convert the component to TypeScript
const EditObjective: React.FC<OkrDrawerProps> = (props) => {
  const {
    setObjectiveValue,
    objectiveValue,
    objective,
    addKeyResult,
    updateKeyResult,
    removeKeyResult,
    addKeyResultValue,
    alignment,
    setAlignment,
  } = useOKRStore();
  const { userId } = useAuthenticationStore();
  const { data: userData } = useGetEmployee(userId);
  const reportsToId = userData?.reportingTo?.id;
  const { data: keyResultByUser } = useGetUserKeyResult(reportsToId);
  const [form] = Form.useForm();
  const { mutate: updateObjective, isLoading } = useUpdateObjective();
  const objectiveValueNew = { ...objectiveValue }; // Create a copy of objectiveValue
  delete objectiveValueNew.daysLeft;
  delete objectiveValueNew.completedKeyResults;
  delete objectiveValueNew.objectiveProgress;

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResults = objectiveValue?.keyResults;
        const keyResultSum = keyResults?.reduce(
          (sum: number, keyResult: Record<string, number>) =>
            sum + Number(keyResult.weight),
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
                  message:
                    'Please add at least one milestone for each milestone key result.',
                });
                return; // Stop submission if no milestone is added
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
          updateObjective(objectiveValueNew, {
            onSuccess: () => {
              props.onClose();
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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Edit Objective
    </div>
  );

  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={props?.onClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton
        loading={isLoading}
        title={'Save'}
        type="primary"
        onClick={onSubmit}
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
  const handleAlignment = () => {
    const updatedAlignment = !alignment;
    setAlignment(updatedAlignment);
    if (!updatedAlignment) {
      setObjectiveValue({
        ...objectiveValue,
        allignedKeyResultId: null,
      });
    }
  };
  return (
    <CustomDrawerLayout
      open={props?.open}
      onClose={props?.onClose}
      modalHeader={modalHeader}
      footer={footer}
      width="50%"
    >
      <Form form={form} layout="vertical">
        <Checkbox
          checked={alignment}
          onChange={() => handleAlignment()}
          className="mb-4"
        >
         Change Objective Name
        </Checkbox>
        <Row gutter={[16, 16]} className="w-full">
          {/* Objective/Alignment */}
          <Col xs={24} sm={12} md={16}>
            <Form.Item
              id="alignment-select"
              className="font-bold text-xs w-full mb-2"
              label="Supervisor Key Result"
              rules={[
                {
                  required: reportsToId?true: false,
                  message: 'Please select a Supervisor Key Result',
                },
              ]}
            >
              <Select
                id="alignment-select-dropdown"
                showSearch
                placeholder="Search and select a Key Result"
                value={objectiveValue?.allignedKeyResultId || null}
                onChange={(value) =>
                  handleObjectiveChange(value, 'allignedKeyResultId')
                }
                filterOption={(input: any, option: any) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {keyResultByUser?.items.map((keyResult) => (
                  <Select.Option key={keyResult.id} value={keyResult.id}>
                    {keyResult.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Objective Deadline */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              id="deadline-picker"
              className="font-bold text-xs w-full mb-2"
              // name="ObjectiveDeadline"
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
                onChange={(date) =>
                  handleObjectiveChange(date?.format('YYYY-MM-DD'), 'deadline')
                }
                className="w-full"
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current < dayjs().startOf('day')
                }
              />
            </Form.Item>
          </Col>

          {/* Supervisor Key Result (Visible Only When Alignment is True) */}
          {alignment && (
            <Col xs={24} sm={24} md={16}>
              <Form.Item
                id="title-input"
                className="font-bold text-xs w-full"
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
                  onChange={(e) =>
                    handleObjectiveChange(e.target.value, 'title')
                  }
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Key Results Section */}
        <div className="border border-gray-300 rounded-lg p-4 mt-5">
          <div className="flex justify-between items-center">
            <p className="font-bold text-xs h-6">Set Key Result</p>
            <Button
              onClick={addKeyResult}
              className="border-none shadow-none bg-none text-xs"
              icon={<GoPlus size={16} />}
            >
              Add Key Result
            </Button>
          </div>
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
      </Form>
    </CustomDrawerLayout>
  );
};

export default EditObjective;
