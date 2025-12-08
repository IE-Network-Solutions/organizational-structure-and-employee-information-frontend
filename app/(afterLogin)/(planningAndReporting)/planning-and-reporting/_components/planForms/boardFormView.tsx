import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import { MdCancel } from 'react-icons/md';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

interface BoardCardInterface {
  form: any;
  handleAddName: (arg1: Record<string, string>, arg2: string) => void;
  handleRemoveBoard: (arg1: number, arg2: string) => void;
  kId: string;
  hideTargetValue?: boolean;
  name: string;
  isMKAsTask?: boolean;
  keyResult: any;
  targetValue?: number;
  milestoneId?: number;
  parentPlanId?: string;
  onCancle?: () => void;
}

function BoardCardForm({
  form,
  handleAddName,
  handleRemoveBoard,
  hideTargetValue,
  name,
  isMKAsTask = false,
  keyResult,
  targetValue,
  milestoneId,
}: BoardCardInterface) {
  const { setMKAsATask, mkAsATask } = PlanningAndReportingStore();
  const { setClickStatus } = useClickStatus();
  return (
    <Form.List name={`board-${name}`}>
      {(subfields, { remove: removeSub }) => (
        <>
          {subfields.map(({ key, name: subName, ...restSubField }) => (
            <Form.Item
              required={false}
              className="py-3"
              key={key}
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '16px' }}>
                <Form.Item
                  {...restSubField}
                  name={[subName, 'task']}
                  key={`${subName}-task`} // Unique key for task
                  rules={[{ required: true, message: 'Task is required' }]}
                  noStyle // Use noStyle to avoid nested Form.Item issues
                  initialValue={isMKAsTask ? mkAsATask?.title : ''}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    disabled={isMKAsTask}
                    placeholder="Add your tasks here"
                    className="text-[12px] h-10"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <MdCancel
                  className="text-primary cursor-pointer"
                  size={20}
                  onClick={() => {
                    removeSub(subName);
                    setClickStatus(milestoneId + '', false);
                  }}
                />
              </div>
              <Form.Item
                {...restSubField}
                name={[subName, 'achieveMK']}
                key={`${subName}-task`} // Unique key for task
                noStyle // Use noStyle to avoid nested Form.Item issues
                initialValue={isMKAsTask ? true : false}
              >
                <Input type="hidden" />
              </Form.Item>
              {/* <Divider className="mt-2 mb-2" /> */}
              <Row justify="space-between" align={'middle'} style={{ marginTop: '8px' }}>
                <Col>
                  <Space size={16}>
                    {keyResult?.metricType?.name !== NAME.ACHIEVE &&
                      keyResult?.metricType?.name !== NAME.MILESTONE && (
                        <Row align="middle" gutter={16}>
                          <Col span={6}>
                            <div className="text-xs flex items-center w-14 gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                              Target
                            </div>
                          </Col>
                          <Col span={18}>
                            <Form.Item
                              hidden={hideTargetValue}
                              {...restSubField}
                              name={[subName, 'targetValue']}
                              key={`${subName}-targetValue`}
                              noStyle
                              rules={[
                                {
                                  /* eslint-disable @typescript-eslint/naming-convention */
                                  validator(_, value: any) {
                                    /* eslint-enable @typescript-eslint/naming-convention */
                                    // Check if keyResult is available
                                    if (
                                      !keyResult ||
                                      !keyResult.targetValue ||
                                      !keyResult.currentValue
                                    ) {
                                      return Promise.reject(
                                        new Error('Key result data is incomplete.'),
                                      );
                                    }

                                    // Skip validation for specific metric types
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

                                    // Ensure value is a valid number
                                    const numericValue = Number(value);
                                    if (isNaN(numericValue)) {
                                      return Promise.reject(
                                        new Error('Please enter a valid number.'),
                                      );
                                    }
                                    if (numericValue < 0) {
                                      return Promise.reject(
                                        new Error(
                                          "Your target value shouldn't be negative.",
                                        ),
                                      );
                                    }

                                    // Validate against the key result limits
                                    if (
                                      targetValue !== null &&
                                      targetValue !== undefined
                                    ) {
                                      // Check if numericValue is within the targetValue
                                      if (numericValue <= targetValue) {
                                        return Promise.resolve(); // Validation passed
                                      }
                                    } else {
                                      // Fallback check if targetValue does not exist
                                      if (
                                        numericValue <=
                                        keyResult.targetValue - keyResult.currentValue
                                      ) {
                                        return Promise.resolve(); // Validation passed
                                      }
                                    }

                                    // If neither condition is satisfied, reject the promise
                                    return Promise.reject(
                                      new Error(
                                        "Your target value shouldn't exceed the allowed limits.",
                                      ),
                                    );
                                  },
                                },
                              ]}
                            >
                              <InputNumber
                                className="w-28 text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full [&_.ant-input-number-input]:pt-1"
                                defaultValue={0} // Set a default value to avoid null issues
                                formatter={(value) => {
                                  if (!value) return '';
                                  const parts = `${value}`.split('.');
                                  parts[0] = parts[0].replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ',',
                                  );
                                  return parts.join('.');
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      )}
                    <Row align="middle" gutter={16}>
                      <Col span={6}>
                        <div className="text-xs flex items-center w-14 gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          Weight
                        </div>
                      </Col>
                      <Col span={18}>
                        <Form.Item
                          {...restSubField}
                          name={[subName, 'weight']}
                          key={`${subName}-weight`} // Unique key for weight
                          noStyle
                          rules={[
                            { required: true, message: 'Weight is required' },
                          ]}
                        >
                          <InputNumber
                            placeholder={'0'}
                            className="w-28 text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full [&_.ant-input-number-input]:pt-1"
                            min={0}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row align="middle" gutter={16}>
                      <Col span={6}>
                        <div className="text-xs flex items-center w-14 gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          Priority
                        </div>
                      </Col>
                      <Col span={18}>
                        <Form.Item
                          {...restSubField}
                          name={[subName, 'priority']}
                          key={`${subName}-priority`} // Unique key for priority
                          noStyle
                          rules={[
                            { required: true, message: 'Priority is required' },
                          ]}
                        >
                          <Select
                            placeholder={
                              <div className="text-xs">Select Priority</div>
                            }
                            className="w-32 h-10"
                            options={[
                              {
                                label: (
                                  <div className="text-error text-xs">High</div>
                                ),
                                value: 'high',
                              },
                              {
                                label: (
                                  <div className="text-warning text-xs">Medium</div>
                                ),
                                value: 'medium',
                              },
                              {
                                label: (
                                  <div className="text-success text-xs">Low</div>
                                ),
                                value: 'low',
                              },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Space>
                </Col>
                <Col>
                  <Button
                    id="add-task-button-for-planning-and-reporting"
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
