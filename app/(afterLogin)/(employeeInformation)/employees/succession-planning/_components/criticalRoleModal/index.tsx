'use client';
import React, { useEffect, useState } from 'react';
import { Card, Form, Modal, Steps, Button, Popconfirm } from 'antd';
import StepRoleSelection, { MOCK_POSITIONS } from '../steps/stepRoleSelection';
import StepCompetencyDefinition, {
  RoleCompetency,
  sumCompetencyWeights,
} from '../steps/stepCompetencyDefinition';
import StepEmployeeSelection, {
  MOCK_EMPLOYEES,
  SuccessorCandidate,
} from '../steps/stepEmployeeSelection';
import StepEvaluatorAssignment, {
  CompetencyEvaluation,
  evaluationFieldKey,
} from '../steps/stepEvaluatorAssignment';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  competencies: RoleCompetency[];
  successors: Array<
    SuccessorCandidate & {
      competencyEvaluations?: CompetencyEvaluation[];
    }
  >;
}

interface CriticalRoleModalProps {
  open: boolean;
  editingRole: CriticalRole | null;
  onClose: () => void;
  onSave: (values: Omit<CriticalRole, 'id' | 'successorCount'>) => void;
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

/** Build flat evaluationAssignments map from saved successor evaluations */
const buildAssignmentsFromRole = (
  role: CriticalRole,
): Record<string, string> => {
  const map: Record<string, string> = {};
  const competencies = (role.competencies ?? []).filter((c) => c?.name?.trim());

  for (const successor of role.successors ?? []) {
    competencies.forEach((comp, index) => {
      const evaluation = (successor.competencyEvaluations ?? []).find(
        (e) => e.competencyName === comp.name && e.category === comp.category,
      );
      if (evaluation?.evaluatorId) {
        map[evaluationFieldKey(successor.id, index)] = evaluation.evaluatorId;
      }
    });
  }
  return map;
};

// ── Component ─────────────────────────────────────────────────────────────────
const CriticalRoleModal: React.FC<CriticalRoleModalProps> = ({
  open,
  editingRole,
  onClose,
  onSave,
}) => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const isEditing = editingRole !== null;

  useEffect(() => {
    if (open) {
      if (editingRole) {
        form.setFieldsValue({
          ...editingRole,
          competencies: editingRole.competencies?.length
            ? editingRole.competencies
            : [],
          successorIds: (editingRole.successors ?? []).map((s) => s.id),
          evaluationAssignments: buildAssignmentsFromRole(editingRole),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          competencies: [],
          successorIds: [],
          evaluationAssignments: {},
        });
      }
      setCurrent(0);
    }
  }, [open, editingRole, form]);

  const positionId: string | null =
    Form.useWatch('positionId', form) ??
    form.getFieldValue('positionId') ??
    null;

  const watchedCompetencies: RoleCompetency[] =
    Form.useWatch('competencies', form) ?? [];
  const hasNamedCompetencies = watchedCompetencies.some((c) =>
    c?.name?.trim(),
  );

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
      const rawCompetencies: RoleCompetency[] =
        form.getFieldValue('competencies') ?? [];
      const competencies = rawCompetencies.filter((c) => c?.name?.trim());

      // Competencies are optional during initial setup — empty list is allowed.
      if (competencies.length === 0) {
        form.setFieldsValue({ competencies: [] });
        setCurrent(2);
        return;
      }

      try {
        await form.validateFields(['competencies']);
        const totalWeight = sumCompetencyWeights(competencies);
        if (totalWeight !== 100) {
          NotificationMessage.warning({
            message: `Competency weights must total 100. Current sum: ${totalWeight}`,
          });
          return;
        }
        setCurrent(2);
      } catch {
        // antd shows inline errors
      }
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
      const position = MOCK_POSITIONS.find((p) => p.id === values.positionId);
      const priority = (values.priority ??
        'Medium') as CriticalRole['priority'];
      const competencies: RoleCompetency[] = (values.competencies ?? []).filter(
        (c: RoleCompetency | undefined) => c?.name?.trim(),
      );
      if (competencies.length > 0) {
        const totalWeight = sumCompetencyWeights(competencies);
        if (totalWeight !== 100) {
          NotificationMessage.warning({
            message: `Competency weights must total 100. Current sum: ${totalWeight}`,
          });
          return;
        }
      }
      const successorIds: string[] = values.successorIds ?? [];
      const assignments: Record<string, string> =
        values.evaluationAssignments ?? {};

      const successors = MOCK_EMPLOYEES.filter((e) =>
        successorIds.includes(e.id),
      ).map((employee) => {
        const competencyEvaluations: CompetencyEvaluation[] = competencies.map(
          (comp, index) => {
            const fieldKey = evaluationFieldKey(employee.id, index);
            const evaluatorId = assignments[fieldKey] ?? '';
            const evaluator = MOCK_EMPLOYEES.find((e) => e.id === evaluatorId);
            return {
              competencyName: comp.name,
              category: comp.category,
              importance: comp.importance,
              weight: comp.weight,
              evaluatorId,
              evaluatorName: evaluator?.name ?? '',
              status: 'Pending' as const,
            };
          },
        );
        return {
          ...employee,
          competencyEvaluations,
        };
      });

      // DEV NOTE (Succession Planning — Critical Role Modal):
      // After a critical role is successfully created, a notification must be
      // sent to every unique evaluator assigned in step 4 (Assign Evaluators).
      // Collect distinct evaluatorIds from successors[].competencyEvaluations
      // and notify each that they have been assigned to evaluate the named
      // successor(s) against the role's competency criteria.
      // TODO: wire this up when the succession-planning notification API is ready.
      onSave({
        positionId: values.positionId,
        roleName: position?.title ?? '',
        department: position?.department ?? '',
        priority,
        riskLevel: deriveRiskLevel(priority),
        notes: values.notes ?? '',
        competencies,
        successors,
      });
      form.resetFields();
      setCurrent(0);
    } catch {
      // antd shows inline errors
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
            {current === 1
              ? 'Define Competencies (optional)'
              : STEP_LABELS[current]}
          </div>
        </div>
        <Steps
          responsive={false}
          current={current}
          labelPlacement="vertical"
          progressDot
          className="cr-modal-steps px-1 mx-auto max-w-3xl hidden sm:flex"
          items={STEP_LABELS.map((label, index) => ({
            title: index === 1 ? `${label} (optional)` : label,
          }))}
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
              continueLabel={hasNamedCompetencies ? 'Continue' : 'Skip for now'}
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
              <StepEvaluatorAssignment positionId={positionId} />
            </Card>
            <StepNavButtons
              current={current}
              totalSteps={TOTAL_STEPS}
              isEditing={isEditing}
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
  onContinue: () => void;
  onBack: () => void;
}

const StepNavButtons: React.FC<StepNavButtonsProps> = ({
  current,
  totalSteps,
  isEditing,
  continueLabel,
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
