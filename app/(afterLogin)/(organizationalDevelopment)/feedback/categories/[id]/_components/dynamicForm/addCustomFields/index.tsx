import CustomButton from '@/components/common/buttons/customButton';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

const { Option } = Select;

const AddCustomFields: React.FC<any> = () => {
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
    <div>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
        <div></div>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="rounded-full bg-primary w-8 h-8 flex items-center justify-center">
            <PlusOutlined size={30} className="text-white" />
          </div>
          <p className="text-xs font-light text-gray-400"> Add Question</p>
        </div>
        <Form.Item className="flex items-center justify-center font-semibold text-medium">
          <Button type="link">Skip</Button>
        </Form.Item>
        <div className="flex flex-col items-center justify-center">
          <Button className="py-1 px-12 h-8 flex item-center justify-center bg-primary text-white">
            Save Draft
          </Button>
          <div className="flex items-center justify-center my-3 gap-4 py-3 px-6">
            <CustomButton
              title="Cancel"
              className="px-12 bg-gray-100 text-gray-400 text-normal font-normal"
            />
            <CustomButton
              title="Next"
              className="px-12 text-normal font-normal bg-primary"
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddCustomFields;
