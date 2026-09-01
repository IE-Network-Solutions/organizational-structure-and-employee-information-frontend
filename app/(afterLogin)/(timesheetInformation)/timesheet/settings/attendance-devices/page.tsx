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
import { useGetZktConfig } from '@/store/server/features/timesheet/zkt/queries';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ZktConnectionCard from './_components/zktConnectionCard';
import ZktConnectedStatus from './_components/zktConnectedStatus';

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

const isZktConfigConnected = (config: any) =>
  Boolean(
    config &&
    (config.url || config.passUrl || config.zkturl) &&
    config.username &&
    config.password,
  );

const AttendanceDevicesPage = () => {
  const [form] = Form.useForm<SaveAttendanceDevicePayload>();
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [editingDevice, setEditingDevice] =
    React.useState<AttendanceDevice | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    isZktConfigured,
    setIsZktConfigured,
    setZktSavedData,
    resetZktConfiguration,
  } = useTimesheetSettingsStore();
  const { data: zktConfigData, isLoading: isZktConfigLoading } =
    useGetZktConfig();

  React.useEffect(() => {
    if (!zktConfigData) {
      resetZktConfiguration();
      return;
    }

    if (isZktConfigConnected(zktConfigData)) {
      const savedUrl =
        zktConfigData.url ||
        zktConfigData.passUrl ||
        zktConfigData.zkturl ||
        '';
      setZktSavedData({
        url: savedUrl,
        username: zktConfigData.username,
      });
      setIsZktConfigured(true);
      return;
    }

    resetZktConfiguration();
  }, [
    resetZktConfiguration,
    setIsZktConfigured,
    setZktSavedData,
    zktConfigData,
  ]);

  const configuredQuery = useGetAttendanceDevices(isZktConfigured);
  const discoveredQuery = useDiscoverAttendanceDevices(isZktConfigured);
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
        onError: (error: any) => {
          messageApi.error(
            getErrorMessage(error, 'Unable to save device configuration.'),
          );
        },
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
      render: (columnValue, row) => (
        <div data-cy="attendance-devices-device-cell">
          <Typography.Text strong data-cy="attendance-devices-device-name">
            {row.name}
          </Typography.Text>
          <div
            className="text-xs text-gray-500"
            data-cy="attendance-devices-device-serial"
          >
            {row.serialNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Area',
      key: 'area',
      render: (columnValue, row) =>
        row.area?.area_name || row.configuredDevice?.areaName || '—',
    },
    {
      title: 'Machine status',
      key: 'state',
      render: (columnValue, row) =>
        row.state === null ? (
          <Tag data-cy="attendance-devices-status-configured-tag">
            Configured
          </Tag>
        ) : (
          <Tag
            color={row.state === '1' ? 'green' : 'red'}
            data-cy="attendance-devices-status-tag"
          >
            {row.state === '1' ? 'Online' : 'Offline'}
          </Tag>
        ),
    },
    {
      title: 'Purpose',
      key: 'purpose',
      render: (columnValue, row) =>
        row.configuredDevice ? (
          <Tag color="blue" data-cy="attendance-devices-purpose-tag">
            {row.configuredDevice.purpose.replace('_', ' ')}
          </Tag>
        ) : (
          <Tag data-cy="attendance-devices-not-configured-tag">
            Not configured
          </Tag>
        ),
    },
    {
      title: 'Enabled',
      key: 'enabled',
      render: (columnValue, row) =>
        row.configuredDevice ? (
          <Tag
            color={row.configuredDevice.enabled ? 'green' : 'default'}
            data-cy="attendance-devices-enabled-tag"
          >
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
      render: (columnValue, row) => (
        <div
          className="flex justify-end gap-2"
          data-cy="attendance-devices-actions"
        >
          <Button
            icon={
              <SettingOutlined data-cy="attendance-devices-configure-icon" />
            }
            onClick={() => openConfigure(row)}
            data-cy="attendance-devices-configure-button"
          >
            {row.configuredDevice ? 'Edit' : 'Configure'}
          </Button>
          {row.configuredDevice && (
            <Button
              danger
              onClick={() =>
                handleDelete(row.configuredDevice as AttendanceDevice)
              }
              data-cy="attendance-devices-remove-button"
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
      <div
        className="space-y-4 w-full max-w-full"
        data-cy="attendance-devices-page"
      >
        {isZktConfigLoading ? (
          <p
            className="mb-0 text-sm text-gray-500 text-center"
            data-cy="attendance-devices-zkt-loading"
          >
            Checking ZKTeco connection…
          </p>
        ) : !isZktConfigured ? (
          <>
            <ZktConnectionCard />
            <div
              className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 sm:w-[754px] mx-auto"
              data-cy="attendance-devices-zkt-awareness"
            >
              Connect ZKTeco above to discover and configure attendance devices.
              Your biometric machines will appear here after linking.
            </div>
          </>
        ) : (
          <>
            <ZktConnectedStatus />
            <div
              className="rounded-lg border border-[#D9D9D9] bg-white p-4"
              data-cy="attendance-devices-list-section"
            >
              <div
                className="mb-4 flex items-center justify-between"
                data-cy="attendance-devices-header"
              >
                <div data-cy="attendance-devices-header-title">
                  <Typography.Title
                    level={4}
                    className="!mb-1"
                    data-cy="attendance-devices-title"
                  >
                    Attendance Devices
                  </Typography.Title>
                  <Typography.Text
                    type="secondary"
                    data-cy="attendance-devices-subtitle"
                  >
                    Configure which biometric machines provide attendance
                    punches.
                  </Typography.Text>
                </div>
                <Button
                  type="primary"
                  icon={
                    <ReloadOutlined data-cy="attendance-devices-discover-icon" />
                  }
                  loading={discoveredQuery.isFetching}
                  onClick={() => discoveredQuery.refetch()}
                  data-cy="attendance-devices-discover-button"
                >
                  Discover devices
                </Button>
              </div>

              {discoveredQuery.isError && (
                <div
                  className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800"
                  data-cy="attendance-devices-discovery-warning"
                >
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
                data-cy="attendance-devices-table"
              />
            </div>
          </>
        )}
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
        data-cy="attendance-devices-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          data-cy="attendance-devices-form"
        >
          <Form.Item
            name="name"
            label="Device name"
            rules={[{ required: true }]}
            data-cy="attendance-devices-name-item"
          >
            <input
              className="ant-input h-10"
              data-cy="attendance-devices-name-input"
            />
          </Form.Item>
          <Form.Item
            name="serialNumber"
            label="Serial number"
            rules={[{ required: true }]}
            data-cy="attendance-devices-serial-item"
          >
            <input
              className="ant-input h-10"
              disabled
              data-cy="attendance-devices-serial-input"
            />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="Purpose"
            rules={[{ required: true }]}
            data-cy="attendance-devices-purpose-item"
          >
            <Select
              options={purposeOptions}
              data-cy="attendance-devices-purpose-select"
            />
          </Form.Item>
          <Form.Item
            name="acceptUnknownPunches"
            label="Accept unknown punch states"
            valuePropName="checked"
            extra="Allow punches whose ZKT state is unknown to enter attendance processing."
            data-cy="attendance-devices-accept-unknown-item"
          >
            <Switch data-cy="attendance-devices-accept-unknown-switch" />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="Enabled"
            valuePropName="checked"
            data-cy="attendance-devices-enabled-item"
          >
            <Switch data-cy="attendance-devices-enabled-switch" />
          </Form.Item>
          <div
            className="flex justify-end gap-2"
            data-cy="attendance-devices-modal-actions"
          >
            <Button
              onClick={closeConfigure}
              data-cy="attendance-devices-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saveMutation.isLoading}
              data-cy="attendance-devices-save-button"
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
