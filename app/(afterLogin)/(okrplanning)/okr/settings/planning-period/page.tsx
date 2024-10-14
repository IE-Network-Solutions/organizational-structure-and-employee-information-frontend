'use client';
import { Input, Card, Switch, Dropdown, Menu, Modal, Form, Select } from 'antd';
import { MoreOutlined, CheckOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useDeletePlanningPeriod,
  useUpdatePlanningPeriod,
  useUpdatePlanningStatus,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Option } = Select;
const PlanningPeriod: FC = () => {
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: updateStatus, isLoading } = useUpdatePlanningStatus();
  const { mutate: deletePlanningPeriod, isLoading: deletePlannniggPeriod } =
    useDeletePlanningPeriod();
  const { mutate: editPlanningPeriod, isLoading: editPlannningPeriod } =
    useUpdatePlanningPeriod();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [form] = Form.useForm();

  const handleEdit = (period: any) => {
    setEditingPeriod(period);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: period.name,
      isActive: period.isActive,
      intervalLength: {
        days: period.intervalLength?.days || 0,
        seconds: period.intervalLength?.seconds || 0,
      },
      intervalType: period.intervalType,
      submissionDeadline: {
        days: period.submissionDeadline?.days || 0,
      },
      actionOnFailure: period.actionOnFailure,
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        intervalLength: `${values.intervalLength?.days || 0} days`,
        submissionDeadline: `${values.submissionDeadline?.days || 0} days `,
      };
      await editPlanningPeriod({ id: editingPeriod.id, data: formattedValues });
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      if (error) {
        NotificationMessage.error({
          message: 'Editing failed',
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this planning period?',
      onOk() {
        deletePlanningPeriod(id);
      },
    });
  };
console.log(allPlanningperiod,"allPlanningperiod")
  const menu = (planningPeriod: any) => (
    <Menu>
      <Menu.Item
        key="1"
        disabled={editPlannningPeriod}
        onClick={() => handleEdit(planningPeriod)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="2"
        disabled={deletePlannniggPeriod}
        onClick={() => handleDelete(planningPeriod.id)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <Input.Search
          placeholder="Search period by name"
          className="rounded-lg"
        />
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {allPlanningperiod?.items?.map((planningPeriod) => (
          <Card
            key={planningPeriod.id} // Add a unique key for each card
            title={planningPeriod?.name}
            extra={
              <div className="flex">
                <Switch
                  checked={planningPeriod?.isActive}
                  disabled={isLoading}
                  onChange={() => updateStatus(planningPeriod.id)}
                  className="mr-4"
                  checkedChildren={<CheckOutlined />}
                />
                <Dropdown overlay={menu(planningPeriod)} trigger={['click']}>
                  <MoreOutlined className="cursor-pointer" />
                </Dropdown>
              </div>
            }
            className="mb-4"
            bodyStyle={{ padding: '0.5rem 1rem' }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Action on Failure</p>
                <p>{planningPeriod?.actionOnFailure}</p>
              </div>
              <div>
                <p className="text-gray-500">Interval</p>
                <p>{planningPeriod?.intervalType}</p>
              </div>
            </div>
          </Card>
        ))}
        {allPlanningperiod?.items.length === 0 && (
          <div className="flex justify-center items-center">
            No Data Available
          </div>
        )}
      </div>
      <Modal
        title="Edit Planning Period"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={editPlannningPeriod}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Interval Length (Days)">
            <Form.Item
              name={['intervalLength', 'days']}
              noStyle
              rules={[{ required: true, message: 'Please enter days' }]}
            >
              <Input type="number" min={0} placeholder="Days" />
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="intervalType"
            label="Interval Type"
            rules={[
              { required: true, message: 'Please select an interval type' },
            ]}
          >
            <Select>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Submission Deadline (Days)">
            <Form.Item
              name={['submissionDeadline', 'days']}
              noStyle
              rules={[
                { required: true, message: 'Please enter submission deadline' },
              ]}
            >
              <Input type="number" min={0} placeholder="Days" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="actionOnFailure" label="Action on Failure">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanningPeriod;
