'use client';
import React, { useState } from 'react';
import { Avatar, Button, Card, Empty, Modal, Table, Tabs, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import type { CriticalRole } from '../criticalRoleModal';
import { roleRequiredEducationLabel } from '../criticalRoleModal';
import {
  CompetencyEvaluation,
  EvaluatorPicker,
  scoreAchievementPercent,
  sumWeightedScores,
} from '../steps/stepEvaluatorAssignment';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import { EVALUATOR_AVATAR_COLOR, PersonIdentity } from '../personRoleChrome';
import { getScoreBadgeClass } from '../hierarchyRows';
import { importanceColor, readinessColor } from '../tagColors';
import SuccessorAssessmentModal, {
  SuccessorAssessmentValues,
} from '../successorAssessmentModal';
import SuccessorGapsPanel from '../successorGapsPanel';
import DevelopmentActionsPanel from '../developmentActionsPanel';
import IdpPanel from '../idpPanel';
import type { GapStatus } from '../successionTypes';
import {
  deriveReadinessFromExperienceGap,
  formatExperienceReadinessHint,
} from '../successionTypes';
import { useSuccessorWrites } from '@/store/server/features/employees/successionPlanning/useSuccessorWrites';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  educationMatchTagColor,
  experienceMatchTagColor,
  formatEducationLabel,
  formatYearsLabel,
  isRelatedEducationAcceptance,
  matchesEducationRequirement,
  matchesExperienceRequirement,
  matchesPositionRequirement,
  positionMatchTagColor,
} from '../educationCatalog';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

type RoleSuccessor = CriticalRole['successors'][number];

interface SuccessorSummaryCardProps {
  successor: RoleSuccessor;
  onOpen: () => void;
}

/** Compact person card — same chrome as elsewhere (border, PersonIdentity, tags). */
export const SuccessorSummaryCard: React.FC<SuccessorSummaryCardProps> = ({
  successor,
  onOpen,
}) => {
  const evaluations = successor.competencyEvaluations ?? [];
  const openGaps = (successor.gaps ?? []).filter(
    (g) => g.status !== 'Closed',
  ).length;
  const totalWeight =
    evaluations.reduce((sum, e) => sum + Number(e.weight ?? 0), 0) || 100;
  const totalScore = sumWeightedScores(evaluations);
  const evaluatedCount = evaluations.filter(
    (e) => e.status === 'Evaluated' && e.score != null,
  ).length;

  return (
    <Card
      hoverable
      bordered={false}
      className="rounded-lg border border-[#D9D9D9] bg-white h-full cursor-pointer shadow-none hover:border-primary"
      styles={{ body: { padding: 16 } }}
      onClick={onOpen}
      data-cy={`cr-detail-successor-card-${successor.id}`}
    >
      <div className="flex flex-col gap-3 h-full">
        <PersonIdentity
          role="Successor"
          name={successor.name}
          caption={`${successor.currentPosition ?? successor.jobTitle} · ${successor.department}`}
          avatarSize={40}
          trailing={
            openGaps > 0 ? (
              <Tag className="m-0" color="orange">
                {openGaps} open gap{openGaps === 1 ? '' : 's'}
              </Tag>
            ) : (
              <Tag className="m-0" color="green">
                No open gaps
              </Tag>
            )
          }
        />

        {successor.readiness ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag
              color={readinessColor[successor.readiness]}
              className="m-0"
              data-cy={`successor-readiness-${successor.id}`}
            >
              {successor.readiness}
            </Tag>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#F0F0F0]">
          <div>
            <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">
              Score
            </p>
            <p className="text-sm font-normal text-[#4d4d4d] m-0 tabular-nums">
              {evaluations.length > 0 ? `${totalScore} / ${totalWeight}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#bababa] font-normal m-0 mb-0.5">
              Evaluated
            </p>
            <p className="text-sm font-normal text-[#4d4d4d] m-0 tabular-nums">
              {evaluations.length > 0
                ? `${evaluatedCount}/${evaluations.length}`
                : '—'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-auto self-start inline-flex items-center gap-1 text-sm font-medium !text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
          style={{ color: '#3636F0' }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          data-cy={`view-successor-details-${successor.id}`}
        >
          View details
          <ArrowForwardOutlinedIcon
            style={{ fontSize: 16, color: '#3636F0' }}
          />
        </button>
      </div>
    </Card>
  );
};

interface SuccessorDetailPanelProps {
  role: CriticalRole;
  successor: RoleSuccessor;
  onEvaluatorChange: (
    evaluation: CompetencyEvaluation,
    evaluatorId: string | undefined,
  ) => void;
  onManageCompetencies: () => void;
  /** Initial drawer tab key */
  initialTab?: string;
}

/** Full successor workspace (Assessment / Competencies / Gaps / Actions / IDP). */
export const SuccessorDetailPanel: React.FC<SuccessorDetailPanelProps> = ({
  role,
  successor,
  onEvaluatorChange,
  onManageCompetencies,
  initialTab = 'assessment',
}) => {
  // Writes go straight to the succession-planning API; the roles query is
  // invalidated on success, which refreshes this panel through the store.
  const {
    updateProfile,
    setEducationRelated,
    recalculateGaps,
    updateGapStatus,
    addAction,
    updateAction,
    deleteAction,
    upsertPlan,
    addActivity,
    updateActivity,
  } = useSuccessorWrites(successor.id);
  const { employees } = useSuccessionOrgData();

  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<CompetencyEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionCreateKey, setActionCreateKey] = useState(0);
  const [idpPlanKey, setIdpPlanKey] = useState(0);
  const [idpActivityKey, setIdpActivityKey] = useState(0);
  useAuthenticationStore((state) => state.userData);
  const canUpdateCriticalRole = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateCriticalRole],
  });
  const canManageSuccessorDevelopment = AccessGuard.checkAccess({
    permissions: [Permissions.ManageSuccessorDevelopment],
  });

  const hasCompetencies = (role.competencies?.length ?? 0) > 0;
  const tabBtnClass = 'h-8 font-normal';

  const tabBarExtra = (() => {
    if (activeTab === 'assessment' && canManageSuccessorDevelopment) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlinedIcon style={{ fontSize: 16 }} />}
          onClick={() => {
            if (canManageSuccessorDevelopment) setAssessmentOpen(true);
          }}
          className={tabBtnClass}
          data-cy={`edit-assessment-${successor.id}`}
        >
          Edit assessment
        </Button>
      );
    }
    if (activeTab === 'competencies' && canUpdateCriticalRole) {
      return (
        <Button
          type="primary"
          size="small"
          icon={
            hasCompetencies ? (
              <EditOutlinedIcon style={{ fontSize: 16 }} />
            ) : (
              <AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />
            )
          }
          onClick={() => {
            if (canUpdateCriticalRole) onManageCompetencies();
          }}
          className={tabBtnClass}
          data-cy={`manage-competencies-${successor.id}`}
        >
          {hasCompetencies ? 'Manage Competencies' : 'Add Competencies'}
        </Button>
      );
    }
    if (activeTab === 'gaps' && canManageSuccessorDevelopment) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<RefreshOutlinedIcon style={{ fontSize: 16 }} />}
          onClick={() => {
            if (canManageSuccessorDevelopment) void recalculateGaps();
          }}
          className={tabBtnClass}
          data-cy={`recalculate-gaps-tab-${successor.id}`}
        >
          Recalculate gaps
        </Button>
      );
    }
    if (activeTab === 'actions' && canManageSuccessorDevelopment) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
          onClick={() => {
            if (canManageSuccessorDevelopment) {
              setActionCreateKey((key) => key + 1);
            }
          }}
          className={tabBtnClass}
          data-cy={`add-development-action-tab-${successor.id}`}
        >
          Add action
        </Button>
      );
    }
    if (activeTab === 'idp' && canManageSuccessorDevelopment) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={() => {
              if (canManageSuccessorDevelopment) {
                setIdpPlanKey((key) => key + 1);
              }
            }}
            className={tabBtnClass}
            data-cy={`edit-idp-plan-tab-${successor.id}`}
          >
            {successor.idp ? 'Edit status' : 'Create IDP'}
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={() => {
              if (canManageSuccessorDevelopment) {
                setIdpActivityKey((key) => key + 1);
              }
            }}
            className={tabBtnClass}
            data-cy={`add-idp-activity-tab-${successor.id}`}
          >
            Add activity
          </Button>
        </div>
      );
    }
    return null;
  })();

  const evaluations = successor.competencyEvaluations ?? [];
  const gaps = successor.gaps ?? [];
  const actions = successor.developmentActions ?? [];
  const openGaps = gaps.filter((g) => g.status !== 'Closed').length;
  // Exclude the successor themselves from their own evaluator list.
  const evaluatorOptions = employees.filter(
    (e) => e.id !== successor.userId && e.id !== successor.id,
  );
  const evaluatedCount = evaluations.filter(
    (e) => e.status === 'Evaluated' && e.score != null,
  ).length;

  const educationMatchOptions = {
    allowRelated: Boolean(
      role.allowRelatedEducationFields &&
      role.requiredEducationField &&
      role.requiredEducationField !== 'Any',
    ),
    relatedAccepted: Boolean(successor.educationRelatedAccepted),
  };
  const educationMatch = matchesEducationRequirement(
    {
      level: role.requiredEducationLevel,
      field: role.requiredEducationField ?? 'Any',
    },
    {
      level: successor.educationLevel,
      field: successor.educationField,
    },
    educationMatchOptions,
  );
  const educationRelatedMarked = isRelatedEducationAcceptance(
    {
      level: role.requiredEducationLevel,
      field: role.requiredEducationField ?? 'Any',
    },
    {
      level: successor.educationLevel,
      field: successor.educationField,
    },
    educationMatchOptions,
  );
  const experienceMatch = matchesExperienceRequirement(
    role.requiredRelevantExperience,
    successor.relevantExperience,
  );
  const experienceReadinessHint = formatExperienceReadinessHint(
    role.requiredRelevantExperience,
    successor.relevantExperience,
  );
  const experienceDerivedReadiness = deriveReadinessFromExperienceGap(
    role.requiredRelevantExperience,
    successor.relevantExperience,
  );
  const positionMatch = matchesPositionRequirement(
    role.requiredCurrentPositionIds,
    successor.currentPositionId,
    role.requiredCurrentPositions,
    successor.currentPosition ?? successor.jobTitle,
  );
  const successorEducationLabel =
    successor.education ||
    formatEducationLabel(successor.educationLevel, successor.educationField);

  const handleAssessmentSave = async (values: SuccessorAssessmentValues) => {
    if (!canManageSuccessorDevelopment) return;

    await updateProfile(values);
    setAssessmentOpen(false);
    NotificationMessage.success({
      message: 'Assessment updated',
      description: `${successor.name}'s succession assessment has been saved.`,
    });
  };

  const competencyColumns: TableColumnsType<CompetencyEvaluation> = [
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Criteria</span>,
      key: 'name',
      render: (_: unknown, record) => (
        <button
          type="button"
          className="text-left group min-w-0"
          onClick={() => setSelectedEvaluation(record)}
        >
          <div className="text-sm font-medium text-primary group-hover:underline truncate">
            {record.competencyName}
          </div>
          {record.category ? (
            <div className="text-xs text-gray-400">{record.category}</div>
          ) : null}
        </button>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Weight</span>,
      key: 'weight',
      width: 90,
      render: (_: unknown, record) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {record.weight != null ? `${record.weight}%` : '—'}
        </span>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Result</span>,
      key: 'result',
      width: 120,
      render: (_: unknown, record) => {
        const scored = record.status === 'Evaluated' && record.score != null;
        if (!scored) return <span className="text-sm text-gray-400">—</span>;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded border text-sm font-semibold tabular-nums ${getScoreBadgeClass(
              scoreAchievementPercent(record.score!, record.weight ?? 0),
            )}`}
          >
            {record.score}
            {record.weight != null ? ` / ${record.weight}` : ''}
          </span>
        );
      },
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Evaluator</span>
      ),
      key: 'evaluator',
      width: 220,
      render: (_: unknown, record) => {
        if (!canUpdateCriticalRole) {
          const evaluatorName =
            record.evaluatorName ||
            employees.find((e) => e.id === record.evaluatorId)?.name;

          return evaluatorName ? (
            <div
              className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg max-w-full"
              data-cy={`readonly-evaluator-${successor.id}-${record.competencyName}`}
            >
              <Avatar
                size={20}
                icon={<UserOutlined />}
                style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
                className="shrink-0"
                data-cy={`readonly-evaluator-avatar-${successor.id}-${record.competencyName}`}
              />
              <span
                className="text-sm text-gray-800 truncate"
                data-cy={`readonly-evaluator-name-${successor.id}-${record.competencyName}`}
              >
                {evaluatorName}
              </span>
            </div>
          ) : (
            <span
              className="text-sm text-gray-400"
              data-cy={`readonly-evaluator-empty-${successor.id}-${record.competencyName}`}
            >
              Not assigned
            </span>
          );
        }

        return (
          <EvaluatorPicker
            value={record.evaluatorId || undefined}
            onChange={(value) => {
              if (canUpdateCriticalRole) onEvaluatorChange(record, value);
            }}
            options={evaluatorOptions}
            dataCy={`cr-detail-evaluator-${successor.id}-${record.competencyName}`}
          />
        );
      },
    },
  ];

  return (
    <div data-cy={`successor-detail-panel-${successor.id}`}>
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarGutter={16}
        tabBarExtraContent={
          tabBarExtra ? (
            <div className="flex items-center py-2">{tabBarExtra}</div>
          ) : null
        }
        className="[&_.ant-tabs-nav]:mb-2 [&_.ant-tabs-nav]:mt-1 [&_.ant-tabs-nav]:min-h-[52px] [&_.ant-tabs-nav]:items-center"
        items={[
          {
            key: 'assessment',
            label: 'Assessment',
            children: (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">
                      Readiness
                    </div>
                    <div className="text-gray-800 font-medium">
                      {successor.readiness || '—'}
                    </div>
                  </div>
                  <div />
                  <div
                    className="sm:col-span-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3"
                    data-cy={`position-match-${successor.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="text-xs text-gray-400">
                        Current position match
                      </div>
                      <Tag
                        color={positionMatchTagColor[positionMatch]}
                        className="m-0"
                      >
                        {positionMatch}
                      </Tag>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Role requirement
                        </div>
                        <div className="text-gray-800 font-medium">
                          {(role.requiredCurrentPositions ?? []).length > 0
                            ? role.requiredCurrentPositions.join(', ')
                            : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Successor position
                        </div>
                        <div className="text-gray-800 font-medium">
                          {successor.currentPosition ||
                            successor.jobTitle ||
                            '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="sm:col-span-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3"
                    data-cy={`education-match-${successor.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="text-xs text-gray-400">
                        Education match
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Tag
                          color={educationMatchTagColor[educationMatch]}
                          className="m-0"
                        >
                          {educationMatch}
                        </Tag>
                        {educationRelatedMarked ? (
                          <Tag color="blue" className="m-0">
                            Related
                          </Tag>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Role requirement
                        </div>
                        <div className="text-gray-800 font-medium">
                          {roleRequiredEducationLabel(role)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Successor background
                        </div>
                        <div className="text-gray-800 font-medium">
                          {successorEducationLabel || '—'}
                        </div>
                      </div>
                    </div>
                    {canManageSuccessorDevelopment &&
                    educationMatchOptions.allowRelated &&
                    educationMatch === 'Field mismatch' ? (
                      <div className="mt-3">
                        <Button
                          type="primary"
                          size="small"
                          className="h-8 font-normal"
                          onClick={() => {
                            if (canManageSuccessorDevelopment) {
                              void setEducationRelated(true);
                            }
                          }}
                          data-cy={`mark-education-related-${successor.id}`}
                        >
                          Mark as related
                        </Button>
                      </div>
                    ) : null}
                    {canManageSuccessorDevelopment && educationRelatedMarked ? (
                      <div className="mt-3">
                        <Button
                          size="small"
                          className="h-8 font-normal border border-[#D9D9D9] text-[#4d4d4d]"
                          onClick={() => {
                            if (canManageSuccessorDevelopment) {
                              void setEducationRelated(false);
                            }
                          }}
                          data-cy={`unmark-education-related-${successor.id}`}
                        >
                          Unmark as related
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className="sm:col-span-2 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3"
                    data-cy={`experience-match-${successor.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="text-xs text-gray-400">
                        Experience match
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Tag
                          color={experienceMatchTagColor[experienceMatch]}
                          className="m-0"
                        >
                          {experienceMatch}
                        </Tag>
                        {experienceMatch === 'Not matched' &&
                        experienceDerivedReadiness ? (
                          <Tag
                            color={readinessColor[experienceDerivedReadiness]}
                            className="m-0"
                          >
                            {experienceDerivedReadiness}
                          </Tag>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Role requirement
                        </div>
                        <div className="text-gray-800 font-medium">
                          {formatYearsLabel(role.requiredRelevantExperience)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">
                          Successor service years
                        </div>
                        <div className="text-gray-800 font-medium">
                          {formatYearsLabel(successor.relevantExperience)}
                        </div>
                      </div>
                    </div>
                    {experienceReadinessHint ? (
                      <div className="text-xs text-gray-500 mt-2">
                        {experienceReadinessHint}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'competencies',
            label: 'Competencies',
            children:
              evaluations.length === 0 ? (
                <div className="py-2">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      canUpdateCriticalRole
                        ? 'No competencies defined yet. Use Add Competencies above to define criteria and assign evaluators.'
                        : 'No competencies have been defined for this role.'
                    }
                  />
                </div>
              ) : (
                <div>
                  <Table
                    columns={competencyColumns}
                    dataSource={evaluations}
                    rowKey={(r) => r.competencyName + '-' + r.category}
                    pagination={false}
                    size="small"
                    rowClassName={(_, index) =>
                      index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                    }
                  />
                  <div className="px-1 py-2 text-xs text-gray-500">
                    {evaluatedCount}/{evaluations.length} criteria evaluated
                  </div>
                </div>
              ),
          },
          {
            key: 'gaps',
            label: `Gaps${openGaps ? ` (${openGaps})` : ''}`,
            children: (
              <div>
                <SuccessorGapsPanel
                  gaps={gaps}
                  actions={actions}
                  hideRecalculateButton
                  onRecalculate={() => {
                    if (!canManageSuccessorDevelopment) return;
                    void recalculateGaps();
                  }}
                  onStatusChange={(gapId, status: GapStatus) => {
                    if (!canManageSuccessorDevelopment) return;
                    void updateGapStatus(gapId, status);
                  }}
                  onAddAction={async (action) => {
                    if (!canManageSuccessorDevelopment) return;
                    await addAction(action);
                    setActiveTab('actions');
                  }}
                />
              </div>
            ),
          },
          {
            key: 'actions',
            label: `Actions${actions.length ? ` (${actions.length})` : ''}`,
            children: (
              <div>
                <DevelopmentActionsPanel
                  actions={actions}
                  gaps={gaps}
                  hideAddButton
                  openCreateKey={actionCreateKey}
                  onAdd={async (action) => {
                    if (!canManageSuccessorDevelopment) return;
                    await addAction(action);
                  }}
                  onUpdate={async (actionId, patch) => {
                    if (!canManageSuccessorDevelopment) return;
                    await updateAction(actionId, patch);
                  }}
                  onDelete={async (actionId) => {
                    if (!canManageSuccessorDevelopment) return;
                    await deleteAction(actionId);
                  }}
                />
              </div>
            ),
          },
          {
            key: 'idp',
            label: 'IDP',
            children: (
              <div>
                <IdpPanel
                  idp={successor.idp}
                  hideToolbarButtons
                  openPlanKey={idpPlanKey}
                  openActivityKey={idpActivityKey}
                  onUpsertPlan={async (plan) => {
                    if (!canManageSuccessorDevelopment) return;
                    await upsertPlan(plan);
                  }}
                  onAddActivity={async (activity) => {
                    if (!canManageSuccessorDevelopment) return;
                    await addActivity(activity);
                  }}
                  onUpdateActivity={async (activityId, patch) => {
                    if (!canManageSuccessorDevelopment) return;
                    await updateActivity(activityId, patch);
                  }}
                />
              </div>
            ),
          },
        ]}
        data-cy={`successor-tabs-${successor.id}`}
      />

      <SuccessorAssessmentModal
        open={assessmentOpen && canManageSuccessorDevelopment}
        successorName={successor.name}
        requiredExperienceYears={role.requiredRelevantExperience}
        initialValues={{
          educationLevel: successor.educationLevel ?? 'Bachelor',
          educationField: successor.educationField ?? 'Other',
          relevantExperience: successor.relevantExperience ?? 0,
          currentPositionId: successor.currentPositionId ?? '',
          readiness: successor.readiness ?? 'Ready within 1 Year',
        }}
        onClose={() => setAssessmentOpen(false)}
        onSave={handleAssessmentSave}
      />

      <Modal
        open={selectedEvaluation !== null}
        onCancel={() => setSelectedEvaluation(null)}
        footer={
          <Button type="primary" onClick={() => setSelectedEvaluation(null)}>
            Close
          </Button>
        }
        title="Evaluation Details"
        width={520}
        destroyOnClose
      >
        {selectedEvaluation ? (
          <div className="flex flex-col gap-4 pt-1">
            <div>
              <div className="text-xs text-gray-400 mb-1">Successor</div>
              <div className="text-sm font-medium text-gray-800">
                {successor.name}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Criteria</div>
                <div className="text-sm font-medium text-gray-800">
                  {selectedEvaluation.competencyName}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Importance</div>
                <Tag
                  color={importanceColor[selectedEvaluation.importance]}
                  className="m-0"
                >
                  {selectedEvaluation.importance}
                </Tag>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Evaluator</div>
              {selectedEvaluation.evaluatorId ? (
                <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                  <Avatar
                    size={20}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
                  />
                  <span className="text-sm text-gray-800">
                    {selectedEvaluation.evaluatorName || '—'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Not assigned</span>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Rating</div>
              <span className="text-sm font-medium text-gray-800 tabular-nums">
                {selectedEvaluation.rating != null
                  ? `${selectedEvaluation.rating} / 100`
                  : '—'}
              </span>
            </div>
            {selectedEvaluation.comment ? (
              <div>
                <div className="text-xs text-gray-400 mb-1">Feedback</div>
                <p className="text-sm text-gray-700 mb-0 whitespace-pre-wrap">
                  {selectedEvaluation.comment}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

/** @deprecated Prefer SuccessorSummaryCard + SuccessorDetailPanel */
const SuccessorCard = SuccessorSummaryCard;
export default SuccessorCard;
