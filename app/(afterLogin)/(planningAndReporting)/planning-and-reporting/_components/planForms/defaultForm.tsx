import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
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
                  <div className="mt-2">
                    <Row gutter={[12, 12]} align="bottom">
                      {keyResult?.metricType?.name !== NAME.ACHIEVE &&
                        keyResult?.metricType?.name !== NAME.MILESTONE && (
                          <Col xs={12} sm={8} md={8}>
                            <Row align="middle" gutter={8} wrap={false}>
                              <Col flex="none">
                                <div className="text-xs flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                                  Target
                                </div>
                              </Col>
                              <Col flex="auto">
                                <Form.Item
                                  hidden={hasTargetValue}
                                  {...field}
                                  name={[field.name, 'targetValue']}
                                  key={`${field.key}-targetValue`}
                                  noStyle
                                >
                                  <InputNumber
                                    min={0}
                                    className="w-full text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                                    defaultValue={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                        )}

                      <Col xs={12} sm={8} md={8}>
                        <Row align="middle" gutter={8} wrap={false}>
                          <Col flex="none">
                            <div className="text-xs flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                              Weight
                            </div>
                          </Col>
                          <Col flex="auto">
                            <Form.Item
                              {...field}
                              name={[field.name, 'weight']}
                              key={`${field.key}-weight`}
                              noStyle
                              rules={[
                                { required: true, message: 'Weight is required' },
                                {
                                  validator: (nonused, value) => {
                                    if (value !== undefined && value !== null && value <= 0) {
                                      return Promise.reject(new Error('Weight must be greater than 0'));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <InputNumber
                                placeholder={'0'}
                                className="w-full text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                                min={1}
                                max={100}
                                onChange={() => {
                                  const fieldValue = form.getFieldValue(name) || [];
                                  const totalWeight = fieldValue.reduce(
                                    (sum: number, f: any) => Number(sum) + Number(f?.weight || 0),
                                    0,
                                  );
                                  setWeight(name, totalWeight);
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>

                      <Col xs={12} sm={8} md={8}>
                        <Row align="middle" gutter={8} wrap={false}>
                          <Col flex="none">
                            <div className="text-xs flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary inline-block"></span>
                              Priority
                            </div>
                          </Col>
                          <Col flex="auto">
                            <Form.Item
                              {...field}
                              name={[field.name, 'priority']}
                              key={`${field.key}-priority`}
                              noStyle
                              rules={[{ required: true, message: 'Priority is required' }]}
                            >
                              <Select
                                placeholder={<div className="text-xs">Priority</div>}
                                className="w-full h-10"
                                options={[
                                  { label: <div className="text-error text-xs">High</div>, value: 'high' },
                                  { label: <div className="text-warning text-xs">Medium</div>, value: 'medium' },
                                  { label: <div className="text-success text-xs">Low</div>, value: 'low' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
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


