import React, { useEffect } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useOKRStore, useMilestoneFormStore } from '@/store/uistate/features/okrplanning/okr';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useIsBasicOkr } from '../../../_utils/okrMode';
import { isKeyResultLockedForWeightEdit } from '../../../_utils/keyResultGuards';
import {
  KeyResultFieldLabel,
  KeyResultRemoveButton,
  KeyResultSectionCard,
  KeyResultSelectedBadge,
  KEY_RESULT_TOOLTIP,
  WEIGHT_TOOLTIP,
  DEADLINE_TOOLTIP,
  ADVANCED_ROW_CLASS,
  ADVANCED_WRAPPER_CLASS,
  INPUT_CLASS,
} from '../_ui';

/** Stable empty array to avoid useEffect loop when keyItem has no milestones. */
const EMPTY_MILESTONES: { title?: string; weight?: number }[] = [];

const MilestoneForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  disableWeightEdit: disableWeightEditProp,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  const { objectiveValue } = useOKRStore();
  const { data: metrics } = useGetMetrics();
  const isBasic = useIsBasicOkr();
  const disableWeightEdit = disableWeightEditProp ?? isKeyResultLockedForWeightEdit(keyItem);
  const storeKey = `milestone-${keyItem?.id ?? 'new'}-${index}`;
  const setMilestonesInStore = useMilestoneFormStore((s) => s.setMilestones);
  const milestones = useMilestoneFormStore((s) => s.milestonesByKey[storeKey]) ?? (
    keyItem.milestones && keyItem.milestones.length > 0 ? keyItem.milestones : EMPTY_MILESTONES
  );

  const setMilestones = (next: typeof milestones) => setMilestonesInStore(storeKey, next);

  useEffect(() => {
    updateKeyResult(index, 'milestones', milestones);
    // eslint-disable-next-line
  }, [milestones]);

  useEffect(() => {
    if (keyItem?.deadline) {
      form.setFieldsValue({ [`dead_line_${index}`]: dayjs(keyItem.deadline) });
    }
  }, [keyItem?.deadline, index, form]);

  const calculateAndDistributeWeights = (milestoneList: any[]) => {
    if (milestoneList.length === 0) return [];
    const baseWeight = Math.floor(100 / milestoneList.length);
    const remainder = 100 - baseWeight * milestoneList.length;
    return milestoneList.map((milestone, idx) => ({
      ...milestone,
      weight: baseWeight + (idx < remainder ? 1 : 0),
    }));
  };

  const handleAddMilestone = () => {
    const newMilestone = { title: '', weight: 0 };
    const updatedMilestones = [newMilestone, ...milestones];
    const distributedMilestones = calculateAndDistributeWeights(updatedMilestones);
    setMilestones(distributedMilestones);
  };

  const handleMilestoneChange = (mIndex: number, field: string, value: any) => {
    const updated = milestones.map((m: any, i: number) =>
      i === mIndex ? { ...m, [field]: value } : m,
    );
    setMilestones(updated);
  };

  const handleEditMilestone = (mIndex: number) => {
    if (mIndex <= 0 || mIndex >= milestones.length) return;
    const moved = milestones[mIndex];
    let rest = milestones.filter((_: any, i: number) => i !== mIndex);
    // When moving a saved milestone to the top, drop the current top row if it's empty
    // so we don't get an "Untitled milestone" card
    const currentFirst = milestones[0];
    const isEmpty = !currentFirst?.title || String(currentFirst.title).trim() === '';
    if (isEmpty && rest.length > 0 && rest[0] === currentFirst) {
      rest = rest.slice(1);
    }
    const reordered = [moved, ...rest];
    setMilestones(calculateAndDistributeWeights(reordered));
  };

  const milestoneWeightSum = milestones.reduce(
    (sum: number, m: any) => sum + Number(m?.weight ?? 0),
    0,
  );

  const { isMobile } = useIsMobile();

  return (
    <div
      id={`okr-milestone-form-container-${index}`}
      data-cy={`okr-milestone-form-container-${index}`}
      className={`relative mb-4 ${isBasic ? 'bg-gray-50 rounded-xl border-none p-6' : 'border border-gray-200 rounded-lg p-6'}`}
    >
      <div className="absolute top-2 right-2" style={{ zIndex: 10 }}>
        <KeyResultRemoveButton
          onClick={() => removeKeyResult(index)}
          title="Remove Key Result"
          aria-label="Remove Key Result"
          id={`cancel-key-result-${index}`}
          data-cy={`okr-milestone-remove-key-result-${index}`}
        />
      </div>

      {/* Advanced mode: "You Have Selected" badge */}
      {!isBasic && (
        <KeyResultSelectedBadge
          label={isMobile ? 'Milestone' : `${milestones.length} Milestone`}
          data-cy={`okr-milestone-selected-badge-${index}`}
        />
      )}

      <Form
        id={`okr-milestone-form-${index}`}
        data-cy={`okr-milestone-form-${index}`}
        form={form}
        layout="vertical"
        initialValues={{
          ...keyItem,
          [`dead_line_${index}`]: keyItem?.deadline ? dayjs(keyItem.deadline) : undefined,
        }}
        requiredMark={false}
      >
        {isMobile ? (
          /* ---- Mobile layout: Key Result * full width, Weight * + Deadline * one row ---- */
          <div
            id={`okr-milestone-mobile-wrapper-${index}`}
            data-cy={`okr-milestone-mobile-wrapper-${index}`}
            className="flex flex-col gap-2 mt-4"
          >
            <div id={`okr-milestone-mobile-title-row-${index}`} data-cy={`okr-milestone-mobile-title-row-${index}`}>
              <Form.Item
                className="mb-0"
                name="title"
                label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
                rules={[{ required: true, message: 'Please enter the Key Result name' }]}
                id={`key-result-title-${index}`}
                data-cy={`okr-milestone-mobile-title-item-${index}`}
              >
                <Input
                  id={`okr-milestone-mobile-title-input-${index}`}
                  data-cy={`okr-milestone-mobile-title-input-${index}`}
                  placeholder="Input"
                  aria-label="Key Result Name"
                  className="h-10 rounded-lg text-base"
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                  onPressEnter={(e) => e.preventDefault()}
                />
              </Form.Item>
            </div>
            <div id={`okr-milestone-mobile-meta-row-${index}`} data-cy={`okr-milestone-mobile-meta-row-${index}`} className="flex flex-row gap-2">
              <Form.Item
                className="flex-1 mb-0"
                name="weight"
                label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
                rules={[{ required: true, message: 'Please enter the Weight' }, { type: 'number', message: 'Weight must be a number' }]}
                id={`key-result-weight-${index}`}
                data-cy={`okr-milestone-mobile-weight-item-${index}`}
              >
                <InputNumber
                  className="w-full h-10 rounded-lg text-base"
                  data-cy={`okr-milestone-mobile-weight-input-${index}`}
                  min={0}
                  max={100}
                  suffix="%"
                  placeholder="Input"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                  disabled={disableWeightEdit}
                />
              </Form.Item>
              <Form.Item
                className="flex-1 mb-0"
                name={`dead_line_${index}`}
                label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
                rules={[{ required: true, message: 'Please select a deadline' }]}
                id={`key-result-deadline-${index}`}
                data-cy={`okr-milestone-mobile-deadline-item-${index}`}
              >
                <DatePicker
                  className="w-full h-10 rounded-lg text-base"
                  data-cy={`okr-milestone-mobile-deadline-picker-${index}`}
                  value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  placeholder="Select date"
                  disabledDate={(current) => {
                    const startOfToday = dayjs().startOf('day');
                    const objectiveDeadline = dayjs(objectiveValue?.deadline);
                    return current && (current < startOfToday || current > objectiveDeadline);
                  }}
                  onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)}
                  id={`deadline-picker-${index}`}
                />
              </Form.Item>
            </div>
            <div id={`okr-milestone-mobile-list-${index}`} data-cy={`okr-milestone-mobile-list-${index}`} className="flex flex-col gap-2">
              {milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500 mb-4 text-center px-4">You have no milestones yet add one to get started</p>
                  <Button id={`okr-milestone-mobile-add-${index}`} data-cy={`okr-milestone-mobile-add-${index}`} className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center" aria-label="Add Milestone" onClick={handleAddMilestone} type="primary">Add</Button>
                </div>
              ) : (
                <>
                  <div id={`okr-milestone-mobile-row-0-${index}`} data-cy={`okr-milestone-mobile-row-0-${index}`} className="flex flex-row gap-2 items-center">
                    <Form.Item className="flex-1 mb-0" data-cy={`okr-milestone-mobile-title-item-0-${index}`}>
                      <Input id={`okr-milestone-mobile-title-input-0-${index}`} data-cy={`okr-milestone-mobile-title-input-0-${index}`} className="h-10 rounded-lg text-base" placeholder="Set Milestone" value={milestones[0]?.title === '' ? undefined : milestones[0]?.title} onChange={(e) => handleMilestoneChange(0, 'title', e.target.value)} onPressEnter={(e) => e.preventDefault()} />
                    </Form.Item>
                    <Form.Item className="w-24 mb-0" data-cy={`okr-milestone-mobile-weight-item-0-${index}`}>
                      <InputNumber id={`okr-milestone-mobile-weight-input-0-${index}`} data-cy={`okr-milestone-mobile-weight-input-0-${index}`} className="w-full h-10 rounded-lg text-base" min={0} max={100} placeholder="Weight" suffix="%" value={milestones[0]?.weight} onChange={(value) => handleMilestoneChange(0, 'weight', value)} />
                    </Form.Item>
                  </div>
                  {milestones.slice(1).map((milestone: any, mIndex: number) => (
                    <div key={mIndex + 1} id={`okr-milestone-mobile-row-${mIndex + 1}-${index}`} data-cy={`okr-milestone-mobile-row-${mIndex + 1}-${index}`} className="flex flex-row gap-2 items-start border border-gray-200 rounded-lg p-2">
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">Weight {milestone.weight}%</span>
                        <span className="text-sm font-medium text-gray-900 truncate block">{milestone.title || 'Untitled milestone'}</span>
                      </div>
                      <button type="button" onClick={() => handleEditMilestone(mIndex + 1)} title="Edit Milestone" aria-label="Edit Milestone" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 pt-0.5" data-cy={`okr-milestone-mobile-edit-${mIndex + 1}-${index}`}>
                        <EditOutlined className="text-xs" />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-lg mt-2">
                    <Button id={`okr-milestone-mobile-add-${index}`} data-cy={`okr-milestone-mobile-add-${index}`} className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center w-fit" aria-label="Add Milestone" onClick={handleAddMilestone} type="primary">Add</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : isBasic ? (
          /* ---- Basic mode desktop layout (unchanged) ---- */
          <div id={`okr-milestone-desktop-wrapper-${index}`} data-cy={`okr-milestone-desktop-wrapper-${index}`} className="flex flex-col gap-2 mt-4 mx-4">
            <div id={`okr-milestone-desktop-meta-row-${index}`} data-cy={`okr-milestone-desktop-meta-row-${index}`} className="flex flex-row gap-2 items-center">
              <Form.Item className="flex-1 mr-2 mb-0" name="title" rules={[{ required: true, message: 'Please enter the Key Result name' }]} id={`key-result-title-${index}`} data-cy={`okr-milestone-desktop-title-item-${index}`}>
                <Input id={`okr-milestone-desktop-title-input-${index}`} data-cy={`okr-milestone-desktop-title-input-${index}`} placeholder="Key Result Name" aria-label="Key Result Name" className="h-10 rounded-lg text-base" value={keyItem.title === '' ? undefined : keyItem.title} onChange={(e) => updateKeyResult(index, 'title', e.target.value)} onPressEnter={(e) => e.preventDefault()} />
              </Form.Item>
              <Form.Item className="w-48 mb-0" rules={[{ required: true, message: 'Please select a Key Result type' }]} id={`key-result-type-${index}`} data-cy={`okr-milestone-desktop-type-item-${index}`}>
                <Select className="w-full h-10 rounded-lg text-base" data-cy={`okr-milestone-desktop-type-select-${index}`} placeholder="Please select a metric type" onChange={(value) => { const selectedMetric = metrics?.items?.find((metric) => metric.id === value); if (selectedMetric) { updateKeyResult(index, 'metricTypeId', value); updateKeyResult(index, 'key_type', selectedMetric.name); } }} value={metrics?.items?.find((metric) => metric.name === keyItem.key_type)?.id || ''} id={`select-metric-type-${index}`}>
                  <Option data-cy={`okr-milestone-desktop-type-option-${index}`} value="" disabled>Please select a metric type</Option>
                  {metrics?.items?.map((metric) => (<Option data-cy={`okr-milestone-desktop-type-option-${index}-${metric?.id}`} key={metric?.id} value={metric?.id}>{metric?.name}</Option>))}
                </Select>
              </Form.Item>
              <Form.Item className="w-24 mb-0" name="weight" rules={[{ required: true, message: 'Please enter the Weight' }, { type: 'number', message: 'Weight must be a number' }]} id={`key-result-weight-${index}`} data-cy={`okr-milestone-desktop-weight-item-${index}`}>
                <InputNumber id={`okr-milestone-desktop-weight-input-${index}`} data-cy={`okr-milestone-desktop-weight-input-${index}`} className="w-full h-10 rounded-lg text-base" min={0} max={100} suffix="%" placeholder="100" value={keyItem.weight} onChange={(value) => updateKeyResult(index, 'weight', value)} disabled={disableWeightEdit} />
              </Form.Item>
              <Form.Item className="w-48 mb-0" name={`dead_line_${index}`} rules={[{ required: true, message: 'Please select a deadline' }]} id={`key-result-deadline-${index}`} data-cy={`okr-milestone-desktop-deadline-item-${index}`}>
                <DatePicker data-cy={`okr-milestone-desktop-deadline-picker-${index}`} className="w-full h-10 rounded-lg text-base" value={keyItem.deadline ? dayjs(keyItem.deadline) : null} format="YYYY-MM-DD" disabledDate={(current) => { const startOfToday = dayjs().startOf('day'); const objectiveDeadline = dayjs(objectiveValue?.deadline); return current && (current < startOfToday || current > objectiveDeadline); }} onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)} id={`deadline-picker-${index}`} />
              </Form.Item>
            </div>
            <div id={`okr-milestone-desktop-list-${index}`} data-cy={`okr-milestone-desktop-list-${index}`} className="flex flex-col gap-2 pl-4">
              {milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500 mb-4 text-center px-4">You have no milestones yet add one to get started</p>
                  <Button id={`okr-milestone-desktop-add-${index}`} data-cy={`okr-milestone-desktop-add-${index}`} className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center w-fit" aria-label="Add Milestone" onClick={handleAddMilestone} type="primary">Add Milestone</Button>
                </div>
              ) : (
                <>
                  <div id={`okr-milestone-desktop-row-0-${index}`} data-cy={`okr-milestone-desktop-row-0-${index}`} className="flex flex-row gap-2 items-center">
                    <Form.Item className="flex-1 mb-0" data-cy={`okr-milestone-desktop-title-item-0-${index}`}>
                      <Input id={`okr-milestone-desktop-title-input-0-${index}`} data-cy={`okr-milestone-desktop-title-input-0-${index}`} className="h-10 rounded-lg text-base" placeholder="Set Milestone" value={milestones[0]?.title === '' ? undefined : milestones[0]?.title} onChange={(e) => handleMilestoneChange(0, 'title', e.target.value)} onPressEnter={(e) => e.preventDefault()} />
                    </Form.Item>
                    <Form.Item className="w-24 mb-0" data-cy={`okr-milestone-desktop-weight-item-0-${index}`}>
                      <InputNumber id={`okr-milestone-desktop-weight-input-0-${index}`} data-cy={`okr-milestone-desktop-weight-input-0-${index}`} className="w-full h-10 rounded-lg text-base" min={0} max={100} placeholder="Weight" suffix="%" value={milestones[0]?.weight} onChange={(value) => handleMilestoneChange(0, 'weight', value)} />
                    </Form.Item>
                  </div>
                  {milestones.slice(1).map((milestone: any, mIndex: number) => (
                    <div key={mIndex + 1} id={`okr-milestone-desktop-row-${mIndex + 1}-${index}`} data-cy={`okr-milestone-desktop-row-${mIndex + 1}-${index}`} className="flex flex-row gap-2 items-start border border-gray-200 rounded-lg p-2">
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">Weight {milestone.weight}%</span>
                        <span className="text-sm font-medium text-gray-900 truncate">{milestone.title || 'Untitled milestone'}</span>
                      </div>
                      <div className="w-48 flex gap-2 items-start pt-0.5" id={`okr-milestone-desktop-actions-${mIndex + 1}-${index}`} data-cy={`okr-milestone-desktop-actions-${mIndex + 1}-${index}`}>
                        <button type="button" onClick={() => handleEditMilestone(mIndex + 1)} title="Edit Milestone" aria-label="Edit Milestone" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" data-cy={`okr-milestone-desktop-edit-${mIndex + 1}-${index}`}>
                          <EditOutlined className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-lg mt-2">
                    <Button id={`okr-milestone-desktop-add-${index}`} data-cy={`okr-milestone-desktop-add-${index}`} className="bg-[#2B3CF1] hover:bg-[#1d2bb8] text-white font-semibold rounded-lg h-10 flex items-center justify-center w-fit" aria-label="Add Milestone" onClick={handleAddMilestone} type="primary">Add Milestone</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ---- Advanced mode desktop layout ---- */
          <div
            id={`okr-milestone-desktop-wrapper-${index}`}
            data-cy={`okr-milestone-desktop-wrapper-${index}`}
            className={ADVANCED_WRAPPER_CLASS}
          >
            <div
              id={`okr-milestone-desktop-meta-row-${index}`}
              data-cy={`okr-milestone-desktop-meta-row-${index}`}
              className={ADVANCED_ROW_CLASS}
            >
              <Form.Item
                className="flex-1 mb-0"
                name="title"
                label={<KeyResultFieldLabel label="Key Result" tooltip={KEY_RESULT_TOOLTIP} />}
                rules={[{ required: true, message: 'Please enter the Key Result name' }]}
                id={`key-result-title-${index}`}
                data-cy={`okr-milestone-desktop-title-item-${index}`}
              >
                <Input
                  id={`okr-milestone-desktop-title-input-${index}`}
                  data-cy={`okr-milestone-desktop-title-input-${index}`}
                  placeholder="Input"
                  aria-label="Key Result Name"
                  className={INPUT_CLASS}
                  value={keyItem.title === '' ? undefined : keyItem.title}
                  onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                  onPressEnter={(e) => e.preventDefault()}
                />
              </Form.Item>
              <Form.Item
                className="w-32 mb-0"
                name="weight"
                label={<KeyResultFieldLabel label="Weight" tooltip={WEIGHT_TOOLTIP} />}
                rules={[{ required: true, message: 'Weight required' }, { type: 'number', message: 'Must be a number' }]}
                id={`key-result-weight-${index}`}
                data-cy={`okr-milestone-desktop-weight-item-${index}`}
              >
                <InputNumber
                  id={`okr-milestone-desktop-weight-input-${index}`}
                  data-cy={`okr-milestone-desktop-weight-input-${index}`}
                  className={`w-full ${INPUT_CLASS}`}
                  min={0}
                  max={100}
                  suffix="%"
                  placeholder="Input"
                  value={keyItem.weight}
                  onChange={(value) => updateKeyResult(index, 'weight', value)}
                  disabled={disableWeightEdit}
                />
              </Form.Item>
              <Form.Item
                className="w-44 mb-0"
                name={`dead_line_${index}`}
                label={<KeyResultFieldLabel label="Deadline" tooltip={DEADLINE_TOOLTIP} />}
                rules={[{ required: true, message: 'Deadline required' }]}
                id={`key-result-deadline-${index}`}
                data-cy={`okr-milestone-desktop-deadline-item-${index}`}
              >
                <DatePicker
                  data-cy={`okr-milestone-desktop-deadline-picker-${index}`}
                  className={`w-full ${INPUT_CLASS}`}
                  placeholder="Select date"
                  value={keyItem.deadline ? dayjs(keyItem.deadline) : null}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const startOfToday = dayjs().startOf('day');
                    const objectiveDeadline = dayjs(objectiveValue?.deadline);
                    return current && (current < startOfToday || current > objectiveDeadline);
                  }}
                  onChange={(date) => updateKeyResult(index, 'deadline', date ? date.format('YYYY-MM-DD') : null)}
                  id={`deadline-picker-${index}`}
                />
              </Form.Item>
            </div>

            <KeyResultSectionCard
              id={`okr-milestone-desktop-list-${index}`}
              data-cy={`okr-milestone-desktop-list-${index}`}
              title="Milestones"
              badge={
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    milestoneWeightSum === 100
                      ? 'border-green-300 text-green-600 bg-green-50'
                      : 'border-blue-300 text-okr-primary bg-blue-50'
                  }`}
                >
                  Total Weight: {milestoneWeightSum}
                </span>
              }
            >
              {milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg" id={`okr-milestone-desktop-add-wrapper-${index}`}>
                  <p className="text-sm text-gray-500 mb-4">You have no milestones yet add one to get started</p>
                  <Button
                    id={`okr-milestone-desktop-add-${index}`}
                    data-cy={`okr-milestone-desktop-add-${index}`}
                    className="bg-okr-primary hover:bg-blue-800 text-white font-medium rounded-lg h-10 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-okr-primary"
                    aria-label="Add Milestone"
                    onClick={handleAddMilestone}
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    Add Milestone
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`${ADVANCED_ROW_CLASS} mb-2`}>
                    <div className="flex-1">
                      <KeyResultFieldLabel label="Milestone" tooltip="Enter the milestone name" />
                    </div>
                    <div className="w-32">
                      <KeyResultFieldLabel label="Weight" tooltip="Milestone weight" />
                    </div>
                    <div className="w-8" />
                  </div>

                  <div
                    id={`okr-milestone-desktop-row-0-${index}`}
                    data-cy={`okr-milestone-desktop-row-0-${index}`}
                    className={`${ADVANCED_ROW_CLASS} items-center mb-3`}
                  >
                    <Form.Item className="flex-1 mb-0" data-cy={`okr-milestone-desktop-title-item-0-${index}`}>
                      <Input
                        id={`okr-milestone-desktop-title-input-0-${index}`}
                        data-cy={`okr-milestone-desktop-title-input-0-${index}`}
                        className={INPUT_CLASS}
                        placeholder="Input"
                        value={milestones[0]?.title === '' ? undefined : milestones[0]?.title}
                        onChange={(e) => handleMilestoneChange(0, 'title', e.target.value)}
                        onPressEnter={(e) => e.preventDefault()}
                      />
                    </Form.Item>
                    <Form.Item className="w-32 mb-0" data-cy={`okr-milestone-desktop-weight-item-0-${index}`}>
                      <InputNumber
                        id={`okr-milestone-desktop-weight-input-0-${index}`}
                        data-cy={`okr-milestone-desktop-weight-input-0-${index}`}
                        className={`w-full ${INPUT_CLASS}`}
                        min={0}
                        max={100}
                        placeholder="Input"
                        suffix="%"
                        value={milestones[0]?.weight}
                        onChange={(value) => handleMilestoneChange(0, 'weight', value)}
                      />
                    </Form.Item>
                    <div className="w-8" />
                  </div>

                  {milestones.slice(1).map((milestone: any, mIndex: number) => (
                    <div
                      key={mIndex + 1}
                      id={`okr-milestone-desktop-row-${mIndex + 1}-${index}`}
                      data-cy={`okr-milestone-desktop-row-${mIndex + 1}-${index}`}
                      className="border border-gray-200 rounded-lg p-3 mb-2 flex items-start justify-between"
                    >
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                          Weight {milestone.weight}%
                        </span>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {milestone.title || <span className="text-gray-400 italic">Untitled milestone</span>}
                        </p>
                      </div>
                      <div className="flex items-start gap-2 flex-shrink-0 pt-0.5">
                        <Tooltip title="Edit milestone">
                          <button
                            type="button"
                            onClick={() => handleEditMilestone(mIndex + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                            data-cy={`okr-milestone-desktop-edit-${mIndex + 1}-${index}`}
                            aria-label="Edit milestone"
                          >
                            <EditOutlined className="text-xs" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 rounded-lg mt-3" id={`okr-milestone-desktop-add-wrapper-${index}`}>
                    <Button
                      id={`okr-milestone-desktop-add-${index}`}
                      data-cy={`okr-milestone-desktop-add-${index}`}
                      className="bg-okr-primary hover:bg-blue-800 text-white font-medium rounded-lg h-10 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-okr-primary"
                      aria-label="Add Milestone"
                      onClick={handleAddMilestone}
                      type="primary"
                      icon={<PlusOutlined />}
                    >
                      Add Milestone
                    </Button>
                  </div>
                </>
              )}
            </KeyResultSectionCard>
          </div>
        )}
      </Form>
    </div>
  );
};

export default MilestoneForm;
