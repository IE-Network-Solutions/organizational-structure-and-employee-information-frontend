import React from 'react';
import { Form, Input, Button } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { MdClose } from 'react-icons/md';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  initialValues?: any;
  loading: boolean;
  form: any;
}

export const MeetingTemplateDrawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  onFinish,
  initialValues,
  loading,
  form,
}) => {
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <Button
        type="default"
        title="Cancel"
        onClick={() => onClose()}
        style={{ marginRight: 8 }}
        loading={loading}
        className="h-10"
      >
        Cancel
      </Button>
      <Button
        htmlType="submit"
        type="primary"
        onClick={() => form.submit()}
        loading={loading}
        className="h-10"
      >
        {initialValues ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={() => onClose()}
      modalHeader={
        <div className="text-center font-bold text-xl">
          {' '}
          {initialValues
            ? 'Update Meeting Template'
            : 'Add New Meeting Template'}
        </div>
      }
      width="40%"
      footer={footer}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues || { agendaItems: [''] }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
        >
          <Input placeholder="Template name" />
        </Form.Item>

        <Form.Item
          label="Meeting Objective"
          name="objective"
          rules={[
            { required: true, message: 'Please enter the meeting objective' },
          ]}
        >
          <Input placeholder="The meeting objective" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea placeholder="Some sort of description" />
        </Form.Item>

        <Form.List name="agendaItems">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="mb-2">
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: 'Missing agenda item' }]}
                    label={`Agenda Item ${key + 1}`}
                    className="w-full"
                  >
                    <Input
                      placeholder="Agenda Item"
                      suffix={
                        <MdClose
                          className="cursor-pointer text-gray-500 hover:text-red-500"
                          onClick={() => remove(name)}
                        />
                      }
                    />
                  </Form.Item>
                </div>
              ))}
              <Form.Item>
                <Button type="primary" onClick={() => add()} block>
                  Add agenda item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </CustomDrawerLayout>
  );
};
