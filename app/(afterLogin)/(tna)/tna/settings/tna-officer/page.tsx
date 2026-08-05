'use client';
import React, { useMemo, useState } from 'react';
import {
  Button,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
} from 'antd';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TableColumnsType } from '@/types/table/table';
import { TnaOfficer } from '@/types/tna/externalTna';
import { useGetTnaOfficers } from '@/store/server/features/tna/tnaOfficer/queries';
import {
  useRemoveTnaOfficer,
  useSetTnaOfficers,
} from '@/store/server/features/tna/tnaOfficer/mutation';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

/**
 * Nominates the users who own the second approval step: confirming payment and
 * setting the commitment period on external training requests.
 */
const TnaOfficerSettingsPage = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { data: officersData, isLoading } = useGetTnaOfficers();
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersData();
  const { mutate: saveOfficers, isLoading: isSaving } = useSetTnaOfficers();
  const { mutate: removeOfficer, isLoading: isRemoving } =
    useRemoveTnaOfficer();

  const officers = useMemo(() => officersData?.items ?? [], [officersData]);

  const userOptions = useMemo(() => {
    // The users endpoint returns `{items}`, `{data}` or a bare array depending
    // on the deployment, so normalise before filtering.
    const list: any[] = Array.isArray(usersData)
      ? usersData
      : (usersData?.items ?? usersData?.data ?? []);
    const existing = new Set(officers.map((officer) => officer.userId));

    return list
      .filter((user: any) => !existing.has(user.id))
      .map((user: any) => ({
        value: user.id,
        label:
          [user.firstName, user.middleName, user.lastName]
            .filter(Boolean)
            .join(' ') ||
          user.email ||
          user.id,
      }));
  }, [usersData, officers]);

  const columns: TableColumnsType<TnaOfficer> = [
    {
      title: 'Officer',
      dataIndex: 'userId',
      key: 'userId',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (value: boolean, record: TnaOfficer) => (
        <AccessGuard permissions={[Permissions.ManageTnaOfficer]}>
          <Switch
            checked={value}
            loading={isSaving}
            onChange={(checked) =>
              saveOfficers([{ userId: record.userId, isActive: checked }])
            }
            data-cy={`tna-officer-toggle-${record.id}`}
          />
        </AccessGuard>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: TnaOfficer) => {
        void unusedValue;
        return (
          <AccessGuard permissions={[Permissions.ManageTnaOfficer]}>
            <Popconfirm
              title="Remove this TNA officer?"
              onConfirm={() => removeOfficer(record.userId)}
              okText="Remove"
              cancelText="Cancel"
            >
              <Button
                danger
                size="small"
                type="link"
                className="!px-0"
                loading={isRemoving}
                data-cy={`tna-officer-remove-${record.id}`}
              >
                Remove
              </Button>
            </Popconfirm>
          </AccessGuard>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div data-cy="tna-officer-settings-loading">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-cy="tna-officer-settings-page">
      <p
        data-cy="tna-officer-settings-description"
        className="m-0 text-sm leading-[22px] text-black/45"
      >
        TNA Officers review manager-approved external training requests, confirm
        payment and set the employee&apos;s commitment period.
      </p>

      <AccessGuard permissions={[Permissions.ManageTnaOfficer]}>
        <Space.Compact className="w-full md:w-[520px]">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full"
            placeholder="Select employees to nominate"
            loading={isUsersLoading}
            options={userOptions}
            value={selectedUserIds}
            onChange={setSelectedUserIds}
            data-cy="tna-officer-settings-select"
          />
          <Button
            type="primary"
            className="h-10 rounded-r-lg border-[#1E40AF] bg-[#1E40AF] px-4"
            loading={isSaving}
            disabled={!selectedUserIds.length}
            onClick={() =>
              saveOfficers(
                selectedUserIds.map((userId) => ({ userId, isActive: true })),
                { onSuccess: () => setSelectedUserIds([]) },
              )
            }
            data-cy="tna-officer-settings-add"
          >
            Nominate
          </Button>
        </Space.Compact>
      </AccessGuard>

      {officers.length ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={officers}
          pagination={false}
          scroll={{ x: 'max-content' }}
          data-cy="tna-officer-settings-table"
        />
      ) : (
        <EmptyState
          compact
          title="No TNA officers yet"
          description="Nominate at least one officer so approved requests have somewhere to go."
          data-cy="tna-officer-settings-empty"
        />
      )}
    </div>
  );
};

export default TnaOfficerSettingsPage;
