import React, { useState } from 'react';
import { Button, Form, Input, DatePicker, Select, InputNumber } from 'antd';
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
  ADVANCED_VALUES_ROW_CLASS,
  INPUT_CLASS,
} from '../_ui';

const NumericForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
}) => {
  const { isMobile } = useIsMobile();
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const isBasic = useIsBasicOkr();
  const [isCardView, setIsCardView] = useState(false);

  return (
    <div
      id={`okr-numeric-form-container-${index}`}
      data-cy={`okr-numeric-form-container-${index}`}
      className={`relative mb-4 ${isBasic ? 'bg-gray-50 rounded-xl border-none p-6' : 'border border-gray-200 rounded-lg p-6'}`}
    >
      <div className="absolute top-2 right-2" style={{ zIndex: 10 }}>
        <KeyResultRemoveButton
          onClick={() => removeKeyResult(index)}
          title="Remove Key Result"
          aria-label="Remove Key Result"
          id={`remove-key-result-${index}`}
          data-cy={`okr-numeric-form-remove-${index}`}
        />
      </div>

      {/* Advanced mode: "You Have Selected" badge */}
      {!isBasic && (
        <KeyResultSelectedBadge label="Numeric" data-cy={`okr-numeric-selected-badge-${index}`} />
      )}

      <Form
        id={`okr-numeric-form-${index}`}
        data-cy={`okr-numeric-form-${index}`}
        form={form}
        initialValues={{
          ...keyItem,
          initialValue: keyItem.initialValue ?? 0,
          targetValue: keyItem.targetValue ?? 0,
        }}
        layout="vertical"
        requiredMark={false}
      >
        {/* Desktop Layout - Basic mode */}
        {!isMobile && isBasic && (
          <>
            <div id={`okr-numeric-desktop-top-row-${index}`} data-cy={`okr-numeric-desktop-top-row-${index}`} className="flex flex-row gap-2 items-center mt-4 mx-4">
              <Form.Item className="flex-1 mr-2 mb-0" name="title" rules={[{ required: true, message: 'Please enter the Key Result name' }]} id={`key-result-title-${index}`} data-cy={`okr-numeric-desktop-title-item-${index}`}>
                <Input id={`okr-numeric-desktop-title-input-${index}`} data-cy={`okr-numeric-desktop-title-input-${index}`} value={keyItem.title === '' ? undefined : keyItem.title} onChange={(e) => updateKeyResult(index, 'title', e.target.value)} placeholder="Key Result Name" className="h-10 rounded-lg text-base" aria-label="Key Result Name" />
              </Form.Item>
              <Form.Item className="w-48 mb-0" rules={[{ required: true, message: 'Please select a Key Result type' }]} id={`key-type-select-${index}`} data-cy={`okr-numeric-desktop-type-item-${index}`}>
                <Select className="w-full h-10 rounded-lg text-base" popupClassName="text-base" data-cy={`okr-numeric-desktop-type-select-${index}`} onChange={(value) => { const selectedMetric = metrics?.items?.find((metric) => metric.id === value); if (selectedMetric) { updateKeyResult(index, 'metricTypeId', value); updateKeyResult(index, 'key_type', selectedMetric.name); } }} value={metrics?.items?.find((metric) => metric.name === keyItem.key_type)?.id || ''}>
                  <Option value="" disabled>Please select a metric type</Option>
                  {metrics?.items?.map((metric) => (<Option key={metric?.id} value={metric?.id}>{metric?.name}</Option>))}
                </Select>
              </Form.Item>
              <Form.Item className="w-24 mb-0" name="weight" rules={[{ required: true, message: 'Please enter the weight' }]} id={`weight-input-${index}`} data-cy={`okr-numeric-desktop-weight-item-${index}`}>
                <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-numeric-desktop-weight-input-${index}`} min={0} max={100} suffix="%" placeholder="100" value={keyItem.weight} onChange={(value) => updateKeyResult(index, 'weight', value)} aria-label="Weight" />
              </Form.Item>
              <Form.Item className="w-48 mb-0" name={`dead_line_${index}`} rules={[{ required: true, message: 'Please select a deadline' }]} id={`deadline-picker-${index}`} data-cy={`okr-numeric-desktop-deadline-item-${index}`}>
                <DatePicker className="w-full h-10 rounded-lg text-base" popupClassName="text-base" data-cy={`okr-numeric-desktop-deadline-picker-${index}`} value={keyItem.deadline ? dayjs(keyItem.deadline) : null} format="YYYY-MM-DD" disabledDate={(current) => { const startOfToday = dayjs().startOf('day'); const objectiveDeadline = dayjs(objectiveValue?.deadline); return current && (current < startOfToday || current > objectiveDeadline); }} onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)} aria-label="Deadline" />
              </Form.Item>
            </div>
            <div id={`okr-numeric-desktop-values-row-${index}`} data-cy={`okr-numeric-desktop-values-row-${index}`} className="flex flex-row gap-4 items-center mt-4 mx-4">
              <Form.Item className="w-60 mb-0" name="initialValue" rules={[{ required: true, message: 'Please enter the initial value' }]} data-cy={`okr-numeric-desktop-initial-item-${index}`}>
                <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-numeric-desktop-initial-input-${index}`} min={0} placeholder="Initial Value" value={keyItem.initialValue ?? 0} onChange={(value) => updateKeyResult(index, 'initialValue', value)} onKeyPress={(e) => { if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') { e.preventDefault(); } }} />
              </Form.Item>
              <Form.Item className="w-60 mb-0" name="targetValue" rules={[{ required: true, message: 'Please enter the target value' }]} data-cy={`okr-numeric-desktop-target-item-${index}`}>
                <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-numeric-desktop-target-input-${index}`} min={0} placeholder="Target Value" value={keyItem.targetValue ?? 0} onChange={(value) => updateKeyResult(index, 'targetValue', value)} onKeyPress={(e) => { if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') { e.preventDefault(); } }} />
              </Form.Item>
            </div>
          </>
        )}

        {/* Desktop Layout - Advanced mode */}
        {!isMobile && !isBasic && (
          <>
            {isCardView ? (
              <KeyResultSavedCard
                weight={keyItem.weight ?? 0}
                title={keyItem.title ?? ''}
                onEdit={() => setIsCardView(false)}
                id={`okr-numeric-desktop-saved-card-${index}`}
                data-cy={`okr-numeric-desktop-saved-card-${index}`}
              />
            ) : (
              <div
                id={`okr-numeric-desktop-top-row-${index}`}
                data-cy={`okr-numeric-desktop-top-row-${index}`}
                className={ADVANCED_WRAPPER_CLASS}
              >
                <div className={`${ADVANCED_ROW_CLASS} items-end`}>
                  <Form.Item
                    className="flex-1 mb-0"
                    name="title"
                    label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
                    rules={[{ required: true, message: 'Please enter the Key Result name' }]}
                    requiredMark={false}
                    id={`key-result-title-${index}`}
                    data-cy={`okr-numeric-desktop-title-item-${index}`}
                  >
                    <Input
                      id={`okr-numeric-desktop-title-input-${index}`}
                      data-cy={`okr-numeric-desktop-title-input-${index}`}
                      value={keyItem.title === '' ? undefined : keyItem.title}
                      onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                      placeholder="Input"
                      className={INPUT_CLASS}
                      aria-label="Key Result Name"
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-32 mb-0"
                    name="weight"
                    label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
                    rules={[{ required: true, message: 'Weight required' }]}
                    requiredMark={false}
                    id={`weight-input-${index}`}
                    data-cy={`okr-numeric-desktop-weight-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-numeric-desktop-weight-input-${index}`}
                      min={0}
                      max={100}
                      suffix="%"
                      placeholder="Input"
                      value={keyItem.weight}
                      onChange={(value) => updateKeyResult(index, 'weight', value)}
                      aria-label="Weight"
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-44 mb-0"
                    name={`dead_line_${index}`}
                    label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
                    rules={[{ required: true, message: 'Deadline required' }]}
                    requiredMark={false}
                    id={`deadline-picker-${index}`}
                    data-cy={`okr-numeric-desktop-deadline-item-${index}`}
                  >
                    <DatePicker
                      className={`w-full ${INPUT_CLASS}`}
                      popupClassName="text-base"
                      data-cy={`okr-numeric-desktop-deadline-picker-${index}`}
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
                      data-cy={`okr-numeric-desktop-save-${index}`}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
                <div
                  id={`okr-numeric-desktop-values-row-${index}`}
                  data-cy={`okr-numeric-desktop-values-row-${index}`}
                  className={ADVANCED_VALUES_ROW_CLASS}
                >
                  <Form.Item
                    className="w-60 mb-0"
                    name="initialValue"
                    label={<KeyResultFieldLabel label="Initial Value" tooltip="Starting numeric value" />}
                    rules={[{ required: true, message: 'Please enter the initial value' }]}
                    requiredMark={false}
                    data-cy={`okr-numeric-desktop-initial-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-numeric-desktop-initial-input-${index}`}
                      min={0}
                      placeholder="Input"
                      value={keyItem.initialValue ?? 0}
                      onChange={(value) => updateKeyResult(index, 'initialValue', value)}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-60 mb-0"
                    name="targetValue"
                    label={<KeyResultFieldLabel label="Target Value" tooltip="Target numeric value" />}
                    rules={[{ required: true, message: 'Please enter the target value' }]}
                    requiredMark={false}
                    data-cy={`okr-numeric-desktop-target-item-${index}`}
                  >
                    <InputNumber
                      className={`w-full ${INPUT_CLASS}`}
                      data-cy={`okr-numeric-desktop-target-input-${index}`}
                      min={0}
                      placeholder="Input"
                      value={keyItem.targetValue ?? 0}
                      onChange={(value) => updateKeyResult(index, 'targetValue', value)}
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mobile Layout: Key Result * full width, Weight * + Deadline * one row with labels/tooltips; type hidden (already chosen) */}
        <div id={`okr-numeric-mobile-wrapper-${index}`} data-cy={`okr-numeric-mobile-wrapper-${index}`} className={`${isMobile ? 'block' : 'hidden'} space-y-4 mt-4 mx-4`}>
          <Form.Item
            className="mb-0"
            name="title"
            label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
            rules={[{ required: true, message: 'Please enter the Key Result name' }]}
            id={`key-result-title-mobile-${index}`}
            data-cy={`okr-numeric-mobile-title-item-${index}`}
          >
            <Input
              id={`okr-numeric-mobile-title-input-${index}`}
              data-cy={`okr-numeric-mobile-title-input-${index}`}
              value={keyItem.title === '' ? undefined : keyItem.title}
              onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
              placeholder="Input"
              className="h-10 rounded-lg text-base"
              aria-label="Key Result Name"
            />
          </Form.Item>
          <div id={`okr-numeric-mobile-meta-row-${index}`} data-cy={`okr-numeric-mobile-meta-row-${index}`} className="flex gap-2">
            <Form.Item
              className="flex-1 mb-0"
              name="weight"
              label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
              rules={[{ required: true, message: 'Please enter the weight' }]}
              id={`weight-input-mobile-${index}`}
              data-cy={`okr-numeric-mobile-weight-item-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg text-base"
                data-cy={`okr-numeric-mobile-weight-input-${index}`}
                min={0}
                max={100}
                suffix="%"
                placeholder="Input"
                value={keyItem.weight}
                onChange={(value) => updateKeyResult(index, 'weight', value)}
                aria-label="Weight"
              />
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              name={`dead_line_${index}`}
              label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-picker-mobile-${index}`}
              data-cy={`okr-numeric-mobile-deadline-item-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg text-base"
                popupClassName="text-base"
                data-cy={`okr-numeric-mobile-deadline-picker-${index}`}
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
          <div id={`okr-numeric-mobile-values-row-${index}`} data-cy={`okr-numeric-mobile-values-row-${index}`} className="flex gap-4 pl-4">
            <Form.Item className="flex-1 mb-0" name="initialValue" rules={[{ required: true, message: 'Please enter the initial value' }]} data-cy={`okr-numeric-mobile-initial-item-${index}`}>
              <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-numeric-mobile-initial-input-${index}`} min={0} placeholder="Initial Value" value={keyItem.initialValue ?? 0} onChange={(value) => updateKeyResult(index, 'initialValue', value)} onKeyPress={(e) => { if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') { e.preventDefault(); } }} />
            </Form.Item>
            <Form.Item className="flex-1 mb-0" name="targetValue" rules={[{ required: true, message: 'Please enter the target value' }]} data-cy={`okr-numeric-mobile-target-item-${index}`}>
              <InputNumber className="w-full h-10 rounded-lg text-base" data-cy={`okr-numeric-mobile-target-input-${index}`} min={0} placeholder="Target Value" value={keyItem.targetValue ?? 0} onChange={(value) => updateKeyResult(index, 'targetValue', value)} onKeyPress={(e) => { if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') { e.preventDefault(); } }} />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default NumericForm;
