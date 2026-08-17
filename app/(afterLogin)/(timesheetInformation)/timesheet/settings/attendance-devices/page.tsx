'use client';

import React from 'react';
import {
  Button,
  Form,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import {
  useDiscoverAttendanceDevices,
  useGetAttendanceDevices,
} from '@/store/server/features/timesheet/device/queries';
import {
  useDeleteAttendanceDevice,
  useSaveAttendanceDevice,
  SaveAttendanceDevicePayload,
} from '@/store/server/features/timesheet/device/mutation';
import {
  AttendanceDevice,
  AttendanceDevicePurpose,
  DiscoveredAttendanceDevice,
} from '@/store/server/features/timesheet/device/interface';

type DeviceRow = DiscoveredAttendanceDevice & { key: string };

const purposeOptions = [
  { label: 'Attendance', value: AttendanceDevicePurpose.ATTENDANCE },
  { label: 'Access control', value: AttendanceDevicePurpose.ACCESS_CONTROL },
  { label: 'Both', value: AttendanceDevicePurpose.BOTH },
];

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const AttendanceDevicesPage = () => {
  const [form] = Form.useForm<SaveAttendanceDevicePayload>();
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [editingDevice, setEditingDevice] =
    React.useState<AttendanceDevice | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const configuredQuery = useGetAttendanceDevices();
  const discoveredQuery = useDiscoverAttendanceDevices();
  const saveMutation = useSaveAttendanceDevice();
  const deleteMutation = useDeleteAttendanceDevice();

  const discoveredRows: DeviceRow[] = (discoveredQuery.data ?? []).map(
    (device) => ({
      ...device,
      key: device.serialNumber,
    }),
  );
  const discoveredSerials = new Set(
    discoveredRows.map((device) => device.serialNumber),
  );
  const fallbackRows: DeviceRow[] = (configuredQuery.data ?? [])
    .filter((device) => !discoveredSerials.has(device.serialNumber))
    .map((device) => ({
      key: device.serialNumber,
      externalDeviceId: device.externalDeviceId,
      serialNumber: device.serialNumber,
      name: device.name,
      area: device.areaName ? { area_name: device.areaName } : null,
      state: null,
      isAttendance: device.zktIsAttendance ?? false,
      configuredDevice: device,
    }));
  const rows = discoveredQuery.isError ? fallbackRows : discoveredRows;

  const openConfigure = (row: DeviceRow) => {
    const configured = row.configuredDevice;
    setEditingDevice(configured);
    form.setFieldsValue({
      name: configured?.name ?? row.name,
      serialNumber: configured?.serialNumber ?? row.serialNumber,
      externalDeviceId: configured?.externalDeviceId ?? row.externalDeviceId,
      purpose: configured?.purpose ?? AttendanceDevicePurpose.ATTENDANCE,
      acceptUnknownPunches: configured?.acceptUnknownPunches ?? false,
      enabled: configured?.enabled ?? true,
      areaName: configured?.areaName ?? row.area?.area_name ?? null,
      zktIsAttendance: configured?.zktIsAttendance ?? row.isAttendance,
    });
    setIsModalOpen(true);
  };

  const closeConfigure = () => {
    if (saveMutation.isLoading) return;
    setIsModalOpen(false);
    setEditingDevice(null);
    form.resetFields();
  };

  const handleSubmit = (values: SaveAttendanceDevicePayload) => {
    saveMutation.mutate(
      { id: editingDevice?.id, payload: values },
      {
        onSuccess: () => {
          messageApi.success('Attendance device configuration saved.');
          closeConfigure();
        },
        onError: (error: any) =>
          messageApi.error(
            getErrorMessage(error, 'Unable to save device configuration.'),
          ),
      },
    );
  };

  const handleDelete = (device: AttendanceDevice) => {
    modal.confirm({
      title: 'Remove device configuration?',
      content: `The device ${device.name} will no longer be used for attendance synchronization.`,
      okText: 'Remove',
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          deleteMutation.mutate(device.id, {
            onSuccess: () => {
              messageApi.success('Device configuration removed.');
              resolve();
            },
            onError: (error: any) => {
              messageApi.error(
                getErrorMessage(
                  error,
                  'Unable to remove device configuration.',
                ),
              );
              reject(error);
            },
          });
        }),
    });
  };

  const columns: ColumnsType<DeviceRow> = [
    {
      title: 'Device',
      key: 'device',
      render: (_, row) => (
        <div>
          <Typography.Text strong>{row.name}</Typography.Text>
          <div className="text-xs text-gray-500">{row.serialNumber}</div>
        </div>
      ),
    },
    {
      title: 'Area',
      key: 'area',
      render: (_, row) =>
        row.area?.area_name || row.configuredDevice?.areaName || '—',
    },
    {
      title: 'Machine status',
      key: 'state',
      render: (_, row) =>
        row.state === null ? (
          <Tag>Configured</Tag>
        ) : (
          <Tag color={row.state === '1' ? 'green' : 'red'}>
            {row.state === '1' ? 'Online' : 'Offline'}
          </Tag>
        ),
    },
    {
      title: 'Purpose',
      key: 'purpose',
      render: (_, row) =>
        row.configuredDevice ? (
          <Tag color="blue">
            {row.configuredDevice.purpose.replace('_', ' ')}
          </Tag>
        ) : (
          <Tag>Not configured</Tag>
        ),
    },
    {
      title: 'Enabled',
      key: 'enabled',
      render: (_, row) =>
        row.configuredDevice ? (
          <Tag color={row.configuredDevice.enabled ? 'green' : 'default'}>
            {row.configuredDevice.enabled ? 'Yes' : 'No'}
          </Tag>
        ) : (
          '—'
        ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button icon={<SettingOutlined />} onClick={() => openConfigure(row)}>
            {row.configuredDevice ? 'Edit' : 'Configure'}
          </Button>
          {row.configuredDevice && (
            <Button
              danger
              onClick={() =>
                handleDelete(row.configuredDevice as AttendanceDevice)
              }
            >
              Remove
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      {messageContextHolder}
      <div className="rounded-lg border border-[#D9D9D9] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Typography.Title level={4} className="!mb-1">
              Attendance Devices
            </Typography.Title>
            <Typography.Text type="secondary">
              Configure which biometric machines provide attendance punches.
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={discoveredQuery.isFetching}
            onClick={() => discoveredQuery.refetch()}
          >
            Discover devices
          </Button>
        </div>

        {discoveredQuery.isError && (
          <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Machine discovery is unavailable. Showing saved device
            configurations.
          </div>
        )}

        <Table<DeviceRow>
          rowKey="key"
          columns={columns}
          dataSource={rows}
          loading={discoveredQuery.isLoading || configuredQuery.isLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No biometric devices found.' }}
        />
      </div>

      <Modal
        title={
          editingDevice
            ? 'Edit Attendance Device'
            : 'Configure Attendance Device'
        }
        open={isModalOpen}
        onCancel={closeConfigure}
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
            name="name"
            label="Device name"
            rules={[{ required: true }]}
          >
            <input className="ant-input h-10" />
          </Form.Item>
          <Form.Item
            name="serialNumber"
            label="Serial number"
            rules={[{ required: true }]}
          >
            <input className="ant-input h-10" disabled />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="Purpose"
            rules={[{ required: true }]}
          >
            <Select options={purposeOptions} />
          </Form.Item>
          <Form.Item
            name="acceptUnknownPunches"
            label="Accept unknown punch states"
            valuePropName="checked"
            extra="Allow punches whose ZKT state is unknown to enter attendance processing."
          >
            <Switch />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={closeConfigure}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saveMutation.isLoading}
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AttendanceDevicesPage;
