'use client';
import React, { useMemo } from 'react';
import { Button, Empty, Form, Input, InputNumber, Select } from 'antd';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { MOCK_POSITIONS } from './stepRoleSelection';

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
  name: string;
  category: CompetencyCategory;
  importance: CompetencyImportance;
  /** Relative evaluation weight (1–100). All criteria weights must total 100. */
  weight: number;
  description?: string;
}

/** Sum competency weights (same rule as OKR key-result weights). */
export const sumCompetencyWeights = (
  competencies: Array<{ weight?: number } | undefined> | undefined,
): number =>
  (competencies ?? []).reduce(
    (sum, c) => sum + Number(c?.weight ?? 0),
    0,
  );

interface StepCompetencyDefinitionProps {
  positionId: string | null;
}

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

  const position = MOCK_POSITIONS.find((p) => p.id === positionId);

  return (
    <div
      className="flex flex-col gap-4 pt-2"
      data-cy="step-competency-definition-container"
    >
      <p className="text-sm text-gray-500 -mt-2">
        Define the competencies and skills required for{' '}
        {position ? (
          <span className="font-semibold text-gray-700">{position.title}</span>
        ) : (
          'this role'
        )}
        .
      </p>

      <Form.List name="competencies">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-3" data-cy="step-competency-list">
            {fields.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span
                    className="text-gray-400 text-sm"
                    data-cy="step-competency-empty"
                  >
                    No competencies added yet. Add skills or criteria for this
                    role.
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
                    icon={<DeleteOutlineOutlinedIcon style={{ fontSize: 18 }} />}
                    onClick={() => remove(name)}
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
              onClick={() =>
                add({
                  name: '',
                  category: 'Skill',
                  importance: 'Required',
                  weight: fields.length === 0 ? 100 : 0,
                  description: '',
                })
              }
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
        )}
      </Form.List>
    </div>
  );
};

export default StepCompetencyDefinition;
