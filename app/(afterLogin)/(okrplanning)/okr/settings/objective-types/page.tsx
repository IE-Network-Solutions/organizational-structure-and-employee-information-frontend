'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Table,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import {
  useCreateOkrObjectiveType,
  useDeactivateOkrObjectiveType,
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
  const { data: objectiveTypes = [], isLoading } = useGetOkrObjectiveTypes();
  const { mutate: createObjectiveType, isLoading: isCreating } =
    useCreateOkrObjectiveType();
  const { mutate: updateObjectiveType, isLoading: isUpdating } =
    useUpdateOkrObjectiveType();
  const { mutate: deactivateObjectiveType, isLoading: isDeactivating } =
    useDeactivateOkrObjectiveType();

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
            sortOrder: selectedType.sortOrder,
          }
        : { sortOrder: objectiveTypes.length + 1 },
    );
  }, [form, isModalOpen, objectiveTypes.length, selectedType]);

  const closeModal = () => setIsModalOpen(false);

  const submit = async () => {
    const values = await form.validateFields();
    const onSuccess = closeModal;

    if (selectedType) {
      updateObjectiveType({ id: selectedType.id, data: values }, { onSuccess });
      return;
    }

    createObjectiveType(values, { onSuccess });
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
      title: 'Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (unusedValue: unknown, record: OkrObjectiveType) => (
        <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
          <div className="flex gap-2">
            <Button
              type="link"
              className="px-0"
              onClick={() => {
                setSelectedType(record);
                setIsModalOpen(true);
              }}
            >
              Edit
            </Button>
            {record.isActive && (
              <Popconfirm
                title="Deactivate objective type?"
                description="It will no longer be available for new objectives."
                okText="Deactivate"
                okButtonProps={{ danger: true, loading: isDeactivating }}
                onConfirm={() => deactivateObjectiveType(record.id)}
              >
                <Button type="link" danger className="px-0">
                  Deactivate
                </Button>
              </Popconfirm>
            )}
          </div>
        </AccessGuard>
      ),
    },
  ];

  return (
    <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
      <div className="rounded-xl bg-white p-4 sm:p-6 lg:p-8">
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
          <Form.Item
            name="sortOrder"
            label="Display order"
            rules={[{ required: true, message: 'Enter a display order.' }]}
          >
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </AccessGuard>
  );
};

export default ObjectiveTypesPage;
