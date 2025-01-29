import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import SubTaskComponent from './createSubtaskForm';
import { MdCancel } from 'react-icons/md';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { NAME } from '@/types/enumTypes';

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

  return (
    <Form.List name={name}>
      {(fields, { remove }, { errors }) => (
        <>
          {fields.map((field) => (
            <Form.Item required={false} key={field.key}>
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

              <Row gutter={8}>
                <Col lg={12} sm={24}>
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
                    label={<div className="text-xs">Task</div>}
                    key={`${field.key}-task`} // Unique key for task
                  >
                    <Input
                      className={`text-xs ${form.getFieldValue(name)[field.name].achieveMK}`}
                      disabled={form.getFieldValue(name)[field.name].achieveMK} // Disable if milestoneId exists
                      placeholder="Task name"
                    />
                  </Form.Item>
                </Col>
                <Col lg={12} sm={24}>
                  <Space>
                    <Form.Item
                      {...field}
                      name={[field.name, 'priority']}
                      label={<div className="text-xs">Priority</div>}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please select a priority',
                        },
                      ]}
                      key={`${field.key}-priority`} // Unique key for priority
                    >
                      <Select
                        className="w-32 h-7 text-xs"
                        options={[
                          {
                            label: 'High',
                            value: 'high',
                            className: 'text-error text-xs',
                          },
                          {
                            label: 'Medium',
                            value: 'medium',
                            className: 'text-warning text-xs',
                          },
                          {
                            label: 'Low',
                            value: 'low',
                            className: 'text-success text-xs',
                          },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label={<div className="text-xs">Weight</div>}
                      name={[field.name, 'weight']}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please input a number',
                        },
                      ]}
                      key={`${field.key}-weight`} // Unique key for weight
                    >
                      <InputNumber
                        placeholder="0"
                        className="w-32 text-xs"
                        onChange={() => {
                          const fieldValue = form.getFieldValue(name) || [];
                          const totalWeight = fieldValue.reduce(
                            (sum: number, field: any) =>
                              sum + (field.weight || 0),
                            0,
                          );
                          setWeight(name, totalWeight);
                        }}
                        min={0}
                        max={100}
                      />
                    </Form.Item>

                    <MdCancel
                      className="text-primary cursor-pointer mt-2"
                      size={20}
                      onClick={() => {
                        remove(field.name);
                        const fieldValue = form.getFieldValue(name) || [];
                        const totalWeight = fieldValue.reduce(
                          (sum: number, field: any) =>
                            sum + (field.weight || 0),
                          0,
                        );
                        setWeight(name, totalWeight);
                      }}
                    />
                  </Space>
                </Col>
              </Row>
              {keyResult?.metricType?.name !== NAME.ACHIEVE &&
                keyResult?.metricType?.name !== NAME.MILESTONE && (
                  <Form.Item
                    className="mb-4"
                    label={<div className="text-xs">Target</div>}
                    {...field}
                    name={[field.name, 'targetValue']}
                    hidden={hasTargetValue}
                    key={`${field.key}-targetValue`} // Unique key for targetValue
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
                              value <=
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
                      className="w-32 text-xs"
                      min={0} // Ensure the value can't go below 0
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                    />
                  </Form.Item>
                )}

              {planningPeriodId && planningUserId && (
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
              )}
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
