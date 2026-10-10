'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AccessGuard from '@/utils/permissionGuard';
import {
  useCreateOkrObjectiveType,
  useDeleteOkrObjectiveType,
  useUpdateOkrObjectiveType,
} from '@/store/server/features/okrplanning/okr-objective-type/mutations';
import { useGetOkrObjectiveTypes } from '@/store/server/features/okrplanning/okr-objective-type/queries';
import {
  CreateOkrObjectiveTypeDto,
  OkrObjectiveType,
} from '@/store/server/features/okrplanning/okr-objective-type/interface';

const MANAGE_OKR_SETTINGS = 'manage_okr_settings';

const ObjectiveTypesPage = () => {
  const [form] = Form.useForm<CreateOkrObjectiveTypeDto>();
  const [selectedType, setSelectedType] = useState<OkrObjectiveType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: objectiveTypes = [], isLoading } = useGetOkrObjectiveTypes({
    activeOnly: true,
  });
  const { mutate: createObjectiveType, isLoading: isCreating } =
    useCreateOkrObjectiveType();
  const { mutate: updateObjectiveType, isLoading: isUpdating } =
    useUpdateOkrObjectiveType();
  const { mutate: deleteObjectiveType, isLoading: isDeleting } =
    useDeleteOkrObjectiveType();

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setSelectedType(null);
      return;
    }

    form.setFieldsValue(
      selectedType
        ? {
            name: selectedType.name,
            description: selectedType.description,
          }
        : {},
    );
  }, [form, isModalOpen, selectedType]);

  const closeModal = () => setIsModalOpen(false);

  const submit = async () => {
    const values = await form.validateFields();
    const onSuccess = closeModal;

    if (selectedType) {
      updateObjectiveType({ id: selectedType.id, data: values }, { onSuccess });
      return;
    }

    createObjectiveType(
      {
        ...values,
        sortOrder: objectiveTypes.length + 1,
      },
      { onSuccess },
    );
  };

  const columns = [
    {
      title: 'Objective type',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: OkrObjectiveType) => (
        <div>
          <div className="font-medium text-[#262626]">{name}</div>
          {record.description && (
            <div className="mt-1 text-xs text-[#8c8c8c]">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (cell: unknown, record: OkrObjectiveType) => (
        <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
          <div className="flex items-center justify-center gap-2">
            <Button
              icon={<EditOutlinedIcon fontSize="small" />}
              className="bg-blue text-white"
              shape="circle"
              aria-label={`Edit ${record.name}`}
              onClick={() => {
                setSelectedType(record);
                setIsModalOpen(true);
              }}
            />
            <Popconfirm
              title="Delete objective type?"
              description="It will no longer be available for new objectives."
              okText="Delete"
              okButtonProps={{ danger: true, loading: isDeleting }}
              onConfirm={() => deleteObjectiveType(record.id)}
            >
              <Button
                icon={<DeleteOutlined />}
                className="bg-red-500 text-white"
                shape="circle"
                aria-label={`Delete ${record.name}`}
              />
            </Popconfirm>
          </div>
        </AccessGuard>
      ),
    },
  ];

  return (
    <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
      <div className="rounded-xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 text-xl font-semibold text-[#262626]">
              Objective Types
            </h2>
            <p className="m-0 text-sm text-[#595959]">
              Create the objective types available when employees plan OKRs.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add objective type
          </Button>
        </div>

        <Table<OkrObjectiveType>
          columns={columns}
          dataSource={objectiveTypes}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No objective types configured yet.' }}
        />
      </div>

      <Modal
        title={selectedType ? 'Edit objective type' : 'Add objective type'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={submit}
        okText={selectedType ? 'Save changes' : 'Create'}
        confirmLoading={isCreating || isUpdating}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, whitespace: true, message: 'Enter a name.' },
            ]}
          >
            <Input maxLength={100} placeholder="e.g. Strategic objective" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              maxLength={500}
              rows={3}
              placeholder="Optional description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </AccessGuard>
  );
};

export default ObjectiveTypesPage;
