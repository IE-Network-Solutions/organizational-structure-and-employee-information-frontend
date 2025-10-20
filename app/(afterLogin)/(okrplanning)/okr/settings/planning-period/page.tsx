'use client';
import { Input, Card, Switch, Dropdown, Modal, Form, Select } from 'antd';
import { MoreOutlined, CheckOutlined } from '@ant-design/icons';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useDeletePlanningPeriod,
  useUpdatePlanningPeriod,
  useUpdatePlanningStatus,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import AccessGuard from '@/utils/permissionGuard';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Permissions } from '@/types/commons/permissionEnum';
import dayjs from 'dayjs';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

const { Option } = Select;
const PlanningPeriod = () => {
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: updateStatus, isLoading } = useUpdatePlanningStatus();
  const { mutate: deletePlanningPeriod } = useDeletePlanningPeriod();
  const { mutate: editPlanningPeriod, isLoading: editPlannningPeriod } =
    useUpdatePlanningPeriod();

  const {
    isModalVisible,
    setIsModalVisible,
    planningPeriodName,
    setPlanningPeriodName,
    editingPeriod,
    setEditingPeriod,
    deleteModalVisible,
    setDeleteModalVisible,
    deleteItemId,
    setDeleteItemId,
  } = useOKRSettingStore();
  const [form] = Form.useForm();

  const handleEdit = (period: any) => {
    setEditingPeriod(period);

    setIsModalVisible(true);
    form.setFieldsValue({
      name: period.name,
      isActive: period.isActive,
      intervalLength: period.intervalLength, // Fixed syntax
      intervalType: period.intervalType,
      submissionDeadline: period.submissionDeadline
        ? dayjs(period.submissionDeadline) // Directly pass the date string
        : null,
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
        intervalLength: `${values.intervalLength}`,
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

  const filteredPlanningPeriod = allPlanningperiod?.items?.filter(
    (item) =>
      item?.name?.toLowerCase().includes(planningPeriodName.toLowerCase()) ||
      item?.actionOnFailure
        ?.toLowerCase()
        .includes(planningPeriodName.toLowerCase()) ||
      item?.intervalType
        ?.toLowerCase()
        .includes(planningPeriodName.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      deletePlanningPeriod(deleteItemId);
      setDeleteModalVisible(false);
      setDeleteItemId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDeleteItemId(null);
  };
  const renderMenu = (planningPeriod: any) => {
    const items = [];

    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.UpdatePlanningPeriod],
      })
    ) {
      items.push({
        key: 'edit',
        label: (
          <div className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded transition-colors duration-200">
            <FaEdit />
            <span>Edit</span>
          </div>
        ),
        onClick: () => handleEdit(planningPeriod),
      });
    }

    if (
      AccessGuard.checkAccess({
        permissions: [Permissions.DeletePlanningPeriod],
      })
    ) {
      items.push({
        key: 'delete',
        label: (
          <div className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded transition-colors duration-200">
            <FaTrashAlt />
            <span>Delete</span>
          </div>
        ),
        onClick: () => handleDelete(planningPeriod.id),
      });
    }

    return { items };
  };

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="mb-4">
        <Input
          placeholder="Search period by name"
          className="rounded-lg"
          onChange={(e) => setPlanningPeriodName(e.target.value)}
        />
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {filteredPlanningPeriod?.map((planningPeriod) => (
          <Card
            key={planningPeriod.id} // Add a unique key for each card
            title={planningPeriod?.name}
            extra={
              <div className="flex">
                <AccessGuard permissions={[Permissions.UpdatePlanningPeriod]}>
                  <Switch
                    checked={planningPeriod?.isActive}
                    disabled={isLoading}
                    onChange={() => updateStatus(planningPeriod.id)}
                    className="mr-3"
                    checkedChildren={<CheckOutlined />}
                  />
                </AccessGuard>
                <Dropdown menu={renderMenu(planningPeriod)} trigger={['click']}>
                  <MoreOutlined className="text-lg cursor-pointer" />
                </Dropdown>
              </div>
            }
            className="mb-4"
            bodyStyle={{ padding: '0.5rem 1rem' }}
          >
            <div className="grid grid-cols-1 gap-4 pb-5">
              <div className="flex justify-between px-2">
                <p className="text-gray-400 text-sm">Action on Failure</p>
                <p>{planningPeriod?.actionOnFailure}</p>
              </div>
              <div className="flex justify-between px-2">
                <p className="text-gray-400 text-sm">Interval</p>
                <p>{planningPeriod?.intervalType}</p>
              </div>
            </div>
          </Card>
        ))}
        {allPlanningperiod?.items?.length === 0 && (
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
              name="intervalLength"
              noStyle
              rules={[{ required: true, message: 'Please enter days' }]}
            >
              <Input disabled type="text" min={0} placeholder="Days" />
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
          <Form.Item
            label="Submission Deadline (Days)"
            name="submissionDeadline"
            noStyle
            rules={[
              { required: true, message: 'Please enter submission deadline' },
            ]}
          >
            <Input disabled type="text" min={0} placeholder="Days" />
          </Form.Item>
          <Form.Item name="actionOnFailure" label="Action on Failure">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <DeleteModal
        open={deleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        deleteMessage="Are you sure you want to delete this planning period?"
        loading={false}
      />
    </div>
  );
};

export default PlanningPeriod;
