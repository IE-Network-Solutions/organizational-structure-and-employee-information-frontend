'use client';
import React, { useState } from 'react';
import { Avatar, Button, Card, Modal, Table, Tabs, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import type { CriticalRole } from '../criticalRoleModal';
import { roleRequiredEducationLabel } from '../criticalRoleModal';
import {
  CompetencyEvaluation,
  EvaluatorPicker,
  scoreAchievementPercent,
  sumWeightedScores,
} from '../steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '../steps/stepEmployeeSelection';
import {
  EVALUATOR_AVATAR_COLOR,
  PersonIdentity,
} from '../personRoleChrome';
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
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
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
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {successor.readiness ? (
            <Tag
              color={readinessColor[successor.readiness]}
              className="m-0"
              data-cy={`successor-readiness-${successor.id}`}
            >
              {successor.readiness}
            </Tag>
          ) : null}
          {openGaps > 0 ? (
            <Tag className="m-0" color="orange">
              {openGaps} open gap{openGaps === 1 ? '' : 's'}
            </Tag>
          ) : (
            <Tag className="m-0" color="green">
              No open gaps
            </Tag>
          )}
        </div>

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
  roleId: string;
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
  roleId,
  role,
  successor,
  onEvaluatorChange,
  onManageCompetencies,
  initialTab = 'assessment',
}) => {
  const updateSuccessorProfile = useSuccessionPlanningStore(
    (s) => s.updateSuccessorProfile,
  );
  const setEducationRelatedAccepted = useSuccessionPlanningStore(
    (s) => s.setEducationRelatedAccepted,
  );
  const recomputeGaps = useSuccessionPlanningStore((s) => s.recomputeGaps);
  const updateGap = useSuccessionPlanningStore((s) => s.updateGap);
  const addDevelopmentAction = useSuccessionPlanningStore(
    (s) => s.addDevelopmentAction,
  );
  const updateDevelopmentAction = useSuccessionPlanningStore(
    (s) => s.updateDevelopmentAction,
  );
  const deleteDevelopmentAction = useSuccessionPlanningStore(
    (s) => s.deleteDevelopmentAction,
  );
  const upsertIdp = useSuccessionPlanningStore((s) => s.upsertIdp);
  const addIdpActivity = useSuccessionPlanningStore((s) => s.addIdpActivity);
  const updateIdpActivity = useSuccessionPlanningStore(
    (s) => s.updateIdpActivity,
  );

  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<CompetencyEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  const evaluations = successor.competencyEvaluations ?? [];
  const gaps = successor.gaps ?? [];
  const actions = successor.developmentActions ?? [];
  const openGaps = gaps.filter((g) => g.status !== 'Closed').length;
  const evaluatorOptions = MOCK_EMPLOYEES.filter((e) => e.id !== successor.id);
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

  const handleAssessmentSave = (values: SuccessorAssessmentValues) => {
    updateSuccessorProfile(roleId, successor.id, values);
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
      render: (_: unknown, record) => (
        <EvaluatorPicker
          value={record.evaluatorId || undefined}
          onChange={(value) => onEvaluatorChange(record, value)}
          options={evaluatorOptions}
          dataCy={`cr-detail-evaluator-${successor.id}-${record.competencyName}`}
        />
      ),
    },
  ];

  return (
    <div data-cy={`successor-detail-panel-${successor.id}`}>
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarGutter={16}
        items={[
          {
            key: 'assessment',
            label: 'Assessment',
            children: (
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button
                    size="small"
                    icon={<EditOutlinedIcon style={{ fontSize: 16 }} />}
                    onClick={() => setAssessmentOpen(true)}
                    className="border border-[#D9D9D9] text-[#4d4d4d] font-normal h-8"
                    data-cy={`edit-assessment-${successor.id}`}
                  >
                    Edit assessment
                  </Button>
                </div>
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
                    {educationMatchOptions.allowRelated &&
                    educationMatch === 'Field mismatch' ? (
                      <div className="mt-3">
                        <Button
                          type="primary"
                          size="small"
                          className="h-8 font-normal"
                          onClick={() => {
                            setEducationRelatedAccepted(
                              roleId,
                              successor.id,
                              true,
                            );
                            NotificationMessage.success({
                              message: 'Marked as related field',
                            });
                          }}
                          data-cy={`mark-education-related-${successor.id}`}
                        >
                          Mark as related
                        </Button>
                      </div>
                    ) : null}
                    {educationRelatedMarked ? (
                      <div className="mt-3">
                        <Button
                          size="small"
                          className="h-8 font-normal border border-[#D9D9D9] text-[#4d4d4d]"
                          onClick={() => {
                            setEducationRelatedAccepted(
                              roleId,
                              successor.id,
                              false,
                            );
                            NotificationMessage.success({
                              message: 'Related mark removed',
                            });
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
                            color={
                              readinessColor[experienceDerivedReadiness]
                            }
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
                <div className="py-4 flex flex-col items-start gap-2">
                  <span className="text-sm text-gray-400">
                    No evaluator assignments yet.
                  </span>
                  <Button
                    type="link"
                    className="!px-0"
                    onClick={onManageCompetencies}
                  >
                    Manage competencies
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
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
              <div className="pt-2">
                <SuccessorGapsPanel
                  gaps={gaps}
                  actions={actions}
                  onRecalculate={() => {
                    recomputeGaps(roleId, successor.id);
                    NotificationMessage.success({
                      message: 'Gaps recalculated',
                    });
                  }}
                  onStatusChange={(gapId, status: GapStatus) =>
                    updateGap(roleId, successor.id, gapId, { status })
                  }
                  onAddAction={(action) => {
                    addDevelopmentAction(roleId, successor.id, action);
                    NotificationMessage.success({
                      message:
                        'Development action added — view it under Actions',
                    });
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
              <div className="pt-2">
                <DevelopmentActionsPanel
                  actions={actions}
                  gaps={gaps}
                  onAdd={(action) =>
                    addDevelopmentAction(roleId, successor.id, action)
                  }
                  onUpdate={(actionId, patch) =>
                    updateDevelopmentAction(
                      roleId,
                      successor.id,
                      actionId,
                      patch,
                    )
                  }
                  onDelete={(actionId) =>
                    deleteDevelopmentAction(roleId, successor.id, actionId)
                  }
                />
              </div>
            ),
          },
          {
            key: 'idp',
            label: 'IDP',
            children: (
              <div className="pt-2">
                <IdpPanel
                  idp={successor.idp}
                  onUpsertPlan={(plan) => upsertIdp(roleId, successor.id, plan)}
                  onAddActivity={(activity) =>
                    addIdpActivity(roleId, successor.id, activity)
                  }
                  onUpdateActivity={(activityId, patch) =>
                    updateIdpActivity(
                      roleId,
                      successor.id,
                      activityId,
                      patch,
                    )
                  }
                />
              </div>
            ),
          },
        ]}
        data-cy={`successor-tabs-${successor.id}`}
      />

      <SuccessorAssessmentModal
        open={assessmentOpen}
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
