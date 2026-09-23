'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Steps,
  Tag,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useGrowthPlanStore,
  WizardGoalDraft,
} from '@/store/uistate/features/tna/growthPlan';
import {
  useGetGrowthPlanConfig,
  useGetGrowthPlanTaxonomy,
} from '@/store/server/features/tna/growthPlan/queries';
import { useCreateGrowthPlan } from '@/store/server/features/tna/growthPlan/mutations';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { DEFAULT_GROWTH_PLAN_CONFIG } from '@/types/tna/growthPlan';
import NotificationMessage from '@/components/common/notification/notificationMessage';

/**
 * Multi-step yearly growth plan wizard (flat skills under category).
 * Pattern found: add-employee-modal — progressDot Steps + vertical labels.
 */
const PlanWizardDrawer = () => {
  const [customForm] = Form.useForm();
  const [skillSearch, setSkillSearch] = useState('');
  const {
    isWizardOpen,
    wizardStep,
    setWizardStep,
    categoryId,
    setCategoryId,
    shortlistSkillIds,
    setShortlistSkillIds,
    goals,
    setGoals,
    resetWizard,
  } = useGrowthPlanStore();

  const { data: configData } = useGetGrowthPlanConfig();
  const { data: taxonomy } = useGetGrowthPlanTaxonomy();
  const { data: activeFy } = useGetActiveFiscalYears();
  const { mutateAsync: createPlan, isLoading: creating } =
    useCreateGrowthPlan();

  const config = configData ?? DEFAULT_GROWTH_PLAN_CONFIG;
  const limitsOn = Boolean(config.enforceCapacityLimits);
  const mappedCategories = useMemo(
    () =>
      (taxonomy ?? []).filter((c) => c.isMapped && (c.skills?.length ?? 0) > 0),
    [taxonomy],
  );
  const selectedCategory = mappedCategories.find((c) => c.id === categoryId);
  const skillsForShortlist = selectedCategory?.skills ?? [];
  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skillsForShortlist;
    return skillsForShortlist.filter((s) => s.name.toLowerCase().includes(q));
  }, [skillsForShortlist, skillSearch]);

  const quarters = useMemo(() => {
    const sessions = activeFy?.sessions ?? [];
    if (sessions.length) {
      return sessions.map((s, idx) => ({
        id: s.id,
        label: s.name || `Q${idx + 1}`,
      }));
    }
    return [1, 2, 3, 4].map((n) => ({
      id: `q${n}`,
      label: `Q${n}`,
    }));
  }, [activeFy]);

  const goalsByQuarter = useMemo(() => {
    const map: Record<string, number> = {};
    quarters.forEach((q) => {
      map[q.id] = 0;
    });
    goals.forEach((g) => {
      if (g.quarterId) map[g.quarterId] = (map[g.quarterId] ?? 0) + 1;
    });
    return map;
  }, [goals, quarters]);

  const close = () => {
    resetWizard();
    customForm.resetFields();
    setSkillSearch('');
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      if (!categoryId) {
        NotificationMessage.warning({
          message: 'Incomplete',
          description: 'Select a skill category.',
        });
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!shortlistSkillIds.length) {
        NotificationMessage.warning({
          message: 'Shortlist empty',
          description: 'Select at least one skill to develop.',
        });
        return false;
      }
      if (limitsOn) {
        const minShort = config.minSkillsInPlanShortlist ?? 0;
        const maxShort = config.maxSkillsInPlanShortlist;
        if (shortlistSkillIds.length < minShort) {
          NotificationMessage.warning({
            message: 'Shortlist too small',
            description: `Select at least ${minShort} skills.`,
          });
          return false;
        }
        if (maxShort != null && shortlistSkillIds.length > maxShort) {
          NotificationMessage.warning({
            message: 'Shortlist too large',
            description: `Select at most ${maxShort} skills.`,
          });
          return false;
        }
      }
      return true;
    }
    if (step === 2) {
      if (!goals.length) {
        NotificationMessage.warning({
          message: 'No goals',
          description: 'Schedule at least one skill into a quarter.',
        });
        return false;
      }
      if (limitsOn) {
        const minQ = config.minSkillsPerQuarter ?? 0;
        const maxQ = config.maxSkillsPerQuarter;
        for (const [quarterId, count] of Object.entries(goalsByQuarter)) {
          if (count === 0) continue;
          if (count < minQ) {
            const label =
              quarters.find((q) => q.id === quarterId)?.label ?? quarterId;
            NotificationMessage.warning({
              message: 'Quarter minimum',
              description: `${label} needs at least ${minQ} skill(s).`,
            });
            return false;
          }
          if (maxQ != null && count > maxQ) {
            const label =
              quarters.find((q) => q.id === quarterId)?.label ?? quarterId;
            NotificationMessage.warning({
              message: 'Quarter maximum',
              description: `${label} allows at most ${maxQ} skill(s).`,
            });
            return false;
          }
        }
      }
      const incomplete = goals.some(
        (g) =>
          !g.measurableOutcome?.trim() || !g.targetDeadline || !g.quarterId,
      );
      if (incomplete) {
        NotificationMessage.warning({
          message: 'Incomplete goals',
          description:
            'Each goal needs an outcome, deadline, and quarter assignment.',
        });
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(wizardStep)) return;
    if (wizardStep === 1 && !goals.length) {
      const seeded: WizardGoalDraft[] = shortlistSkillIds.map((id) => {
        const skill = skillsForShortlist.find((s) => s.id === id);
        return {
          key: id,
          skillId: id,
          skillName: skill?.name ?? id,
          isCustom: false,
          measurableOutcome: '',
          targetDeadline: null,
          quarterId: null,
        };
      });
      setGoals(seeded);
    }
    setWizardStep(Math.min(wizardStep + 1, 3));
  };

  const goBack = () => setWizardStep(Math.max(wizardStep - 1, 0));

  const toggleShortlist = (skillId: string, checked: boolean) => {
    if (checked) {
      if (
        limitsOn &&
        config.maxSkillsInPlanShortlist != null &&
        shortlistSkillIds.length >= config.maxSkillsInPlanShortlist
      ) {
        NotificationMessage.warning({
          message: 'Shortlist limit',
          description: `Maximum ${config.maxSkillsInPlanShortlist} skills.`,
        });
        return;
      }
      setShortlistSkillIds([...shortlistSkillIds, skillId]);
    } else {
      setShortlistSkillIds(shortlistSkillIds.filter((id) => id !== skillId));
      setGoals(goals.filter((g) => g.skillId !== skillId));
    }
  };

  const updateGoal = (key: string, patch: Partial<WizardGoalDraft>) => {
    setGoals(goals.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  };

  const addCustomSkill = async () => {
    const values = await customForm.validateFields().catch(() => null);
    if (!values) return;
    const key = `custom-${Date.now()}`;
    setGoals([
      ...goals,
      {
        key,
        skillId: null,
        skillName: values.skillName,
        isCustom: true,
        measurableOutcome: values.measurableOutcome || '',
        targetDeadline: values.targetDeadline
          ? values.targetDeadline.format('YYYY-MM-DD')
          : null,
        quarterId: values.quarterId || null,
        quarterLabel: quarters.find((q) => q.id === values.quarterId)?.label,
      },
    ]);
    customForm.resetFields();
  };

  const buildPayload = () => {
    if (!activeFy?.id || !categoryId) {
      throw new Error('Missing plan fields');
    }
    return {
      fiscalYearId: activeFy.id,
      categoryId,
      shortlistSkillIds,
      goals: goals.map((g) => ({
        skillId: g.skillId,
        skillName: g.skillName,
        isCustom: g.isCustom,
        measurableOutcome: g.measurableOutcome,
        targetDeadline: g.targetDeadline as string,
        quarterId: g.quarterId as string,
        quarterLabel:
          g.quarterLabel || quarters.find((q) => q.id === g.quarterId)?.label,
      })),
    };
  };

  const onSaveDraft = async () => {
    if (!validateStep(2)) return;
    try {
      await createPlan({ ...buildPayload(), asDraft: true });
      close();
    } catch {
      /* handled */
    }
  };

  const onSubmit = async () => {
    if (!validateStep(2)) return;
    try {
      await createPlan(buildPayload());
      close();
    } catch {
      /* handled */
    }
  };

  return (
    <Modal
      title="Create growth plan"
      open={isWizardOpen}
      onCancel={close}
      width={800}
      destroyOnClose
      centered
      data-cy="pgp-wizard-modal"
      styles={{
        body: {
          height: wizardStep === 0 ? 220 : 560,
          paddingTop: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      footer={
        <div
          className="flex flex-wrap justify-between gap-2"
          data-cy="pgp-wizard-footer"
        >
          <Button onClick={close} data-cy="pgp-wizard-cancel">
            Cancel
          </Button>
          <div
            data-cy="tna-planning-planwizarddrawer-index-div-326"
            className="flex gap-2"
          >
            {wizardStep > 0 && (
              <Button onClick={goBack} data-cy="pgp-wizard-back">
                Back
              </Button>
            )}
            {wizardStep < 3 && (
              <Button
                type="primary"
                onClick={goNext}
                className="bg-primary"
                data-cy="pgp-wizard-next"
              >
                Next
              </Button>
            )}
            {wizardStep === 3 && (
              <>
                <Button
                  onClick={onSaveDraft}
                  loading={creating}
                  data-cy="pgp-wizard-save-draft"
                >
                  Save draft
                </Button>
                <Button
                  type="primary"
                  onClick={onSubmit}
                  loading={creating}
                  className="bg-primary"
                  data-cy="pgp-wizard-submit"
                >
                  Create plan
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="mb-4 shrink-0" data-cy="pgp-wizard-steps-container">
        <style data-cy="tna-planning-planwizarddrawer-index-style-367">{`
          .pgp-wizard-steps .ant-steps-item-title {
            white-space: nowrap !important;
          }
          .pgp-wizard-steps .ant-steps-item-process .ant-steps-item-title,
          .pgp-wizard-steps .ant-steps-item-finish .ant-steps-item-title {
            color: #1e40af !important;
          }
          .pgp-wizard-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }
        `}</style>
        <Steps
          responsive={false}
          current={wizardStep}
          labelPlacement="vertical"
          progressDot
          className="pgp-wizard-steps mx-auto max-w-5xl px-4"
          items={[
            { title: 'Category' },
            { title: 'Skills' },
            { title: 'Schedule' },
            { title: 'Review' },
          ]}
          data-cy="pgp-wizard-steps"
        />
      </div>

      <div
        data-cy="tna-planning-planwizarddrawer-index-div-395"
        className="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
      >
        {wizardStep === 0 && (
          <div
            className="flex flex-col gap-4"
            data-cy="pgp-wizard-step-category"
          >
            <div data-cy="tna-planning-planwizarddrawer-index-div-401">
              <div
                data-cy="tna-planning-planwizarddrawer-index-div-402"
                className="mb-1 text-xs font-semibold text-gray-900"
              >
                Skill category
              </div>
              <Select
                className="w-full"
                placeholder="Select category"
                value={categoryId ?? undefined}
                onChange={(v) => {
                  setCategoryId(v);
                  setShortlistSkillIds([]);
                  setGoals([]);
                  setSkillSearch('');
                }}
                options={mappedCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                data-cy="pgp-wizard-category"
              />
            </div>
            {activeFy && (
              <p
                data-cy="tna-planning-planwizarddrawer-index-p-423"
                className="mb-0 text-xs text-gray-500"
              >
                Fiscal year: {activeFy.name}
              </p>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          <div
            className="flex flex-col gap-3"
            data-cy="pgp-wizard-step-shortlist"
          >
            <p
              data-cy="tna-planning-planwizarddrawer-index-p-435"
              className="mb-0 text-xs text-gray-500"
            >
              {limitsOn ? (
                <>
                  Select at least {config.minSkillsInPlanShortlist ?? 0} skills
                  {config.maxSkillsInPlanShortlist != null
                    ? ` (max ${config.maxSkillsInPlanShortlist})`
                    : ''}
                  . Selected: {shortlistSkillIds.length}
                </>
              ) : (
                <>
                  Select skills to develop. Selected: {shortlistSkillIds.length}
                </>
              )}
            </p>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-[#8c8c8c]" />}
              placeholder="Search skills"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              data-cy="pgp-wizard-skill-search"
            />
            <div
              data-cy="tna-planning-planwizarddrawer-index-div-458"
              className="flex flex-col gap-2"
            >
              {filteredSkills.map((skill) => (
                <label
                  key={skill.id}
                  className="mb-1 flex items-center gap-2 text-sm text-gray-800"
                  data-cy={`pgp-wizard-shortlist-${skill.id}`}
                >
                  <Checkbox
                    checked={shortlistSkillIds.includes(skill.id)}
                    onChange={(e) =>
                      toggleShortlist(skill.id, e.target.checked)
                    }
                  />
                  {skill.name}
                </label>
              ))}
              {!skillsForShortlist.length ? (
                <p
                  data-cy="tna-planning-planwizarddrawer-index-p-475"
                  className="mb-0 text-xs text-gray-500"
                >
                  No skills in this category yet.
                </p>
              ) : !filteredSkills.length ? (
                <p
                  data-cy="tna-planning-planwizarddrawer-index-p-479"
                  className="mb-0 text-xs text-gray-500"
                >
                  No skills match your search.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div
            className="flex flex-col gap-4"
            data-cy="pgp-wizard-step-schedule"
          >
            <p
              data-cy="tna-planning-planwizarddrawer-index-p-492"
              className="mb-0 text-xs text-gray-500"
            >
              {limitsOn ? (
                <>
                  Schedule {config.minSkillsPerQuarter ?? 0}–
                  {config.maxSkillsPerQuarter ?? '∞'} skills per quarter. Custom
                  skills count toward the cap.
                </>
              ) : (
                <>
                  Assign each skill to a quarter. Custom skills are allowed; no
                  capacity caps are enforced.
                </>
              )}
            </p>
            {goals.map((goal) => (
              <div
                key={goal.key}
                className="rounded-lg border border-[#E5E7EB] p-3 shadow-none"
                data-cy={`pgp-wizard-goal-${goal.key}`}
              >
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-512"
                  className="mb-2 flex flex-wrap items-center gap-2"
                >
                  <span
                    data-cy="tna-planning-planwizarddrawer-index-span-513"
                    className="text-sm font-semibold text-gray-900"
                  >
                    {goal.skillName}
                  </span>
                  {goal.isCustom ? <Tag>Custom</Tag> : null}
                </div>
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-518"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <div data-cy="tna-planning-planwizarddrawer-index-div-519">
                    <div
                      data-cy="tna-planning-planwizarddrawer-index-div-520"
                      className="mb-1 text-xs text-gray-600"
                    >
                      Quarter
                    </div>
                    <Select
                      className="w-full"
                      value={goal.quarterId ?? undefined}
                      onChange={(v) =>
                        updateGoal(goal.key, {
                          quarterId: v,
                          quarterLabel: quarters.find((q) => q.id === v)?.label,
                        })
                      }
                      options={quarters.map((q) => ({
                        value: q.id,
                        label: limitsOn
                          ? `${q.label} (${goalsByQuarter[q.id] ?? 0}/${config.maxSkillsPerQuarter ?? '∞'})`
                          : `${q.label} (${goalsByQuarter[q.id] ?? 0})`,
                      }))}
                      data-cy={`pgp-wizard-goal-quarter-${goal.key}`}
                    />
                  </div>
                  <div data-cy="tna-planning-planwizarddrawer-index-div-539">
                    <div
                      data-cy="tna-planning-planwizarddrawer-index-div-540"
                      className="mb-1 text-xs text-gray-600"
                    >
                      Deadline
                    </div>
                    <DatePicker
                      className="w-full"
                      value={
                        goal.targetDeadline
                          ? dayjs(goal.targetDeadline)
                          : undefined
                      }
                      onChange={(d) =>
                        updateGoal(goal.key, {
                          targetDeadline: d ? d.format('YYYY-MM-DD') : null,
                        })
                      }
                      data-cy={`pgp-wizard-goal-deadline-${goal.key}`}
                    />
                  </div>
                </div>
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-557"
                  className="mt-3"
                >
                  <div
                    data-cy="tna-planning-planwizarddrawer-index-div-558"
                    className="mb-1 text-xs text-gray-600"
                  >
                    Measurable outcome
                  </div>
                  <Input.TextArea
                    rows={2}
                    value={goal.measurableOutcome}
                    onChange={(e) =>
                      updateGoal(goal.key, {
                        measurableOutcome: e.target.value,
                      })
                    }
                    placeholder="e.g. Earn AWS Solutions Architect cert"
                    data-cy={`pgp-wizard-goal-outcome-${goal.key}`}
                  />
                </div>
              </div>
            ))}

            <div
              className="rounded-lg border border-dashed border-[#D9D9D9] p-3"
              data-cy="pgp-wizard-custom-skill"
            >
              <div
                data-cy="tna-planning-planwizarddrawer-index-div-580"
                className="mb-2 text-sm font-semibold text-gray-900"
              >
                Add custom skill
              </div>
              <Form form={customForm} layout="vertical">
                <Form.Item
                  name="skillName"
                  label="Skill name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input data-cy="pgp-wizard-custom-name" />
                </Form.Item>
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-591"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Form.Item name="quarterId" label="Quarter">
                    <Select
                      options={quarters.map((q) => ({
                        value: q.id,
                        label: q.label,
                      }))}
                      data-cy="pgp-wizard-custom-quarter"
                    />
                  </Form.Item>
                  <Form.Item name="targetDeadline" label="Deadline">
                    <DatePicker
                      className="w-full"
                      data-cy="pgp-wizard-custom-deadline"
                    />
                  </Form.Item>
                </div>
                <Form.Item name="measurableOutcome" label="Measurable outcome">
                  <Input.TextArea
                    rows={2}
                    data-cy="pgp-wizard-custom-outcome"
                  />
                </Form.Item>
                <Button
                  onClick={addCustomSkill}
                  data-cy="pgp-wizard-custom-add"
                >
                  Add to plan
                </Button>
              </Form>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="flex flex-col gap-3" data-cy="pgp-wizard-step-review">
            <div
              data-cy="tna-planning-planwizarddrawer-index-div-627"
              className="rounded-lg border border-[#E5E7EB] p-3"
            >
              <div
                data-cy="tna-planning-planwizarddrawer-index-div-628"
                className="text-sm font-semibold text-gray-900"
              >
                {selectedCategory?.name}
              </div>
              <p
                data-cy="tna-planning-planwizarddrawer-index-p-631"
                className="mb-0 mt-1 text-xs text-gray-500"
              >
                {activeFy?.name} · {goals.length} goals
              </p>
              <p
                data-cy="tna-planning-planwizarddrawer-index-p-634"
                className="mb-0 mt-2 text-xs text-gray-500"
              >
                {limitsOn
                  ? `Caps at submit: ${config.minSkillsPerQuarter}–${config.maxSkillsPerQuarter} / quarter; shortlist min ${config.minSkillsInPlanShortlist}`
                  : 'Capacity limits are not enforced for this org.'}
              </p>
            </div>
            {goals.map((g) => (
              <div
                data-cy="tna-planning-planwizarddrawer-index-div-641"
                key={g.key}
                className="rounded-lg border border-[#E5E7EB] p-3 text-sm"
              >
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-645"
                  className="font-medium text-gray-900"
                >
                  {g.skillName}
                  {g.isCustom ? ' (custom)' : ''}
                </div>
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-649"
                  className="text-xs text-gray-500"
                >
                  {g.quarterLabel || g.quarterId} · due {g.targetDeadline}
                </div>
                <div
                  data-cy="tna-planning-planwizarddrawer-index-div-652"
                  className="mt-1 text-xs text-gray-700"
                >
                  {g.measurableOutcome}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PlanWizardDrawer;
