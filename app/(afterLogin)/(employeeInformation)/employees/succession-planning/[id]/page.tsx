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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { CompetencyImportance } from '../_components/steps/stepCompetencyDefinition';
import {
  CompetencyEvaluation,
  scoreAchievementPercent,
  sumWeightedScores,
} from '../_components/steps/stepEvaluatorAssignment';
import {
  EVALUATOR_AVATAR_COLOR,
  PersonIdentity,
} from '../_components/personRoleChrome';

const riskTheme: Record<string, StatusBadgeTheme> = {
  High: StatusBadgeTheme.danger,
  Medium: StatusBadgeTheme.warning,
  Low: StatusBadgeTheme.success,
};

const priorityTheme: Record<string, StatusBadgeTheme> = {
  Critical: StatusBadgeTheme.danger,
  High: StatusBadgeTheme.warning,
  Medium: StatusBadgeTheme.secondary,
};

const importanceColor: Record<CompetencyImportance, string> = {
  Required: 'red',
  Preferred: 'blue',
  'Nice to Have': 'default',
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-green-50 border-green-200 text-green-700';
  if (score >= 60) return 'bg-amber-50 border-amber-200 text-amber-700';
  return 'bg-red-50 border-red-200 text-red-700';
};

const th = 'text-[#4d4d4d] text-sm font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

const CriticalRoleDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');
  const role = useSuccessionPlanningStore((s) =>
    s.roles.find((r) => r.id === id),
  );

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

  const competencyColumns: TableColumnsType<(typeof role.competencies)[number]> =
    [
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

  return (
    <div
      id="critical-role-detail-page"
      data-cy="critical-role-detail-page"
      className="pb-8"
    >
      <div className="flex flex-wrap justify-between items-center pt-4">
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
          <StatusBadge theme={priorityTheme[role.priority]}>
            {role.priority} Priority
          </StatusBadge>
          <StatusBadge theme={riskTheme[role.riskLevel]}>
            {role.riskLevel} Risk
          </StatusBadge>
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
        <h3 className="text-base font-bold text-black mb-3">Competencies</h3>
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
                description="No competencies defined for this role."
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
                <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <PersonIdentity
                    role="Successor"
                    name={successor.name}
                    caption={`${successor.jobTitle} · ${successor.department}`}
                    avatarSize={32}
                  />
                </div>

                <SuccessorEvaluationsTable
                  successorName={successor.name}
                  evaluations={successor.competencyEvaluations ?? []}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface SuccessorEvaluationsTableProps {
  successorName: string;
  evaluations: CompetencyEvaluation[];
}

const SuccessorEvaluationsTable: React.FC<SuccessorEvaluationsTableProps> = ({
  successorName,
  evaluations,
}) => {
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<CompetencyEvaluation | null>(null);

  if (evaluations.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400">
        No evaluator assignments yet.
      </div>
    );
  }

  const totalScore = sumWeightedScores(evaluations);
  const totalWeight = evaluations.reduce(
    (sum, e) => sum + Number(e.weight ?? 0),
    0,
  );
  const evaluatedCount = evaluations.filter(
    (e) => e.status === 'Evaluated' && e.score != null,
  ).length;

  const columns: TableColumnsType<CompetencyEvaluation> = [
    {
      title: <span className={th}>Competency</span>,
      dataIndex: 'competencyName',
      key: 'competencyName',
      render: (value: string, record) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800">{value}</div>
          <div className="text-xs text-gray-400">{record.category}</div>
        </div>
      ),
    },
    {
      title: <span className={th}>Importance</span>,
      dataIndex: 'importance',
      key: 'importance',
      width: 120,
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
      width: 90,
      render: (value?: number) => (
        <span className={td + ' tabular-nums'}>
          {value != null ? value + '%' : '—'}
        </span>
      ),
    },
    {
      title: <span className={th}>Evaluator</span>,
      key: 'evaluator',
      render: (_: unknown, record) =>
        record.evaluatorId ? (
          <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
            <Avatar
              size={20}
              icon={<UserOutlined />}
              style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
            />
            <span className="text-sm text-gray-800">
              {record.evaluatorName || '—'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not assigned</span>
        ),
    },
    {
      title: <span className={th}>Result</span>,
      key: 'result',
      width: 130,
      render: (_: unknown, record) => {
        const isEvaluated =
          record.status === 'Evaluated' && record.score != null;
        const weight = Number(record.weight ?? 0);

        if (isEvaluated) {
          const achievement = scoreAchievementPercent(record.score!, weight);
          return (
            <span
              className={
                'inline-flex items-center justify-center px-2 py-0.5 rounded border text-sm font-semibold tabular-nums ' +
                getScoreBadgeClass(achievement)
              }
              data-cy="cr-detail-eval-score"
              title={
                record.rating != null
                  ? 'Rating ' + record.rating + '/100'
                  : undefined
              }
            >
              {record.score}
              {weight > 0 ? ' / ' + weight : ''}
            </span>
          );
        }

        return (
          <span
            className="text-sm text-gray-400 font-medium"
            data-cy="cr-detail-eval-pending"
          >
            Pending
          </span>
        );
      },
    },
    {
      title: <span className={th}>Details</span>,
      key: 'details',
      width: 120,
      render: (_: unknown, record) => {
        const isEvaluated =
          record.status === 'Evaluated' && record.score != null;
        return (
          <Button
            type="link"
            size="small"
            disabled={!isEvaluated}
            icon={<VisibilityOutlinedIcon style={{ fontSize: 16 }} />}
            className="!px-0 inline-flex items-center gap-1"
            onClick={() => setSelectedEvaluation(record)}
            data-cy={'cr-detail-view-feedback-btn-' + record.competencyName}
          >
            View
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={evaluations}
        rowKey={(r) => r.competencyName + '-' + r.evaluatorId}
        pagination={false}
        size="small"
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
      />

      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC]"
        data-cy="cr-detail-successor-total"
      >
        <span className="text-sm text-gray-600">
          Total score
          <span className="text-xs text-gray-400 ml-1">
            ({evaluatedCount}/{evaluations.length} criteria evaluated)
          </span>
        </span>
        <span
          className={
            'text-base font-bold tabular-nums ' +
            (totalScore === totalWeight && totalWeight > 0
              ? 'text-green-700'
              : 'text-gray-800')
          }
          data-cy="cr-detail-successor-total-value"
        >
          {totalScore} / {totalWeight || 100}
        </span>
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
      <div className="flex flex-col gap-4 pt-1" data-cy="evaluation-feedback-body">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
            Successor
          </div>
          <div className="text-sm font-medium text-gray-800">{successorName}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
              Competency
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
            <span className="text-sm font-medium text-gray-800 tabular-nums" data-cy="eval-feedback-rating">
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
