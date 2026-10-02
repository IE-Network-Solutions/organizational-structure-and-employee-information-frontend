'use client';

import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  AssigneeType,
  ObjectiveTypeAssignment,
  useObjectiveTypeAssignmentStore,
} from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypeAssignmentStore';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import {
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Tooltip,
} from 'antd';
import React, { useEffect, useMemo } from 'react';

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  assignment?: ObjectiveTypeAssignment | null;
}

interface ItemRow {
  objectiveTypeId?: string;
  weight?: number | null;
}

const FieldLabel = ({
  label,
  tooltip,
  dataCy,
}: {
  label: string;
  tooltip: string;
  dataCy: string;
}) => (
  <div className="flex items-center gap-1" data-cy={`${dataCy}-label`}>
    <span
      className="text-[14px] font-medium text-[#262626]"
      data-cy={`${dataCy}-label-text`}
    >
      {label}
    </span>
    <Tooltip title={tooltip}>
      <QuestionCircleOutlined
        className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
        data-cy={`${dataCy}-tooltip`}
      />
    </Tooltip>
  </div>
);

const ObjectiveTypeAssignmentModal: React.FC<Props> = ({
  open,
  onClose,
  assignment,
}) => {
  const { addAssignments, updateAssignment, setSelectedAssignment } =
    useObjectiveTypeAssignmentStore();
  const objectiveTypes = useObjectiveTypesStore((s) => s.types);
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: positionsData } = useGetAllPositions();
  const { data: usersData } = useGetAllUsers();
  const [form] = Form.useForm();
  const isEdit = Boolean(assignment);

  const watchedAssigneeType = Form.useWatch('assigneeType', form) as
    | AssigneeType
    | undefined;
  const watchedItems = Form.useWatch('items', form) as ItemRow[] | undefined;

  const positions = useMemo(() => {
    const raw = positionsData?.items ?? positionsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [positionsData]);

  const users = useMemo(() => {
    const raw = usersData?.items ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const draftTotal = (watchedItems || []).reduce(
    (sum, row) => sum + Number(row?.weight || 0),
    0,
  );

  const handleModalClose = () => {
    form.resetFields();
    onClose();
    setSelectedAssignment(null);
  };

  const resolveAssigneeLabel = (
    assigneeType: AssigneeType,
    assigneeId: string,
  ) => {
    if (assigneeType === 'role') {
      const role = positions.find((p: any) => p.id === assigneeId);
      return role?.name || assigneeId;
    }
    if (assigneeType === 'department') {
      const dept = (departmentData || []).find((d: any) => d.id === assigneeId);
      return dept?.name || assigneeId;
    }
    const user = users.find((u: any) => u.id === assigneeId);
    if (!user) return assigneeId;
    return `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
      .replace(/\s+/g, ' ')
      .trim();
  };

  const onFinish = (values: {
    assigneeType: AssigneeType;
    assigneeIds: string | string[];
    items: ItemRow[];
  }) => {
    const items = (values.items || [])
      .map((row) => ({
        objectiveTypeId: String(row?.objectiveTypeId || ''),
        weight: Number(row?.weight || 0),
      }))
      .filter((row) => row.objectiveTypeId || row.weight);

    const assigneeIds = (
      Array.isArray(values.assigneeIds)
        ? values.assigneeIds
        : values.assigneeIds
          ? [values.assigneeIds]
          : []
    ).filter(Boolean);

    if (!assigneeIds.length) {
      NotificationMessage.warning({
        message: 'Please select at least one assignee',
      });
      return;
    }

    if (isEdit && assignment) {
      const assigneeId = assigneeIds[0];
      const result = updateAssignment(assignment.id, {
        assigneeType: values.assigneeType,
        assigneeId,
        assigneeLabel: resolveAssigneeLabel(values.assigneeType, assigneeId),
        items,
      });
      if (!result.ok) {
        NotificationMessage.warning({
          message: result.message || 'Unable to update assignment',
        });
        return;
      }
      NotificationMessage.success({ message: 'Assignment updated' });
      handleModalClose();
      return;
    }

    const result = addAssignments(
      assigneeIds.map((assigneeId) => ({
        assigneeType: values.assigneeType,
        assigneeId,
        assigneeLabel: resolveAssigneeLabel(values.assigneeType, assigneeId),
        items,
      })),
    );

    if (!result.ok) {
      NotificationMessage.warning({
        message: result.message || 'Unable to save assignment',
      });
      return;
    }

    NotificationMessage.success({
      message:
        result.message ||
        (result.created && result.created > 1
          ? `${result.created} assignments saved`
          : 'Assignment saved'),
    });
    handleModalClose();
  };

  useEffect(() => {
    if (!open) return;
    if (assignment) {
      form.setFieldsValue({
        assigneeType: assignment.assigneeType,
        assigneeIds: isEdit ? assignment.assigneeId : [assignment.assigneeId],
        items: assignment.items.map((i) => ({
          objectiveTypeId: i.objectiveTypeId,
          weight: i.weight,
        })),
      });
    } else {
      form.setFieldsValue({
        assigneeType: undefined,
        assigneeIds: [],
        items: [{ objectiveTypeId: undefined, weight: null }],
      });
    }
  }, [assignment, form, open, isEdit]);

  const footer = (
    <div
      className="flex justify-end gap-3"
      data-cy="okr-objective-type-assignment-modal-footer"
    >
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-objective-type-assignment-modal-cancel"
        data-cy="okr-objective-type-assignment-modal-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-objective-type-assignment-modal-submit"
        data-cy="okr-objective-type-assignment-modal-submit"
      >
        {isEdit ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  const assigneePlaceholder =
    watchedAssigneeType === 'role'
      ? 'Select roles'
      : watchedAssigneeType === 'department'
        ? 'Select departments'
        : watchedAssigneeType === 'individual'
          ? 'Select employees'
          : 'Select assignee type first';

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          data-cy="okr-objective-type-assignment-modal-title"
        >
          {isEdit ? 'Edit Type Assignment' : 'Add Type Assignment'}
        </span>
      }
      footer={footer}
      width={800}
      centered
      destroyOnClose
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-objective-type-assignment-modal-close-icon"
        />
      }
      data-cy="okr-objective-type-assignment-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        id="okr-objective-type-assignment-modal-form"
        data-cy="okr-objective-type-assignment-modal-form"
      >
        <Row gutter={24} data-cy="okr-objective-type-assignment-assignee-row">
          <Col span={12}>
            <Form.Item
              label={
                <FieldLabel
                  label="Assignee Type"
                  tooltip="Choose whether this assignment applies to roles, departments, or individuals."
                  dataCy="okr-objective-type-assignment-assignee-type"
                />
              }
              name="assigneeType"
              rules={[
                { required: true, message: 'Please select assignee type' },
              ]}
              data-cy="okr-objective-type-assignment-assignee-type-field"
            >
              <Select
                placeholder="Select Assignee Type"
                className="w-full h-11 custom-modal-select"
                popupClassName="custom-assignee-dropdown"
                onChange={() => form.setFieldsValue({ assigneeIds: [] })}
                data-cy="okr-objective-type-assignment-assignee-type-select"
              >
                <Option value="role">Role</Option>
                <Option value="department">Department</Option>
                <Option value="individual">Individual</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <FieldLabel
                  label="Assignees"
                  tooltip="Select one or more roles, departments, or employees. Each gets the same type weights."
                  dataCy="okr-objective-type-assignment-assignee"
                />
              }
              name="assigneeIds"
              rules={[
                isEdit
                  ? {
                      required: true,
                      message: 'Please select an assignee',
                    }
                  : {
                      required: true,
                      type: 'array',
                      min: 1,
                      message: 'Please select at least one assignee',
                    },
              ]}
              data-cy="okr-objective-type-assignment-assignee-field"
            >
              <Select
                mode={isEdit ? undefined : 'multiple'}
                allowClear
                showSearch
                optionFilterProp="label"
                maxTagCount="responsive"
                placeholder={
                  isEdit
                    ? watchedAssigneeType === 'role'
                      ? 'Select role'
                      : watchedAssigneeType === 'department'
                        ? 'Select department'
                        : watchedAssigneeType === 'individual'
                          ? 'Select employee'
                          : 'Select assignee type first'
                    : assigneePlaceholder
                }
                disabled={!watchedAssigneeType}
                className={`w-full custom-modal-select ${isEdit ? 'h-11' : 'custom-modal-select-multiple'}`}
                popupClassName="custom-assignee-dropdown"
                data-cy="okr-objective-type-assignment-assignee-select"
              >
                {watchedAssigneeType === 'role' &&
                  positions.map((p: any) => (
                    <Option key={p.id} value={p.id} label={p.name}>
                      {p.name}
                    </Option>
                  ))}
                {watchedAssigneeType === 'department' &&
                  (departmentData || []).map((d: any) => (
                    <Option key={d.id} value={d.id} label={d.name}>
                      {d.name}
                    </Option>
                  ))}
                {watchedAssigneeType === 'individual' &&
                  users.map((u: any) => {
                    const name =
                      `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`
                        .replace(/\s+/g, ' ')
                        .trim() || u.email;
                    return (
                      <Option key={u.id} value={u.id} label={name}>
                        {name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <div
              className="flex flex-col gap-3"
              data-cy="okr-objective-type-assignment-items"
            >
              {fields.map(({ key, name, ...restField }, index) => (
                <Row
                  key={key}
                  gutter={16}
                  align="top"
                  data-cy={`okr-objective-type-assignment-item-${index}`}
                >
                  <Col flex="auto">
                    <Form.Item
                      {...restField}
                      name={[name, 'objectiveTypeId']}
                      label={
                        index === 0 ? (
                          <FieldLabel
                            label="Objective Type"
                            tooltip="Pick a type from the catalog. Duplicate types are not allowed."
                            dataCy={`okr-objective-type-assignment-item-type-${index}`}
                          />
                        ) : undefined
                      }
                      className="mb-0"
                      rules={[
                        {
                          required: true,
                          message: 'Please select objective type',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Objective Type"
                        className="w-full h-11 custom-modal-select"
                        popupClassName="custom-assignee-dropdown"
                        optionFilterProp="label"
                        showSearch
                        data-cy={`okr-objective-type-assignment-item-type-select-${index}`}
                      >
                        {objectiveTypes.map((t) => {
                          const label = t.isStrategic
                            ? `${t.name} (Strategic)`
                            : t.name;
                          return (
                            <Option key={t.id} value={t.id} label={label}>
                              {label}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col flex="140px">
                    <Form.Item
                      {...restField}
                      name={[name, 'weight']}
                      label={
                        index === 0 ? (
                          <FieldLabel
                            label="Weight (%)"
                            tooltip="Share of this assignee’s type budget. All rows must total 100%."
                            dataCy={`okr-objective-type-assignment-item-weight-${index}`}
                          />
                        ) : undefined
                      }
                      className="mb-0"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 1, message: 'Min 1' },
                      ]}
                    >
                      <InputNumber
                        className="w-full h-11"
                        min={1}
                        max={100}
                        placeholder="Input"
                        data-cy={`okr-objective-type-assignment-item-weight-input-${index}`}
                      />
                    </Form.Item>
                  </Col>
                  {fields.length > 1 && (
                    <Col flex="40px" className={index === 0 ? 'mt-8' : 'mt-1'}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="h-11 w-10 flex items-center justify-center"
                        data-cy={`okr-objective-type-assignment-item-remove-${index}`}
                      />
                    </Col>
                  )}
                </Row>
              ))}

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() =>
                  add({ objectiveTypeId: undefined, weight: null })
                }
                disabled={
                  draftTotal >= 100 ||
                  fields.length >= Math.max(objectiveTypes.length, 1)
                }
                className="w-full h-11 rounded-lg"
                data-cy="okr-objective-type-assignment-add-item"
              >
                Add type
              </Button>
            </div>
          )}
        </Form.List>

        <div
          className="mt-4 flex items-center justify-end"
          data-cy="okr-objective-type-assignment-weight-total"
        >
          <span
            className="whitespace-nowrap text-[12px] tabular-nums text-[#475569] md:text-sm"
            data-cy="okr-objective-type-assignment-weight-total-label"
          >
            <span
              className={`text-[18px] font-extrabold md:text-[20px] ${
                draftTotal === 100
                  ? 'text-[#059669]'
                  : draftTotal > 100
                    ? 'text-[#DC2626]'
                    : 'text-[#D97706]'
              }`}
              data-cy="okr-objective-type-assignment-weight-value"
            >
              {draftTotal}
            </span>
            <span
              className="text-[13px] font-medium text-[#94A3B8] md:text-[14px]"
              data-cy="okr-objective-type-assignment-weight-denominator"
            >
              {' '}
              / 100
            </span>
          </span>
        </div>

        <style
          jsx
          global
          data-cy="okr-objective-type-assignment-modal-styles"
        >{`
          .okr-settings-modal .custom-modal-select .ant-select-selector {
            display: flex !important;
            align-items: center !important;
            min-height: 44px !important;
          }
          .okr-settings-modal
            .custom-modal-select:not(.custom-modal-select-multiple)
            .ant-select-selector {
            height: 44px !important;
          }
          .okr-settings-modal
            .custom-assignee-dropdown
            .ant-select-item-option-selected {
            background-color: #e6f7ff !important;
          }
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
            border-radius: 8px !important;
          }
          .okr-settings-modal .ant-modal-title {
            margin-bottom: 24px !important;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 16px 24px !important;
            border-bottom: none !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 8px 24px 24px 24px !important;
            border-top: none !important;
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
          .okr-settings-modal .ant-input-number {
            width: 100% !important;
            height: 44px !important;
          }
          .okr-settings-modal .ant-input-number-input {
            height: 42px !important;
          }
        `}</style>
      </Form>
    </Modal>
  );
};

export default ObjectiveTypeAssignmentModal;
