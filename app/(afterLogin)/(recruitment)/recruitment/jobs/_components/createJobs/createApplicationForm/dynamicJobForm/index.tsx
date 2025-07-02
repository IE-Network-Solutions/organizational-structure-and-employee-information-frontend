import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Checkbox,
  Col,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
} from 'antd';
import { FieldType } from '@/types/enumTypes';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Option } = Select;
interface DynamicJobFormProps {
  form: FormInstance;
}
const DynamicJobForm: React.FC<DynamicJobFormProps> = ({ form }) => {
  const renderOptionInput = (type: any) => {
    switch (type) {
      case 'multiple_choice':
        return <Radio className="mr-2" disabled value="" />;
      case 'checkbox':
        return <Checkbox className="mr-2" disabled value="" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Form.List
        name="questions"
        initialValue={[
          {
            id: '',
            fieldType: undefined,
            question: '',
            required: false,
            field: [],
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <>
                <div
                  key={index}
                  className="text-md font-semibold text-gray-800 mb-2 block"
                >
                  Question {index + 1}
                  <span className="text-red-500">*</span>
                </div>

                <Row gutter={12} key={key}>
                  <Col lg={14} md={14} xs={24} sm={14} xl={14}>
                    <Form.Item
                      label=""
                      name={[name, 'question']}
                      rules={[
                        {
                          required: true,
                          message: 'This field is required',
                        },
                      ]}
                    >
                      <div className="flex items-center">
                        <Input
                          placeholder="Enter your question here"
                          allowClear
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col lg={10} md={10} xs={24} sm={10} xl={10}>
                    <Row gutter={[8, 8]} justify="space-between">
                      <Col lg={18} sm={18} xs={24} md={18} xl={18}>
                        <Form.Item
                          {...restField}
                          name={[name, 'fieldType']}
                          rules={[
                            {
                              required: true,
                              message: 'Please select a field type',
                            },
                          ]}
                        >
                          <Select placeholder="Select type" allowClear>
                            <Option value="multiple_choice">
                              Multiple Choice
                            </Option>
                            <Option value="checkbox">Checkbox</Option>
                            <Option value="short_text">Short Text</Option>
                            <Option value="paragraph">Paragraph</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col lg={4} sm={4} xs={24} md={4} xl={4}>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          className="flex items-center justify-center"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Form.Item
                  label=""
                  name={[name, 'required']}
                  className="mb-2 mt-0 ml-4"
                  valuePropName="checked"
                >
                  <div className="flex items-center text-sm">
                    <Checkbox defaultChecked={false}>Is Required</Checkbox>
                  </div>
                </Form.Item>

                <Form.List
                  name={[name, 'field']}
                  initialValue={[]}
                  rules={[
                    {
                      /* eslint-disable @typescript-eslint/naming-convention */
                      validator: async (_, names) => {
                        /* eslint-enable @typescript-eslint/naming-convention */
                        const type = form?.getFieldValue([
                          'questions',
                          name,
                          'fieldType',
                        ]);

                        if (
                          type === FieldType.MULTIPLE_CHOICE ||
                          type === FieldType.CHECKBOX
                        ) {
                          if (!names || names.length < 2) {
                            return Promise.reject(
                              NotificationMessage.warning({
                                message: `At least ${2} options are required`,
                                description: 'Please add additional fields.',
                              }),
                            );
                          }
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }) => {
                    const questionType = form?.getFieldValue([
                      'questions',
                      name,
                      'fieldType',
                    ]);
                    return (
                      <div className="ml-8">
                        {fields.map((field) => (
                          <Form.Item required={false} key={field.key}>
                            <div className="flex items-center gap-3">
                              {renderOptionInput(questionType)}
                              <Form.Item
                                {...field}
                                initialValue={[]}
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      'Please input something or delete this field.',
                                  },
                                ]}
                                noStyle
                              >
                                <Input placeholder="" />
                              </Form.Item>
                              {fields.length > 0 ? (
                                <MinusCircleOutlined
                                  className="dynamic-delete-button"
                                  onClick={() => remove(field.name)}
                                />
                              ) : null}
                            </div>
                          </Form.Item>
                        ))}

                        {questionType === 'multiple_choice' ||
                        questionType === FieldType.CHECKBOX ? (
                          <Form.Item>
                            <div className="flex flex-col items-center justify-center">
                              <div
                                onClick={() => add()}
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-primary cursor-pointer"
                              >
                                <PlusOutlined
                                  size={30}
                                  className="text-white"
                                />
                              </div>
                              <p className="text-xs font-light text-gray-400 ">
                                Add Option
                              </p>
                            </div>
                          </Form.Item>
                        ) : (
                          <></>
                        )}
                      </div>
                    );
                  }}
                </Form.List>
              </>
            ))}
            <Form.Item>
              <div className="flex flex-col items-center justify-center my-8">
                <div
                  className="rounded-full bg-primary w-8 h-8 flex items-center justify-center"
                  onClick={() => add()}
                >
                  <PlusOutlined size={50} className="text-white" />
                </div>
                <p className="text-md font-normal mt-2 text-gray-400">
                  Add Question
                </p>
              </div>
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );
};

export default DynamicJobForm;
