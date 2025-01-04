import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import { NAME } from '@/types/enumTypes';

interface BoardCardInterface {
  form: any;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  kId: string;
  hideTargetValue: boolean;
  name: string;
  isMKAsTask?: boolean;
  keyResult: any;
}

function BoardCardForm({
  form,
  handleAddName,
  handleRemoveBoard,
  hideTargetValue,
  name,
  isMKAsTask = false,
  keyResult,
}: BoardCardInterface) {
  const { setMKAsATask, mkAsATask } = PlanningAndReportingStore();
  return (
    <Form.List name={`board-${name}`}>
      {(subfields, { remove: removeSub }) => (
        <>
          {subfields.map(({ key, name: subName, ...restSubField }) => (
            <Form.Item
              required={false}
              className="border-2 border-primary p-4 rounded-lg m-4 shadow-lg"
              key={key}
              label={'Task'}
            >
              <Form.Item
                {...restSubField}
                name={[subName, 'task']}
                key={`${subName}-task`} // Unique key for task
                rules={[{ required: true, message: 'Task is required' }]}
                noStyle // Use noStyle to avoid nested Form.Item issues
                initialValue={isMKAsTask ? mkAsATask : ''}
              >
                <Input
                  disabled={isMKAsTask}
                  placeholder="Add your tasks here"
                />
              </Form.Item>
              <Form.Item
                {...restSubField}
                name={[subName, 'achieveMK']}
                key={`${subName}-task`} // Unique key for task
                noStyle // Use noStyle to avoid nested Form.Item issues
                initialValue={isMKAsTask ? true : false}
              >
                <Input type="hidden" />
              </Form.Item>
              <Divider className="mt-4" />
              {(keyResult?.metricType?.name != NAME.ACHIEVE ||
                keyResult?.metricType?.name != NAME.MILESTONE) && (
                <Form.Item
                  hidden={hideTargetValue}
                  label="Target"
                  {...restSubField}
                  name={[subName, 'targetValue']}
                  key={`${subName}-targetValue`}
                  rules={[
                    {
                      validator(value: any) {
                        // Log the value and calculated limit for debugging

                        if (
                          keyResult?.metricType?.name === NAME.ACHIEVE ||
                          keyResult?.metricType?.name === NAME.MILESTONE
                        ) {
                          return Promise.resolve(); // Skip validation
                        }
                        // Handle null or undefined value
                        if (value === null || value === undefined) {
                          return Promise.reject(
                            new Error('Please enter a target value.'),
                          );
                        }

                        // Validate against the key result limits
                        if (
                          value <=
                          keyResult.targetValue - keyResult.currentValue
                        ) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(
                            "Your target value shouldn't be greater than your key result target value.",
                          ),
                        );
                      },
                    },
                  ]}
                >
                  <InputNumber
                    className="w-28"
                    defaultValue={0} // Set a default value to avoid null issues
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                  />
                </Form.Item>
              )}

              <Row justify="space-between" align={'middle'}>
                <Col>
                  <Space size={10}>
                    <Form.Item
                      label="Weight"
                      {...restSubField}
                      name={[subName, 'weight']}
                      key={`${subName}-weight`} // Unique key for weight
                      rules={[
                        { required: true, message: 'Weight is required' },
                      ]}
                    >
                      <InputNumber
                        placeholder={'0'}
                        className="w-28"
                        min={0}
                        max={100}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Priority"
                      {...restSubField}
                      name={[subName, 'priority']}
                      key={`${subName}-priority`} // Unique key for priority
                      rules={[
                        { required: true, message: 'Priority is required' },
                      ]}
                    >
                      <Select
                        placeholder="Select Priority"
                        className="w-28"
                        options={[
                          {
                            label: <div className="text-error">High</div>,
                            value: 'high',
                          },
                          {
                            label: <div className="text-warning">Medium</div>,
                            value: 'medium',
                          },
                          {
                            label: <div className="text-success">Low</div>,
                            value: 'low',
                          },
                        ]}
                      />
                    </Form.Item>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        form
                          .validateFields([`board-${name}`, subName])
                          .then(() => {
                            const boardsKey = `board-${name}`;
                            const currentBoardValues =
                              form.getFieldValue([boardsKey, subName]) || [];
                            handleAddName(currentBoardValues, name);
                            handleRemoveBoard(subName, name);
                            setMKAsATask(null);
                          });
                      }}
                    >
                      Add Task
                    </Button>
                    <Button onClick={() => removeSub(subName)}>Cancel</Button>
                  </Space>
                </Col>
              </Row>
            </Form.Item>
          ))}
        </>
      )}
    </Form.List>
  );
}

export default BoardCardForm;
