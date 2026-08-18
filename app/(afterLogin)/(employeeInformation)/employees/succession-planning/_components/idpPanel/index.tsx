'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
} from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type {
  IdpActivity,
  IdpActivityStatus,
  IdpActivityType,
  IdpPlanStatus,
  IndividualDevelopmentPlan,
} from '../successionTypes';
import { idpActivityStatusColor } from '../tagColors';
import IdpActivityTypeSelect from '../idpActivityTypeSelect';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface IdpPanelProps {
  idp?: IndividualDevelopmentPlan;
  /** Awaited so the Save buttons can hold their loading state. */
  onUpsertPlan: (plan: { status: IdpPlanStatus }) => void | Promise<void>;
  onAddActivity: (activity: Omit<IdpActivity, 'id'>) => void | Promise<void>;
  onUpdateActivity: (
    activityId: string,
    patch: Partial<IdpActivity>,
  ) => void | Promise<void>;
  /** Hide plan/activity buttons when parent renders them in the tab bar. */
  hideToolbarButtons?: boolean;
  /** Increment to open the plan status modal from outside. */
  openPlanKey?: number;
  /** Increment to open the add-activity modal from outside. */
  openActivityKey?: number;
}

const IdpPanel: React.FC<IdpPanelProps> = ({
  idp,
  onUpsertPlan,
  onAddActivity,
  onUpdateActivity,
  hideToolbarButtons = false,
  openPlanKey = 0,
  openActivityKey = 0,
}) => {
  const [planOpen, setPlanOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IdpActivity | null>(
    null,
  );
  const [planForm] = Form.useForm();
  const [activityForm] = Form.useForm();
  const canManageSuccessorDevelopment = AccessGuard.checkAccess({
    permissions: [Permissions.ManageSuccessorDevelopment],
  });

  const openPlan = () => {
    if (!canManageSuccessorDevelopment) return;

    planForm.setFieldsValue({
      status: idp?.status ?? 'Draft',
    });
    setPlanOpen(true);
  };

  const openActivity = (activity?: IdpActivity) => {
    if (!canManageSuccessorDevelopment) return;

    setEditingActivity(activity ?? null);
    activityForm.setFieldsValue(
      activity
        ? {
            ...activity,
            targetDate: activity.targetDate
              ? dayjs(activity.targetDate)
              : undefined,
          }
        : { type: 'Leadership Training', status: 'Not Started' },
    );
    setActivityOpen(true);
  };

  useEffect(() => {
    if (!canManageSuccessorDevelopment || openPlanKey <= 0) return;

    planForm.setFieldsValue({ status: idp?.status ?? 'Draft' });
    setPlanOpen(true);
  }, [openPlanKey, canManageSuccessorDevelopment, idp?.status, planForm]);

  useEffect(() => {
    if (!canManageSuccessorDevelopment || openActivityKey <= 0) return;

    setEditingActivity(null);
    activityForm.setFieldsValue({
      type: 'Leadership Training',
      status: 'Not Started',
    });
    setActivityOpen(true);
  }, [openActivityKey, canManageSuccessorDevelopment, activityForm]);

  const columns: TableColumnsType<IdpActivity> = [
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Type</span>,
      dataIndex: 'type',
      width: 180,
      render: (value: string) => (
        <span className="text-sm text-[#4d4d4d]">{value}</span>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Activity</span>,
      dataIndex: 'title',
      ellipsis: true,
      render: (value: string, record) =>
        canManageSuccessorDevelopment ? (
          <button
            type="button"
            className="text-left text-sm font-medium text-primary hover:underline"
            onClick={() => openActivity(record)}
          >
            {value}
          </button>
        ) : (
          <span
            className="text-sm font-medium text-[#4d4d4d]"
            data-cy={`idp-activity-readonly-${record.id}`}
          >
            {value}
          </span>
        ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Target</span>,
      dataIndex: 'targetDate',
      width: 110,
      render: (value?: string) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {value || '—'}
        </span>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Status</span>,
      dataIndex: 'status',
      width: 120,
      render: (value: IdpActivityStatus) => (
        <Tag color={idpActivityStatusColor[value]} className="m-0">
          {value}
        </Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3" data-cy="idp-panel">
      {idp ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Plan status</span>
          <Tag className="m-0" data-cy="idp-plan-status-tag">
            {idp.status}
          </Tag>
        </div>
      ) : null}

      {!hideToolbarButtons && canManageSuccessorDevelopment ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={openPlan}
            className="h-8 font-normal"
            data-cy="edit-idp-plan-btn"
          >
            {idp ? 'Edit status' : 'Create IDP'}
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={() => openActivity()}
            className="h-8 font-normal"
            data-cy="add-idp-activity-btn"
          >
            Add activity
          </Button>
        </div>
      ) : null}

      <Table
        columns={columns}
        dataSource={idp?.activities ?? []}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                canManageSuccessorDevelopment
                  ? 'No IDP activities yet. Add an activity to get started.'
                  : 'No IDP activities have been defined.'
              }
            />
          ),
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="idp-activities-table"
      />

      <Modal
        open={planOpen && canManageSuccessorDevelopment}
        title={idp ? 'Edit IDP status' : 'Create IDP'}
        onCancel={() => setPlanOpen(false)}
        onOk={async () => {
          if (!canManageSuccessorDevelopment) return;

          const values = await planForm.validateFields();
          setSavingPlan(true);
          try {
            await onUpsertPlan({ status: values.status as IdpPlanStatus });
            setPlanOpen(false);
          } finally {
            setSavingPlan(false);
          }
        }}
        okText="Save"
        confirmLoading={savingPlan}
        cancelButtonProps={{ disabled: savingPlan }}
        maskClosable={!savingPlan}
        destroyOnClose
        data-cy="idp-plan-modal"
      >
        <Form form={planForm} layout="vertical" className="mt-2">
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Active', label: 'Active' },
                { value: 'Completed', label: 'Completed' },
              ]}
              data-cy="idp-status"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={activityOpen && canManageSuccessorDevelopment}
        title={editingActivity ? 'Edit activity' : 'Add activity'}
        onCancel={() => setActivityOpen(false)}
        onOk={async () => {
          if (!canManageSuccessorDevelopment) return;

          const values = await activityForm.validateFields();
          const payload = {
            type: values.type as IdpActivityType,
            title: values.title as string,
            notes: values.notes as string | undefined,
            targetDate: values.targetDate
              ? values.targetDate.format('YYYY-MM-DD')
              : undefined,
            status: values.status as IdpActivityStatus,
          };
          setSavingActivity(true);
          try {
            if (editingActivity) {
              await onUpdateActivity(editingActivity.id, payload);
            } else {
              await onAddActivity(payload);
            }
            setActivityOpen(false);
          } finally {
            setSavingActivity(false);
          }
        }}
        okText="Save"
        confirmLoading={savingActivity}
        cancelButtonProps={{ disabled: savingActivity }}
        maskClosable={!savingActivity}
        destroyOnClose
        data-cy="idp-activity-modal"
      >
        <Form form={activityForm} layout="vertical" className="mt-2">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Required' }]}
          >
            <IdpActivityTypeSelect data-cy="idp-activity-type" />
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input data-cy="idp-activity-title" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} data-cy="idp-activity-notes" />
          </Form.Item>
          <Form.Item name="targetDate" label="Target Date">
            <DatePicker className="w-full" data-cy="idp-activity-date" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Not Started', label: 'Not Started' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
              ]}
              data-cy="idp-activity-status"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IdpPanel;
