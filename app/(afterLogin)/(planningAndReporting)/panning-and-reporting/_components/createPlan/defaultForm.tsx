import { Col, Form, Input, InputNumber, Row, Select, Space } from 'antd';
import SubTaskComponent from './createSubtaskForm';
import { MdCancel } from 'react-icons/md';
import { usePlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

interface DefaultCardInterface {
  kId: string;
  hasTargetValue: boolean;
  hasMilestone: boolean;
  milestoneId: string | null;
  name: string;
  form: any;
}
function DefaultCardForm({
  kId: kId,
  hasTargetValue: hasTargetValue,
  milestoneId: milestoneId,
  name: name,
  form: form,
}: DefaultCardInterface) {
  const { setWeight } = usePlanningAndReportingStore();

  return (
    <Form.List name={name}>
      {(fields, { remove }, { errors }) => (
        <>
          {fields.map((field, index) => (
            <Form.Item required={false} key={field.key}>
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
                initialValue={''}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planningUserId']}
                initialValue={''}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'userId']}
                initialValue={''}
                noStyle
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'planId']}
                initialValue={''}
                noStyle
              >
                <Input type="hidden" />
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
                    label={'Task'}
                  >
                    <Input placeholder="Task name" />
                  </Form.Item>
                </Col>
                <Col lg={12} sm={24}>
                  <Space>
                    <Form.Item
                      {...field}
                      name={[field.name, 'priority']}
                      label={'Priority'}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please select a priority',
                        },
                      ]}
                    >
                      <Select
                        className="w-24"
                        options={[
                          {
                            label: 'High',
                            value: 'high',
                            className: 'text-error',
                          },
                          {
                            label: 'Medium',
                            value: 'medium',
                            className: 'text-warning',
                          },
                          {
                            label: 'Low',
                            value: 'low',
                            className: 'text-success',
                          },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label={'Weight'}
                      name={[field.name, 'weight']}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          message: 'Please input number',
                        },
                      ]}
                    >
                      <InputNumber
                        placeholder="0"
                        onChange={(v) => {
                          let fieldValue = form.getFieldValue(name) || [];

                          const totalWeight = fieldValue.reduce(
                            (sum: number, field: any) => {
                              return sum + (field.weight || 0);
                            },
                            0,
                          );
                          setWeight(name, totalWeight);
                        }}
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MdCancel
                        className="text-primary cursor-pointer"
                        size={20}
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Space>
                </Col>
              </Row>

              <Form.Item
                className="my-4"
                label={'Target Amount'}
                {...field}
                name={[field.name, 'targetAmount']}
                hidden={hasTargetValue}
              >
                <InputNumber placeholder="20" />
              </Form.Item>
              <Form.Item label="Sub tasks">
                <SubTaskComponent field={field} />
              </Form.Item>
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
