'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Form, Input, InputNumber, Modal, Tag } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { CompetencyImportance } from '../steps/stepCompetencyDefinition';
import {
  CompetencyEvaluation,
  ratingFromWeightedScore,
  sumWeightedScores,
  toWeightedScore,
} from '../steps/stepEvaluatorAssignment';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import { useSuccessorWrites } from '@/store/server/features/employees/successionPlanning/useSuccessorWrites';
import { PersonRoleAvatar, PersonRoleLabel } from '../personRoleChrome';
import { importanceColor } from '../tagColors';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { TextArea } = Input;

interface CriterionFormValue {
  /** Backend criteria id — what the score is posted against. */
  competencyCriteriaId?: string;
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

  // Keep the permission decision reactive after auth hydration/refresh while
  // retaining AccessGuard's owner bypass.
  useAuthenticationStore((state) => state.userData);
  const canSubmitEvaluation = AccessGuard.checkAccess({
    permissions: [Permissions.SubmitSuccessionEvaluation],
  });

  const role = useSuccessionPlanningStore((s) =>
    target ? s.roles.find((r) => r.id === target.roleId) : undefined,
  );
  const { submitEvaluation } = useSuccessorWrites(target?.successorId ?? '');
  const { employees } = useSuccessionOrgData();

  const successor = useMemo(
    () => role?.successors?.find((s) => s.id === target?.successorId),
    [role, target?.successorId],
  );

  const evaluatorId = target?.evaluatorId ?? '';

  const evaluator =
    employees.find((e) => e.id === evaluatorId) ??
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
        competencyCriteriaId: c.competencyCriteriaId,
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

  const watchedCriteriaValue = Form.useWatch('criteria', form);
  const watchedCriteria = useMemo(
    () => watchedCriteriaValue ?? ([] as CriterionFormValue[]),
    [watchedCriteriaValue],
  );

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
    // Defense in depth: the submit button is absent without this permission,
    // but the handler must also reject indirect/programmatic invocation.
    if (!target || !canSubmitEvaluation) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Only the raw rating is sent; the server derives the weighted score so
      // it can never exceed the criterion weight.
      const scores = (values.criteria ?? [])
        .filter(
          (c): c is CriterionFormValue & { competencyCriteriaId: string } =>
            Boolean(c.competencyCriteriaId),
        )
        .map((c) => ({
          competencyCriteriaId: c.competencyCriteriaId,
          rating: Number(c.rating),
          comment: c.comment?.trim() || undefined,
        }));

      if (scores.length === 0) return;

      await submitEvaluation(scores, target.evaluatorId);

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
            {!canSubmitEvaluation
              ? 'Review Evaluation'
              : allAlreadyEvaluated
                ? 'Edit Evaluation'
                : 'Evaluate Successor'}
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
            className="rounded-lg bg-[#F8FAFC] px-3 sm:px-4 py-3 border-b border-[#E5E7EB]"
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

          <p
            className="text-sm text-gray-500 -mt-1 mb-0"
            data-cy="evaluation-intro"
          >
            {canSubmitEvaluation
              ? 'Rate each competency from 0–100.'
              : 'Evaluation scores are read-only.'}
          </p>

          <Form
            form={form}
            layout="vertical"
            className="flex flex-col gap-3"
            data-cy="evaluation-form"
          >
            <Form.List name="criteria">
              {(fields) => (
                <div className="max-h-[45vh] overflow-y-auto divide-y divide-[#F0F0F0] border-y border-[#F0F0F0]">
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
                        className="py-4 first:pt-3"
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

                        {/* Rating and its weighted result share one baseline;
                            comments take the full width beneath. The previous
                            3-column grid padded the middle cell by hand to fake
                            label alignment, which never lined up. */}
                        <div className="flex flex-wrap items-end gap-4">
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
                            className="mb-0 w-[150px]"
                            data-cy={`evaluation-rating-item-${field.key}`}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              disabled={!canSubmitEvaluation}
                              className="w-full h-9"
                              placeholder="e.g. 85"
                              data-cy={`evaluation-rating-input-${field.key}`}
                            />
                          </Form.Item>

                          <div
                            className="flex h-9 items-center gap-2 rounded-md bg-[#F8FAFC] px-3"
                            data-cy={`evaluation-weighted-preview-${field.key}`}
                          >
                            <span className="text-xs text-gray-500">
                              Weighted
                            </span>
                            <span className="text-sm font-semibold text-gray-800 tabular-nums">
                              {weightedPreview != null
                                ? `${weightedPreview} / ${weight}`
                                : `— / ${weight}`}
                            </span>
                          </div>
                        </div>

                        <Form.Item
                          name={[field.name, 'comment']}
                          label={
                            <span className="text-sm font-medium text-gray-700">
                              Comments{' '}
                              <span className="font-normal text-gray-400">
                                (optional)
                              </span>
                            </span>
                          }
                          className="mb-0 mt-3"
                          data-cy={`evaluation-comment-item-${field.key}`}
                        >
                          <TextArea
                            rows={2}
                            disabled={!canSubmitEvaluation}
                            placeholder="Notes on this competency…"
                            maxLength={500}
                            data-cy={`evaluation-comment-input-${field.key}`}
                          />
                        </Form.Item>
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.List>

            <div
              className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] px-4 py-3 rounded-md"
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
                {canSubmitEvaluation ? 'Cancel' : 'Close'}
              </Button>
              {canSubmitEvaluation ? (
                <Button
                  type="primary"
                  loading={submitting}
                  onClick={handleSubmit}
                  data-cy="evaluation-submit-btn"
                >
                  {allAlreadyEvaluated
                    ? 'Update Evaluation'
                    : 'Submit Evaluation'}
                </Button>
              ) : null}
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default EvaluationModal;
