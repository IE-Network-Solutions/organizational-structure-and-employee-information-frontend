'use client';
import React, { useEffect, useState } from 'react';
import { Card, Form, Modal, Steps, Button, Popconfirm } from 'antd';
import StepRoleSelection, {
  MOCK_POSITIONS,
} from '../steps/stepRoleSelection';
import StepSubordinateRanking from '../steps/stepSubordinateRanking';

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
}

interface CriticalRoleModalProps {
  open: boolean;
  editingRole: CriticalRole | null;
  onClose: () => void;
  onSave: (values: Omit<CriticalRole, 'id' | 'successorCount'>) => void;
}

const TOTAL_STEPS = 2;
const STEP_LABELS = ['Select Role', 'Review Successors'];

// ── Component ─────────────────────────────────────────────────────────────────
const CriticalRoleModal: React.FC<CriticalRoleModalProps> = ({
  open,
  editingRole,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const isEditing = editingRole !== null;

  // Seed / reset form on open
  useEffect(() => {
    if (open) {
      if (editingRole) {
        form.setFieldsValue(editingRole);
      } else {
        form.resetFields();
      }
      setCurrent(0);
    }
  }, [open, editingRole, form]);

  // Reactive positionId — read directly from form at render time so it's
  // always in sync when step 1 mounts inside the Modal (useWatch can lag on
  // first render inside a Modal due to the deferred mount cycle).
  const positionId: string | null =
    Form.useWatch('positionId', form) ?? form.getFieldValue('positionId') ?? null;

  // ── Navigation ──────────────────────────────────────────────────
  const handleContinueClick = async () => {
    if (current < TOTAL_STEPS - 1) {
      try {
        await form.validateFields(['positionId']);
        setCurrent((s) => s + 1);
      } catch {
        // antd shows inline errors
      }
    } else {
      // last step — build payload and confirm
      const values = form.getFieldsValue(true);
      const position = MOCK_POSITIONS.find((p) => p.id === values.positionId);
      onSave({
        positionId: values.positionId,
        roleName: position?.title ?? '',
        department: position?.department ?? '',
        priority:
          position?.level === 'C-Level'
            ? 'Critical'
            : position?.level === 'VP'
              ? 'High'
              : 'Medium',
        riskLevel:
          position?.level === 'C-Level'
            ? 'High'
            : position?.level === 'VP'
              ? 'Medium'
              : 'Low',
        notes: '',
      });
      form.resetFields();
      setCurrent(0);
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

  // ── Modal title (matches add-employee header style) ─────────────
  const modalTitle = (
    <div data-cy="critical-role-modal-header">
      <h2 className="text-xl font-bold text-black mb-1">
        {isEditing ? 'Edit Critical Role' : 'Add Critical Role'}
      </h2>
      <p className="text-sm text-black font-normal">
        {isEditing
          ? 'Update the position information below.'
          : 'Select a position and review ranked successors.'}
      </p>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={modalTitle}
      footer={null}
      width={902}
      zIndex={10002}
      data-cy="critical-role-modal"
    >
      {/* ── Steps bar — identical CSS scope trick as add-employee ── */}
      <div className="my-6" data-cy="critical-role-modal-steps-container">
        <style>{`
          .cr-modal-steps .ant-steps-item-title {
            white-space: nowrap !important;
          }
          .cr-modal-steps .ant-steps-item-process .ant-steps-item-title,
          .cr-modal-steps .ant-steps-item-finish .ant-steps-item-title {
            color: #1e40af !important;
          }
          .cr-modal-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }
        `}</style>
        <Steps
          responsive={false}
          current={current}
          labelPlacement="vertical"
          progressDot
          className="cr-modal-steps px-4 mx-auto max-w-lg hidden sm:flex"
          items={STEP_LABELS.map((label) => ({ title: label }))}
          data-cy="critical-role-modal-steps"
        />
      </div>

      {/* ── Form wraps both steps so field values persist ──────── */}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        autoComplete="off"
        style={{ maxWidth: '100%' }}
        data-cy="critical-role-modal-form"
      >
        {/* Step 0 — Role selection */}
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

        {/* Step 1 — Subordinate OKR ranking */}
        {current === 1 && (
          <>
            <div
              className="mt-2 max-h-[52vh] overflow-y-auto pr-1"
              data-cy="critical-role-modal-card-step1"
            >
              <StepSubordinateRanking positionId={positionId} />
            </div>
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

// ── Navigation button row — mirrors ButtonContinue from add-employee ──────────
interface StepNavButtonsProps {
  current: number;
  totalSteps: number;
  isEditing: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const StepNavButtons: React.FC<StepNavButtonsProps> = ({
  current,
  totalSteps,
  isEditing,
  onContinue,
  onBack,
}) => {
  const isLastStep = current === totalSteps - 1;

  return (
    <div
      className="w-full flex justify-between items-center gap-2 mt-4"
      data-cy="critical-role-modal-nav-row"
    >
      {/* Left side */}
      <div>
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
              className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal"
              data-cy="critical-role-modal-cancel-btn"
            >
              Cancel
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="default"
            className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal"
            onClick={onBack}
            data-cy="critical-role-modal-back-btn"
          >
            Back
          </Button>
        )}
      </div>

      {/* Right side */}
      <Button
        type="primary"
        className="text-sm font-normal"
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
          : 'Continue'}
      </Button>
    </div>
  );
};

export default CriticalRoleModal;
