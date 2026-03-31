'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Select,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { PAYROLL_URL } from '@/utils/constants';
import {
  fetchBasecampConnectUrl,
  useBasecampModules,
  useBasecampPeople,
  useBasecampProjectMappings,
  useBasecampProjects,
  useBasecampStatus,
  useBasecampUserMappings,
  useBasecampDeleteUserMapping,
  useBasecampDisconnect,
  useBasecampUpdateModules,
  useBasecampUpsertProjectMapping,
  useBasecampUpsertUserMapping,
} from '@/store/server/features/basecamp';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import type {
  BasecampModuleCategory,
  BasecampModuleRow,
  BasecampUserMapping,
} from '@/store/server/features/basecamp/types';

const { Title, Paragraph, Text } = Typography;

const CATEGORY_LABEL: Record<BasecampModuleCategory, string> = {
  personal_notifications: 'Personal notifications',
  public_posts: 'Public project posts',
};

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

export default function AdminBasecampClient() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [userMapForm] = Form.useForm<{
    selamnewUserId: string;
    basecampUserId: number;
  }>();

  const { data: status, isLoading: statusLoading } = useBasecampStatus();
  const { data: modules, isLoading: modulesLoading } = useBasecampModules();
  const { data: projectMappings, isLoading: pmLoading } =
    useBasecampProjectMappings();
  const { data: userMappings, isLoading: umLoading } = useBasecampUserMappings();
  const { data: allEmployees } = useGetAllUsersData();

  const connected = !!status?.connected;
  const { data: projects = [], isLoading: projectsLoading } =
    useBasecampProjects(connected);
  const { data: people = [], isLoading: peopleLoading } =
    useBasecampPeople(connected);

  const updateModules = useBasecampUpdateModules();
  const upsertProject = useBasecampUpsertProjectMapping();
  const upsertUser = useBasecampUpsertUserMapping();
  const deleteUser = useBasecampDeleteUserMapping();
  const disconnect = useBasecampDisconnect();

  useEffect(() => {
    const basecamp = searchParams.get('basecamp');
    if (!basecamp) return;
    if (basecamp === 'connected') {
      message.success('Basecamp connected successfully.');
    } else if (basecamp === 'error') {
      const detail = searchParams.get('message');
      message.error(
        detail
          ? `Basecamp connection failed (${detail}).`
          : 'Basecamp connection failed.',
      );
    }
    router.replace('/integrations/basecamp', { scroll: false });
  }, [searchParams, message, router]);

  const onToggleModule = useCallback(
    (slug: string, enabled: boolean, list: BasecampModuleRow[] | undefined) => {
      if (!list?.length) return;
      updateModules.mutate(
        {
          modules: list.map((m) => ({
            moduleSlug: m.slug,
            enabled: m.slug === slug ? enabled : m.enabled,
          })),
        },
        {
          onError: () => {
            message.error('Could not update module settings.');
          },
        },
      );
    },
    [updateModules, message],
  );

  const projectModules = useMemo(
    () =>
      (modules ?? []).filter((m) => m.category === 'public_posts'),
    [modules],
  );

  const mappingByModule = useMemo(() => {
    const map = new Map<string, string>();
    (projectMappings ?? []).forEach((r) =>
      map.set(r.selamnewModule, r.basecampProjectId),
    );
    return map;
  }, [projectMappings]);

  const onProjectChange = useCallback(
    (selamnewModule: string, projectId: number | undefined) => {
      if (projectId == null) return;
      const proj = projects.find((p) => p.id === projectId);
      upsertProject.mutate(
        {
          selamnewModule,
          basecampProjectId: projectId,
          basecampProjectName: proj?.name,
        },
        {
          onSuccess: () => {
            message.success('Project mapping saved.');
          },
          onError: () => {
            message.error('Could not save project mapping.');
          },
        },
      );
    },
    [projects, upsertProject, message],
  );

  const employees = allEmployees?.items ?? [];
  const mappedUserIds = useMemo(
    () => new Set((userMappings ?? []).map((r) => r.selamnewUserId)),
    [userMappings],
  );

  const employeeOptions = useMemo(
    () =>
      employees
        .filter((e: { id?: string }) => e.id && !mappedUserIds.has(e.id))
        .map(
          (e: {
            id: string;
            firstName?: string;
            middleName?: string;
            lastName?: string;
            email?: string;
          }) => ({
            value: e.id,
            label: employeeLabel(e),
          }),
        ),
    [employees, mappedUserIds],
  );

  const personOptions = useMemo(
    () =>
      people.map((p) => ({
        value: p.id,
        label: p.email_address
          ? `${p.name} (${p.email_address})`
          : p.name,
      })),
    [people],
  );

  const userMappingColumns: ColumnsType<BasecampUserMapping> = useMemo(
    () => [
      {
        title: 'Employee',
        key: 'emp',
        render: (_, row) => {
          const u = employees.find(
            (e: { id?: string }) => e.id === row.selamnewUserId,
          );
          return u ? employeeLabel(u) : row.selamnewUserId;
        },
      },
      {
        title: 'Basecamp user ID',
        dataIndex: 'basecampUserId',
        key: 'basecampUserId',
      },
      {
        title: '',
        key: 'actions',
        width: 100,
        render: (_, row) => (
          <Button
            type="link"
            danger
            loading={deleteUser.isLoading}
            onClick={() =>
              deleteUser.mutate(row.selamnewUserId, {
                onSuccess: () => {
                  message.success('Mapping removed.');
                },
                onError: () => {
                  message.error('Could not remove mapping.');
                },
              })
            }
          >
            Remove
          </Button>
        ),
      },
    ],
    [employees, deleteUser, message],
  );

  const modulesByCategory = useMemo(() => {
    const m = modules ?? [];
    const groups: Record<string, BasecampModuleRow[]> = {};
    m.forEach((row) => {
      if (!groups[row.category]) groups[row.category] = [];
      groups[row.category].push(row);
    });
    return groups;
  }, [modules]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await fetchBasecampConnectUrl();
      globalThis.location.href = url;
    } catch {
      message.error('Could not start Basecamp connection.');
      setConnecting(false);
    }
  };

  if (!PAYROLL_URL) {
    return (
      <div className="p-6 max-w-3xl">
        <Alert
          type="error"
          showIcon
          message="PAYROLL_URL is not set"
          description="Configure PAYROLL_URL in the environment so the app can reach the payroll API (Basecamp routes live under /api/v1/integrations/basecamp)."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <Title level={3} className="!mb-1">
          Basecamp
        </Title>
        <Paragraph type="secondary" className="!mb-0">
          Connect your tenant to Basecamp, choose which modules sync, and map
          projects and people for notifications and posts.
        </Paragraph>
      </div>

      <Card title="Connection" loading={statusLoading}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Status">
            {connected ? (
              <Text type="success">Connected</Text>
            ) : (
              <Text type="secondary">Not connected</Text>
            )}
          </Descriptions.Item>
          {status?.accountId ? (
            <Descriptions.Item label="Account ID">
              {status.accountId}
            </Descriptions.Item>
          ) : null}
          {status?.connectedAt ? (
            <Descriptions.Item label="Connected at">
              {dayjs(status.connectedAt).format('DD MMM YYYY HH:mm')}
            </Descriptions.Item>
          ) : null}
        </Descriptions>
        <Space className="mt-4" wrap>
          <Button
            type="primary"
            onClick={handleConnect}
            loading={connecting}
            disabled={connected}
          >
            Connect Basecamp
          </Button>
          <Button
            danger
            disabled={!connected}
            loading={disconnect.isLoading}
            onClick={() =>
              disconnect.mutate(undefined, {
                onSuccess: () => {
                  message.success('Basecamp disconnected.');
                },
                onError: () => {
                  message.error('Could not disconnect.');
                },
              })
            }
          >
            Disconnect
          </Button>
        </Space>
      </Card>

      <Card title="Modules" loading={modulesLoading}>
        <Paragraph type="secondary" className="text-sm !mt-0">
          Only enabled modules will trigger Basecamp actions once the backend
          pipelines are wired.
        </Paragraph>
        <div className="space-y-6">
          {(Object.keys(modulesByCategory) as BasecampModuleCategory[]).map(
            (cat) => (
              <div key={cat}>
                <Text strong>{CATEGORY_LABEL[cat]}</Text>
                <Divider className="my-2" />
                <ul className="list-none pl-0 space-y-2">
                  {modulesByCategory[cat]?.map((row) => (
                    <li
                      key={row.slug}
                      className="flex items-center justify-between gap-4 flex-wrap"
                    >
                      <span>{row.displayName}</span>
                      <Switch
                        checked={row.enabled}
                        loading={updateModules.isLoading}
                        onChange={(checked) =>
                          onToggleModule(row.slug, checked, modules)
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card
        title="Project mappings"
        loading={pmLoading || (connected && projectsLoading)}
      >
        <Paragraph type="secondary" className="text-sm !mt-0">
          Map each module that posts to a Basecamp project to the correct
          project.
        </Paragraph>
        {!connected ? (
          <Text type="secondary">Connect Basecamp to load projects.</Text>
        ) : (
          <ul className="list-none pl-0 space-y-3">
            {projectModules.map((row) => (
              <li
                key={row.slug}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <span className="min-w-[200px] sm:max-w-xs">
                  {row.displayName}
                </span>
                <Select
                  className="min-w-[240px] flex-1"
                  placeholder="Select Basecamp project"
                  loading={projectsLoading}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  value={
                    mappingByModule.has(row.slug)
                      ? Number(mappingByModule.get(row.slug))
                      : undefined
                  }
                  onChange={(v) =>
                    onProjectChange(row.slug, v as number | undefined)
                  }
                  disabled={upsertProject.isLoading}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        title="User mappings"
        loading={umLoading || (connected && peopleLoading)}
      >
        <Paragraph type="secondary" className="text-sm !mt-0">
          Map workspace users to Basecamp people for personal notifications.
        </Paragraph>
        {!connected ? (
          <Text type="secondary">Connect Basecamp to load people.</Text>
        ) : (
          <>
            <Form
              form={userMapForm}
              layout="inline"
              className="flex flex-wrap gap-2 mb-4 items-end"
              onFinish={(v) => {
                upsertUser.mutate(
                  {
                    selamnewUserId: v.selamnewUserId,
                    basecampUserId: v.basecampUserId,
                  },
                  {
                    onSuccess: () => {
                      message.success('User mapping saved.');
                      userMapForm.resetFields();
                    },
                    onError: () => {
                      message.error('Could not save user mapping.');
                    },
                  },
                );
              }}
            >
              <Form.Item
                name="selamnewUserId"
                rules={[{ required: true, message: 'Select employee' }]}
                className="!mb-0 min-w-[200px] flex-1"
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Employee"
                  options={employeeOptions}
                />
              </Form.Item>
              <Form.Item
                name="basecampUserId"
                rules={[{ required: true, message: 'Select Basecamp person' }]}
                className="!mb-0 min-w-[220px] flex-1"
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Basecamp person"
                  options={personOptions}
                />
              </Form.Item>
              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={upsertUser.isLoading}
                >
                  Add mapping
                </Button>
              </Form.Item>
            </Form>
            <Table<BasecampUserMapping>
              size="small"
              rowKey={(r) => r.selamnewUserId}
              columns={userMappingColumns}
              dataSource={userMappings ?? []}
              pagination={false}
            />
          </>
        )}
      </Card>
    </div>
  );
}
