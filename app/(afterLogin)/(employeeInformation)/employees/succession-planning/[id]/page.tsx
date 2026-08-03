'use client';
import React, { useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  Button,
  Empty,
  Modal,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import {
  CompetencyImportance,
  RoleCompetency,
} from '../_components/steps/stepCompetencyDefinition';
import {
  CompetencyEvaluation,
  EvaluatorPicker,
  scoreAchievementPercent,
  sumWeightedScores,
} from '../_components/steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '../_components/steps/stepEmployeeSelection';
import ManageCompetenciesModal from '../_components/manageCompetenciesModal';
import {
  EVALUATOR_AVATAR_COLOR,
  PersonIdentity,
} from '../_components/personRoleChrome';
import { getScoreBadgeClass } from '../_components/hierarchyRows';
import {
  importanceColor,
  priorityColor,
  riskLevelColor,
} from '../_components/tagColors';

const th = 'text-[#4d4d4d] text-base font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

const CriticalRoleDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');
  const role = useSuccessionPlanningStore((s) =>
    s.roles.find((r) => r.id === id),
  );
  const updateRole = useSuccessionPlanningStore((s) => s.updateRole);
  const assignCompetencyEvaluator = useSuccessionPlanningStore(
    (s) => s.assignCompetencyEvaluator,
  );
  const [manageOpen, setManageOpen] = useState(false);

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
  ) => {
    updateRole(role.id, {
      positionId: role.positionId,
      roleName: role.roleName,
      department: role.department,
      priority: role.priority,
      riskLevel: role.riskLevel,
      notes: role.notes,
      competencies,
      successors,
    });
    NotificationMessage.success({
      message: 'Competencies updated',
      description:
        'Criteria and evaluator assignments have been applied to all successors.',
    });
  };

  const handleEvaluatorChange = (
    successorId: string,
    evaluation: CompetencyEvaluation,
    evaluatorId: string | undefined,
  ) => {
    const evaluator = MOCK_EMPLOYEES.find((e) => e.id === evaluatorId);
    assignCompetencyEvaluator(
      role.id,
      successorId,
      evaluation.competencyName,
      evaluation.category,
      evaluatorId ?? '',
      evaluator?.name ?? '',
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
        <span className={'' + td + ' tabular-nums'}>
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

      <div
        className="rounded-lg border border-[#D9D9D9] p-4 mb-6"
        data-cy="critical-role-detail-overview"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Tag color={priorityColor[role.priority]} className="m-0">
            {role.priority} Priority
          </Tag>
          <Tag color={riskLevelColor[role.riskLevel]} className="m-0">
            {role.riskLevel} Risk
          </Tag>
          <Tag className="m-0">{role.department}</Tag>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Department</div>
            <div className="text-gray-800 font-medium">{role.department}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Competencies</div>
            <div className="text-gray-800 font-medium">
              {role.competencies?.length ?? 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Successors</div>
            <div className="text-gray-800 font-medium">
              {role.successors?.length ?? role.successorCount ?? 0}
            </div>
          </div>
        </div>
        {role.notes ? (
          <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
            <div className="text-xs text-gray-400 mb-1">Notes</div>
            <p className="text-sm text-gray-700 mb-0" data-cy="cr-detail-notes">
              {role.notes}
            </p>
          </div>
        ) : null}
      </div>

      <section className="mb-6" data-cy="critical-role-detail-competencies">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-black mb-0">Competencies</h3>
          <Button
            type={hasCompetencies ? 'default' : 'primary'}
            className={
              hasCompetencies
                ? 'border border-[#D9D9D9] text-[#4d4d4d] font-normal h-8'
                : 'font-normal h-8'
            }
            icon={
              hasCompetencies ? (
                <EditOutlinedIcon style={{ fontSize: 16 }} />
              ) : (
                <AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />
              )
            }
            onClick={() => setManageOpen(true)}
            data-cy="cr-detail-manage-competencies-btn"
          >
            {hasCompetencies ? 'Manage Competencies' : 'Add Competencies'}
          </Button>
        </div>
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
                description="No competencies defined yet. Add competencies and assign evaluators to each successor."
              />
            ),
          }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
          }
          data-cy="cr-detail-competencies-table"
        />
      </section>

      <section data-cy="critical-role-detail-successors">
        <h3 className="text-base font-bold text-black mb-3">Successors</h3>
        {(role.successors?.length ?? 0) === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No successors selected for this role."
            data-cy="cr-detail-successors-empty"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {role.successors.map((successor) => (
              <div
                key={successor.id}
                className="rounded-lg border border-[#D9D9D9] overflow-hidden"
                data-cy={'cr-detail-successor-card-' + successor.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <PersonIdentity
                    role="Successor"
                    name={successor.name}
                    caption={`${successor.jobTitle} · ${successor.department}`}
                    avatarSize={32}
                  />
                  {(successor.competencyEvaluations?.length ?? 0) > 0 ? (
                    <span className="text-sm text-gray-600 tabular-nums">
                      Total{' '}
                      <span className="font-bold text-gray-800">
                        {sumWeightedScores(
                          successor.competencyEvaluations ?? [],
                        )}{' '}
                        /{' '}
                        {(successor.competencyEvaluations ?? []).reduce(
                          (sum, e) => sum + Number(e.weight ?? 0),
                          0,
                        ) || 100}
                      </span>
                    </span>
                  ) : null}
                </div>

                <SuccessorEvaluationsList
                  successorId={successor.id}
                  successorName={successor.name}
                  evaluations={successor.competencyEvaluations ?? []}
                  onEvaluatorChange={(evaluation, evaluatorId) =>
                    handleEvaluatorChange(
                      successor.id,
                      evaluation,
                      evaluatorId,
                    )
                  }
                  onManageCompetencies={() => setManageOpen(true)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <ManageCompetenciesModal
        open={manageOpen}
        role={role}
        onClose={() => setManageOpen(false)}
        onSave={handleManageSave}
      />
    </div>
  );
};

interface SuccessorEvaluationsListProps {
  successorId: string;
  successorName: string;
  evaluations: CompetencyEvaluation[];
  onEvaluatorChange: (
    evaluation: CompetencyEvaluation,
    evaluatorId: string | undefined,
  ) => void;
  onManageCompetencies: () => void;
}

const SuccessorEvaluationsList: React.FC<SuccessorEvaluationsListProps> = ({
  successorId,
  successorName,
  evaluations,
  onEvaluatorChange,
  onManageCompetencies,
}) => {
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<CompetencyEvaluation | null>(null);

  if (evaluations.length === 0) {
    return (
      <div className="px-4 py-4 flex flex-col items-start gap-2">
        <span className="text-sm text-gray-400">
          No evaluator assignments yet. Add competencies to assign them to this
          successor.
        </span>
        <Button
          type="link"
          className="!px-0"
          onClick={onManageCompetencies}
          data-cy={`cr-detail-successor-manage-link-${successorId}`}
        >
          Manage competencies
        </Button>
      </div>
    );
  }

  const evaluatedCount = evaluations.filter(
    (e) => e.status === 'Evaluated' && e.score != null,
  ).length;
  const evaluatorOptions = MOCK_EMPLOYEES.filter((e) => e.id !== successorId);

  const columns: TableColumnsType<CompetencyEvaluation> = [
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Criteria</span>
      ),
      key: 'name',
      render: (_: unknown, record) => (
        <button
          type="button"
          className="text-left group min-w-0"
          onClick={() => setSelectedEvaluation(record)}
          data-cy={`cr-detail-criteria-row-${record.competencyName}`}
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
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Weight</span>
      ),
      key: 'weight',
      width: 90,
      render: (_: unknown, record) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {record.weight != null ? `${record.weight}%` : '—'}
        </span>
      ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Result</span>
      ),
      key: 'result',
      width: 120,
      render: (_: unknown, record) => {
        const scored = record.status === 'Evaluated' && record.score != null;
        if (!scored) {
          return <span className="text-sm text-gray-400">—</span>;
        }
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
          dataCy={`cr-detail-evaluator-${successorId}-${record.competencyName}`}
        />
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={evaluations}
        rowKey={(r) => r.competencyName + '-' + r.category}
        pagination={false}
        size="small"
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy={`cr-detail-successor-criteria-${successorId}`}
      />

      <div
        className="px-4 py-2 border-t border-[#E5E7EB] bg-[#F8FAFC] text-xs text-gray-500"
        data-cy="cr-detail-successor-progress"
      >
        {evaluatedCount}/{evaluations.length} criteria evaluated
      </div>

      <EvaluationFeedbackModal
        open={selectedEvaluation !== null}
        evaluation={selectedEvaluation}
        successorName={successorName}
        onClose={() => setSelectedEvaluation(null)}
      />
    </>
  );
};

interface EvaluationFeedbackModalProps {
  open: boolean;
  evaluation: CompetencyEvaluation | null;
  successorName: string;
  onClose: () => void;
}

const EvaluationFeedbackModal: React.FC<EvaluationFeedbackModalProps> = ({
  open,
  evaluation,
  successorName,
  onClose,
}) => {
  if (!evaluation) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose} data-cy="eval-feedback-close">
          Close
        </Button>
      }
      title="Evaluation Details"
      width={520}
      destroyOnClose
      data-cy="evaluation-feedback-modal"
    >
      <div
        className="flex flex-col gap-4 pt-1"
        data-cy="evaluation-feedback-body"
      >
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Successor
          </div>
          <div className="text-sm font-medium text-gray-800">
            {successorName}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
              Criteria
            </div>
            <div className="text-sm font-medium text-gray-800">
              {evaluation.competencyName}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {evaluation.category}
              {evaluation.weight != null ? ' · ' + evaluation.weight + '%' : ''}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
              Importance
            </div>
            <Tag color={importanceColor[evaluation.importance]} className="m-0">
              {evaluation.importance}
            </Tag>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Evaluator
          </div>
          {evaluation.evaluatorId ? (
            <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
              <Avatar
                size={20}
                icon={<UserOutlined />}
                style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
              />
              <span className="text-sm text-gray-800">
                {evaluation.evaluatorName || '—'}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Not assigned</span>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Rating
          </div>
          {evaluation.rating != null ? (
            <span
              className="text-sm font-medium text-gray-800 tabular-nums"
              data-cy="eval-feedback-rating"
            >
              {evaluation.rating} / 100
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Weighted result
          </div>
          {evaluation.score != null ? (
            <span
              className={
                'inline-flex items-center justify-center min-w-[2.75rem] px-2.5 py-1 rounded border text-base font-semibold tabular-nums ' +
                getScoreBadgeClass(
                  scoreAchievementPercent(
                    evaluation.score,
                    evaluation.weight ?? 0,
                  ),
                )
              }
              data-cy="eval-feedback-score"
            >
              {evaluation.score}
              {evaluation.weight != null ? ' / ' + evaluation.weight : ''}
            </span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Notes
          </div>
          {evaluation.comment?.trim() ? (
            <p
              className="text-sm text-gray-700 mb-0 whitespace-pre-wrap rounded-md border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2"
              data-cy="eval-feedback-notes"
            >
              {evaluation.comment}
            </p>
          ) : (
            <p
              className="text-sm text-gray-400 mb-0"
              data-cy="eval-feedback-notes-empty"
            >
              No notes provided for this competency.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CriticalRoleDetailPage;
