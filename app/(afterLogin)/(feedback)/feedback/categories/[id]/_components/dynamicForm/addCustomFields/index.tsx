import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import React from 'react';

const { Option } = Select;

const AddCustomFields: React.FC<{ onSkip: () => void; onNext: () => void }> = ({
  onSkip,
}) => {
  const { customFields, setCustomFields } = CategoriesManagementStore();

  const [form] = Form.useForm();

  const handleCustomFieldChange = (fieldName: string, checked: boolean) => {
    const updatedFields = customFields.map((field) =>
      field.name === fieldName ? { ...field, selected: checked } : field,
    );
    setCustomFields(updatedFields);
  };

  const onFinish = () => {};
  const customDropdownRender = () => (
    <div className="bg-white rounded-md shadow-lg">
      {customFields.map((field, index) => (
        <div key={index} className="p-2 hover:bg-gray-100">
          <Checkbox
            checked={field.selected}
            onChange={(e) =>
              handleCustomFieldChange(field.name, e.target.checked)
            }
          >
            {field.name}
          </Checkbox>
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex flex-col gap-9 justify-between items-between">
      <Form
        // form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="customFields"
          label={
            <span className="font-semibold"> Choose your custom fields</span>
          }
          rules={[
            {
              required: true,
              message: 'Please select at least one custom field',
            },
          ]}
        >
          <Select
            mode="multiple"
            size="middle"
            style={{ width: '100%' }}
            placeholder="Select custom fields"
            dropdownRender={customDropdownRender}
            onChange={(values) => {
              const updatedFields = customFields.map((field: any) => ({
                ...field,
                selected: values.includes(field.name),
              }));
              setCustomFields(updatedFields);
            }}
          >
            {customFields.map((field: any, index: any) => (
              <Option key={index} value={field.name}>
                {field.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {customFields
          .filter((field: any) => field.selected)
          .map((field: any, index: any) => (
            <Form.Item key={index} name={`field_${index}`} label={field.name}>
              <Input allowClear placeholder={field.name} />
            </Form.Item>
          ))}
        <div className="flex items-center justify-center font-semibold text-medium">
          <Button type="link" onClick={onSkip}>
            Skip
          </Button>
        </div>
      </Form>
      <div className="flex flex-col items-center">
        <Button className="py-1 px-12 h-8 flex item-center justify-center bg-primary text-white">
          Save Draft
        </Button>
      </div>
    </div>
  );
};

export default AddCustomFields;
