'use client';
import { Input, Card, Switch, Dropdown, Menu, Modal, Form, Select } from 'antd';
import { MoreOutlined, CheckOutlined } from '@ant-design/icons';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useDeletePlanningPeriod,
  useUpdatePlanningPeriod,
  useUpdatePlanningStatus,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import dayjs from 'dayjs';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

const { Option } = Select;
const PlanningPeriod = () => {
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: updateStatus, isLoading } = useUpdatePlanningStatus();
  const { mutate: deletePlanningPeriod, isLoading: deletePlannniggPeriod } =
    useDeletePlanningPeriod();
  const { mutate: editPlanningPeriod, isLoading: editPlannningPeriod } =
    useUpdatePlanningPeriod();

  const {
    isModalVisible,
    setIsModalVisible,
    planningPeriodName,
    setPlanningPeriodName,
    editingPeriod,
    setEditingPeriod,
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
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this planning period ?',
      onOk() {
        deletePlanningPeriod(id);
      },
    });
  };
  const menu = (planningPeriod: any) => (
    <Menu
      id={`okr-planning-period-card-menu-${planningPeriod.id}`}
      data-cy={`okr-planning-period-card-menu-${planningPeriod.id}`}
    >
      <AccessGuard permissions={[Permissions.UpdatePlanningPeriod]}>
        <Menu.Item
          key="1"
          disabled={editPlannningPeriod}
          onClick={() => handleEdit(planningPeriod)}
          id={`okr-planning-period-card-menu-edit-${planningPeriod.id}`}
          data-cy={`okr-planning-period-card-menu-edit-${planningPeriod.id}`}
        >
          Edit
        </Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.DeletePlanningPeriod]}>
        <Menu.Item
          key="2"
          disabled={deletePlannniggPeriod}
          onClick={() => handleDelete(planningPeriod.id)}
          id={`okr-planning-period-card-menu-delete-${planningPeriod.id}`}
          data-cy={`okr-planning-period-card-menu-delete-${planningPeriod.id}`}
        >
          Delete
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="okr-planning-period-container-display-div"
      data-cy="okr-planning-period-container-display-div"
    >
      <div
        className="mb-4"
        id="okr-planning-period-search-wrapper-display-div"
        data-cy="okr-planning-period-search-wrapper-display-div"
      >
        <Input
          placeholder="Search period by name"
          className="rounded-lg"
          onChange={(e) => setPlanningPeriodName(e.target.value)}
          id="okr-planning-period-search-input-display-input"
          data-cy="okr-planning-period-search-input-display-input"
        />
      </div>
      <div
        className="max-h-[400px] overflow-y-auto"
        id="okr-planning-period-list-container-display-div"
        data-cy="okr-planning-period-list-container-display-div"
      >
        {filteredPlanningPeriod?.map((planningPeriod) => (
          <Card
            key={planningPeriod.id}
            title={planningPeriod?.name}
            extra={
              <div
                className="flex"
                id={`okr-planning-period-card-actions-${planningPeriod.id}`}
                data-cy={`okr-planning-period-card-actions-${planningPeriod.id}`}
              >
                <AccessGuard data-cy="okr-planning-period-card-switch-access-guard-display-guard" permissions={[Permissions.UpdatePlanningPeriod]}>
                  <Switch
                    checked={planningPeriod?.isActive}
                    disabled={isLoading}
                    onChange={() => updateStatus(planningPeriod.id)}
                    className="mr-3"
                    checkedChildren={<CheckOutlined />}
                    id={`okr-planning-period-card-switch-${planningPeriod.id}`}
                    data-cy={`okr-planning-period-card-switch-${planningPeriod.id}`}
                  />
                </AccessGuard>
                <Dropdown
                  overlay={menu(planningPeriod)}
                  trigger={['click']}
                
                  data-cy={`okr-planning-period-card-dropdown-${planningPeriod.id}`}
                >
                  <MoreOutlined
                    className="cursor-pointer "
                    style={{ fontSize: '22px', color: '#000000' }}
                    id={`okr-planning-period-card-more-icon-${planningPeriod.id}`}
                    data-cy={`okr-planning-period-card-more-icon-${planningPeriod.id}`}
                  />
                </Dropdown>
              </div>
            }
            className="mb-4"
            bodyStyle={{ padding: '0.5rem 1rem' }}
            id={`okr-planning-period-card-${planningPeriod.id}`}
            data-cy={`okr-planning-period-card-${planningPeriod.id}`}
          >
            <div
              className="grid grid-cols-1 gap-4 pb-5"
              id={`okr-planning-period-card-content-${planningPeriod.id}`}
              data-cy={`okr-planning-period-card-content-${planningPeriod.id}`}
            >
              <div
                className="flex justify-between px-2"
                id={`okr-planning-period-card-action-failure-${planningPeriod.id}`}
                data-cy={`okr-planning-period-card-action-failure-${planningPeriod.id}`}
              >
                <p
                  className="text-gray-400 text-sm"
                  id={`okr-planning-period-card-action-failure-label-${planningPeriod.id}`}
                  data-cy={`okr-planning-period-card-action-failure-label-${planningPeriod.id}`}
                >
                  Action on Failure
                </p>
                <p
                  id={`okr-planning-period-card-action-failure-value-${planningPeriod.id}`}
                  data-cy={`okr-planning-period-card-action-failure-value-${planningPeriod.id}`}
                >
                  {planningPeriod?.actionOnFailure}
                </p>
              </div>
              <div
                className="flex justify-between px-2"
                id={`okr-planning-period-card-interval-${planningPeriod.id}`}
                data-cy={`okr-planning-period-card-interval-${planningPeriod.id}`}
              >
                <p
                  className="text-gray-400 text-sm"
                  id={`okr-planning-period-card-interval-label-${planningPeriod.id}`}
                  data-cy={`okr-planning-period-card-interval-label-${planningPeriod.id}`}
                >
                  Interval
                </p>
                <p
                  id={`okr-planning-period-card-interval-value-${planningPeriod.id}`}
                  data-cy={`okr-planning-period-card-interval-value-${planningPeriod.id}`}
                >
                  {planningPeriod?.intervalType}
                </p>
              </div>
            </div>
          </Card>
        ))}
        {allPlanningperiod?.items?.length === 0 && (
          <div
            className="flex justify-center items-center"
            id="okr-planning-period-empty-state-display-div"
            data-cy="okr-planning-period-empty-state-display-div"
          >
            <span
              id="okr-planning-period-empty-state-text-display-span"
              data-cy="okr-planning-period-empty-state-text-display-span"
            >
              No Data Available
            </span>
          </div>
        )}
      </div>
      <Modal
        title="Edit Planning Period"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={editPlannningPeriod}
     
        data-cy="okr-planning-period-edit-modal-display-modal"
      >
        <Form
          form={form}
          layout="vertical"
          id="okr-planning-period-edit-form-display-form"
          data-cy="okr-planning-period-edit-form-display-form"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
            id="okr-planning-period-edit-form-name-item-display-item"
            data-cy="okr-planning-period-edit-form-name-item-display-item"
          >
            <Input
              id="okr-planning-period-edit-form-name-input-display-input"
              data-cy="okr-planning-period-edit-form-name-input-display-input"
            />
          </Form.Item>

          <Form.Item
            label="Interval Length (Days)"
            id="okr-planning-period-edit-form-interval-length-wrapper-display-item"
            data-cy="okr-planning-period-edit-form-interval-length-wrapper-display-item"
          >
            <Form.Item
              name="intervalLength"
              noStyle
              rules={[{ required: true, message: 'Please enter days' }]}
              id="okr-planning-period-edit-form-interval-length-item-display-item"
              data-cy="okr-planning-period-edit-form-interval-length-item-display-item"
            >
              <Input
                disabled
                type="text"
                min={0}
                placeholder="Days"
                id="okr-planning-period-edit-form-interval-length-input-display-input"
                data-cy="okr-planning-period-edit-form-interval-length-input-display-input"
              />
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="intervalType"
            label="Interval Type"
            rules={[
              { required: true, message: 'Please select an interval type' },
            ]}
            id="okr-planning-period-edit-form-interval-type-item-display-item"
            data-cy="okr-planning-period-edit-form-interval-type-item-display-item"
          >
            <Select
              id="okr-planning-period-edit-form-interval-type-select-display-select"
              data-cy="okr-planning-period-edit-form-interval-type-select-display-select"
            >
              <Option
                value="daily"
                id="okr-planning-period-edit-form-interval-type-option-daily-display-option"
                data-cy="okr-planning-period-edit-form-interval-type-option-daily-display-option"
              >
                Daily
              </Option>
              <Option
                value="weekly"
                id="okr-planning-period-edit-form-interval-type-option-weekly-display-option"
                data-cy="okr-planning-period-edit-form-interval-type-option-weekly-display-option"
              >
                Weekly
              </Option>
              <Option
                value="monthly"
                id="okr-planning-period-edit-form-interval-type-option-monthly-display-option"
                data-cy="okr-planning-period-edit-form-interval-type-option-monthly-display-option"
              >
                Monthly
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Submission Deadline (Days)"
            name="submissionDeadline"
            noStyle
            rules={[
              { required: true, message: 'Please enter submission deadline' },
            ]}
            id="okr-planning-period-edit-form-deadline-wrapper-display-item"
            data-cy="okr-planning-period-edit-form-deadline-wrapper-display-item"
          >
            <Input
              disabled
              type="text"
              min={0}
              placeholder="Days"
              id="okr-planning-period-edit-form-deadline-input-display-input"
              data-cy="okr-planning-period-edit-form-deadline-input-display-input"
            />
          </Form.Item>
          <Form.Item
            name="actionOnFailure"
            label="Action on Failure"
            id="okr-planning-period-edit-form-action-failure-item-display-item"
            data-cy="okr-planning-period-edit-form-action-failure-item-display-item"
          >
            <Input
              id="okr-planning-period-edit-form-action-failure-input-display-input"
              data-cy="okr-planning-period-edit-form-action-failure-input-display-input"
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Is Active"
            valuePropName="checked"
            id="okr-planning-period-edit-form-is-active-item-display-item"
            data-cy="okr-planning-period-edit-form-is-active-item-display-item"
          >
            <Switch
              id="okr-planning-period-edit-form-is-active-switch-display-switch"
              data-cy="okr-planning-period-edit-form-is-active-switch-display-switch"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanningPeriod;
