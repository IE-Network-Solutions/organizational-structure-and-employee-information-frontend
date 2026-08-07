'use client';

import { useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  ColorPicker,
  Dropdown,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomLabel from '@/components/form/customLabel/customLabel';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import {
  getActorName,
  useShiftSwapStore,
} from '@/store/uistate/features/timesheet/shiftSwap';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  ShiftTemplate,
  WEEK_DAYS,
  WEEK_DAY_LABEL,
} from '@/types/timesheet/shiftSwap';
import { formatShiftTime, formatWorkingDays } from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

const ShiftTemplatesPanel = () => {
  const [form] = Form.useForm();
  const { userData } = useAuthenticationStore();
  const {
    templates,
    filters,
    isTemplateModalOpen,
    editingTemplateId,
    deleteTemplateId,
    setIsTemplateModalOpen,
    setDeleteTemplateId,
    upsertTemplate,
    deleteTemplate,
  } = useShiftSwapStore();

  const editingTemplate = templates.find(
    (item) => item.id === editingTemplateId,
  );

  useEffect(() => {
    if (!isTemplateModalOpen) return;
    if (editingTemplate) {
      form.setFieldsValue({
        ...editingTemplate,
        startTime: dayjs(editingTemplate.startTime, 'HH:mm'),
        endTime: dayjs(editingTemplate.endTime, 'HH:mm'),
      });
      return;
    }
    form.resetFields();
  }, [isTemplateModalOpen, editingTemplate, form]);

  const visibleTemplates = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((item) =>
      `${item.name} ${item.description || ''}`.toLowerCase().includes(query),
    );
  }, [templates, filters.search]);

  const openCreate = () => {
    form.resetFields();
    setIsTemplateModalOpen(true, null);
  };

  const openEdit = (template: ShiftTemplate) => {
    form.setFieldsValue({
      ...template,
      startTime: dayjs(template.startTime, 'HH:mm'),
      endTime: dayjs(template.endTime, 'HH:mm'),
    });
    setIsTemplateModalOpen(true, template.id);
  };

  const handleFinish = (values: any) => {
    upsertTemplate(
      {
        id: editingTemplate?.id,
        name: values.name,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        breakDurationMinutes: values.breakDurationMinutes,
        gracePeriodMinutes: values.gracePeriodMinutes,
        workingDays: values.workingDays,
        overtimeEligible: Boolean(values.overtimeEligible),
        isNightShift: Boolean(values.isNightShift),
        color:
          typeof values.color === 'string'
            ? values.color
            : values.color?.toHexString?.() || '#3636F0',
        isActive: values.isActive !== false,
        description: values.description,
      },
      getActorName(userData),
    );
    NotificationMessage.success({
      message: editingTemplate
        ? 'Shift template updated'
        : 'Shift template created',
      description: 'Reusable shift settings are ready for scheduling.',
    });
    form.resetFields();
    setIsTemplateModalOpen(false);
  };

  const menuItems = (template: ShiftTemplate): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlinedIcon fontSize="small" />,
      onClick: () => openEdit(template),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlinedIcon fontSize="small" />,
      onClick: () => setDeleteTemplateId(template.id),
    },
  ];

  return (
    <div
      id="time-attendance-settings-shift-swap-templates"
      data-cy="time-attendance-settings-shift-swap-templates"
    >
      <SectionHeader
        title="Shift Templates"
        description="Create reusable start/end times, breaks, grace periods, and working days."
        extra={
          <AccessGuard permissions={[Permissions.CreateShiftTemplate]}>
            <Button
              type="primary"
              className="h-10"
              onClick={openCreate}
              id="time-attendance-settings-shift-swap-add-template"
              data-cy="time-attendance-settings-shift-swap-add-template"
            >
              Add Shift Template
            </Button>
          </AccessGuard>
        }
      />

      <Row gutter={[16, 16]}>
        {visibleTemplates.map((template) => (
          <Col xs={24} sm={12} xl={8} key={template.id}>
            <Card
              className="border-[#D9D9D9]"
              id={`time-attendance-settings-shift-swap-template-card-${template.id}`}
              data-cy={`time-attendance-settings-shift-swap-template-card-${template.id}`}
            >
              <Flex
                justify="space-between"
                align="start"
                gap={8}
                className="mb-3"
              >
                <Flex align="center" gap={8} className="min-w-0">
                  <Flex
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: template.color }}
                  />
                  <Typography.Title
                    level={5}
                    className="!text-base !font-semibold !text-gray-900 !m-0"
                    ellipsis
                  >
                    {template.name}
                  </Typography.Title>
                </Flex>
                <AccessGuard
                  permissions={[
                    Permissions.UpdateShiftTemplate,
                    Permissions.DeleteShiftTemplate,
                  ]}
                >
                  <Dropdown
                    trigger={['click']}
                    menu={{ items: menuItems(template) }}
                  >
                    <Button
                      type="text"
                      className="!w-8 !h-8 border border-[#D9D9D9] rounded-lg"
                    >
                      <MoreHorizIcon />
                    </Button>
                  </Dropdown>
                </AccessGuard>
              </Flex>
              <Typography.Text className="text-sm text-[#4d4d4d] mb-3 block">
                {formatShiftTime(template)}
              </Typography.Text>
              <Space wrap className="mb-3">
                <StatusBadge
                  theme={
                    template.isActive
                      ? StatusBadgeTheme.success
                      : StatusBadgeTheme.secondary
                  }
                >
                  {template.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
                {template.isNightShift && (
                  <StatusBadge theme={StatusBadgeTheme.secondary}>
                    Night
                  </StatusBadge>
                )}
                {template.overtimeEligible && (
                  <StatusBadge theme={StatusBadgeTheme.warning}>OT</StatusBadge>
                )}
              </Space>
              <Flex vertical gap={4}>
                <Typography.Text className="text-xs text-gray-500">
                  Break: {template.breakDurationMinutes} min
                </Typography.Text>
                <Typography.Text className="text-xs text-gray-500">
                  Grace: {template.gracePeriodMinutes} min
                </Typography.Text>
                <Typography.Text className="text-xs text-gray-500">
                  Days: {formatWorkingDays(template.workingDays)}
                </Typography.Text>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={isTemplateModalOpen}
        onCancel={() => {
          form.resetFields();
          setIsTemplateModalOpen(false);
        }}
        title={
          <Typography.Text className="text-lg font-semibold text-[#4d4d4d]">
            {editingTemplate ? 'Edit Shift Template' : 'New Shift Template'}
          </Typography.Text>
        }
        footer={
          <Flex justify="end" gap={8}>
            <Button
              className="border border-[#D9D9D9] text-[#4d4d4d]"
              onClick={() => {
                form.resetFields();
                setIsTemplateModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingTemplate ? 'Save' : 'Create'}
            </Button>
          </Flex>
        }
        centered
        width={720}
        zIndex={10002}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={CustomLabel}
          onFinish={handleFinish}
          initialValues={{
            breakDurationMinutes: 60,
            gracePeriodMinutes: 10,
            workingDays: [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
            ],
            overtimeEligible: true,
            isNightShift: false,
            isActive: true,
            color: '#3636F0',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <Typography.Text className="text-sm">
                    Shift name
                  </Typography.Text>
                }
                rules={[{ required: true, message: 'Enter a shift name' }]}
              >
                <Input className="h-[40px]" placeholder="Morning Shift" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="color"
                label={
                  <Typography.Text className="text-sm">Colour</Typography.Text>
                }
              >
                <ColorPicker className="h-[40px]" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label={
                  <Typography.Text className="text-sm">
                    Start time
                  </Typography.Text>
                }
                rules={[{ required: true, message: 'Select start time' }]}
              >
                <TimePicker className="w-full h-[40px]" format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label={
                  <Typography.Text className="text-sm">
                    End time
                  </Typography.Text>
                }
                rules={[{ required: true, message: 'Select end time' }]}
              >
                <TimePicker className="w-full h-[40px]" format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="breakDurationMinutes"
                label={
                  <Typography.Text className="text-sm">
                    Break duration (min)
                  </Typography.Text>
                }
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full h-[40px]" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gracePeriodMinutes"
                label={
                  <Typography.Text className="text-sm">
                    Grace period (min)
                  </Typography.Text>
                }
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full h-[40px]" min={0} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="workingDays"
                label={
                  <Typography.Text className="text-sm">
                    Working days
                  </Typography.Text>
                }
                rules={[{ required: true, message: 'Select working days' }]}
              >
                <Select
                  mode="multiple"
                  className="w-full"
                  options={WEEK_DAYS.map((day) => ({
                    value: day,
                    label: WEEK_DAY_LABEL[day],
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label={
                  <Typography.Text className="text-sm">
                    Description
                  </Typography.Text>
                }
              >
                <Input.TextArea rows={2} placeholder="Optional notes" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="overtimeEligible"
                label={
                  <Typography.Text className="text-sm">
                    Overtime eligible
                  </Typography.Text>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isNightShift"
                label={
                  <Typography.Text className="text-sm">
                    Night shift
                  </Typography.Text>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isActive"
                label={
                  <Typography.Text className="text-sm">Active</Typography.Text>
                }
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <DeleteModal
        open={Boolean(deleteTemplateId)}
        onCancel={() => setDeleteTemplateId(null)}
        onConfirm={() => {
          if (deleteTemplateId) {
            deleteTemplate(deleteTemplateId, getActorName(userData));
            NotificationMessage.success({
              message: 'Template deleted',
              description: 'Related assignments were also removed.',
            });
          }
        }}
        customMessage="Delete this shift template and its assignments?"
      />
    </div>
  );
};

export default ShiftTemplatesPanel;
