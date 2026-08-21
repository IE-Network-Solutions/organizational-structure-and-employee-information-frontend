'use client';
import React, { useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { useSuccessionPlanningData } from '@/store/server/features/employees/successionPlanning/useSuccessionPlanningData';
import {
  CompetencyImportance,
  RoleCompetency,
} from '../_components/steps/stepCompetencyDefinition';
import ManageCompetenciesModal from '../_components/manageCompetenciesModal';
import { SuccessorSummaryCard } from '../_components/successorCard';
import {
  importanceColor,
  priorityColor,
  riskLevelColor,
} from '../_components/tagColors';
import { roleRequiredEducationLabel } from '../_components/criticalRoleModal';
import { formatYearsLabel } from '../_components/educationCatalog';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const th = 'text-[#4d4d4d] text-base font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">{label}</p>
    <div className="text-sm font-normal text-[#4d4d4d]">{children}</div>
  </div>
);

const parseRoleTab = (value: string | null): 'successors' | 'competencies' =>
  value === 'competencies' ? 'competencies' : 'successors';

const CriticalRoleDetailPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = String(params?.id ?? '');
  const role = useSuccessionPlanningStore((s) =>
    s.roles.find((r) => r.id === id),
  );
  const { saveRole } = useSuccessionPlanningData();
  const [manageOpen, setManageOpen] = useState(false);
  const activeTab = parseRoleTab(searchParams.get('tab'));
  useAuthenticationStore((state) => state.userData);
  const canUpdateCriticalRole = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateCriticalRole],
  });

  if (!role) {
    return (
      <div
        className="pt-4"
        id="critical-role-detail-not-found"
        data-cy="critical-role-detail-not-found"
      >
        <CustomBreadcrumb
          onBack={() => router.push('/employees/succession-planning')}
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              Role Not Found
            </Typography.Title>
          }
          subtitle={
            <Breadcrumb
              className="text-xs sm:text-sm"
              items={[
                {
                  title: (
                    <Link
                      className="text-gray-600"
                      href="/employees/succession-planning"
                    >
                      Succession Planning
                    </Link>
                  ),
                },
                {
                  title: <span className="text-[#4d4d4d]">Not Found</span>,
                },
              ]}
            />
          }
        />
        <Empty
          className="mt-10"
          description="This critical role could not be found."
        />
      </div>
    );
  }

  const handleManageSave = (
    competencies: RoleCompetency[],
    successors: typeof role.successors,
    qualifications?: {
      requiredEducationLevel: typeof role.requiredEducationLevel;
      requiredEducationField: typeof role.requiredEducationField;
      allowRelatedEducationFields?: boolean;
      requiredRelevantExperience: number;
      requiredCurrentPositionIds: string[];
      requiredCurrentPositions: string[];
    },
  ) => {
    if (!canUpdateCriticalRole) return;

    return saveRole(
      {
        positionId: role.positionId,
        roleName: role.roleName,
        department: role.department,
        priority: role.priority,
        riskLevel: role.riskLevel,
        notes: role.notes,
        requiredEducationLevel:
          qualifications?.requiredEducationLevel ?? role.requiredEducationLevel,
        requiredEducationField:
          qualifications?.requiredEducationField ?? role.requiredEducationField,
        allowRelatedEducationFields:
          qualifications?.allowRelatedEducationFields ??
          role.allowRelatedEducationFields,
        requiredRelevantExperience:
          qualifications?.requiredRelevantExperience ??
          role.requiredRelevantExperience,
        requiredCurrentPositionIds:
          qualifications?.requiredCurrentPositionIds ??
          role.requiredCurrentPositionIds,
        requiredCurrentPositions:
          qualifications?.requiredCurrentPositions ??
          role.requiredCurrentPositions,
        competencies,
        successors,
      },
      role.id,
    );
  };

  const competencyColumns: TableColumnsType<
    (typeof role.competencies)[number]
  > = [
    {
      title: <span className={th}>Competency</span>,
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-800">{value}</span>
      ),
    },
    {
      title: <span className={th}>Category</span>,
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (value: string) => <span className={td}>{value}</span>,
    },
    {
      title: <span className={th}>Importance</span>,
      dataIndex: 'importance',
      key: 'importance',
      width: 140,
      render: (value: CompetencyImportance) => (
        <Tag color={importanceColor[value]} className="m-0">
          {value}
        </Tag>
      ),
    },
    {
      title: <span className={th}>Weight</span>,
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (value?: number) => (
        <span className={td + ' tabular-nums'}>
          {value != null ? value + '%' : '—'}
        </span>
      ),
    },
    {
      title: <span className={th}>Description</span>,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value?: string) => (
        <span className="text-sm text-gray-500">{value || '—'}</span>
      ),
    },
  ];

  const hasCompetencies = (role.competencies?.length ?? 0) > 0;
  const successorCount = role.successors?.length ?? role.successorCount ?? 0;

  const openSuccessor = (successorId: string) => {
    router.push(
      `/employees/succession-planning/${role.id}/successors/${successorId}`,
    );
  };

  const tabItems = [
    {
      key: 'successors',
      label: `Successors (${successorCount})`,
      children: (
        <div data-cy="critical-role-detail-successors">
          {(role.successors?.length ?? 0) === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No successors selected for this role."
              data-cy="cr-detail-successors-empty"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {role.successors.map((successor) => (
                <SuccessorSummaryCard
                  key={successor.id}
                  successor={successor}
                  onOpen={() => openSuccessor(successor.id)}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'competencies',
      label: `Competencies (${role.competencies?.length ?? 0})`,
      children: (
        <div data-cy="critical-role-detail-competencies">
          <Card
            bordered={false}
            className="rounded-lg bg-[#F9FAFB]"
            styles={{ body: { padding: 0 } }}
          >
            <Table
              columns={competencyColumns}
              dataSource={role.competencies ?? []}
              rowKey={(r) => r.name + '-' + r.category}
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      canUpdateCriticalRole
                        ? 'No competencies defined yet. Use Add Competencies above to define criteria and assign evaluators.'
                        : 'No competencies have been defined for this role.'
                    }
                  />
                ),
              }}
              rowClassName={(_, index) =>
                index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
              }
              data-cy="cr-detail-competencies-table"
            />
          </Card>
        </div>
      ),
    },
  ];

  const tabBarExtra =
    activeTab === 'competencies' && canUpdateCriticalRole ? (
      <div className="flex items-center py-2">
        <Button
          type="primary"
          size="small"
          className="h-8 font-normal"
          icon={
            hasCompetencies ? (
              <EditOutlinedIcon style={{ fontSize: 16 }} />
            ) : (
              <AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />
            )
          }
          onClick={() => {
            if (canUpdateCriticalRole) setManageOpen(true);
          }}
          data-cy="cr-detail-manage-competencies-btn"
        >
          {hasCompetencies ? 'Manage Competencies' : 'Add Competencies'}
        </Button>
      </div>
    ) : null;

  return (
    <div
      id="critical-role-detail-page"
      data-cy="critical-role-detail-page"
      className="pb-8"
    >
      <div className="flex flex-wrap justify-between items-center pt-4 gap-3">
        <CustomBreadcrumb
          onBack={() => router.push('/employees/succession-planning')}
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              {role.roleName}
            </Typography.Title>
          }
          subtitle={
            <Breadcrumb
              className="text-xs sm:text-sm"
              items={[
                {
                  title: <span className="text-gray-500">Employee</span>,
                },
                {
                  title: (
                    <Link
                      className="text-gray-600"
                      href="/employees/succession-planning"
                      data-cy="cr-detail-breadcrumb-succession"
                    >
                      Succession Planning
                    </Link>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-[#4d4d4d]"
                      data-cy="cr-detail-breadcrumb-current"
                    >
                      {role.roleName}
                    </span>
                  ),
                },
              ]}
            />
          }
          data-cy="critical-role-detail-breadcrumb"
        />
      </div>

      <Card
        className="mb-3 rounded-lg bg-[#F9FAFB] shadow-none"
        bordered={false}
        styles={{ body: { padding: 16 } }}
        data-cy="critical-role-detail-overview"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h5 className="text-sm font-normal text-[#4d4d4d] m-0">
              {role.roleName}
            </h5>
            <p className="text-sm text-[#bababa] font-normal m-0">
              {role.department}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Tag color={priorityColor[role.priority]} className="m-0">
              {role.priority} Priority
            </Tag>
            <Tag color={riskLevelColor[role.riskLevel]} className="m-0">
              {role.riskLevel} Risk
            </Tag>
          </div>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          data-cy="cr-detail-meta-row"
        >
          <MetaField label="Department">{role.department}</MetaField>
          <MetaField label="Competencies">
            {role.competencies?.length ?? 0}
          </MetaField>
          <MetaField label="Successors">{successorCount}</MetaField>
          <MetaField label="Required Experience">
            {formatYearsLabel(role.requiredRelevantExperience)}
          </MetaField>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 mt-4 border-t border-gray-100"
          data-cy="cr-detail-mandatory-qualifications"
        >
          <MetaField label="Required Education">
            <div>
              {roleRequiredEducationLabel(role)}
              {role.allowRelatedEducationFields &&
              role.requiredEducationField &&
              role.requiredEducationField !== 'Any' ? (
                <div className="text-xs text-gray-500 mt-0.5">
                  Related fields allowed
                </div>
              ) : null}
            </div>
          </MetaField>
          <MetaField label="Required Current Positions">
            {(role.requiredCurrentPositions ?? []).length > 0
              ? role.requiredCurrentPositions.join(', ')
              : '—'}
          </MetaField>
        </div>

        {role.notes ? (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <MetaField label="Notes">
              <p className="m-0" data-cy="cr-detail-notes">
                {role.notes}
              </p>
            </MetaField>
          </div>
        ) : null}
      </Card>

      <Tabs
        size="small"
        tabBarGutter={16}
        activeKey={activeTab}
        onChange={(key) => {
          const next = parseRoleTab(key);
          const params = new URLSearchParams(searchParams.toString());
          if (next === 'successors') params.delete('tab');
          else params.set('tab', next);
          const qs = params.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        items={tabItems}
        tabBarExtraContent={tabBarExtra}
        className="[&_.ant-tabs-nav]:mb-2 [&_.ant-tabs-nav]:mt-1 [&_.ant-tabs-nav]:min-h-[52px] [&_.ant-tabs-nav]:items-center"
        data-cy="critical-role-detail-tabs"
      />

      <ManageCompetenciesModal
        open={manageOpen && canUpdateCriticalRole}
        role={role}
        onClose={() => setManageOpen(false)}
        onSave={handleManageSave}
      />
    </div>
  );
};

export default CriticalRoleDetailPage;
