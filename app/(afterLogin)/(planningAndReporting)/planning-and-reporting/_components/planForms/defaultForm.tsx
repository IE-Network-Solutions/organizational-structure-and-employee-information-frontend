import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { MdCancel } from 'react-icons/md';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { NAME } from '@/types/enumTypes';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

interface DefaultCardInterface {
  kId: string;
  hasTargetValue?: boolean;
  hasMilestone?: boolean;
  milestoneId: string | null;
  name: string;
  form: any;
  planningPeriodId: string;
  userId: string;
  planningUserId: string;
  parentPlanId?: string;
  planId?: string;
  planTaskId?: string;
  isMKAsTask?: boolean;
  keyResult?: any;
  targetValue?: number;
}

function DefaultCardForm({
  kId,
  hasTargetValue,
  milestoneId,
  name,
  form,
  userId,
  planningPeriodId,
  planningUserId,
  planTaskId,
  parentPlanId,
  keyResult,
  targetValue,
  planId,
}: DefaultCardInterface) {
  const { setWeight } = PlanningAndReportingStore();
  const { setClickStatus } = useClickStatus();

  const sumTargetValue = (name: string) => {
    const formValues = form.getFieldsValue(); // Get all form values
    const total = formValues[name].reduce(
      (sum: number, task: any) => sum + task.targetValue,
      0,
    );
    return total;
  };
  return (
    <Form.List name={name}>
      {(fields, { remove }, { errors }) => (
        <>
          {fields.map((field) => (
            <Form.Item
              required={false}
              className="py-2"
              key={field.key}
              style={{ marginBottom: 0 }}
            >
              <Form.Item
                {...field}
                name={[field.name, 'milestoneId']}
                initialValue={milestoneId || null}
                noStyle
                key={`${field.key}-milestoneId`} // Unique key for milestoneId
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'parentPlanId']}
                initialValue={parentPlanId || null}
                noStyle
                key={`${field.key}-parentPlanId`} // Unique key for milestoneId
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planId']}
                initialValue={planId || null}
                noStyle
                key={`${field.key}-planId`} // Unique key for milestoneId
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'parentTaskId']}
                initialValue={planTaskId || null}
                noStyle
                key={`${field.key}-parentTaskId`} // Unique key for milestoneId
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'keyResultId']}
                initialValue={kId || null}
                noStyle
                key={`${field.key}-keyResultId`} // Unique key for keyResultId
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planningPeriodId']}
                initialValue={planningPeriodId}
                noStyle
                key={`${field.key}-planningPeriodId`} // Unique key for planningPeriodId
              >
                <Input type="hidden" value={planningPeriodId} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planningUserId']}
                initialValue={planningUserId}
                noStyle
                key={`${field.key}-planningUserId`} // Unique key for planningUserId
              >
                <Input type="hidden" value={planningUserId} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'userId']}
                initialValue={userId}
                noStyle
                key={`${field.key}-userId`} // Unique key for userId
              >
                <Input type="hidden" value={userId} />
              </Form.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '16px' }}>
                <Form.Item
                  {...field}
                  name={[field.name, 'task']}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message:
                        'Please input a task name or delete this field.',
                    },
                  ]}
                  noStyle
                  key={`${field.key}-task`} // Unique key for task
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input
                    className={`text-[12px] h-10 ${form.getFieldValue(name)[field.name].achieveMK}`}
                    disabled={form.getFieldValue(name)[field.name].achieveMK} // Disable if milestoneId exists
                    placeholder="Add your tasks here"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <MdCancel
                  className="text-primary cursor-pointer"
                  size={20}
                  onClick={() => {
                    setClickStatus(milestoneId + '', false);
                    remove(field.name);
                    const fieldValue = form.getFieldValue(name) || [];
                    const totalWeight = fieldValue.reduce(
                      (sum: number, field: any) =>
                        Number(sum) + Number(field?.weight || 0),
                      0,
                    );
                    setWeight(name, totalWeight);
                  }}
                />
              </div>
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
                              hidden={hasTargetValue}
                              {...field}
                              name={[field.name, 'targetValue']}
                              key={`${field.key}-targetValue`}
                              noStyle
                              rules={[
                                {
                                  /* eslint-disable @typescript-eslint/naming-convention */
                                  validator(_, value: any) {
                                    /* eslint-enable @typescript-eslint/naming-convention */
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
                                      targetValue !== null &&
                                      targetValue !== undefined
                                    ) {
                                      // Check if numericValue is within the targetValue
                                      if (value <= targetValue) {
                                        return Promise.resolve(); // Validation passed
                                      }
                                    } else {
                                      // Fallback check if targetValue does not exist
                                      if (
                                        sumTargetValue(name) <=
                                        keyResult.targetValue - keyResult.currentValue
                                      ) {
                                        return Promise.resolve(); // Validation passed
                                      }
                                    }

                                    // If neither condition is satisfied, reject the promise
                                    return Promise.reject(
                                      new Error(
                                        `Your target value shouldn't exceed the allowed limits. you have only ${Number(keyResult.targetValue - keyResult.currentValue).toLocaleString()}`,
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
                        <div className="text-xs flex items-center  w-14 gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                          Weight
                        </div>
                      </Col>
                      <Col span={18}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'weight']}
                          key={`${field.key}-weight`} // Unique key for weight
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: 'Weight is required',
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder={'0'}
                            className="w-28 text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full [&_.ant-input-number-input]:pt-1"
                            min={0}
                            max={100}
                            onChange={() => {
                              const fieldValue = form.getFieldValue(name) || [];
                              const totalWeight = fieldValue.reduce(
                                (sum: number, field: any) =>
                                  Number(sum) + Number(field?.weight || 0),
                                0,
                              );
                              setWeight(name, totalWeight);
                            }}
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
                          {...field}
                          name={[field.name, 'priority']}
                          key={`${field.key}-priority`} // Unique key for priority
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: 'Priority is required',
                            },
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
              </Row>

              {/* {planningPeriodId && planningUserId && (
                <Form.Item
                  label={<div className="text-xs">Sub Tasks</div>}
                  className="border px-4 py-1 rounded-md"
                >
                  <SubTaskComponent
                    field={field}
                    kId={kId}
                    hasTargetValue={hasTargetValue}
                    milestoneId={milestoneId}
                    planningPeriodId={planningPeriodId}
                    planningUserId={planningUserId}
                    userId={userId}
                  />
                </Form.Item>
              )} */}
            </Form.Item>
          ))}

          <Form.Item>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
  );
}

export default DefaultCardForm;


