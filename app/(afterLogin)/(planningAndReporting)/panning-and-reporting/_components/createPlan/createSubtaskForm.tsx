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

function SubTaskComponent({ field: field }: any) {
  return (
    <Form.List name={[field.name, 'subTasks']} initialValue={[]}>
      {(subFields, subOpt) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 16,
          }}
        >
          {subFields.map((subField) => (
            <>
              {' '}
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
                  >
                    <Input placeholder="Task name" />
                  </Form.Item>
                </Col>
                <Col lg={12} sm={24}>
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
                    >
                      <InputNumber placeholder="0" />
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
              <Form.Item
                className="my-4"
                label={'Target'}
                {...subField}
                name={[subField.name, 'targetAmount']}
                key={`target-${subField.key}`}
              >
                <InputNumber placeholder="20" />
              </Form.Item>
            </>

            // <Space key={subField.key}>
            //   <Form.Item noStyle name={[subField.name, 'first']}>
            //     <Input placeholder="first" />
            //   </Form.Item>
            //   <Form.Item noStyle name={[subField.name, 'second']}>
            //     <Input placeholder="second" />
            //   </Form.Item>
            //   <MdCancel
            //     className="text-primary cursor-pointer"
            //     size={20}
            //     onClick={() => {
            //       subOpt.remove(subField.name);
            //     }}
            //   />
            // </Space>
          ))}
          <Button type="dashed" onClick={() => subOpt.add()} block>
            + Add Sub Item
          </Button>
        </div>
      )}
    </Form.List>
  );
}

export default SubTaskComponent;
