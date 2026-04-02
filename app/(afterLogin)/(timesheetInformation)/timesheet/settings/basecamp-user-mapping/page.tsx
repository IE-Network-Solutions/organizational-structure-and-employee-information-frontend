'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { FaPlus } from 'react-icons/fa';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetBasecampUserMappings } from '@/store/server/features/timesheet/basecampUserMapping/queries';
import {
  useCreateBasecampUserMapping,
  useUpdateBasecampUserMapping,
  useDeleteBasecampUserMapping,
} from '@/store/server/features/timesheet/basecampUserMapping/mutation';
import type {
  BasecampUserMappingItem,
  CreateBasecampUserMappingDto,
} from '@/store/server/features/timesheet/basecampUserMapping/types';

const { Text } = Typography;

function employeeLabel(u: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
}) {
  const name = [u.firstName, u.middleName, u.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || u.email || '—';
}

const BasecampUserMappingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<BasecampUserMappingItem | null>(null);
  const [form] = Form.useForm();

  const { data: mappingsData, isLoading: mappingsLoading } =
    useGetBasecampUserMappings();
  const { data: allEmployees } = useGetAllUsersData();
  const { mutate: createMapping, isLoading: createLoading } =
    useCreateBasecampUserMapping();
  const { mutate: updateMapping, isLoading: updateLoading } =
    useUpdateBasecampUserMapping();
  const { mutate: deleteMapping } = useDeleteBasecampUserMapping();

  const employees: any[] = allEmployees?.items ?? [];
  const mappings: BasecampUserMappingItem[] = mappingsData?.items ?? [];

  const mappedUserIds = useMemo(
    () => new Set(mappings.map((m) => m.userId)),
    [mappings],
  );

  const employeeOptions = useMemo(
    () =>
      employees
        .filter(
          (e: { id?: string }) =>
            e.id &&
            (!mappedUserIds.has(e.id) ||
              e.id === editingRecord?.userId),
        )
        .map((e: any) => ({
          value: e.id,
          label: employeeLabel(e),
        })),
    [employees, mappedUserIds, editingRecord],
  );

  const employeeMap = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e: any) => {
      if (e.id) map.set(e.id, employeeLabel(e));
    });
    return map;
  }, [employees]);

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: BasecampUserMappingItem) => {
    setEditingRecord(record);
    form.setFieldsValue({
      userId: record.userId,
      basecampPersonId: record.basecampPersonId,
      basecampDisplayName: record.basecampDisplayName ?? '',
      basecampEmail: record.basecampEmail ?? '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: CreateBasecampUserMappingDto) => {
    if (editingRecord) {
      updateMapping(
        { id: editingRecord.id, data: values },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createMapping(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMapping(id);
  };

  const columns: TableColumnsType<BasecampUserMappingItem> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: string) => (
        <Text>{employeeMap.get(userId) ?? userId}</Text>
      ),
    },
    {
      title: 'Basecamp Person ID',
      dataIndex: 'basecampPersonId',
      key: 'basecampPersonId',
    },
    {
      title: 'Display Name',
      dataIndex: 'basecampDisplayName',
      key: 'basecampDisplayName',
      render: (text: string | null) => text || '—',
    },
    {
      title: 'Email',
      dataIndex: 'basecampEmail',
      key: 'basecampEmail',
      render: (text: string | null) => text || '—',
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: BasecampUserMappingItem) => (
        <Space>
          <ActionButtons
            id={record.id}
            onEdit={() => openEditModal(record)}
          />
          <ActionButtons
            id={record.id}
            onDelete={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">Basecamp User Mapping</h1>
        <Button
          type="primary"
          icon={<FaPlus />}
          className="h-10 w-10 sm:w-auto"
          onClick={openCreateModal}
        >
          <span className="hidden md:inline"> New Mapping</span>
        </Button>
      </div>

      <Text type="secondary" className="block mb-4">
        Map employees to their Basecamp identities so leave notifications
        include the correct display names.
      </Text>

      <Spin spinning={mappingsLoading}>
        <Table<BasecampUserMappingItem>
          className="mt-2"
          columns={columns}
          dataSource={mappings}
          rowKey="id"
          pagination={false}
        />
      </Spin>

      <Modal
        title={editingRecord ? 'Edit Mapping' : 'New Basecamp User Mapping'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="userId"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select employee"
              options={employeeOptions}
              disabled={!!editingRecord}
            />
          </Form.Item>

          <Form.Item
            name="basecampPersonId"
            label="Basecamp Person ID"
            rules={[
              { required: true, message: 'Please enter Basecamp Person ID' },
            ]}
          >
            <Input placeholder="e.g. 12345678" />
          </Form.Item>

          <Form.Item
            name="basecampDisplayName"
            label="Display Name (optional)"
          >
            <Input placeholder="Basecamp display name" />
          </Form.Item>

          <Form.Item name="basecampEmail" label="Email (optional)">
            <Input placeholder="Basecamp email" />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createLoading || updateLoading}
              >
                {editingRecord ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BasecampUserMappingPage;
