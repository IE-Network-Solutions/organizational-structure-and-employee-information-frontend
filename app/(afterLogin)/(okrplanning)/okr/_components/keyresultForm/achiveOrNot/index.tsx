import React, { useState } from 'react';
import { Button, Form, DatePicker, Select, Input, InputNumber } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import {
  KeyResultFieldLabel,
  KeyResultRemoveButton,
  KeyResultSavedCard,
  KeyResultSelectedBadge,
  KEY_RESULT_TOOLTIP,
  WEIGHT_TOOLTIP,
  DEADLINE_TOOLTIP,
  ADVANCED_ROW_CLASS,
  ADVANCED_WRAPPER_CLASS,
  INPUT_CLASS,
} from '../_ui';

const AchieveOrNot: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const { isMobile } = useIsMobile();
  const isBasic = useIsBasicOkr();
  const [isCardView, setIsCardView] = useState(false);

  return (
    <div
      id={`okr-achieve-form-container-${index}`}
      data-cy={`okr-achieve-form-container-${index}`}
      className={`relative mb-4 ${isBasic ? 'bg-gray-50 rounded-xl border-none p-6' : 'border border-gray-200 rounded-lg p-6'}`}
    >
      <div className="absolute top-2 right-2" style={{ zIndex: 10 }}>
        <KeyResultRemoveButton
          onClick={() => removeKeyResult(index)}
          title="Remove Key Result"
          aria-label="Remove Key Result"
          id={`remove-key-result-${index}`}
          data-cy={`okr-achieve-form-remove-${index}`}
        />
      </div>

      {/* Advanced mode: "You Have Selected" badge */}
      {!isBasic && (
        <KeyResultSelectedBadge label="Achieve or not" data-cy={`okr-achieve-selected-badge-${index}`} />
      )}

      <Form
        id={`okr-achieve-form-${index}`}
        data-cy={`okr-achieve-form-${index}`}
        form={form}
        layout="vertical"
        initialValues={keyItem}
        requiredMark={false}
      >
        {/* Desktop Layout - Basic mode */}
        {!isMobile && isBasic && (
          <div
            id={`okr-achieve-desktop-top-row-${index}`}
            data-cy={`okr-achieve-desktop-top-row-${index}`}
            className="flex flex-row gap-1 items-center mt-4 mx-4"
          >
            <Form.Item className="flex-1 mr-2 mb-0" name="title" rules={[{ required: true, message: 'Please enter the Key Result name' }]} id={`key-result-name-${index}`} data-cy={`okr-achieve-desktop-title-item-${index}`}>
              <Input id={`okr-achieve-desktop-title-input-${index}`} data-cy={`okr-achieve-desktop-title-input-${index}`} placeholder="Key Result Name" aria-label="Key Result Name" className="h-10 rounded-lg text-base" value={keyItem.title === '' ? undefined : keyItem.title} onChange={(e) => updateKeyResult(index, 'title', e.target.value)} />
            </Form.Item>
            <Form.Item className="w-48 mb-0 hidden" id={`select-metric-${index}`} data-cy={`okr-achieve-desktop-type-item-${index}`}>
              <Select className="w-full h-10 rounded-lg text-base" data-cy={`okr-achieve-desktop-type-select-${index}`} onChange={(value) => { const selectedMetric = metrics?.items?.find((metric) => metric.id === value); if (selectedMetric) { updateKeyResult(index, 'metricTypeId', value); updateKeyResult(index, 'key_type', selectedMetric.name); } }} value={keyItem.key_type}>
                {metrics?.items?.map((metric) => (<Option data-cy={`okr-achieve-desktop-type-option-${index}-${metric?.id}`} key={metric?.id} value={metric?.id}>{metric?.name}</Option>))}
              </Select>
            </Form.Item>
            <Form.Item className="w-24 mb-0" name="weight" rules={[{ required: true, message: 'Please enter the Weight' }, { type: 'number', message: 'Weight must be a number' }]} id={`weight-input-${index}`} data-cy={`okr-achieve-desktop-weight-item-${index}`}>
              <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-achieve-desktop-weight-input-${index}`} min={0} max={100} suffix="%" placeholder="100" aria-label="Weight" value={keyItem.weight} onChange={(value) => updateKeyResult(index, 'weight', value)} />
            </Form.Item>
            <Form.Item className="w-48 mb-0" name={`dead_line_${index}`} rules={[{ required: true, message: 'Please select a deadline' }]} id={`deadline-picker-${index}`} data-cy={`okr-achieve-desktop-deadline-item-${index}`}>
              <DatePicker className="w-full h-10 rounded-lg text-base" data-cy={`okr-achieve-desktop-deadline-picker-${index}`} value={keyItem.deadline ? dayjs(keyItem.deadline) : null} format="YYYY-MM-DD" disabledDate={(current) => { const startOfToday = dayjs().startOf('day'); const objectiveDeadline = dayjs(objectiveValue?.deadline); return current && (current < startOfToday || current > objectiveDeadline); }} onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)} aria-label="Deadline" />
            </Form.Item>
          </div>
        )}

        {/* Desktop Layout - Advanced mode */}
        {!isMobile && !isBasic && (
          <>
            {isCardView ? (
              <KeyResultSavedCard
                weight={keyItem.weight ?? 0}
                title={keyItem.title ?? ''}
                onEdit={() => setIsCardView(false)}
                id={`okr-achieve-desktop-saved-card-${index}`}
                data-cy={`okr-achieve-desktop-saved-card-${index}`}
              />
            ) : (
              <div
                id={`okr-achieve-desktop-top-row-${index}`}
                data-cy={`okr-achieve-desktop-top-row-${index}`}
                className={ADVANCED_WRAPPER_CLASS}
              >
                <div className={`${ADVANCED_ROW_CLASS} items-end`}>
                  <Form.Item
                    className="flex-1 mb-0"
                    name="title"
                    label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
                    rules={[{ required: true, message: 'Please enter the Key Result name' }]}
                    requiredMark={false}
                    id={`key-result-name-${index}`}
                    data-cy={`okr-achieve-desktop-title-item-${index}`}
                  >
                    <Input
                      id={`okr-achieve-desktop-title-input-${index}`}
                      data-cy={`okr-achieve-desktop-title-input-${index}`}
                      placeholder="Input"
                      aria-label="Key Result Name"
                      className={INPUT_CLASS}
                      value={keyItem.title === '' ? undefined : keyItem.title}
                      onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-32 mb-0"
                    name="weight"
                    label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
                    rules={[{ required: true, message: 'Weight required' }, { type: 'number', message: 'Must be a number' }]}
                    requiredMark={false}
                    id={`weight-input-${index}`}
                    data-cy={`okr-achieve-desktop-weight-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-achieve-desktop-weight-input-${index}`}
                      min={0}
                      max={100}
                      suffix="%"
                      placeholder="Input"
                      aria-label="Weight"
                      value={keyItem.weight}
                      onChange={(value) => updateKeyResult(index, 'weight', value)}
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-44 mb-0"
                    name={`dead_line_${index}`}
                    label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
                    rules={[{ required: true, message: 'Deadline required' }]}
                    requiredMark={false}
                    id={`deadline-picker-${index}`}
                    data-cy={`okr-achieve-desktop-deadline-item-${index}`}
                  >
                    <DatePicker
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-achieve-desktop-deadline-picker-${index}`}
                      placeholder="Select date"
                      value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        const startOfToday = dayjs().startOf('day');
                        const objectiveDeadline = dayjs(objectiveValue?.deadline);
                        return current && (current < startOfToday || current > objectiveDeadline);
                      }}
                      onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)}
                      aria-label="Deadline"
                    />
                  </Form.Item>
                  <Form.Item className="mb-0" label={<span className="opacity-0 select-none">Save</span>}>
                    <Button
                      type="primary"
                      className="bg-okr-primary hover:bg-blue-800 text-white h-10 rounded-lg font-medium"
                      onClick={() => {
                        form.validateFields().then(() => setIsCardView(true)).catch(() => {});
                      }}
                      data-cy={`okr-achieve-desktop-save-${index}`}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mobile Layout: Key Result * full width, Weight * + Deadline * one row with labels/tooltips */}
        <div
          id={`okr-achieve-mobile-wrapper-${index}`}
          data-cy={`okr-achieve-mobile-wrapper-${index}`}
          className={`${isMobile ? 'block' : 'hidden'} space-y-4 mt-4 mx-4`}
        >
          <Form.Item
            className="mb-0"
            name="title"
            label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
            rules={[{ required: true, message: 'Please enter the Key Result name' }]}
            id={`key-result-name-mobile-${index}`}
            data-cy={`okr-achieve-mobile-title-item-${index}`}
          >
            <Input
              id={`okr-achieve-mobile-title-input-${index}`}
              data-cy={`okr-achieve-mobile-title-input-${index}`}
              placeholder="Input"
              aria-label="Key Result Name"
              className="h-10 rounded-lg text-base"
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
            />
          </Form.Item>
          <div id={`okr-achieve-mobile-meta-row-${index}`} data-cy={`okr-achieve-mobile-meta-row-${index}`} className="flex gap-2">
            <Form.Item
              className="flex-1 mb-0"
              name="weight"
              label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
              rules={[{ required: true, message: 'Please enter the Weight' }, { type: 'number', message: 'Weight must be a number' }]}
              id={`weight-input-mobile-${index}`}
              data-cy={`okr-achieve-mobile-weight-item-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-achieve-mobile-weight-input-${index}`}
                min={0}
                max={100}
                suffix="%"
                placeholder="Input"
                aria-label="Weight"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
              />
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              name={`dead_line_${index}`}
              label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-picker-mobile-${index}`}
              data-cy={`okr-achieve-mobile-deadline-item-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-achieve-mobile-deadline-picker-${index}`}
                placeholder="Select date"
                value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const startOfToday = dayjs().startOf('day');
                  const objectiveDeadline = dayjs(objectiveValue?.deadline);
                  return current && (current < startOfToday || current > objectiveDeadline);
                }}
                onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)}
                aria-label="Deadline"
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AchieveOrNot;
