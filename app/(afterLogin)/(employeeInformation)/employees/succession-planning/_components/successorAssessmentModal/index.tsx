'use client';
import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Modal, Select } from 'antd';
import type { SuccessorReadiness } from '../successionTypes';
import {
  deriveReadinessFromExperienceGap,
  formatExperienceReadinessHint,
} from '../successionTypes';
import type { EducationField, EducationLevel } from '../educationCatalog';
import {
  educationLevelOptions,
  formatEducationLabel,
  formatYearsLabel,
  matchesExperienceRequirement,
} from '../educationCatalog';
import DepartmentPositionSelect from '../departmentPositionSelect';
import EducationFieldSelect from '../educationFieldSelect';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';

export interface SuccessorAssessmentValues {
  educationLevel: EducationLevel;
  educationField: EducationField;
  /** Derived display label kept for reports / legacy display. */
  education: string;
  /** Years of relevant experience from employee record. */
  relevantExperience: number;
  currentPositionId: string;
  currentPosition: string;
  readiness: SuccessorReadiness;
}

interface SuccessorAssessmentModalProps {
  open: boolean;
  successorName: string;
  /** Role required years — readiness is derived from the shortfall. */
  requiredExperienceYears?: number;
  initialValues: Omit<
    SuccessorAssessmentValues,
    'education' | 'currentPosition'
  > & {
    education?: string;
    currentPosition?: string;
  };
  onClose: () => void;
  /** Awaited so the Save button can stay in its loading state. */
  onSave: (values: SuccessorAssessmentValues) => void | Promise<void>;
}

const SuccessorAssessmentModal: React.FC<SuccessorAssessmentModalProps> = ({
  open,
  successorName,
  requiredExperienceYears,
  initialValues,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { positions, resolvePositionTitle } = useSuccessionOrgData();
  const resolvePositionDepartment = (positionId?: string | null) =>
    positions.find((p) => p.id === positionId)?.department;
  const watchedYears = Form.useWatch('relevantExperience', form) as
    | number
    | undefined;

  const readinessHint = formatExperienceReadinessHint(
    requiredExperienceYears,
    watchedYears ?? initialValues.relevantExperience,
  );

  const experienceMatch = matchesExperienceRequirement(
    requiredExperienceYears,
    watchedYears ?? initialValues.relevantExperience,
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        educationLevel: initialValues.educationLevel,
        educationField: initialValues.educationField,
        relevantExperience: initialValues.relevantExperience,
        currentPositionId: initialValues.currentPositionId,
        currentPositionDepartment: resolvePositionDepartment(
          initialValues.currentPositionId,
        ),
        readiness:
          deriveReadinessFromExperienceGap(
            requiredExperienceYears,
            initialValues.relevantExperience,
          ) ?? initialValues.readiness,
      });
    }
  }, [open, initialValues, form, requiredExperienceYears]);

  useEffect(() => {
    if (!open) return;
    const next = deriveReadinessFromExperienceGap(
      requiredExperienceYears,
      watchedYears,
    );
    if (next) {
      form.setFieldValue('readiness', next);
    }
  }, [watchedYears, requiredExperienceYears, form, open]);

  return (
    <Modal
      open={open}
      title={`Edit assessment — ${successorName}`}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={submitting}
      cancelButtonProps={{ disabled: submitting }}
      maskClosable={!submitting}
      destroyOnClose
      data-cy="successor-assessment-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-2"
        onFinish={async (values) => {
          const currentPositionId = values.currentPositionId as string;
          const years = Number(values.relevantExperience ?? 0);
          const readiness =
            deriveReadinessFromExperienceGap(requiredExperienceYears, years) ??
            values.readiness;
          setSubmitting(true);
          try {
            await onSave({
              educationLevel: values.educationLevel,
              educationField: values.educationField,
              relevantExperience: years,
              currentPositionId,
              currentPosition: resolvePositionTitle(currentPositionId) ?? '',
              readiness,
              education: formatEducationLabel(
                values.educationLevel,
                values.educationField,
              ),
            });
          } finally {
            setSubmitting(false);
          }
        }}
        data-cy="successor-assessment-form"
      >
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Current Position
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Fetched from organizational positions (department + position).
          </p>
          <DepartmentPositionSelect
            departmentFieldName="currentPositionDepartment"
            positionFieldName="currentPositionId"
            departmentLabel="Department"
            positionLabel="Position"
            departmentDataCy="assessment-position-department"
            positionDataCy="assessment-position-select"
          />
        </div>
        <Form.Item
          name="educationLevel"
          label="Education level"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            options={educationLevelOptions}
            data-cy="assessment-education-level"
          />
        </Form.Item>
        <Form.Item
          name="educationField"
          label="Field of study"
          rules={[{ required: true, message: 'Required' }]}
        >
          <EducationFieldSelect
            includeAny={false}
            placeholder="Select field of study"
            className="w-full"
            data-cy="assessment-education-field"
          />
        </Form.Item>
        <Form.Item
          name="relevantExperience"
          label="Relevant experience (years)"
          extra={
            requiredExperienceYears != null ? (
              <span className="text-xs text-gray-500">
                Role requires {formatYearsLabel(requiredExperienceYears)}
                {experienceMatch === 'Not matched' && readinessHint
                  ? ` · ${readinessHint}`
                  : ''}
              </span>
            ) : undefined
          }
          rules={[
            { required: true, message: 'Required' },
            { type: 'number', min: 0, message: 'Years must be 0 or greater' },
          ]}
        >
          <InputNumber
            min={0}
            max={50}
            precision={0}
            className="w-full"
            addonAfter="years"
            data-cy="assessment-experience"
          />
        </Form.Item>
        <Form.Item
          name="readiness"
          label="Readiness Status"
          extra={
            <span className="text-xs text-gray-500">
              Calculated from experience shortfall vs the role requirement.
            </span>
          }
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            disabled
            options={[
              { value: 'Ready Now', label: 'Ready Now' },
              {
                value: 'Ready within 6 Months',
                label: 'Ready within 6 Months',
              },
              {
                value: 'Ready within 1 Year',
                label: 'Ready within 1 Year',
              },
              {
                value: 'Ready within 2 Years',
                label: 'Ready within 2 Years',
              },
              {
                value: 'Ready within 3+ Years',
                label: 'Ready within 3+ Years',
              },
            ]}
            data-cy="assessment-readiness"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SuccessorAssessmentModal;
