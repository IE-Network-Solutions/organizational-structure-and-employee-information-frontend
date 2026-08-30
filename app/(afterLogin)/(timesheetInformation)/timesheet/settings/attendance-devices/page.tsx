'use client';

import React from 'react';
import {
  Button,
  Dropdown,
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
import type { MenuProps } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
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

const getPurposeLabel = (purpose: AttendanceDevicePurpose) =>
  purposeOptions.find((option) => option.value === purpose)?.label ??
  purpose
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());

const headerClass = 'text-[#4d4d4d] text-base font-bold';
const cellClass = 'text-[#4d4d4d] text-sm font-normal';

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
      title: <span className={headerClass}>Device</span>,
      key: 'device',
      render: (columnValue, row) => (
        <div data-cy="attendance-devices-device-cell">
          <div
            className={`${cellClass} font-medium`}
            data-cy="attendance-devices-device-name"
          >
            {row.name}
          </div>
          <div
            className="text-xs text-[#8c8c8c]"
            data-cy="attendance-devices-device-serial"
          >
            {row.serialNumber}
          </div>
        </div>
      ),
    },
    {
      title: <span className={headerClass}>Area</span>,
      key: 'area',
      render: (columnValue, row) => (
        <span className={cellClass}>
          {row.area?.area_name || row.configuredDevice?.areaName || '—'}
        </span>
      ),
    },
    {
      title: <span className={headerClass}>Machine status</span>,
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
      title: <span className={headerClass}>Purpose</span>,
      key: 'purpose',
      render: (columnValue, row) =>
        row.configuredDevice ? (
          <Tag color="blue" data-cy="attendance-devices-purpose-tag">
            {getPurposeLabel(row.configuredDevice.purpose)}
          </Tag>
        ) : (
          <Tag data-cy="attendance-devices-not-configured-tag">
            Not configured
          </Tag>
        ),
    },
    {
      title: <span className={headerClass}>Enabled</span>,
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
          <span className={cellClass}>—</span>
        ),
    },
    {
      title: <span className={headerClass}>Action</span>,
      key: 'action',
      align: 'left',
      render: (columnValue, row) => {
        const items: MenuProps['items'] = [
          {
            key: 'configure',
            label: row.configuredDevice ? 'Edit' : 'Configure',
            icon: row.configuredDevice ? (
              <EditOutlinedIcon fontSize="small" />
            ) : (
              <SettingsOutlinedIcon fontSize="small" />
            ),
            onClick: () => openConfigure(row),
          },
          ...(row.configuredDevice
            ? [
                {
                  key: 'remove',
                  label: 'Remove',
                  icon: <DeleteOutlinedIcon fontSize="small" />,
                  danger: true,
                  onClick: () =>
                    handleDelete(row.configuredDevice as AttendanceDevice),
                },
              ]
            : []),
        ];

        return (
          <Dropdown
            trigger={['click']}
            menu={{ items }}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="!w-8 !h-8 !min-w-8 !min-h-8 flex items-center justify-center hover:!bg-gray-50 !border-0 !shadow-none"
              aria-label="Device actions"
              data-cy="attendance-devices-actions"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizIcon />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      {messageContextHolder}
      <div
        className="rounded-lg bg-white p-4"
        data-cy="attendance-devices-page"
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
              Configure which biometric machines provide attendance punches.
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined data-cy="attendance-devices-discover-icon" />}
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
          onRow={(_, index) => ({
            className:
              (index ?? 0) % 2 === 0
                ? 'attendance-devices-row-odd'
                : 'attendance-devices-row-even',
          })}
          className="[&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-[#4d4d4d] [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_.ant-table-tbody>tr>td]:text-[#4d4d4d] [&_.ant-table-tbody>tr>td]:text-sm [&_.ant-table-tbody>tr>td]:font-normal [&_tr.attendance-devices-row-even>td]:!bg-[#FAFAFA] [&_tr.attendance-devices-row-odd>td]:!bg-white"
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
            data-cy="attendance-devices-actions"
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
