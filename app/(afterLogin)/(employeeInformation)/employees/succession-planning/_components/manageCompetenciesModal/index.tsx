'use client';
import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Popconfirm, Steps } from 'antd';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CriticalRole } from '../criticalRoleModal';
import StepCompetencyDefinition, {
  RoleCompetency,
  sumCompetencyWeights,
} from '../steps/stepCompetencyDefinition';
import StepEvaluatorAssignment, {
  CompetencyEvaluation,
  evaluationFieldKey,
} from '../steps/stepEvaluatorAssignment';
import { MOCK_EMPLOYEES } from '../steps/stepEmployeeSelection';
import {
  MOCK_POSITIONS,
  resolvePositionTitles,
} from '../steps/stepRoleSelection';

interface ManageCompetenciesModalProps {
  open: boolean;
  role: CriticalRole;
  onClose: () => void;
  onSave: (
    competencies: RoleCompetency[],
    successors: CriticalRole['successors'],
    qualifications?: {
      requiredEducationLevel: CriticalRole['requiredEducationLevel'];
      requiredEducationField: CriticalRole['requiredEducationField'];
      allowRelatedEducationFields?: boolean;
      requiredRelevantExperience: CriticalRole['requiredRelevantExperience'];
      requiredCurrentPositionIds: string[];
      requiredCurrentPositions: string[];
    },
  ) => void;
}

const STEP_LABELS = ['Edit Competencies', 'Assign Evaluators'];

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

/** Apply competencies to every successor and attach evaluator assignments. */
export const syncCompetenciesToSuccessors = (
  competencies: RoleCompetency[],
  successors: CriticalRole['successors'],
  assignments: Record<string, string>,
): CriticalRole['successors'] =>
  (successors ?? []).map((successor) => {
    const previous = successor.competencyEvaluations ?? [];
    const competencyEvaluations: CompetencyEvaluation[] = competencies.map(
      (comp, index) => {
        const fieldKey = evaluationFieldKey(successor.id, index);
        const evaluatorId = assignments[fieldKey] ?? '';
        const evaluator = MOCK_EMPLOYEES.find((e) => e.id === evaluatorId);
        const prev = previous.find(
          (e) =>
            e.competencyName === comp.name && e.category === comp.category,
        );
        const sameEvaluator =
          !!evaluatorId && prev?.evaluatorId === evaluatorId;

        return {
          competencyName: comp.name,
          category: comp.category,
          importance: comp.importance,
          weight: comp.weight,
          evaluatorId,
          evaluatorName: evaluator?.name ?? '',
          status: sameEvaluator ? (prev?.status ?? 'Pending') : 'Pending',
          rating: sameEvaluator ? prev?.rating : undefined,
          score: sameEvaluator ? prev?.score : undefined,
          comment: sameEvaluator ? prev?.comment : undefined,
        };
      },
    );
    return { ...successor, competencyEvaluations };
  });

const ManageCompetenciesModal: React.FC<ManageCompetenciesModalProps> = ({
  open,
  role,
  onClose,
  onSave,
}) => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      competencies: role.competencies?.length ? role.competencies : [],
      successorIds: (role.successors ?? []).map((s) => s.id),
      evaluationAssignments: buildAssignmentsFromRole(role),
      requiredEducationLevel: role.requiredEducationLevel,
      requiredEducationField: role.requiredEducationField,
      allowRelatedEducationFields: Boolean(role.allowRelatedEducationFields),
      requiredRelevantExperience: role.requiredRelevantExperience,
      requiredCurrentPositionIds: role.requiredCurrentPositionIds ?? [],
      requiredCurrentDepartment:
        role.requiredCurrentPositionIds?.length === 1
          ? MOCK_POSITIONS.find(
              (p) => p.id === role.requiredCurrentPositionIds[0],
            )?.department
          : undefined,
    });
    setCurrent(0);
  }, [open, role, form]);

  const watchedCompetencies: RoleCompetency[] =
    Form.useWatch('competencies', form) ?? [];
  const hasNamedCompetencies = watchedCompetencies.some((c) =>
    c?.name?.trim(),
  );

  const handleContinue = async () => {
    if (current === 0) {
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

      const raw: RoleCompetency[] = form.getFieldValue('competencies') ?? [];
      const competencies = raw.filter((c) => c?.name?.trim());
      const positionIds: string[] =
        form.getFieldValue('requiredCurrentPositionIds') ?? [];
      const qualificationValues = {
        requiredEducationLevel: form.getFieldValue('requiredEducationLevel'),
        requiredEducationField:
          form.getFieldValue('requiredEducationField') ?? 'Any',
        allowRelatedEducationFields: Boolean(
          form.getFieldValue('allowRelatedEducationFields') &&
            form.getFieldValue('requiredEducationField') &&
            form.getFieldValue('requiredEducationField') !== 'Any',
        ),
        requiredRelevantExperience:
          form.getFieldValue('requiredRelevantExperience') ?? 0,
        requiredCurrentPositionIds: positionIds,
        requiredCurrentPositions: resolvePositionTitles(positionIds),
      };

      if (competencies.length === 0) {
        form.setFieldsValue({ competencies: [] });
        // Still allow advancing to assign step (empty) or save empty
        if ((role.successors ?? []).length === 0) {
          onSave([], role.successors ?? [], qualificationValues);
          onClose();
          return;
        }
        setCurrent(1);
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

        // Remap evaluator assignments when competency list/order changes
        const previousComps = (role.competencies ?? []).filter((c) =>
          c?.name?.trim(),
        );
        const prevAssignments: Record<string, string> =
          form.getFieldValue('evaluationAssignments') ?? {};
        const nextAssignments: Record<string, string> = {};
        for (const successor of role.successors ?? []) {
          competencies.forEach((comp, newIndex) => {
            const oldIndex = previousComps.findIndex(
              (c) => c.name === comp.name && c.category === comp.category,
            );
            if (oldIndex < 0) return;
            const prevKey = evaluationFieldKey(successor.id, oldIndex);
            const nextKey = evaluationFieldKey(successor.id, newIndex);
            if (prevAssignments[prevKey]) {
              nextAssignments[nextKey] = prevAssignments[prevKey];
            }
          });
        }
        form.setFieldsValue({
          competencies,
          evaluationAssignments: nextAssignments,
        });
        setCurrent(1);
      } catch {
        // inline errors
      }
      return;
    }

    try {
      const values = form.getFieldsValue(true);
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

      const assignments: Record<string, string> =
        values.evaluationAssignments ?? {};
      const successors = syncCompetenciesToSuccessors(
        competencies,
        role.successors ?? [],
        assignments,
      );

      onSave(competencies, successors, {
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
      });
      onClose();
    } catch {
      // inline errors
    }
  };

  const handleBack = () => {
    if (current > 0) setCurrent((s) => s - 1);
    else onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrent(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <div data-cy="manage-competencies-modal-header">
          <h2 className="text-xl font-bold text-black mb-1">
            Manage Competencies
          </h2>
          <p className="text-sm text-black font-normal">
            Update criteria for {role.roleName}. Changes apply to all successors;
            assign or change evaluators per successor.
          </p>
        </div>
      }
      footer={null}
      centered={isMobile}
      width={isMobile ? 'calc(100% - 32px)' : 960}
      destroyOnClose
      zIndex={10002}
      data-cy="manage-competencies-modal"
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
            }
          : undefined
      }
    >
      <div className="my-4 sm:my-6" data-cy="manage-competencies-steps">
        <style>{`
          .mc-modal-steps .ant-steps-item-title {
            white-space: nowrap !important;
            font-size: 12px !important;
          }
          .mc-modal-steps .ant-steps-item-process .ant-steps-item-title,
          .mc-modal-steps .ant-steps-item-finish .ant-steps-item-title {
            color: #1e40af !important;
          }
          .mc-modal-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }
        `}</style>
        <div className="sm:hidden text-center mb-2">
          <div className="text-xs text-gray-400 mb-0.5">
            Step {current + 1} of {STEP_LABELS.length}
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
          className="mc-modal-steps px-1 mx-auto max-w-xl hidden sm:flex"
          items={STEP_LABELS.map((label) => ({ title: label }))}
          data-cy="manage-competencies-steps-bar"
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        autoComplete="off"
        data-cy="manage-competencies-form"
      >
        {current === 0 && (
          <>
            <div
              className="mt-2 max-h-[42vh] sm:max-h-[52vh] overflow-y-auto px-1"
              data-cy="manage-competencies-step0"
            >
              <StepCompetencyDefinition positionId={role.positionId} />
            </div>
            <div
              className="w-full flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4"
              data-cy="manage-competencies-nav"
            >
              <Popconfirm
                title="Discard changes?"
                description="Unsaved competency edits will be lost."
                onConfirm={handleCancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="default"
                  block
                  className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal sm:!w-auto"
                  data-cy="manage-competencies-cancel-btn"
                >
                  Cancel
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                block
                className="text-sm font-normal sm:!w-auto"
                onClick={handleContinue}
                data-cy="manage-competencies-continue-btn"
              >
                {hasNamedCompetencies
                  ? 'Continue'
                  : (role.successors?.length ?? 0) > 0
                    ? 'Skip to evaluators'
                    : 'Save'}
              </Button>
            </div>
          </>
        )}

        {current === 1 && (
          <>
            <div
              className="mt-2 max-h-[42vh] sm:max-h-[52vh] overflow-y-auto px-1"
              data-cy="manage-competencies-step1"
            >
              <StepEvaluatorAssignment
                positionId={role.positionId}
                requireEvaluators={false}
              />
            </div>
            <div
              className="w-full flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4"
              data-cy="manage-competencies-nav-step1"
            >
              <Button
                type="default"
                block
                className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal sm:!w-auto"
                onClick={handleBack}
                data-cy="manage-competencies-back-btn"
              >
                Back
              </Button>
              <Button
                type="primary"
                block
                className="text-sm font-normal sm:!w-auto"
                onClick={handleContinue}
                data-cy="manage-competencies-save-btn"
              >
                Save Changes
              </Button>
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ManageCompetenciesModal;
