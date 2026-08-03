'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Tag,
} from 'antd';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { CompetencyImportance } from '../steps/stepCompetencyDefinition';
import {
  CompetencyEvaluation,
  ratingFromWeightedScore,
  sumWeightedScores,
  toWeightedScore,
} from '../steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '../steps/stepEmployeeSelection';
import { PersonRoleAvatar, PersonRoleLabel } from '../personRoleChrome';

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
  rating?: number | null;
  comment?: string;
}

export interface EvaluationModalTarget {
  roleId: string;
  successorId: string;
  evaluatorId: string;
}

interface EvaluationModalProps {
  open: boolean;
  target: EvaluationModalTarget | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
  open,
  target,
  onClose,
  onSubmitted,
}) => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm<{ criteria: CriterionFormValue[] }>();
  const [submitting, setSubmitting] = useState(false);

  const role = useSuccessionPlanningStore((s) =>
    target ? s.roles.find((r) => r.id === target.roleId) : undefined,
  );
  const saveEvaluationScores = useSuccessionPlanningStore(
    (s) => s.saveEvaluationScores,
  );

  const successor = useMemo(
    () => role?.successors?.find((s) => s.id === target?.successorId),
    [role, target?.successorId],
  );

  const evaluatorId = target?.evaluatorId ?? '';

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

  useEffect(() => {
    if (!open) return;
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
  }, [assignedCriteria, form, open]);

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
    () => assignedCriteria.reduce((sum, c) => sum + Number(c.weight ?? 0), 0),
    [assignedCriteria],
  );

  const allAlreadyEvaluated =
    assignedCriteria.length > 0 &&
    assignedCriteria.every((c) => c.status === 'Evaluated' && c.score != null);

  const handleSubmit = async () => {
    if (!target) return;
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

      saveEvaluationScores(
        target.roleId,
        target.successorId,
        target.evaluatorId,
        scores,
      );

      NotificationMessage.success({
        message: 'Evaluation submitted',
        description: `Scores for ${successor?.name ?? 'successor'} have been saved.`,
      });

      onSubmitted?.();
      onClose();
    } catch {
      // validation errors shown by antd
    } finally {
      setSubmitting(false);
    }
  };

  const canEvaluate =
    !!role && !!successor && !!evaluatorId && assignedCriteria.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div data-cy="evaluation-modal-header">
          <h2 className="text-xl font-bold text-black mb-0">
            {allAlreadyEvaluated ? 'Edit Evaluation' : 'Evaluate Successor'}
          </h2>
        </div>
      }
      footer={null}
      centered={isMobile}
      width={isMobile ? 'calc(100% - 32px)' : 720}
      destroyOnClose
      zIndex={10003}
      data-cy="evaluation-modal"
    >
      {!canEvaluate ? (
        <Empty
          className="my-6"
          description="This evaluation assignment could not be found."
          data-cy="evaluation-modal-empty"
        />
      ) : (
        <div className="flex flex-col gap-4" data-cy="evaluation-modal-body">
          <div
            className="rounded-lg border border-[#D9D9D9] bg-[#F8FAFC] p-3 sm:p-4"
            data-cy="evaluation-context-card"
          >
            <div className="flex flex-wrap items-start gap-3 min-w-0">
              <PersonRoleAvatar role="Successor" size={40} />
              <div className="min-w-0 flex-1">
                <PersonRoleLabel role="Successor" />
                <div className="text-base font-semibold text-gray-900 truncate">
                  {successor.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {successor.jobTitle} · {successor.department}
                </div>
                <div className="mt-1.5 text-sm text-gray-600">
                  For{' '}
                  <span className="font-semibold text-gray-800">
                    {role.roleName}
                  </span>
                  <span className="text-gray-400"> · {role.department}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Evaluator: {evaluator?.name ?? 'Evaluator'}
                  {evaluator?.jobTitle ? ` · ${evaluator.jobTitle}` : ''}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 -mt-1 mb-0" data-cy="evaluation-intro">
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
                <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
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
                        className="rounded-lg border border-[#D9D9D9] bg-white p-3 sm:p-4"
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

                        <div className="grid grid-cols-1 sm:grid-cols-[140px_120px_1fr] gap-3 items-start">
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

                          <div
                            className="pt-7"
                            data-cy={`evaluation-weighted-preview-${field.key}`}
                          >
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D9D9D9] bg-[#F8FAFC] px-4 py-3"
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
              className="flex flex-wrap justify-end gap-2"
              data-cy="evaluation-actions"
            >
              <Button onClick={onClose} data-cy="evaluation-cancel-btn">
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
      )}
    </Modal>
  );
};

export default EvaluationModal;
