'use client';
import React, { useEffect, useState } from 'react';
import { Card, Form, Modal, Steps, Button, Popconfirm } from 'antd';
import StepRoleSelection from '../steps/stepRoleSelection';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import StepCompetencyDefinition, {
  RoleCompetency,
  sumCompetencyWeights,
} from '../steps/stepCompetencyDefinition';
import StepEmployeeSelection, {
  SuccessorCandidate,
  successorPersonId,
} from '../steps/stepEmployeeSelection';
import StepEvaluatorAssignment, {
  CompetencyEvaluation,
  evaluationFieldKey,
  buildEvaluationAssignments,
} from '../steps/stepEvaluatorAssignment';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import type {
  CompetencyGap,
  DevelopmentAction,
  IndividualDevelopmentPlan,
} from '../successionTypes';
import { deriveSuccessorGaps } from '../successionTypes';
import type { EducationField, EducationLevel } from '../educationCatalog';
import { formatEducationLabel } from '../educationCatalog';

// ── Public type ───────────────────────────────────────────────────────────────
export interface CriticalRole {
  id: string;
  positionId: string;
  roleName: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium';
  riskLevel: 'High' | 'Medium' | 'Low';
  successorCount: number;
  notes: string;
  /** Role-level mandatory qualifications (wizard step 2). */
  requiredEducationLevel: EducationLevel;
  requiredEducationField: EducationField;
  /**
   * When true, PMs may mark a successor’s non-exact field of study as related
   * on the successor Assessment (free-text acceptance).
   */
  allowRelatedEducationFields?: boolean;
  requiredRelevantExperience: number;
  /** Org position ids for acceptable feeder / current positions. */
  requiredCurrentPositionIds: string[];
  /** Display titles resolved from the org position catalog. */
  requiredCurrentPositions: string[];
  competencies: RoleCompetency[];
  successors: Array<
    SuccessorCandidate & {
      competencyEvaluations?: CompetencyEvaluation[];
      gaps?: CompetencyGap[];
      developmentActions?: DevelopmentAction[];
      idp?: IndividualDevelopmentPlan;
      /** PM accepted this successor’s field as related for the role. */
      educationRelatedAccepted?: boolean;
      /** Snapshot of field when marked related. */
      educationRelatedAcceptedField?: string;
    }
  >;
}

/** Display helper for role education requirement. */
export const roleRequiredEducationLabel = (role: {
  requiredEducationLevel?: EducationLevel;
  requiredEducationField?: EducationField;
}): string =>
  formatEducationLabel(
    role.requiredEducationLevel,
    role.requiredEducationField,
  );

interface CriticalRoleModalProps {
  open: boolean;
  editingRole: CriticalRole | null;
  onClose: () => void;
  /**
   * Awaited before the wizard resets, so the confirm button can stay in its
   * loading state until the API responds.
   */
  onSave: (
    values: Omit<CriticalRole, 'id' | 'successorCount'>,
  ) => void | Promise<void>;
}

const TOTAL_STEPS = 4;
const STEP_LABELS = [
  'Select Role',
  'Define Competencies',
  'Select Successors',
  'Assign Evaluators',
];

const deriveRiskLevel = (
  priority: CriticalRole['priority'],
): CriticalRole['riskLevel'] => {
  if (priority === 'Critical') return 'High';
  if (priority === 'High') return 'Medium';
  return 'Low';
};

// ── Component ─────────────────────────────────────────────────────────────────
const CriticalRoleModal: React.FC<CriticalRoleModalProps> = ({
  open,
  editingRole,
  onClose,
  onSave,
}) => {
  const { isMobile } = useIsMobile();
  const { positions, employees, resolvePositionTitles } =
    useSuccessionOrgData();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = editingRole !== null;

  useEffect(() => {
    if (open) {
      if (editingRole) {
        form.setFieldsValue({
          ...editingRole,
          competencies: editingRole.competencies?.length
            ? editingRole.competencies
            : [],
          successorIds: (editingRole.successors ?? []).map(successorPersonId),
          evaluationAssignments: buildEvaluationAssignments(
            editingRole.successors ?? [],
            editingRole.competencies ?? [],
          ),
          requiredCurrentPositionIds: editingRole.requiredCurrentPositionIds
            ?.length
            ? editingRole.requiredCurrentPositionIds
            : [],
          requiredCurrentDepartment:
            editingRole.requiredCurrentPositionIds?.length === 1
              ? positions.find(
                  (p) => p.id === editingRole.requiredCurrentPositionIds[0],
                )?.department
              : undefined,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          competencies: [],
          successorIds: [],
          evaluationAssignments: {},
          allowRelatedEducationFields: false,
        });
      }
      setCurrent(0);
    }
  }, [open, editingRole, form]);

  const positionId: string | null =
    Form.useWatch('positionId', form) ??
    form.getFieldValue('positionId') ??
    null;

  /**
   * Validate the competency rows, returning them when they are usable and
   * `null` when the user must fix something first.
   *
   * A half-filled row used to be silently dropped by the name filter, which
   * then made the remaining weights fall short of 100 — so a missing *name*
   * surfaced as a *weight* error. Blank names are now reported as blank names.
   */
  const collectCompetencies = async (): Promise<RoleCompetency[] | null> => {
    const rows: RoleCompetency[] = (
      form.getFieldValue('competencies') ?? []
    ).filter(Boolean);

    // Criteria are optional — no rows at all is a valid role.
    if (rows.length === 0) return [];

    if (rows.some((competency) => !competency?.name?.trim())) {
      // Surfaces the inline "Please enter a competency name" on the offending
      // row; the toast explains why the step did not advance.
      await form.validateFields(['competencies']).catch(() => undefined);
      NotificationMessage.warning({
        message: 'Every competency needs a name',
        description:
          'Fill in the missing competency name, or remove the empty row.',
      });
      return null;
    }

    const totalWeight = sumCompetencyWeights(rows);
    if (totalWeight !== 100) {
      NotificationMessage.warning({
        message: `Competency weights must total 100. Current sum: ${totalWeight}`,
      });
      return null;
    }

    return rows;
  };

  const handleContinueClick = async () => {
    if (current === 0) {
      try {
        await form.validateFields(['positionId', 'priority']);
        setCurrent(1);
      } catch {
        // antd shows inline errors
      }
      return;
    }

    if (current === 1) {
      try {
        await form.validateFields([
          'requiredEducationLevel',
          'requiredEducationField',
          'requiredRelevantExperience',
          'requiredCurrentDepartment',
          'requiredCurrentPositionIds',
        ]);
      } catch {
        return;
      }

      const competencies = await collectCompetencies();
      if (competencies === null) return;
      setCurrent(2);
      return;
    }

    if (current === 2) {
      const successorIds: string[] = form.getFieldValue('successorIds') ?? [];
      if (successorIds.length === 0) {
        // Soft nudge — still allow continue if they want empty, but prefer selection
        // Keep as soft: allow continue without forcing. User asked for listing under selected.
      }
      setCurrent(3);
      return;
    }

    // last step — validate evaluator assignments and save
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      const position = positions.find((p) => p.id === values.positionId);
      const priority = (values.priority ??
        'Medium') as CriticalRole['priority'];
      const competencies = await collectCompetencies();
      if (competencies === null) return;
      const successorIds: string[] = values.successorIds ?? [];
      const assignments: Record<string, string> =
        values.evaluationAssignments ?? {};
      const existingByPersonId = new Map(
        (editingRole?.successors ?? []).map((successor) => [
          successorPersonId(successor),
          successor,
        ]),
      );

      const successors = successorIds
        .map((personId) => {
          const employee = employees.find((e) => e.id === personId);
          const existing = existingByPersonId.get(personId);
          const person = employee ?? existing;
          if (!person) return null;

          const competencyEvaluations: CompetencyEvaluation[] =
            competencies.map((comp, index) => {
              const fieldKey = evaluationFieldKey(personId, index);
              const evaluatorId = assignments[fieldKey] ?? '';
              const evaluator = employees.find((e) => e.id === evaluatorId);
              const previous = (existing?.competencyEvaluations ?? []).find(
                (evaluation) =>
                  (comp.id && evaluation.competencyCriteriaId === comp.id) ||
                  (evaluation.competencyName === comp.name &&
                    evaluation.category === comp.category),
              );
              const sameEvaluator =
                !!evaluatorId && previous?.evaluatorId === evaluatorId;
              return {
                competencyCriteriaId: comp.id ?? previous?.competencyCriteriaId,
                competencyName: comp.name,
                category: comp.category,
                importance: comp.importance,
                weight: comp.weight,
                evaluatorId,
                evaluatorName:
                  evaluator?.name ?? previous?.evaluatorName ?? '',
                status: sameEvaluator
                  ? (previous?.status ?? 'Pending')
                  : 'Pending',
                rating: sameEvaluator ? previous?.rating : undefined,
                score: sameEvaluator ? previous?.score : undefined,
                comment: sameEvaluator ? previous?.comment : undefined,
              };
            });
          return {
            ...existing,
            ...person,
            id: existing?.id ?? person.id,
            userId: personId,
            currentPosition: person.currentPosition ?? person.jobTitle,
            education:
              person.education ??
              formatEducationLabel(
                person.educationLevel,
                person.educationField,
              ),
            competencyEvaluations,
            gaps:
              existing?.gaps ??
              deriveSuccessorGaps(
                competencies,
                competencyEvaluations,
                [],
                {
                  level: values.requiredEducationLevel,
                  field: values.requiredEducationField ?? 'Any',
                },
                {
                  level: person.educationLevel,
                  field: person.educationField,
                },
                Number(values.requiredRelevantExperience ?? 0),
                person.relevantExperience,
                {
                  allowRelated: Boolean(
                    values.allowRelatedEducationFields &&
                    values.requiredEducationField &&
                    values.requiredEducationField !== 'Any',
                  ),
                  relatedAccepted: Boolean(existing?.educationRelatedAccepted),
                },
              ),
            developmentActions: existing?.developmentActions ?? [],
            educationRelatedAccepted: Boolean(
              existing?.educationRelatedAccepted,
            ),
          };
        })
        .filter(
          (successor): successor is NonNullable<typeof successor> =>
            successor != null,
        );

      // DEV NOTE (Succession Planning — Critical Role Modal):
      // After a critical role is successfully created, a notification must be
      // sent to every unique evaluator assigned in step 4 (Assign Evaluators).
      // Collect distinct evaluatorIds from successors[].competencyEvaluations
      // and notify each that they have been assigned to evaluate the named
      // successor(s) against the role's competency criteria.
      // TODO: wire this up when the succession-planning notification API is ready.
      // Hold the button in its loading state until the API settles. Resetting
      // before this resolved is what made the wizard snap back to step 1 and
      // look like a second modal had opened.
      setSubmitting(true);
      await onSave({
        positionId: values.positionId,
        roleName: position?.title ?? '',
        department: position?.department ?? '',
        priority,
        riskLevel: deriveRiskLevel(priority),
        notes: values.notes ?? '',
        requiredEducationLevel: values.requiredEducationLevel,
        requiredEducationField: values.requiredEducationField ?? 'Any',
        allowRelatedEducationFields: Boolean(
          values.allowRelatedEducationFields &&
          values.requiredEducationField &&
          values.requiredEducationField !== 'Any',
        ),
        requiredRelevantExperience: Number(
          values.requiredRelevantExperience ?? 0,
        ),
        requiredCurrentPositionIds: values.requiredCurrentPositionIds ?? [],
        requiredCurrentPositions: resolvePositionTitles(
          values.requiredCurrentPositionIds ?? [],
        ),
        competencies,
        successors,
      });
      form.resetFields();
      setCurrent(0);
    } catch {
      // Validation errors render inline; a failed save is reported by the
      // parent's error notification. Either way stay on this step so the user
      // can correct and retry rather than losing their input.
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    if (current > 0) {
      setCurrent((s) => s - 1);
    } else {
      form.resetFields();
      setCurrent(0);
      onClose();
    }
  };

  const handleCancel = () => {
    // Ignore dismissal while a save is in flight, so the wizard cannot be torn
    // down underneath an in-progress request.
    if (submitting) return;
    form.resetFields();
    setCurrent(0);
    onClose();
  };

  const modalTitle = (
    <div data-cy="critical-role-modal-header">
      <h2 className="text-xl font-bold text-black mb-1">
        {isEditing ? 'Edit Critical Role' : 'Add Critical Role'}
      </h2>
      <p className="text-sm text-black font-normal">
        {isEditing
          ? 'Update the role, competencies, successors, and evaluators.'
          : 'Define the role and successors. Competencies and evaluators can be added now or managed later from the role details.'}
      </p>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={modalTitle}
      footer={null}
      centered={isMobile}
      width={isMobile ? 'calc(100% - 32px)' : 960}
      style={
        isMobile
          ? {
              maxWidth: 'calc(100vw - 32px)',
              margin: '0 auto',
              paddingBottom: 0,
            }
          : undefined
      }
      styles={
        isMobile
          ? {
              content: {
                maxHeight: 'calc(100vh - 48px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
              body: {
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'auto',
                paddingTop: 12,
                paddingBottom: 12,
              },
              header: {
                paddingTop: 12,
                paddingBottom: 8,
              },
            }
          : undefined
      }
      className={isMobile ? 'critical-role-modal-mobile' : undefined}
      zIndex={10002}
      data-cy="critical-role-modal"
    >
      <div
        className="my-4 sm:my-6"
        data-cy="critical-role-modal-steps-container"
      >
        <style>{`
          .cr-modal-steps .ant-steps-item-title {
            white-space: nowrap !important;
            font-size: 12px !important;
          }
          .cr-modal-steps .ant-steps-item-process .ant-steps-item-title,
          .cr-modal-steps .ant-steps-item-finish .ant-steps-item-title {
            color: #1e40af !important;
          }
          .cr-modal-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }
        `}</style>
        <div
          className="sm:hidden text-center mb-2"
          data-cy="critical-role-modal-mobile-step"
        >
          <div className="text-xs text-gray-400 mb-0.5">
            Step {current + 1} of {TOTAL_STEPS}
          </div>
          <div className="text-sm font-semibold text-[#1E40AF]">
            {STEP_LABELS[current]}
          </div>
        </div>
        <Steps
          responsive={false}
          current={current}
          labelPlacement="vertical"
          progressDot
          className="cr-modal-steps px-1 mx-auto max-w-3xl hidden sm:flex"
          items={STEP_LABELS.map((label) => ({ title: label }))}
          data-cy="critical-role-modal-steps"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        autoComplete="off"
        style={{ maxWidth: '100%' }}
        initialValues={{
          competencies: [],
          successorIds: [],
          evaluationAssignments: {},
        }}
        data-cy="critical-role-modal-form"
      >
        {current === 0 && (
          <>
            <Card
              bodyStyle={{ padding: 16 }}
              className="mt-2 border border-[#D9D9D9]"
              data-cy="critical-role-modal-card-step0"
            >
              <StepRoleSelection form={form} />
            </Card>
            <StepNavButtons
              current={current}
              totalSteps={TOTAL_STEPS}
              isEditing={isEditing}
              submitting={submitting}
              onContinue={handleContinueClick}
              onBack={handleBackClick}
            />
          </>
        )}

        {current === 1 && (
          <>
            <Card
              bodyStyle={{ padding: 16 }}
              className="mt-2 border border-[#D9D9D9] max-h-[42vh] sm:max-h-[52vh] overflow-y-auto"
              data-cy="critical-role-modal-card-step1"
            >
              <StepCompetencyDefinition positionId={positionId} />
            </Card>
            <StepNavButtons
              current={current}
              totalSteps={TOTAL_STEPS}
              isEditing={isEditing}
              submitting={submitting}
              onContinue={handleContinueClick}
              onBack={handleBackClick}
            />
          </>
        )}

        {current === 2 && (
          <>
            <Card
              bodyStyle={{ padding: 16 }}
              className="mt-2 border border-[#D9D9D9] max-h-[42vh] sm:max-h-[52vh] overflow-y-auto"
              data-cy="critical-role-modal-card-step2"
            >
              <StepEmployeeSelection positionId={positionId} />
            </Card>
            <StepNavButtons
              current={current}
              totalSteps={TOTAL_STEPS}
              isEditing={isEditing}
              submitting={submitting}
              onContinue={handleContinueClick}
              onBack={handleBackClick}
            />
          </>
        )}

        {current === 3 && (
          <>
            <Card
              bodyStyle={{ padding: 16 }}
              className="mt-2 border border-[#D9D9D9] max-h-[42vh] sm:max-h-[52vh] overflow-y-auto"
              data-cy="critical-role-modal-card-step3"
            >
              <StepEvaluatorAssignment
                positionId={positionId}
                nominatedSuccessors={editingRole?.successors ?? []}
              />
            </Card>
            <StepNavButtons
              current={current}
              totalSteps={TOTAL_STEPS}
              isEditing={isEditing}
              submitting={submitting}
              onContinue={handleContinueClick}
              onBack={handleBackClick}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};

interface StepNavButtonsProps {
  current: number;
  totalSteps: number;
  isEditing: boolean;
  continueLabel?: string;
  /** True while the final save is in flight. */
  submitting?: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const StepNavButtons: React.FC<StepNavButtonsProps> = ({
  current,
  totalSteps,
  isEditing,
  continueLabel,
  submitting = false,
  onContinue,
  onBack,
}) => {
  const isLastStep = current === totalSteps - 1;

  return (
    <div
      className="w-full flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4"
      data-cy="critical-role-modal-nav-row"
    >
      <div className="w-full sm:w-auto">
        {current === 0 ? (
          <Popconfirm
            title="Discard changes?"
            description="Any selections will be lost."
            onConfirm={onBack}
            okText="Yes"
            cancelText="No"
            data-cy="critical-role-cancel-popconfirm"
          >
            <Button
              type="default"
              block
              disabled={submitting}
              className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal sm:!w-auto"
              data-cy="critical-role-modal-cancel-btn"
            >
              Cancel
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="default"
            block
            disabled={submitting}
            className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal sm:!w-auto"
            onClick={onBack}
            data-cy="critical-role-modal-back-btn"
          >
            Back
          </Button>
        )}
      </div>

      <Button
        type="primary"
        block
        loading={submitting}
        className="text-sm font-normal sm:!w-auto"
        onClick={onContinue}
        data-cy={
          isLastStep
            ? 'critical-role-modal-confirm-btn'
            : 'critical-role-modal-continue-btn'
        }
      >
        {isLastStep
          ? isEditing
            ? 'Save Changes'
            : 'Confirm & Create'
          : (continueLabel ?? 'Continue')}
      </Button>
    </div>
  );
};

export default CriticalRoleModal;
