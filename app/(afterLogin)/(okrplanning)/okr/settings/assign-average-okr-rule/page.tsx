'use client';

import AssignAverageOkrRuleDrawer from './_components/assign-average-okr-rule-drawer';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { getAverageOkrRuleByUser } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/queries';
import { useRemoveAverageOkrRuleFromUser } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useAssignAverageOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/assign-average-okr-rule';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  Avatar,
  Button,
  Form,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import { useQueries } from 'react-query';
import { OkrRule } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule/interface';

const AssignAverageOkrRulePage: React.FC = () => {
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetAllUsers();
  const { mutate: removeAssignment } = useRemoveAverageOkrRuleFromUser();
  const { open, setOpen, setEditContext } = useAssignAverageOkrRuleStore();
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeEmployees = useMemo(() => {
    const items = employeeData?.items ?? [];
    return items.filter((user: any) => {
      const deleted = user?.deletedAt !== null && user?.deletedAt !== undefined;
      const inactive =
        user?.employee_status === 'inactive' ||
        user?.employee_status === 'terminated';
      return !deleted && !inactive;
    });
  }, [employeeData?.items]);

  const activeDepartmentLeads = useMemo(
    () =>
      activeEmployees.filter((user: any) =>
        Boolean(
          user?.employeeJobInformation?.find(
            (job: any) => job?.isPositionActive,
          )?.departmentLeadOrNot,
        ),
      ),
    [activeEmployees],
  );

  const filteredEmployees = useMemo(() => {
    if (!filterUserId) {
      return activeDepartmentLeads;
    }
    return activeDepartmentLeads.filter((u: any) => u.id === filterUserId);
  }, [activeDepartmentLeads, filterUserId]);

  const userRuleQueries = useQueries(
    filteredEmployees.map((emp: any) => ({
      queryKey: ['averageOkrRuleByUser', emp.id] as const,
      queryFn: () => getAverageOkrRuleByUser(emp.id),
      staleTime: 30_000,
    })),
  );

  const getEmployeeLabel = (userId: string) => {
    const employee = activeDepartmentLeads.find((u: any) => u.id === userId);
    if (!employee) return '—';
    const firstName = employee?.firstName || '';
    const middleName = employee?.middleName || '';
    const lastName = employee?.lastName || '';
    return `${firstName} ${middleName} ${lastName}`.trim() || '—';
  };

  const showDrawer = () => {
    setEditContext(null);
    setOpen(true);
  };

  const onCloseDrawer = () => {
    setOpen(false);
  };

  const handleEdit = (userId: string, rule: OkrRule) => {
    if (!rule?.id) {
      return;
    }
    setEditContext({ userId, averageOkrRuleId: rule.id });
    setOpen(true);
  };

  const handleRemove = (userId: string) => {
    removeAssignment(userId);
  };

  const assignedRows = useMemo(() => {
    return filteredEmployees
      .map((emp: any, index: number) => {
        const assignedRule = userRuleQueries[index]?.data as OkrRule | null;
        return {
          key: emp.id,
          userId: emp.id,
          profileImage: emp.profileImage,
          nameLabel: getEmployeeLabel(emp.id),
          assignedRule,
        };
      })
      .filter((row: { assignedRule?: OkrRule | null }) =>
        Boolean(row.assignedRule?.id),
      );
  }, [filteredEmployees, userRuleQueries]);

  const total = assignedRows.length;
  const dataSource = useMemo(() => {
    const start = (page - 1) * pageSize;
    return assignedRows.slice(start, start + pageSize);
  }, [assignedRows, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, pageSize, total]);

  const columns: ColumnsType<(typeof dataSource)[0]> = [
    {
      title: 'Department lead',
      dataIndex: 'nameLabel',
      key: 'name',
      sorter: (a, b) => (a.nameLabel || '').localeCompare(b.nameLabel || ''),
      render: (nameLabel, record) => {
        void nameLabel;
        return (
          <Tooltip
            title={record.nameLabel}
            id={`okr-assign-average-okr-rule-table-employee-tooltip-${record.userId}`}
            data-cy={`okr-assign-average-okr-rule-table-employee-tooltip-${record.userId}`}
          >
            <div
              className="flex items-center gap-2"
              id={`okr-assign-average-okr-rule-table-employee-wrapper-${record.userId}`}
              data-cy={`okr-assign-average-okr-rule-table-employee-wrapper-${record.userId}`}
            >
              {record.profileImage ? (
                <Avatar
                  size={20}
                  src={record.profileImage}
                  data-cy={`okr-assign-average-okr-rule-table-employee-avatar-${record.userId}`}
                />
              ) : (
                <Avatar
                  size={20}
                  data-cy={`okr-assign-average-okr-rule-table-employee-avatar-initials-${record.userId}`}
                >
                  {record.nameLabel
                    .split(' ')
                    .map((name: string) => name[0]?.toUpperCase())
                    .join('')
                    .slice(0, 2)}
                </Avatar>
              )}
              <span
                id={`okr-assign-average-okr-rule-table-employee-name-${record.userId}`}
                data-cy={`okr-assign-average-okr-rule-table-employee-name-${record.userId}`}
              >
                {employeeDataLoading ? (
                  <Spin
                    size="small"
                    data-cy={`okr-assign-average-okr-rule-table-employee-name-loading-${record.userId}`}
                  />
                ) : (
                  record.nameLabel
                )}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Assigned average OKR rule',
      key: 'rule',
      render: (value, record) => {
        void value;
        const rule = record.assignedRule as OkrRule | null;
        return (
          <span
            id={`okr-assign-average-okr-rule-table-rule-text-${record.userId}`}
            data-cy={`okr-assign-average-okr-rule-table-rule-text-${record.userId}`}
          >
            {rule?.title ?? '—'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (value, record) => {
        void value;
        const rule = record.assignedRule as OkrRule | null;
        const hasRule = Boolean(rule?.id);

        return (
          <div
            className="flex items-center space-x-1"
            id={`okr-assign-average-okr-rule-table-actions-${record.userId}`}
            data-cy={`okr-assign-average-okr-rule-table-actions-${record.userId}`}
          >
            <AccessGuard
              data-cy="okr-assign-average-okr-rule-table-edit-access-guard"
              permissions={[Permissions.UpdateOkrRule]}
            >
              <button
                type="button"
                disabled={!hasRule}
                className="bg-[#2F78EE] font-bold text-white rounded px-2 py-1 text-xs disabled:opacity-40"
                onClick={() => rule && handleEdit(record.userId, rule)}
                id={`okr-assign-average-okr-rule-table-edit-button-${record.userId}`}
                data-cy={`okr-assign-average-okr-rule-table-edit-button-${record.userId}`}
              >
                <MdModeEditOutline
                  id={`okr-assign-average-okr-rule-table-edit-icon-${record.userId}`}
                  data-cy={`okr-assign-average-okr-rule-table-edit-icon-${record.userId}`}
                />
              </button>
            </AccessGuard>
            <AccessGuard
              data-cy="okr-assign-average-okr-rule-table-delete-access-guard"
              permissions={[Permissions.DeleteOkrRule]}
            >
              <Popconfirm
                title="Remove this OKR rule assignment from the employee?"
                onConfirm={() => handleRemove(record.userId)}
                okText="Yes"
                cancelText="No"
                id={`okr-assign-average-okr-rule-table-delete-popconfirm-${record.userId}`}
                data-cy={`okr-assign-average-okr-rule-table-delete-popconfirm-${record.userId}`}
              >
                <button
                  type="button"
                  disabled={!hasRule}
                  className="bg-red-600 font-bold text-white rounded px-2 py-1 text-xs disabled:opacity-40"
                  id={`okr-assign-average-okr-rule-table-delete-button-${record.userId}`}
                  data-cy={`okr-assign-average-okr-rule-table-delete-button-${record.userId}`}
                >
                  <MdDeleteForever
                    id={`okr-assign-average-okr-rule-table-delete-icon-${record.userId}`}
                    data-cy={`okr-assign-average-okr-rule-table-delete-icon-${record.userId}`}
                  />
                </button>
              </Popconfirm>
            </AccessGuard>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl shadow-md bg-white h-full"
      id="okr-assign-average-okr-rule-container"
      data-cy="okr-assign-average-okr-rule-container"
    >
      <div
        className="flex justify-between mb-4"
        id="okr-assign-average-okr-rule-header"
        data-cy="okr-assign-average-okr-rule-header"
      >
        <h2
          className="text-lg font-semibold"
          id="okr-assign-average-okr-rule-title"
          data-cy="okr-assign-average-okr-rule-title"
        >
          OKR rule assignment
        </h2>
      </div>

      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4"
        id="okr-assign-average-okr-rule-filters"
        data-cy="okr-assign-average-okr-rule-filters"
      >
        <Form.Item
          name="filterUserId"
          id="okr-assign-average-okr-rule-filter-form-item"
          data-cy="okr-assign-average-okr-rule-filter-form-item"
          className="mb-0"
        >
          <Select
            placeholder="Filter by department lead"
            showSearch
            className="w-60 sm:w-80 h-10"
            allowClear
            optionFilterProp="label"
            onChange={(value: string | undefined) => {
              setFilterUserId(value ?? null);
              setPage(1);
            }}
            options={activeDepartmentLeads.map((list: any) => ({
              value: list?.id,
              label:
                list.firstName + ' ' + list.middleName + ' ' + list.lastName,
            }))}
            loading={employeeDataLoading}
            id="okr-assign-average-okr-rule-user-filter"
            data-cy="okr-assign-average-okr-rule-user-filter"
          />
        </Form.Item>

        <AccessGuard
          data-cy="okr-assign-average-okr-rule-assign-button-access-guard"
          permissions={[Permissions.UpdateOkrRule]}
        >
          <Button
            icon={
              <FaPlus data-cy="okr-assign-average-okr-rule-assign-button-icon" />
            }
            onClick={showDrawer}
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 h-10"
            type="primary"
            id="okr-assign-average-okr-rule-assign-button"
            data-cy="okr-assign-average-okr-rule-assign-button"
          >
            <span
              className="hidden sm:inline"
              id="okr-assign-average-okr-rule-assign-button-label"
              data-cy="okr-assign-average-okr-rule-assign-button-label"
            >
              Assign rule
            </span>
          </Button>
        </AccessGuard>
      </div>

      <div
        className="overflow-x-auto scrollbar-none w-full"
        id="okr-assign-average-okr-rule-table-wrapper"
        data-cy="okr-assign-average-okr-rule-table-wrapper"
      >
        <Table
          loading={
            employeeDataLoading || userRuleQueries.some((q) => q.isLoading)
          }
          dataSource={dataSource}
          columns={columns}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              if (ps) setPageSize(ps);
            },
          }}
          id="okr-assign-average-okr-rule-table"
          data-cy="okr-assign-average-okr-rule-table"
        />
      </div>

      <AssignAverageOkrRuleDrawer
        open={open}
        onClose={onCloseDrawer}
        data-cy="okr-assign-average-okr-rule-drawer-wrapper"
      />
    </div>
  );
};

export default AssignAverageOkrRulePage;
