'use client';
import React, { useState } from 'react';
import { Breadcrumb, Card, Empty, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import type { RoleCompetency } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepCompetencyDefinition';
import type { CompetencyEvaluation } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEvaluatorAssignment';
import { sumWeightedScores } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEmployeeSelection';
import ManageCompetenciesModal from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/manageCompetenciesModal';
import { SuccessorDetailPanel } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successorCard';
import { PersonIdentity } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/personRoleChrome';
import { readinessColor } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/tagColors';
import {
  formatEducationLabel,
  formatYearsLabel,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/educationCatalog';

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">{label}</p>
    <div className="text-sm font-normal text-[#4d4d4d]">{children}</div>
  </div>
);

const SuccessorDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const roleId = String(params?.id ?? '');
  const successorId = String(params?.successorId ?? '');
  const [manageOpen, setManageOpen] = useState(false);

  const role = useSuccessionPlanningStore((s) =>
    s.roles.find((r) => r.id === roleId),
  );
  const updateRole = useSuccessionPlanningStore((s) => s.updateRole);
  const assignCompetencyEvaluator = useSuccessionPlanningStore(
    (s) => s.assignCompetencyEvaluator,
  );

  const successor = role?.successors?.find((s) => s.id === successorId);
  const roleHref = `/employees/succession-planning/${roleId}`;

  if (!role || !successor) {
    return (
      <div
        className="pt-4 pb-8"
        data-cy="successor-detail-not-found"
      >
        <CustomBreadcrumb
          onBack={() =>
            router.push(
              roleId
                ? roleHref
                : '/employees/succession-planning',
            )
          }
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              Successor Not Found
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
          description="This successor could not be found for the selected role."
        />
      </div>
    );
  }

  const evaluations = successor.competencyEvaluations ?? [];
  const totalWeight =
    evaluations.reduce((sum, e) => sum + Number(e.weight ?? 0), 0) || 100;
  const educationLabel =
    successor.education ||
    formatEducationLabel(successor.educationLevel, successor.educationField);

  const handleEvaluatorChange = (
    evaluation: CompetencyEvaluation,
    evaluatorId: string | undefined,
  ) => {
    const evaluator = MOCK_EMPLOYEES.find((e) => e.id === evaluatorId);
    assignCompetencyEvaluator(
      role.id,
      successor.id,
      evaluation.competencyName,
      evaluation.category,
      evaluatorId ?? '',
      evaluator?.name ?? '',
    );
  };

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
    updateRole(role.id, {
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
    });
    NotificationMessage.success({
      message: 'Competencies updated',
      description:
        'Criteria and evaluator assignments have been applied to all successors.',
    });
  };

  return (
    <div
      className="pb-8"
      id="successor-detail-page"
      data-cy="successor-detail-page"
    >
      <div className="flex flex-wrap justify-between items-center pt-4 gap-3">
        <CustomBreadcrumb
          onBack={() => router.push(roleHref)}
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              {successor.name}
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
                    >
                      Succession Planning
                    </Link>
                  ),
                },
                {
                  title: (
                    <Link className="text-gray-600" href={roleHref}>
                      {role.roleName}
                    </Link>
                  ),
                },
                {
                  title: (
                    <span className="text-[#4d4d4d]">{successor.name}</span>
                  ),
                },
              ]}
            />
          }
          data-cy="successor-detail-breadcrumb"
        />
      </div>

      <Card
        className="mb-3 rounded-lg bg-[#F9FAFB]"
        bordered={false}
        styles={{ body: { padding: 16 } }}
        data-cy="successor-detail-header"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <PersonIdentity
            role="Successor"
            name={successor.name}
            caption={`${successor.currentPosition ?? successor.jobTitle} · ${successor.department}`}
            avatarSize={48}
          />
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {successor.readiness ? (
              <Tag
                color={readinessColor[successor.readiness]}
                className="m-0"
                data-cy={`successor-detail-readiness-${successor.id}`}
              >
                {successor.readiness}
              </Tag>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <MetaField label="Role">{role.roleName}</MetaField>
          <MetaField label="Education">
            {educationLabel || '—'}
          </MetaField>
          <MetaField label="Service years">
            {formatYearsLabel(successor.relevantExperience)}
          </MetaField>
          <MetaField label="Score">
            {evaluations.length > 0
              ? `${sumWeightedScores(evaluations)} / ${totalWeight}`
              : '—'}
          </MetaField>
        </div>
      </Card>

      <Card
        bordered={false}
        className="rounded-lg bg-white border border-[#D9D9D9]"
        styles={{ body: { padding: '8px 16px 16px' } }}
      >
        <SuccessorDetailPanel
          roleId={role.id}
          role={role}
          successor={successor}
          onEvaluatorChange={handleEvaluatorChange}
          onManageCompetencies={() => setManageOpen(true)}
        />
      </Card>

      <ManageCompetenciesModal
        open={manageOpen}
        role={role}
        onClose={() => setManageOpen(false)}
        onSave={handleManageSave}
      />
    </div>
  );
};

export default SuccessorDetailPage;
