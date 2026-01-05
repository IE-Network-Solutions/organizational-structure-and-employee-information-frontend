import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
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
              <Row gutter={[12, 12]} align="bottom">
                <Col xs={24} lg={12}>
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
                    className="mb-0"
                  >
                    <Input
                      id={`subtask-task-input-${field.name}-${subField.name}`}
                      data-cy={`subtask-task-input-${field.name}-${subField.name}`}
                      className="text-xs h-10"
                      placeholder="Task name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} lg={5}>
                  <Form.Item
                    {...subField}
                    name={[subField.name, 'targetValue']}
                    key={`target-${subField.key}`}
                    hidden={hasTargetValue}
                    className="mb-0"
                  >
                    <Row align="middle" gutter={8} wrap={false}>
                      <Col flex="none">
                        <div className="text-xs whitespace-nowrap">Target</div>
                      </Col>
                      <Col flex="auto">
                        <InputNumber
                          id={`subtask-target-input-${field.name}-${subField.name}`}
                          data-cy={`subtask-target-input-${field.name}-${subField.name}`}
                          className="w-full text-xs h-10 [&_.ant-input-number-input]:h-full [&_.ant-input-number-input]:flex [&_.ant-input-number-input]:items-center"
                          placeholder="20"
                          min={0}
                        />
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} lg={5}>
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
                    className="mb-0"
                  >
                    <Row align="middle" gutter={8} wrap={false}>
                      <Col flex="none">
                        <div className="text-xs whitespace-nowrap">
                          Priority
                        </div>
                      </Col>
                      <Col flex="auto">
                        <Select
                          id={`subtask-priority-select-${field.name}-${subField.name}`}
                          data-cy={`subtask-priority-select-${field.name}-${subField.name}`}
                          className="w-full h-10 text-xs"
                          options={[
                            {
                              label: (
                                <span className="text-error text-xs">High</span>
                              ),
                              value: 'high',
                            },
                            {
                              label: (
                                <span className="text-warning text-xs">
                                  Medium
                                </span>
                              ),
                              value: 'medium',
                            },
                            {
                              label: (
                                <span className="text-success text-xs">
                                  Low
                                </span>
                              ),
                              value: 'low',
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  sm={8}
                  lg={2}
                  className="flex items-center justify-end h-10"
                >
                  <Form.Item
                    {...subField}
                    name={[subField.name, 'weight']}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[{ required: true, message: 'Please input number' }]}
                    key={`weight-${subField.key}`}
                    hidden
                  >
                    <InputNumber
                      id={`subtask-weight-input-${field.name}-${subField.name}`}
                      data-cy={`subtask-weight-input-${field.name}-${subField.name}`}
                      defaultValue={0}
                    />
                  </Form.Item>
                  <MdCancel
                    id={`subtask-remove-button-${field.name}-${subField.name}`}
                    data-cy={`subtask-remove-button-${field.name}-${subField.name}`}
                    className="text-primary cursor-pointer hover:text-red-500 transition-colors"
                    size={24}
                    onClick={() => subOpt.remove(subField.name)}
                    key={`remove-${subField.key}`}
                  />
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
