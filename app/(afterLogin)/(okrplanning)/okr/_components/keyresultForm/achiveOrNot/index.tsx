import React, { useEffect } from 'react';
import { Button, Form, DatePicker, Input, InputNumber } from 'antd';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import {
  useOKRStore,
  useAchieveOrNotStore,
} from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { isKeyResultLockedForWeightEdit } from '../../../_utils/keyResultGuards';
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
  disableWeightEdit: disableWeightEditProp,
  onSaveSuccess,
  hideRemoveButton,
}) => {
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { isMobile } = useIsMobile();
  const isBasic = useIsBasicOkr();
  const disableWeightEdit =
    disableWeightEditProp ?? isKeyResultLockedForWeightEdit(keyItem);
  const cardViewKey = `${keyItem?.id ?? 'new'}-${index}`;
  const setCardView = useAchieveOrNotStore((s) => s.setCardView);
  const isCardView = useAchieveOrNotStore(
    (s) => s.cardViewByKey[cardViewKey] ?? false,
  );

  useEffect(() => {
    if (keyItem?.deadline) {
      form.setFieldsValue({ [`dead_line_${index}`]: dayjs(keyItem.deadline) });
    }
  }, [keyItem?.deadline, index, form]);

  return (
    <div
      id={`okr-achieve-form-container-${index}`}
      data-cy={`okr-achieve-form-container-${index}`}
      className={`relative mb-4 ${isBasic ? `bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-6'}` : `border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-6'}`}`}
    >
      {!hideRemoveButton && (isBasic || !isCardView) ? (
        <div
          className="absolute top-2 right-2"
          style={{ zIndex: 10 }}
          data-cy={`okr-achieve-form-remove-wrapper-${index}`}
        >
          <KeyResultRemoveButton
            onClick={() => removeKeyResult(index)}
            title="Remove Key Result"
            aria-label="Remove Key Result"
            id={`remove-key-result-${index}`}
            data-cy={`okr-achieve-form-remove-${index}`}
          />
        </div>
      ) : null}

      {/* Advanced mode: "You Have Selected" badge */}
      {!isBasic && (
        <KeyResultSelectedBadge
          label="Achieve or not"
          data-cy={`okr-achieve-selected-badge-${index}`}
        />
      )}

      <Form
        id={`okr-achieve-form-${index}`}
        data-cy={`okr-achieve-form-${index}`}
        form={form}
        layout="vertical"
        initialValues={{
          ...keyItem,
          weight:
            keyItem?.weight != null ? Number(keyItem.weight) : keyItem?.weight,
          [`dead_line_${index}`]: keyItem?.deadline
            ? dayjs(keyItem.deadline)
            : undefined,
        }}
        requiredMark={false}
      >
        {/* Desktop Layout - Basic mode (Create modal style: labels, bordered card) */}
        {!isMobile && isBasic && (
          <div
            id={`okr-achieve-desktop-top-row-${index}`}
            data-cy={`okr-achieve-desktop-top-row-${index}`}
            className="flex flex-row flex-wrap gap-4 items-end mt-4"
          >
            <Form.Item
              className="flex-1 min-w-[200px] mb-0"
              name="title"
              label={
                <KeyResultFieldLabel
                  label="Key Result"
                  tooltip={KEY_RESULT_TOOLTIP}
                />
              }
              rules={[
                { required: true, message: 'Please enter the Key Result name' },
              ]}
              id={`key-result-name-${index}`}
              data-cy={`okr-achieve-desktop-title-item-${index}`}
            >
              <Input
                id={`okr-achieve-desktop-title-input-${index}`}
                data-cy={`okr-achieve-desktop-title-input-${index}`}
                placeholder="Input"
                aria-label="Key Result"
                className="h-10 rounded-lg"
              />
            </Form.Item>
            <Form.Item
              className="w-28 mb-0"
              name="weight"
              label={
                <KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />
              }
              rules={[
                { required: true, message: 'Please enter the Weight' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  transform: (v: any) =>
                    v != null && v !== '' ? Number(v) : v,
                  message: 'Weight must be between 0 and 100',
                },
              ]}
              id={`weight-input-${index}`}
              data-cy={`okr-achieve-desktop-weight-item-${index}`}
            >
              <InputNumber
                className="w-full h-10 rounded-lg"
                data-cy={`okr-achieve-desktop-weight-input-${index}`}
                min={0}
                max={100}
                suffix="%"
                placeholder="Input"
                aria-label="Weight"
                disabled={disableWeightEdit}
              />
            </Form.Item>
            <Form.Item
              className="w-44 mb-0"
              name={`dead_line_${index}`}
              label={
                <KeyResultFieldLabel
                  label="Deadline"
                  tooltip={DEADLINE_TOOLTIP}
                />
              }
              rules={[{ required: true, message: 'Please select a deadline' }]}
              id={`deadline-picker-${index}`}
              data-cy={`okr-achieve-desktop-deadline-item-${index}`}
            >
              <DatePicker
                className="w-full h-10 rounded-lg"
                data-cy={`okr-achieve-desktop-deadline-picker-${index}`}
                placeholder="Select date"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const startOfToday = dayjs().startOf('day');
                  const objectiveDeadline = dayjs(objectiveValue?.deadline);
                  return (
                    current &&
                    (current < startOfToday || current > objectiveDeadline)
                  );
                }}
                aria-label="Deadline"
              />
            </Form.Item>
            <Form.Item
              className="mb-0"
              label={
                <span
                  className="opacity-0 select-none"
                  data-cy={`okr-achieve-save-label-spacer-${index}`}
                >
                  Save
                </span>
              }
            >
              <Button
                type="primary"
                className="bg-okr-primary hover:bg-blue-800 text-white h-10 px-6 rounded-lg font-medium"
                onClick={() =>
                  form
                    .validateFields()
                    .then((values) => {
                      // Sync form values to store before collapse (same as Create modal)
                      updateKeyResult(
                        index,
                        'title',
                        (values.title ?? '').toString().trim(),
                      );
                      updateKeyResult(
                        index,
                        'weight',
                        values.weight != null && values.weight !== ''
                          ? Number(values.weight)
                          : values.weight,
                      );
                      const rawDeadline = values[`dead_line_${index}`];
                      updateKeyResult(
                        index,
                        'deadline',
                        rawDeadline != null
                          ? dayjs(rawDeadline).format('YYYY-MM-DD')
                          : null,
                      );
                      onSaveSuccess?.();
                    })
                    .catch(() => {})
                }
                data-cy={`okr-achieve-desktop-save-${index}`}
              >
                Save
              </Button>
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
                onEdit={() => setCardView(cardViewKey, false)}
                id={`okr-achieve-desktop-saved-card-${index}`}
                data-cy={`okr-achieve-desktop-saved-card-${index}`}
              />
            ) : (
              <div
                id={`okr-achieve-desktop-top-row-${index}`}
                data-cy={`okr-achieve-desktop-top-row-${index}`}
                className={ADVANCED_WRAPPER_CLASS}
              >
                <div
                  className={`${ADVANCED_ROW_CLASS} items-end`}
                  data-cy={`okr-achieve-desktop-advanced-row-${index}`}
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    name="title"
                    label={
                      <KeyResultFieldLabel
                        label="Key Result"
                        tooltip={KEY_RESULT_TOOLTIP}
                      />
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the Key Result name',
                      },
                    ]}
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
                      onChange={(e) =>
                        updateKeyResult(index, 'title', e.target.value)
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-32 mb-0"
                    name="weight"
                    label={
                      <KeyResultFieldLabel
                        label="Weight"
                        tooltip={WEIGHT_TOOLTIP}
                      />
                    }
                    rules={[
                      { required: true, message: 'Weight required' },
                      {
                        type: 'number',
                        transform: (v: any) =>
                          v != null && v !== '' ? Number(v) : v,
                        message: 'Must be a number',
                      },
                    ]}
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
                      value={
                        keyItem?.weight != null
                          ? Number(keyItem.weight)
                          : keyItem?.weight
                      }
                      onChange={(value) =>
                        updateKeyResult(index, 'weight', value)
                      }
                      disabled={disableWeightEdit}
                    />
                  </Form.Item>
                  <Form.Item
                    className="w-44 mb-0"
                    name={`dead_line_${index}`}
                    label={
                      <KeyResultFieldLabel
                        label="Deadline"
                        tooltip={DEADLINE_TOOLTIP}
                      />
                    }
                    rules={[{ required: true, message: 'Deadline required' }]}
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
                        const objectiveDeadline = dayjs(
                          objectiveValue?.deadline,
                        );
                        return (
                          current &&
                          (current < startOfToday ||
                            current > objectiveDeadline)
                        );
                      }}
                      onChange={(date) =>
                        updateKeyResult(
                          index,
                          'deadline',
                          date ? date.format('YYYY-MM-DD') : null,
                        )
                      }
                      aria-label="Deadline"
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    label={
                      <span
                        className="opacity-0 select-none"
                        data-cy={`okr-achieve-save-label-spacer-${index}`}
                      >
                        Save
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      className="bg-okr-primary hover:bg-blue-800 text-white h-10 rounded-lg font-medium"
                      onClick={() => {
                        form
                          .validateFields()
                          .then((values) => {
                            updateKeyResult(
                              index,
                              'title',
                              (values.title ?? '').toString().trim(),
                            );
                            updateKeyResult(
                              index,
                              'weight',
                              values.weight != null && values.weight !== ''
                                ? Number(values.weight)
                                : values.weight,
                            );
                            const rawDeadline = values[`dead_line_${index}`];
                            updateKeyResult(
                              index,
                              'deadline',
                              rawDeadline != null
                                ? dayjs(rawDeadline).format('YYYY-MM-DD')
                                : null,
                            );
                            setCardView(cardViewKey, true);
                          })
                          .catch(() => {});
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

        {/* Mobile Layout: Show card view when saved, form view when editing */}
        {isMobile && (
          <>
            {isCardView ? (
              <div
                className="mt-4 mx-4"
                data-cy={`okr-achieve-mobile-card-wrapper-${index}`}
              >
                <KeyResultSavedCard
                  weight={keyItem.weight ?? 0}
                  title={keyItem.title ?? ''}
                  onEdit={() => {
                    setCardView(cardViewKey, false);
                    // Sync form values with current keyItem data
                    form.setFieldsValue({
                      title: keyItem.title,
                      weight:
                        keyItem?.weight != null
                          ? Number(keyItem.weight)
                          : keyItem?.weight,
                      [`dead_line_${index}`]: keyItem.deadline
                        ? dayjs(keyItem.deadline)
                        : null,
                    });
                  }}
                  id={`okr-achieve-mobile-saved-card-${index}`}
                  data-cy={`okr-achieve-mobile-saved-card-${index}`}
                />
              </div>
            ) : (
              <div
                id={`okr-achieve-mobile-wrapper-${index}`}
                data-cy={`okr-achieve-mobile-wrapper-${index}`}
                className="space-y-4 mt-4 mx-4"
              >
                <Form.Item
                  className="mb-0"
                  name="title"
                  label={
                    <KeyResultFieldLabel
                      label="Key Result"
                      tooltip={KEY_RESULT_TOOLTIP}
                    />
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the Key Result name',
                    },
                  ]}
                  id={`key-result-name-mobile-${index}`}
                  data-cy={`okr-achieve-mobile-title-item-${index}`}
                >
                  <Input
                    id={`okr-achieve-mobile-title-input-${index}`}
                    data-cy={`okr-achieve-mobile-title-input-${index}`}
                    placeholder="Input"
                    aria-label="Key Result Name"
                    className="h-10 rounded-lg text-base"
                  />
                </Form.Item>
                <div
                  id={`okr-achieve-mobile-meta-row-${index}`}
                  data-cy={`okr-achieve-mobile-meta-row-${index}`}
                  className="flex gap-2 items-end"
                >
                  <Form.Item
                    className="flex-1 mb-0"
                    name="weight"
                    label={
                      <KeyResultFieldLabel
                        label="Weight"
                        tooltip={WEIGHT_TOOLTIP}
                      />
                    }
                    rules={[
                      { required: true, message: 'Please enter the Weight' },
                      {
                        type: 'number',
                        transform: (v: any) =>
                          v != null && v !== '' ? Number(v) : v,
                        message: 'Weight must be a number',
                      },
                    ]}
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
                      disabled={disableWeightEdit}
                    />
                  </Form.Item>
                  <Form.Item
                    className="flex-1 mb-0"
                    name={`dead_line_${index}`}
                    label={
                      <KeyResultFieldLabel
                        label="Deadline"
                        tooltip={DEADLINE_TOOLTIP}
                      />
                    }
                    rules={[
                      { required: true, message: 'Please select a deadline' },
                    ]}
                    id={`deadline-picker-mobile-${index}`}
                    data-cy={`okr-achieve-mobile-deadline-item-${index}`}
                  >
                    <DatePicker
                      className="w-full h-10 rounded-lg text-base"
                      data-cy={`okr-achieve-mobile-deadline-picker-${index}`}
                      placeholder="Select date"
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        const startOfToday = dayjs().startOf('day');
                        const objectiveDeadline = dayjs(
                          objectiveValue?.deadline,
                        );
                        return (
                          current &&
                          (current < startOfToday ||
                            current > objectiveDeadline)
                        );
                      }}
                      aria-label="Deadline"
                    />
                  </Form.Item>
                  <Form.Item
                    className="mb-0"
                    label={
                      <span
                        className="opacity-0 select-none"
                        data-cy={`okr-achieve-save-label-spacer-${index}`}
                      >
                        Save
                      </span>
                    }
                  >
                    <Button
                      type="primary"
                      className="bg-okr-primary hover:bg-blue-800 text-white h-10 rounded-lg font-medium px-4"
                      onClick={() => {
                        form
                          .validateFields()
                          .then((values) => {
                            updateKeyResult(
                              index,
                              'title',
                              (values.title ?? '').toString().trim(),
                            );
                            updateKeyResult(
                              index,
                              'weight',
                              values.weight != null && values.weight !== ''
                                ? Number(values.weight)
                                : values.weight,
                            );
                            const rawDeadline = values[`dead_line_${index}`];
                            updateKeyResult(
                              index,
                              'deadline',
                              rawDeadline != null
                                ? dayjs(rawDeadline).format('YYYY-MM-DD')
                                : null,
                            );
                            onSaveSuccess
                              ? onSaveSuccess()
                              : setCardView(cardViewKey, true);
                          })
                          .catch(() => {});
                      }}
                      data-cy={`okr-achieve-mobile-save-${index}`}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </div>
              </div>
            )}
          </>
        )}
      </Form>
    </div>
  );
};

export default AchieveOrNot;
