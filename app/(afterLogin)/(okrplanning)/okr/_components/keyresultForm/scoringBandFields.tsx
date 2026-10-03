import React from 'react';
import { Form, InputNumber } from 'antd';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OkrScoringMode } from '@/store/server/features/okrplanning/okr-setting/interface';
import {
  getKeyResultBandValidationError,
  shouldIncludeScoringBands,
} from '@/utils/okrScoringBands';
import { KeyResultFieldLabel, INPUT_CLASS } from './_ui';

type Layout = 'basic' | 'advanced' | 'mobile';

interface ScoringBandFieldsProps {
  keyItem: KeyResult;
  index: number;
  metric: 'currency' | 'numeric' | 'percentage';
  layout: Layout;
  scoringMode: OkrScoringMode | undefined;
  updateKeyResult: (
    index: number,
    field: keyof KeyResult,
    value: number | null,
  ) => void;
  max?: number;
  suffix?: string;
  allowDecimal?: boolean;
}

const BAND_FIELDS = [
  {
    name: 'initialValue',
    label: 'Baseline',
    tooltip: 'Starting value used as the scoring baseline',
  },
  {
    name: 'thresholdValue',
    label: 'Threshold',
    tooltip: 'Minimum value that receives a score',
  },
  {
    name: 'targetValue',
    label: 'Target',
    tooltip: 'Value that receives a full score',
  },
  {
    name: 'stretchValue',
    label: 'Stretch',
    tooltip: 'Maximum score cap value',
  },
] as const;

export function ScoringBandFields({
  keyItem,
  index,
  metric,
  layout,
  scoringMode,
  updateKeyResult,
  max,
  suffix,
  allowDecimal = false,
}: ScoringBandFieldsProps) {
  const isTypeWeighted = shouldIncludeScoringBands(scoringMode);
  const fields = isTypeWeighted
    ? BAND_FIELDS
    : BAND_FIELDS.filter(
        (field) =>
          field.name === 'initialValue' || field.name === 'targetValue',
      );
  const isBasic = layout === 'basic';
  const formItemClass = 'flex-1 min-w-0 mb-0';
  const inputClass =
    layout === 'advanced'
      ? `w-full ${INPUT_CLASS}`
      : 'w-full h-10 rounded-lg text-base';

  return (
    <>
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          className={formItemClass}
          name={field.name}
          label={
            isBasic ? undefined : (
              <KeyResultFieldLabel
                label={field.label}
                tooltip={field.tooltip}
              />
            )
          }
          dependencies={BAND_FIELDS.map((band) => band.name)}
          rules={[
            { required: true, message: `Please enter the ${field.label}` },
            ({ getFieldValue }) => ({
              validator(rule: unknown, value: number | undefined) {
                void rule;
                const error = getKeyResultBandValidationError(
                  {
                    initialValue:
                      field.name === 'initialValue'
                        ? value
                        : getFieldValue('initialValue'),
                    thresholdValue:
                      field.name === 'thresholdValue'
                        ? value
                        : getFieldValue('thresholdValue'),
                    targetValue:
                      field.name === 'targetValue'
                        ? value
                        : getFieldValue('targetValue'),
                    stretchValue:
                      field.name === 'stretchValue'
                        ? value
                        : getFieldValue('stretchValue'),
                  },
                  scoringMode,
                );
                return error
                  ? Promise.reject(new Error(error))
                  : Promise.resolve();
              },
            }),
          ]}
          data-cy={`okr-${metric}-${layout}-${field.name}-item-${index}`}
        >
          <InputNumber
            className={inputClass}
            data-cy={`okr-${metric}-${layout}-${field.name}-input-${index}`}
            min={0}
            max={max}
            suffix={suffix}
            placeholder={isBasic ? field.label : 'Input'}
            value={keyItem[field.name] as number | undefined}
            onChange={(value) => updateKeyResult(index, field.name, value)}
            onKeyPress={(event) => {
              if (
                !/[0-9]/.test(event.key) &&
                event.key !== 'Backspace' &&
                event.key !== 'Delete' &&
                event.key !== 'Tab' &&
                (!allowDecimal || event.key !== '.')
              ) {
                event.preventDefault();
              }
            }}
          />
        </Form.Item>
      ))}
      {isTypeWeighted && (
        <p
          className="basis-full text-xs text-gray-500 -mt-1"
          data-cy={`okr-${metric}-${layout}-scoring-band-help-${index}`}
        >
          Score is 0% below Threshold, 100% at Target, and capped at Stretch.
        </p>
      )}
    </>
  );
}
