import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import { MdCancel } from 'react-icons/md';

interface SubTaskInterface {
  kId: string;
  hasTargetValue?: boolean;
  milestoneId: string | null;
  field: any;
  planningPeriodId: string;
  userId: string;
  planningUserId: string;
}
function SubTaskComponent({
  field: field,
  userId: userId,
  planningPeriodId: planningPeriodId,
  planningUserId: planningUserId,
  kId: kId,
  hasTargetValue: hasTargetValue,
  milestoneId: milestoneId,
}: SubTaskInterface) {
  return (
    <Form.List name={[field.name, 'subTasks']} initialValue={[]}>
      {(subFields, subOpt) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {subFields.map((subField) => (
            <>
              <Form.Item
                {...field}
                name={[field.name, 'milestoneId']}
                initialValue={milestoneId || null}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'keyResultId']}
                initialValue={kId || null}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planningPeriodId']}
                initialValue={planningPeriodId}
                noStyle
              >
                <Input type="hidden" value={planningPeriodId} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planningUserId']}
                initialValue={planningUserId}
                noStyle
              >
                <Input type="hidden" value={planningUserId} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'userId']}
                initialValue={userId}
                noStyle
              >
                <Input type="hidden" value={userId} />
              </Form.Item>{' '}
              <Row gutter={8}>
                <Col lg={12} sm={24}>
                  <Form.Item
                    {...subField}
                    name={[subField.name, 'task']}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message:
                          'Please input a task name or delete this field.',
                      },
                    ]}
                    key={`task-${subField.key}`}
                    label={<div className="text-xs">Task</div>}
                  >
                    <Input className="text-xs" placeholder="Task name" />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    label={<div className="text-xs">Target</div>}
                    {...subField}
                    name={[subField.name, 'targetValue']}
                    key={`target-${subField.key}`}
                    hidden={hasTargetValue}
                  >
                    <InputNumber
                      className="w-32 text-xs"
                      placeholder="20"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Space>
                    <Form.Item
                      {...subField}
                      name={[subField.name, 'priority']}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please select a priority',
                        },
                      ]}
                      key={`priority-${subField.key}`}
                      label={<div className="text-xs">Priority</div>}
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
                      {...subField}
                      name={[subField.name, 'weight']}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please input number',
                        },
                      ]}
                      key={`weight-${subField.key}`}
                      label="Weight"
                      hidden
                    >
                      <InputNumber defaultValue={0} />
                    </Form.Item>

                    <MdCancel
                      className="text-primary cursor-pointer"
                      size={20}
                      onClick={() => subOpt.remove(subField.name)}
                      key={`remove-${subField.key}`}
                    />
                  </Space>
                </Col>
              </Row>
            </>
          ))}
          {/* <Button
            className="w-16 h-2 text-[10px] "
            type="link"
            onClick={() => subOpt.add()}
            block
          >
            + Add Sub Task
          </Button> */}
        </div>
      )}
    </Form.List>
  );
}

export default SubTaskComponent;
