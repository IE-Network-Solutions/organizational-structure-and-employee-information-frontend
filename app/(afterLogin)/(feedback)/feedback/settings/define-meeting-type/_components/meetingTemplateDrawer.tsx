import React from 'react';
import { Drawer, Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { MdClose } from 'react-icons/md';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  initialValues?: any;
}

export const MeetingTemplateDrawer: React.FC<DrawerProps> = ({ open, onClose, onFinish, initialValues }) => {
  const [form] = Form.useForm();

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
        onClick={()=>onClose()}
        style={{ marginRight: 8 }}
      >Cancel</Button>
      <Button
        htmlType="submit"
        title={initialValues ? 'Update' : 'Submit'}
        type="primary"
        onClick={() => form.submit()}
      >Submit</Button>
    </div>
  );

  return (
    
        <CustomDrawerLayout
      open={open}
      onClose={()=>onClose()}
      modalHeader={<div className='text-center'> {initialValues ? 'Update Meeting Template' : 'Add New Meeting Template'}</div>}
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
          rules={[{ required: true, message: 'Please enter the meeting objective' }]}
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
                <div
                 className='flex mb-1 gap-4 items-center'
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: 'Missing agenda item' }]}
                    className='w-full'
                    label={`Agenda Item ${key+1}`}
                  >
                    <Input placeholder="Agenda Item" />
                  </Form.Item>
                  <MdClose onClick={() => remove(name)} />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="primary"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
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