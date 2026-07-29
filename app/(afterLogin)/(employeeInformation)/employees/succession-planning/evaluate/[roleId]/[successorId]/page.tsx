'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Breadcrumb,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Tag,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { CompetencyImportance } from '../../../_components/steps/stepCompetencyDefinition';
import {
  CompetencyEvaluation,
  ratingFromWeightedScore,
  sumWeightedScores,
  toWeightedScore,
} from '../../../_components/steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '../../../_components/steps/stepEmployeeSelection';

const { TextArea } = Input;

const importanceColor: Record<CompetencyImportance, string> = {
  Required: 'red',
  Preferred: 'blue',
  'Nice to Have': 'default',
};

interface CriterionFormValue {
  competencyName: string;
  category: string;
  importance: CompetencyImportance;
  weight?: number;
  /** Raw 0–100 rating; converted to weighted points on submit */
  rating?: number | null;
  comment?: string;
}

const SuccessionEvaluationPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [form] = Form.useForm<{ criteria: CriterionFormValue[] }>();

  const roleId = String(params?.roleId ?? '');
  const successorId = String(params?.successorId ?? '');
  const evaluatorId = searchParams.get('evaluatorId') ?? '';

  const role = useSuccessionPlanningStore((s) =>
    s.roles.find((r) => r.id === roleId),
  );
  const saveEvaluationScores = useSuccessionPlanningStore(
    (s) => s.saveEvaluationScores,
  );

  const successor = useMemo(
    () => role?.successors?.find((s) => s.id === successorId),
    [role, successorId],
  );

  const evaluator =
    MOCK_EMPLOYEES.find((e) => e.id === evaluatorId) ??
    (successor?.competencyEvaluations?.find(
      (e) => e.evaluatorId === evaluatorId,
    )
      ? {
          id: evaluatorId,
          name:
            successor?.competencyEvaluations?.find(
              (e) => e.evaluatorId === evaluatorId,
            )?.evaluatorName ?? 'Evaluator',
          jobTitle: '',
          department: '',
        }
      : null);

  const assignedCriteria: CompetencyEvaluation[] = useMemo(() => {
    if (!successor?.competencyEvaluations || !evaluatorId) return [];
    return successor.competencyEvaluations.filter(
      (e) => e.evaluatorId === evaluatorId,
    );
  }, [successor, evaluatorId]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      criteria: assignedCriteria.map((c) => ({
        competencyName: c.competencyName,
        category: c.category,
        importance: c.importance,
        weight: c.weight,
        rating:
          c.rating ??
          (c.score != null && c.weight
            ? ratingFromWeightedScore(c.score, c.weight)
            : null),
        comment: c.comment ?? '',
      })),
    });
  }, [assignedCriteria, form]);

  const watchedCriteria =
    Form.useWatch('criteria', form) ?? ([] as CriterionFormValue[]);

  const liveTotal = useMemo(() => {
    const weighted = (watchedCriteria as CriterionFormValue[]).map((c) => ({
      score:
        c?.rating != null
          ? toWeightedScore(Number(c.rating), Number(c.weight ?? 0))
          : 0,
    }));
    return sumWeightedScores(weighted);
  }, [watchedCriteria]);

  const maxSessionWeight = useMemo(
    () =>
      assignedCriteria.reduce((sum, c) => sum + Number(c.weight ?? 0), 0),
    [assignedCriteria],
  );

  const allAlreadyEvaluated =
    assignedCriteria.length > 0 &&
    assignedCriteria.every((c) => c.status === 'Evaluated' && c.score != null);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const scores = (values.criteria ?? []).map((c) => {
        const rating = Number(c.rating);
        const weight = Number(c.weight ?? 0);
        return {
          competencyName: c.competencyName,
          category: c.category,
          rating,
          score: toWeightedScore(rating, weight),
          comment: c.comment?.trim() || undefined,
        };
      });

      saveEvaluationScores(roleId, successorId, evaluatorId, scores);

      NotificationMessage.success({
        message: 'Evaluation submitted',
        description: `Scores for ${successor?.name ?? 'successor'} have been saved.`,
      });

      router.push('/employees/succession-planning?view=evaluators');
    } catch {
      // validation errors shown by antd
    } finally {
      setSubmitting(false);
    }
  };

  if (!role || !successor || !evaluatorId || assignedCriteria.length === 0) {
    return (
      <div
        className="pt-4"
        id="succession-evaluation-not-found"
        data-cy="succession-evaluation-not-found"
      >
        <CustomBreadcrumb
          onBack={() =>
            router.push('/employees/succession-planning?view=evaluators')
          }
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              Evaluation Not Found
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
                  title: (
                    <span className="text-[#4d4d4d]">Not Found</span>
                  ),
                },
              ]}
            />
          }
        />
        <Empty
          className="mt-10"
          description="This evaluation assignment could not be found. Open it from the Evaluators view."
        />
      </div>
    );
  }

  return (
    <div
      className="pt-4 pb-10"
      id="succession-evaluation-page"
      data-cy="succession-evaluation-page"
    >
      <CustomBreadcrumb
        onBack={() =>
          router.push('/employees/succession-planning?view=evaluators')
        }
        title={
          <Typography.Title className="text-xl font-bold text-black !mb-0">
            {allAlreadyEvaluated ? 'Edit Evaluation' : 'Evaluate Successor'}
          </Typography.Title>
        }
        subtitle={
          <Breadcrumb
            className="text-xs sm:text-sm"
            items={[
              {
                title: (
                  <span className="text-gray-500">Employee</span>
                ),
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
                  <span className="text-[#4d4d4d]">Evaluation</span>
                ),
              },
            ]}
          />
        }
      />

      <div
        className="mt-4 rounded-lg border border-[#D9D9D9] bg-white p-4 sm:p-5"
        data-cy="evaluation-context-card"
      >
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1E40AF' }}
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                Successor
              </div>
              <div className="text-sm font-semibold text-gray-800 truncate">
                {successor.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {successor.jobTitle} · {successor.department}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
              Critical Role
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {role.roleName}
            </div>
            <div className="text-xs text-gray-500">{role.department}</div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#64748B' }}
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                Evaluator
              </div>
              <div className="text-sm font-semibold text-gray-800 truncate">
                {evaluator?.name ?? 'Evaluator'}
              </div>
              {evaluator?.jobTitle ? (
                <div className="text-xs text-gray-500 truncate">
                  {evaluator.jobTitle}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4 mb-3" data-cy="evaluation-intro">
        Rate each competency from 0–100.
      </p>

      <Form
        form={form}
        layout="vertical"
        className="flex flex-col gap-3"
        data-cy="evaluation-form"
      >
        <Form.List name="criteria">
          {(fields) => (
            <div className="flex flex-col gap-3">
              {fields.map((field) => {
                const meta = assignedCriteria[field.name];
                const weight = Number(meta?.weight ?? 0);
                const ratingValue = Number(
                  (watchedCriteria as CriterionFormValue[])?.[field.name]
                    ?.rating ?? 0,
                );
                const weightedPreview =
                  (watchedCriteria as CriterionFormValue[])?.[field.name]
                    ?.rating != null
                    ? toWeightedScore(ratingValue, weight)
                    : null;

                return (
                  <div
                    key={field.key}
                    className="rounded-lg border border-[#D9D9D9] bg-white p-4"
                    data-cy={`evaluation-criterion-card-${field.key}`}
                  >
                    <Form.Item name={[field.name, 'competencyName']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'category']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'importance']} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, 'weight']} hidden>
                      <InputNumber />
                    </Form.Item>

                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800">
                          {meta?.competencyName}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {meta?.category}
                          {meta?.weight != null
                            ? ` · Weight ${meta.weight}%`
                            : ''}
                        </div>
                      </div>
                      {meta?.importance ? (
                        <Tag
                          color={importanceColor[meta.importance]}
                          className="m-0"
                        >
                          {meta.importance}
                        </Tag>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[160px_140px_1fr] gap-3 items-start">
                      <Form.Item
                        name={[field.name, 'rating']}
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Rating (0–100)
                          </span>
                        }
                        rules={[
                          { required: true, message: 'Enter a rating' },
                          {
                            type: 'number',
                            min: 0,
                            max: 100,
                            message: 'Rating must be between 0 and 100',
                          },
                        ]}
                        className="mb-0"
                        data-cy={`evaluation-rating-item-${field.key}`}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          className="w-full"
                          placeholder="e.g. 85"
                          data-cy={`evaluation-rating-input-${field.key}`}
                        />
                      </Form.Item>

                      <div className="pt-7" data-cy={`evaluation-weighted-preview-${field.key}`}>
                        <div className="text-xs text-gray-400 mb-1">
                          Weighted result
                        </div>
                        <div className="text-sm font-semibold text-gray-800 tabular-nums">
                          {weightedPreview != null
                            ? `${weightedPreview} / ${weight}`
                            : `— / ${weight}`}
                        </div>
                      </div>

                      <Form.Item
                        name={[field.name, 'comment']}
                        label={
                          <span className="text-sm font-medium text-gray-700">
                            Comments (optional)
                          </span>
                        }
                        className="mb-0"
                        data-cy={`evaluation-comment-item-${field.key}`}
                      >
                        <TextArea
                          rows={2}
                          placeholder="Notes on this competency…"
                          maxLength={500}
                          data-cy={`evaluation-comment-input-${field.key}`}
                        />
                      </Form.Item>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Form.List>

        <div
          className="flex flex-wrap items-center justify-between gap-3 mt-2 rounded-lg border border-[#D9D9D9] bg-[#F8FAFC] px-4 py-3"
          data-cy="evaluation-session-total"
        >
          <span className="text-sm text-gray-600 font-medium">
            Session total (weighted)
          </span>
          <span
            className={`text-base font-bold tabular-nums ${
              liveTotal === maxSessionWeight
                ? 'text-green-700'
                : 'text-gray-800'
            }`}
            data-cy="evaluation-session-total-value"
          >
            {liveTotal} / {maxSessionWeight}
          </span>
        </div>

        <div
          className="flex flex-wrap justify-end gap-2 mt-2"
          data-cy="evaluation-actions"
        >
          <Button
            onClick={() =>
              router.push('/employees/succession-planning?view=evaluators')
            }
            data-cy="evaluation-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            data-cy="evaluation-submit-btn"
          >
            {allAlreadyEvaluated ? 'Update Evaluation' : 'Submit Evaluation'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SuccessionEvaluationPage;
