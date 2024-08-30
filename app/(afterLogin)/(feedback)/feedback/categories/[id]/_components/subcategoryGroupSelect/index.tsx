'use client';
import React from 'react';
import {
  Select,
  Checkbox,
  Avatar,
  Button,
  Divider,
  Modal,
  Form,
  Input,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;
interface EmployeeGroup {
  id: string;
  name: string;
  type: 'group' | 'individual';
  email?: string;
  avatar?: string;
}

const employeeGroups: EmployeeGroup[] = [
  { id: 'all', name: 'All', type: 'group' },
  { id: 'saas', name: 'Saas', type: 'group' },
  { id: 'legal', name: 'Legal', type: 'group' },
  { id: 'operation', name: 'Operation', type: 'group' },
  {
    id: 'pristia',
    name: 'Pristia Candra',
    type: 'individual',
    email: 'pristia@enetworks.co',
    avatar: '/path/to/avatar1.jpg',
  },
  {
    id: 'david',
    name: 'David',
    type: 'individual',
    email: 'david@enetworks.co',
    avatar: '/path/to/avatar2.jpg',
  },
];

interface SubcategoryGroupSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

const SubcategoryGroupSelect: React.FC<SubcategoryGroupSelectProps> = ({
  value = [],
  onChange,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const handleChange = (selectedIds: string[]) => {
    onChange?.(selectedIds);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const renderOption = (group: EmployeeGroup) => (
    <Option key={group.id} value={group.id}>
      <Checkbox checked={value.includes(group.id)}>
        {group.type === 'individual' ? (
          <div className="flex items-center">
            <Avatar
              src={group.avatar}
              icon={<UserOutlined />}
              size="small"
              className="mr-2"
            />
            <div>
              <div>{group.name}</div>
              <div className="text-xs text-gray-500">{group.email}</div>
            </div>
          </div>
        ) : (
          group.name
        )}
      </Checkbox>
    </Option>
  );

  return (
    <>
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder="Select Employee Group"
        onChange={handleChange}
        value={value}
        optionLabelProp="label"
        dropdownRender={(menu) => (
          <div>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ padding: '0 8px 4px' }}>
              <Button type="primary" onClick={showModal} block>
                Add
              </Button>
            </div>
          </div>
        )}
      >
        {employeeGroups.map(renderOption)}
      </Select>

      <Modal
        title="Add New Group"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Group Type"
            rules={[{ required: true, message: 'Please select group type' }]}
          >
            <Select>
              <Option value="group">Group</Option>
              <Option value="individual">Individual</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => (
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' },
                  {
                    required: getFieldValue('type') === 'individual',
                    message: 'Please enter an email for individual',
                  },
                ]}
              >
                <Input disabled={getFieldValue('type') !== 'individual'} />
              </Form.Item>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SubcategoryGroupSelect;
