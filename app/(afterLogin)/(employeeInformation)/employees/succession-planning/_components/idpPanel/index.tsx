'use client';
import React, { useState } from 'react';
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

interface IdpPanelProps {
  idp?: IndividualDevelopmentPlan;
  onUpsertPlan: (plan: {
    objectives: string;
    status: IdpPlanStatus;
  }) => void;
  onAddActivity: (activity: Omit<IdpActivity, 'id'>) => void;
  onUpdateActivity: (activityId: string, patch: Partial<IdpActivity>) => void;
}

const ACTIVITY_TYPES: IdpActivityType[] = [
  'Leadership Training',
  'Technical Training',
  'Certification',
  'Delegation / Acting Assignment',
  'Other',
];

const IdpPanel: React.FC<IdpPanelProps> = ({
  idp,
  onUpsertPlan,
  onAddActivity,
  onUpdateActivity,
}) => {
  const [planOpen, setPlanOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<IdpActivity | null>(
    null,
  );
  const [planForm] = Form.useForm();
  const [activityForm] = Form.useForm();

  const openPlan = () => {
    planForm.setFieldsValue({
      objectives: idp?.objectives ?? '',
      status: idp?.status ?? 'Draft',
    });
    setPlanOpen(true);
  };

  const openActivity = (activity?: IdpActivity) => {
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
      render: (value: string, record) => (
        <button
          type="button"
          className="text-left text-sm font-medium text-primary hover:underline"
          onClick={() => openActivity(record)}
        >
          {value}
        </button>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Target</span>,
      dataIndex: 'targetDate',
      width: 110,
      render: (value?: string) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">{value || '—'}</span>
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
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-400 mb-1">Objectives</div>
            <p className="text-sm text-gray-800 mb-2">
              {idp?.objectives || 'No IDP created yet for this successor.'}
            </p>
            {idp ? (
              <Tag className="m-0">{idp.status}</Tag>
            ) : null}
          </div>
          <Button
            size="small"
            icon={<EditOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={openPlan}
            className="border border-[#D9D9D9] text-[#4d4d4d] font-normal h-8"
            data-cy="edit-idp-plan-btn"
          >
            {idp ? 'Edit plan' : 'Create IDP'}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="primary"
          size="small"
          disabled={!idp}
          icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
          onClick={() => openActivity()}
          className="h-8 font-normal"
          data-cy="add-idp-activity-btn"
        >
          Add activity
        </Button>
      </div>

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
                idp
                  ? 'No IDP activities yet.'
                  : 'Create an IDP to add development activities.'
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
        open={planOpen}
        title="Individual Development Plan"
        onCancel={() => setPlanOpen(false)}
        onOk={async () => {
          const values = await planForm.validateFields();
          onUpsertPlan(values);
          setPlanOpen(false);
        }}
        okText="Save"
        destroyOnClose
        data-cy="idp-plan-modal"
      >
        <Form form={planForm} layout="vertical" className="mt-2">
          <Form.Item
            name="objectives"
            label="Objectives"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input.TextArea rows={3} data-cy="idp-objectives" />
          </Form.Item>
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
        open={activityOpen}
        title={editingActivity ? 'Edit activity' : 'Add activity'}
        onCancel={() => setActivityOpen(false)}
        onOk={async () => {
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
          if (editingActivity) {
            onUpdateActivity(editingActivity.id, payload);
          } else {
            onAddActivity(payload);
          }
          setActivityOpen(false);
        }}
        okText="Save"
        destroyOnClose
        data-cy="idp-activity-modal"
      >
        <Form form={activityForm} layout="vertical" className="mt-2">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              options={ACTIVITY_TYPES.map((value) => ({ value, label: value }))}
              data-cy="idp-activity-type"
            />
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
