import React from 'react';
import { Form, InputNumber } from 'antd';
import { KeyResult } from '@/store/uistate/features/okrplanning/okr/interface';
import { OkrScoringMode } from '@/store/server/features/okrplanning/okr-setting/interface';
import {
  getKeyResultBandValidationIssue,
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
  /**
   * Separate ceiling for Stretch. Percentage key results cap the other bands at
   * 100, but Stretch must stay above Target, so Target 100 + Stretch 120 needs
   * headroom here.
   */
  stretchMax?: number;
  suffix?: string;
  allowDecimal?: boolean;
}

/**
 * Currency amounts are typed and shown with thousands separators
 * (1000000 → 1,000,000); the stored value stays a plain number.
 */
const formatThousands = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '';
  const [whole, decimals] = String(value).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals !== undefined ? `${grouped}.${decimals}` : grouped;
};

// antd expects a number here; it also accepts the digit string while typing.
const parseThousands = (value: string | undefined): number =>
  (value ?? '').replace(/,/g, '') as unknown as number;

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
  stretchMax,
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
  const isCurrency = metric === 'currency';
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
                const issue = getKeyResultBandValidationIssue(
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
                // Every band re-validates when one changes (dependencies);
                // only the field the rule is about shows the message.
                return issue && issue.field === field.name
                  ? Promise.reject(new Error(issue.message))
                  : Promise.resolve();
              },
            }),
          ]}
          data-cy={`okr-${metric}-${layout}-${field.name}-item-${index}`}
        >
          <InputNumber<number>
            className={inputClass}
            data-cy={`okr-${metric}-${layout}-${field.name}-input-${index}`}
            min={0}
            max={field.name === 'stretchValue' ? stretchMax : max}
            suffix={suffix}
            {...(isCurrency && {
              formatter: formatThousands,
              parser: parseThousands,
            })}
            placeholder={isBasic ? field.label : 'Input'}
            value={keyItem[field.name] as number | undefined}
            onChange={(value) => updateKeyResult(index, field.name, value)}
            onKeyPress={(event) => {
              if (
                !/[0-9]/.test(event.key) &&
                event.key !== 'Backspace' &&
                event.key !== 'Delete' &&
                event.key !== 'Tab' &&
                (!allowDecimal || event.key !== '.') &&
                // Pasted / typed separators are stripped by the parser.
                !(isCurrency && event.key === ',')
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
          Score is 0% below Threshold, 100% at Target, and capped at Stretch
          (Stretch may equal Target).
        </p>
      )}
    </>
  );
}
