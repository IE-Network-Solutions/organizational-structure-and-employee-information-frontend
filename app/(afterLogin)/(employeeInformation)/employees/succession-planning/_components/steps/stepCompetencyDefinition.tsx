'use client';
import React, { useMemo } from 'react';
import { Button, Empty, Form, Input, InputNumber, Select, Switch } from 'antd';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import {
  educationLevelOptions,
  getRelatedEducationFields,
} from '../educationCatalog';
import DepartmentPositionSelect from '../departmentPositionSelect';
import EducationFieldSelect from '../educationFieldSelect';

const { Option } = Select;
const { TextArea } = Input;

export type CompetencyImportance = 'Required' | 'Preferred' | 'Nice to Have';
export type CompetencyCategory =
  | 'Skill'
  | 'Knowledge'
  | 'Behavior'
  | 'Experience'
  | 'Certification';

export interface RoleCompetency {
  /**
   * Backend criteria id. Absent for a criterion being added in the wizard;
   * sending it back on update keeps the criterion (and its evaluations, scores
   * and gap history) instead of recreating it.
   */
  id?: string;
  name: string;
  category: CompetencyCategory;
  importance: CompetencyImportance;
  /** Relative evaluation weight (1–100). All criteria weights must total 100. */
  weight: number;
  description?: string;
}

/**
 * Split 100 evenly across `count` criteria, giving the remainder to the first
 * rows so the total is always exactly 100 — the same approach OKR uses for key
 * result weights. 1 → [100], 2 → [50,50], 3 → [34,33,33].
 */
export const distributeWeightsEvenly = (count: number): number[] => {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  return Array.from(
    { length: count },
    (_unused, index) => base + (index < remainder ? 1 : 0),
  );
};

/** Sum competency weights (same rule as OKR key-result weights). */
export const sumCompetencyWeights = (
  competencies: Array<{ weight?: number } | undefined> | undefined,
): number =>
  (competencies ?? []).reduce((sum, c) => sum + Number(c?.weight ?? 0), 0);

interface StepCompetencyDefinitionProps {
  positionId: string | null;
}

/** Opt-in: PM may later mark non-exact successor fields as related on Assessment. */
const RelatedEducationFieldsSwitch: React.FC = () => {
  const form = Form.useFormInstance();
  const field = Form.useWatch('requiredEducationField', form) as
    | string
    | undefined;
  const allowRelated = Form.useWatch('allowRelatedEducationFields', form) as
    | boolean
    | undefined;
  const isAny = !field || field === 'Any';
  const relatedExamples = getRelatedEducationFields(field);

  return (
    <div
      className="rounded-md border border-[#F0F0F0] bg-[#FAFAFA] px-3 py-2"
      data-cy="step-allow-related-education-wrap"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-700">
            Allow related fields of study
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {isAny
              ? 'Not needed when field of study is Any.'
              : 'When on, you can mark a successor’s non-exact field as related on their Assessment. Until marked, mismatched fields stay as Field mismatch.'}
          </div>
        </div>
        <Form.Item
          name="allowRelatedEducationFields"
          valuePropName="checked"
          className="mb-0"
          initialValue={false}
        >
          <Switch
            disabled={isAny}
            onChange={(checked) => {
              if (isAny) {
                form.setFieldsValue({ allowRelatedEducationFields: false });
                return;
              }
              form.setFieldsValue({ allowRelatedEducationFields: checked });
            }}
            data-cy="step-allow-related-education-switch"
          />
        </Form.Item>
      </div>
      {!isAny && allowRelated && relatedExamples.length > 0 ? (
        <div className="text-xs text-gray-500 mt-2">
          Common related examples: {relatedExamples.join(', ')}
        </div>
      ) : null}
    </div>
  );
};

const StepCompetencyDefinition: React.FC<StepCompetencyDefinitionProps> = ({
  positionId,
}) => {
  const form = Form.useFormInstance();
  const competencies: RoleCompetency[] =
    Form.useWatch('competencies', form) ?? [];

  const totalWeight = useMemo(
    () => sumCompetencyWeights(competencies),
    [competencies],
  );

  const { positions } = useSuccessionOrgData();
  const position = positions.find((p) => p.id === positionId);

  return (
    <div
      className="flex flex-col gap-4 pt-2"
      data-cy="step-competency-definition-container"
    >
      <p className="text-sm text-gray-500 -mt-2">
        Define mandatory qualifications for{' '}
        {position ? (
          <span className="font-semibold text-gray-700">{position.title}</span>
        ) : (
          'this role'
        )}
        , then optionally add competency criteria. Competencies can also be
        managed later from the role details page.
      </p>

      <div className="text-sm font-semibold text-gray-800">
        Mandatory qualifications
      </div>

      <div
        className="rounded-lg border border-[#D9D9D9] p-3 bg-white flex flex-col gap-3"
        data-cy="step-mandatory-qualifications"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Qualifications
        </span>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Form.Item
            name="requiredEducationLevel"
            label={
              <span className="text-sm font-medium text-gray-700">
                Education level
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select required education level',
              },
            ]}
            className="mb-0"
            data-cy="step-required-education-level-item"
          >
            <Select
              placeholder="Select education level"
              className="w-full h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!leading-8"
              options={educationLevelOptions}
              data-cy="step-required-education-level-select"
            />
          </Form.Item>
          <Form.Item
            name="requiredEducationField"
            label={
              <span className="text-sm font-medium text-gray-700">
                Field of study
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select required field of study',
              },
            ]}
            className="mb-0"
            data-cy="step-required-education-field-item"
          >
            <EducationFieldSelect
              includeAny
              placeholder="Select field (or Any)"
              data-cy="step-required-education-field-select"
            />
          </Form.Item>
          <Form.Item
            name="requiredRelevantExperience"
            label={
              <span className="text-sm font-medium text-gray-700">
                Experience (years)
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please enter required years of experience',
              },
              {
                type: 'number',
                min: 0,
                message: 'Years must be 0 or greater',
              },
            ]}
            className="mb-0"
            data-cy="step-required-experience-item"
          >
            <InputNumber
              min={0}
              max={50}
              precision={0}
              className="w-full h-10 [&_.ant-input-number]:h-10 [&_.ant-input-number-input]:h-10 [&_.ant-input-number-group-addon]:h-10 [&_.ant-input-number-group-addon]:leading-10"
              placeholder="e.g. 8"
              addonAfter="years"
              data-cy="step-required-experience-input"
            />
          </Form.Item>
        </div>

        <RelatedEducationFieldsSwitch />

        <div data-cy="step-required-position-fields">
          <DepartmentPositionSelect
            departmentFieldName="requiredCurrentDepartment"
            positionFieldName="requiredCurrentPositionIds"
            departmentLabel="Department"
            positionLabel="Required current positions"
            multiple
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
            departmentDataCy="step-required-position-department"
            positionDataCy="step-required-position-select"
          />
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-800">
        Competency criteria{' '}
        <span className="text-xs font-normal text-gray-400">(optional)</span>
      </div>

      <Form.List name="competencies">
        {(fields, { add, remove }) => {
          /**
           * Re-split weights evenly whenever a criterion is added or removed,
           * so the total is always 100 without the user doing the arithmetic.
           * The field stays editable for anyone who wants a manual split.
           */
          const redistributeWeights = () => {
            const list: RoleCompetency[] =
              form.getFieldValue('competencies') ?? [];
            const weights = distributeWeightsEvenly(list.length);
            form.setFieldsValue({
              competencies: list.map((competency, index) => ({
                ...competency,
                weight: weights[index],
              })),
            });
          };

          return (
            <div className="flex flex-col gap-3" data-cy="step-competency-list">
              {fields.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span
                      className="text-gray-400 text-sm"
                      data-cy="step-competency-empty"
                    >
                      No competency criteria yet. These are optional — you can
                      add them now or later from the role details page.
                    </span>
                  }
                />
              )}

              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="rounded-lg border border-[#D9D9D9] p-3 bg-white"
                  data-cy={`step-competency-row-${key}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Criterion {name + 1}
                    </span>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={
                        <DeleteOutlineOutlinedIcon style={{ fontSize: 18 }} />
                      }
                      onClick={() => {
                        remove(name);
                        redistributeWeights();
                      }}
                      aria-label="Remove competency"
                      data-cy={`step-competency-remove-${key}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Competency / Skill
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a competency name',
                        },
                      ]}
                      className="mb-0"
                      data-cy={`step-competency-name-item-${key}`}
                    >
                      <Input
                        placeholder="e.g. Strategic planning"
                        className="h-10"
                        data-cy={`step-competency-name-input-${key}`}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'category']}
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Category
                        </span>
                      }
                      rules={[
                        { required: true, message: 'Please select a category' },
                      ]}
                      className="mb-0"
                      data-cy={`step-competency-category-item-${key}`}
                    >
                      <Select
                        placeholder="Select category"
                        className="w-full h-10"
                        data-cy={`step-competency-category-select-${key}`}
                      >
                        <Option value="Skill">Skill</Option>
                        <Option value="Knowledge">Knowledge</Option>
                        <Option value="Behavior">Behavior</Option>
                        <Option value="Experience">Experience</Option>
                        <Option value="Certification">Certification</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'importance']}
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Importance
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: 'Please select importance',
                        },
                      ]}
                      className="mb-0"
                      data-cy={`step-competency-importance-item-${key}`}
                    >
                      <Select
                        placeholder="Select importance"
                        className="w-full h-10"
                        data-cy={`step-competency-importance-select-${key}`}
                      >
                        <Option value="Required">Required</Option>
                        <Option value="Preferred">Preferred</Option>
                        <Option value="Nice to Have">Nice to Have</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'weight']}
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Weight (%)
                        </span>
                      }
                      rules={[
                        { required: true, message: 'Please enter a weight' },
                        {
                          type: 'number',
                          min: 1,
                          max: 100,
                          message: 'Weight must be between 1 and 100',
                        },
                      ]}
                      className="mb-0"
                      data-cy={`step-competency-weight-item-${key}`}
                    >
                      <InputNumber
                        min={1}
                        max={100}
                        className="w-full h-10"
                        placeholder="e.g. 25"
                        data-cy={`step-competency-weight-input-${key}`}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Description{' '}
                        <span className="text-gray-400 font-normal">
                          (optional)
                        </span>
                      </span>
                    }
                    className="mb-0 mt-3"
                    data-cy={`step-competency-description-item-${key}`}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Briefly describe what this competency looks like for this role..."
                      data-cy={`step-competency-description-textarea-${key}`}
                    />
                  </Form.Item>
                </div>
              ))}

              <Button
                type="dashed"
                block
                className="h-10 text-sm font-normal border-[#91caff] text-[#1677ff]"
                icon={
                  <AddCircleOutlineOutlinedIcon
                    style={{ fontSize: 18, display: 'block' }}
                  />
                }
                onClick={() => {
                  add({
                    name: '',
                    category: 'Skill',
                    importance: 'Required',
                    weight: 0,
                    description: '',
                  });
                  redistributeWeights();
                }}
                data-cy="step-competency-add-btn"
              >
                Add Competency
              </Button>

              {fields.length > 0 && (
                <div
                  className="flex justify-end mt-1"
                  data-cy="step-competency-total-weight"
                >
                  <div className="text-sm text-gray-600 font-bold">
                    Total Weight:{' '}
                    <span
                      className={`font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}
                      data-cy="step-competency-total-weight-value"
                    >
                      {totalWeight}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </Form.List>
    </div>
  );
};

export default StepCompetencyDefinition;
