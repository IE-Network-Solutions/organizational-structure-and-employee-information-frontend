'use client';
import React, { useMemo } from 'react';
import { Avatar, Empty, Form, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  RoleCompetency,
  CompetencyImportance,
} from './stepCompetencyDefinition';
import { SuccessorCandidate } from './stepEmployeeSelection';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import { EVALUATOR_AVATAR_COLOR, PersonIdentity } from '../personRoleChrome';

const { Option } = Select;

export interface CompetencyEvaluation {
  /**
   * Backend competency-criteria id. Absent while a role is being built in the
   * wizard (criteria have no ids yet); present on anything loaded from the API,
   * where it addresses the criterion for evaluator assignment and scoring.
   */
  competencyCriteriaId?: string;
  competencyName: string;
  category: RoleCompetency['category'];
  importance: CompetencyImportance;
  weight?: number;
  evaluatorId: string;
  evaluatorName: string;
  /** Whether the evaluator has completed this competency assessment */
  status?: 'Evaluated' | 'Pending';
  /**
   * Weighted result points (0–weight). Derived from rating × weight / 100.
   * Must never exceed the competency weight.
   */
  score?: number;
  /** Raw evaluator rating on a 0–100 scale before weight conversion */
  rating?: number;
  /** Optional notes from the evaluator */
  comment?: string;
}

/** Convert a 0–100 rating into weighted points, capped at the criterion weight. */
export const toWeightedScore = (rating: number, weight = 0): number => {
  const w = Math.max(0, Number(weight) || 0);
  const r = Math.min(100, Math.max(0, Number(rating) || 0));
  return Math.round((r / 100) * w * 10) / 10;
};

/** Recover a 0–100 rating from a stored weighted score (for edit forms). */
export const ratingFromWeightedScore = (score: number, weight = 0): number => {
  const w = Number(weight) || 0;
  if (w <= 0) return 0;
  return Math.round((Number(score) / w) * 100 * 10) / 10;
};

/** Sum weighted criterion scores (prototype total out of 100). */
export const sumWeightedScores = (
  evaluations: Array<{ score?: number } | undefined> | undefined,
): number =>
  Math.round(
    (evaluations ?? []).reduce((sum, e) => sum + Number(e?.score ?? 0), 0) * 10,
  ) / 10;

/** Achievement % of a criterion relative to its weight (for color coding). */
export const scoreAchievementPercent = (score: number, weight = 0): number => {
  const w = Number(weight) || 0;
  if (w <= 0) return 0;
  return Math.min(100, Math.round((Number(score) / w) * 100));
};

/** Stable key for a competency within evaluationAssignments form map */
export const competencyKey = (c: Pick<RoleCompetency, 'name' | 'category'>) =>
  `${c.name.trim()}__${c.category}`;

/** Flat form field key — one evaluator slot per employee × criterion */
export const evaluationFieldKey = (
  employeeId: string,
  competencyIndex: number,
) => `${employeeId}::${competencyIndex}`;

interface StepEvaluatorAssignmentProps {
  positionId: string | null;
  /** When false, evaluator selects are optional (manage-from-details flow). */
  requireEvaluators?: boolean;
}

const StepEvaluatorAssignment: React.FC<StepEvaluatorAssignmentProps> = ({
  positionId,
  requireEvaluators = true,
}) => {
  const form = Form.useFormInstance();

  const successorIds: string[] =
    Form.useWatch('successorIds', form) ??
    form.getFieldValue('successorIds') ??
    [];

  const rawCompetencies: RoleCompetency[] =
    Form.useWatch('competencies', form) ??
    form.getFieldValue('competencies') ??
    [];

  const competencies = useMemo(
    () => rawCompetencies.filter((c) => c?.name?.trim()),
    [rawCompetencies],
  );

  const { employees, positions } = useSuccessionOrgData();

  const selectedEmployees = useMemo(
    () => employees.filter((e) => successorIds.includes(e.id)),
    [employees, successorIds],
  );

  const position = positions.find((p) => p.id === positionId);

  if (selectedEmployees.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span
            className="text-gray-400 text-sm"
            data-cy="step-evaluator-no-successors"
          >
            No successors selected. Go back and select at least one employee.
          </span>
        }
      />
    );
  }

  if (competencies.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span
            className="text-gray-400 text-sm"
            data-cy="step-evaluator-no-competencies"
          >
            No competencies defined yet. You can finish setup now and add
            competencies later from the role details page (with evaluator
            assignment).
          </span>
        }
      />
    );
  }

  return (
    <div
      className="flex flex-col gap-4 pt-2"
      data-cy="step-evaluator-assignment-container"
    >
      <p className="text-sm text-gray-500 -mt-2">
        For each successor below, assign an evaluator for{' '}
        <span className="font-medium text-gray-700">each competency</span>
        {position ? (
          <>
            {' '}
            of{' '}
            <span className="font-semibold text-gray-700">
              {position.title}
            </span>
          </>
        ) : null}
        . You can pick a different evaluator for every criterion.
      </p>

      <div
        className="rounded-lg border border-[#D9D9D9] overflow-hidden divide-y divide-[#E5E7EB]"
        data-cy="step-evaluator-employee-list"
      >
        {selectedEmployees.map((employee) => (
          <EmployeeEvaluationCard
            key={employee.id}
            employee={employee}
            competencies={competencies}
            requireEvaluators={requireEvaluators}
          />
        ))}
      </div>
    </div>
  );
};

interface EmployeeEvaluationCardProps {
  employee: SuccessorCandidate;
  competencies: RoleCompetency[];
  requireEvaluators?: boolean;
}

const EmployeeEvaluationCard: React.FC<EmployeeEvaluationCardProps> = ({
  employee,
  competencies,
  requireEvaluators = true,
}) => {
  const { employees } = useSuccessionOrgData();
  // Anyone but the successor themselves can evaluate them.
  const evaluatorOptions = employees.filter((e) => e.id !== employee.id);

  return (
    <div
      className="bg-white"
      data-cy={`step-evaluator-employee-card-${employee.id}`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC]"
        data-cy={`step-evaluator-employee-header-${employee.id}`}
      >
        <PersonIdentity
          role="Successor"
          name={employee.name}
          caption={`${employee.jobTitle} · ${employee.department}`}
          avatarSize={32}
        />
      </div>

      <div className="flex flex-col divide-y divide-[#F0F0F0]">
        {competencies.map((comp, index) => {
          const fieldKey = evaluationFieldKey(employee.id, index);
          return (
            <div
              key={`${employee.id}-${index}-${competencyKey(comp)}`}
              className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[1fr_80px_minmax(220px,1fr)] sm:gap-3 sm:items-center"
              data-cy={`step-evaluator-row-${employee.id}-${index}`}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">
                  {comp.name}
                </div>
                <div className="text-xs text-gray-400">{comp.category}</div>
              </div>

              <div className="text-sm text-[#4d4d4d] tabular-nums">
                {comp.weight != null ? `${comp.weight}%` : '—'}
              </div>

              <Form.Item
                name={['evaluationAssignments', fieldKey]}
                rules={
                  requireEvaluators
                    ? [
                        {
                          required: true,
                          message: 'Select an evaluator',
                        },
                      ]
                    : undefined
                }
                className="mb-0"
                data-cy={`step-evaluator-select-item-${employee.id}-${index}`}
              >
                <EvaluatorPicker
                  options={evaluatorOptions}
                  dataCy={`step-evaluator-select-${employee.id}-${index}`}
                />
              </Form.Item>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Searchable evaluator select; shows avatar tag after selection */
export interface EvaluatorPickerProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  options: SuccessorCandidate[];
  dataCy?: string;
}

export const EvaluatorPicker: React.FC<EvaluatorPickerProps> = ({
  value,
  onChange,
  options,
  dataCy,
}) => {
  const { employees } = useSuccessionOrgData();
  // Fall back to the full directory so an already-assigned evaluator still
  // renders even when they are filtered out of `options`.
  const selected =
    options.find((o) => o.id === value) ??
    employees.find((o) => o.id === value);

  return (
    <div
      className="w-full"
      data-cy={dataCy ? `${dataCy}-wrap` : 'evaluator-picker-wrap'}
    >
      {selected ? (
        <div
          className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg max-w-full mb-0"
          data-cy={dataCy ? `${dataCy}-tag` : 'evaluator-tag'}
        >
          <Avatar
            size={20}
            icon={<UserOutlined />}
            style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
            className="shrink-0"
          />
          <span className="text-sm text-gray-800 truncate">
            {selected.name}
          </span>
          <button
            type="button"
            aria-label="Clear evaluator"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange?.(undefined);
            }}
            className="text-gray-500 hover:text-gray-800 text-xs leading-none ml-0.5 shrink-0"
            data-cy={dataCy ? `${dataCy}-clear` : 'evaluator-tag-clear'}
          >
            ✖
          </button>
        </div>
      ) : null}

      {/* Keep Select mounted so each Form.Item stays independently controlled */}
      <Select
        showSearch
        allowClear
        value={value}
        onChange={(v) => onChange?.(v)}
        placeholder="Search and select evaluator"
        className="w-full"
        style={{ display: selected ? 'none' : undefined }}
        optionLabelProp="label"
        // Portal to body so the menu isn't clipped by card/modal overflow;
        // z-index must sit above CriticalRoleModal (10002).
        getPopupContainer={() => document.body}
        dropdownStyle={{ zIndex: 10050 }}
        listHeight={280}
        filterOption={(input, option) => {
          const emp = options.find((o) => o.id === option?.value);
          if (!emp) return false;
          const q = input.toLowerCase();
          return (
            emp.name.toLowerCase().includes(q) ||
            emp.jobTitle.toLowerCase().includes(q) ||
            emp.department.toLowerCase().includes(q)
          );
        }}
        data-cy={dataCy}
      >
        {options.map((opt) => (
          <Option
            key={opt.id}
            value={opt.id}
            label={opt.name}
            data-cy={`evaluator-option-${opt.id}`}
          >
            <div className="flex items-center gap-2 py-0.5">
              <Avatar
                size={20}
                icon={<UserOutlined />}
                style={{ backgroundColor: EVALUATOR_AVATAR_COLOR }}
                className="shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-gray-800 truncate">
                  {opt.name}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {opt.jobTitle}
                </span>
              </div>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default StepEvaluatorAssignment;
