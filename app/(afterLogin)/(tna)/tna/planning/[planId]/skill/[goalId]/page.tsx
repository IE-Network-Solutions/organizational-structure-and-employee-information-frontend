'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Skeleton,
  Tag,
} from 'antd';
import {
  LuArrowLeft,
  LuFileText,
  LuImage,
  LuLink,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import TextEditor from '@/components/form/textEditor';
import { DATE_FORMAT } from '@/utils/constants';
import {
  useGetGrowthPlanById,
  useGetGrowthPlanTaxonomy,
} from '@/store/server/features/tna/growthPlan/queries';
import {
  useAddGoalActivity,
  useAddGoalChecklistItem,
  useApplyCourseEvidence,
  useDeleteGoalChecklistItem,
  useDeleteGoalMaterial,
  useToggleGoalChecklist,
  useUpdateGoalProgress,
} from '@/store/server/features/tna/growthPlan/mutations';
import {
  useGetCoursesManagement,
  useGetMyCourses,
} from '@/store/server/features/tna/management/queries';
import { useEnrollSelfInCourse } from '@/store/server/features/tna/management/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  checklistItemWeight,
  goalDisplayProgress,
  GROWTH_PLAN_PROGRESS_STATUS_OPTIONS,
  GrowthPlanMaterial,
  GrowthPlanSkillResource,
  isUrlLikeOutcome,
  normalizeChecklist,
  resolveVideoEmbed,
} from '@/types/tna/growthPlan';
import { Course } from '@/types/tna/course';
import SkillMaterialsPanel from '../../../_components/skillMaterials';
import SkillVideoQueue, {
  resolveVideoPlatform,
  SkillVideoItem,
} from '../../../_components/skillVideoQueue';

/**
 * Skill detail — resources + OKR-like progress / updates.
 * Pattern found: KeyResultMetrics progress + plan skill resources.
 */
const GrowthPlanSkillDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const planId = String(params?.planId ?? '');
  const goalId = String(params?.goalId ?? '');

  const { userId } = useAuthenticationStore();
  const { data: plan, isLoading } = useGetGrowthPlanById(planId, !!planId);
  const { data: taxonomy } = useGetGrowthPlanTaxonomy();
  const { data: coursesData } = useGetCoursesManagement({}, true, true);
  const { data: myCoursesData } = useGetMyCourses(userId ?? '', !!userId);
  const { mutate: updateProgress, isLoading: savingProgress } =
    useUpdateGoalProgress();
  const { mutate: toggleChecklist } = useToggleGoalChecklist();
  const { mutate: addChecklistItem, isLoading: addingChecklist } =
    useAddGoalChecklistItem();
  const { mutate: deleteChecklistItem } = useDeleteGoalChecklistItem();
  const { mutate: deleteMaterial } = useDeleteGoalMaterial();
  const { mutate: addActivity, isLoading: addingNote } = useAddGoalActivity();
  const { mutate: applyCourseEvidence, isLoading: applyingCourse } =
    useApplyCourseEvidence();
  const { mutate: enrollCourse, isLoading: enrolling } =
    useEnrollSelfInCourse();

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [localPercent, setLocalPercent] = useState<number | null>(null);
  const percentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goal = useMemo(
    () => plan?.goals?.find((g) => g.id === goalId) ?? null,
    [plan, goalId],
  );

  const resources = useMemo((): GrowthPlanSkillResource[] => {
    if (!goal?.skillId) return [];
    for (const cat of taxonomy ?? []) {
      const skill = cat.skills.find((s) => s.id === goal.skillId);
      if (skill) return skill.resources ?? [];
    }
    return [];
  }, [goal, taxonomy]);

  const courseCatalog = useMemo((): Course[] => {
    const items = coursesData?.items ?? [];
    return items.filter((c) => Boolean(c?.id) && !c.isDraft);
  }, [coursesData]);

  const enrolledCourseIds = useMemo(() => {
    const raw: any = myCoursesData;
    const items = Array.isArray(raw)
      ? raw
      : (raw?.items ?? raw?.data?.items ?? raw?.data ?? []);
    return new Set(
      (Array.isArray(items) ? items : [])
        .map((c: any) => c?.id)
        .filter(Boolean)
        .map(String),
    );
  }, [myCoursesData]);

  /** Bind suggested course resources to live TNA catalog (fallback: first published). */
  const resolveLiveCourse = (res: GrowthPlanSkillResource): Course | null => {
    if (res.type !== 'course') return null;
    const match = courseCatalog.find((c) => c.id === res.courseId);
    if (match) return match;
    return courseCatalog[0] ?? null;
  };

  const { videos, other, attachments } = useMemo(() => {
    const queue: SkillVideoItem[] = [];
    const links: GrowthPlanSkillResource[] = [];
    const files: GrowthPlanMaterial[] = [];

    for (const resource of resources) {
      if (resource.type === 'course' || resource.type === 'document') {
        links.push(resource);
        continue;
      }
      const embed = resolveVideoEmbed(resource.url, resource.videoId);
      if (embed) {
        queue.push({
          id: resource.id,
          title: resource.title,
          url: resource.url,
          videoId: resource.videoId,
          embed,
          source: 'recommended',
          platform: resolveVideoPlatform(resource.url, resource.videoId),
        });
      } else {
        links.push(resource);
      }
    }

    for (const material of goal?.materials ?? []) {
      if (material.category === 'video') {
        const url = material.url || material.fileUrl;
        const embed = resolveVideoEmbed(url, material.videoId);
        if (!embed) {
          files.push(material);
          continue;
        }
        const already = queue.some(
          (v) =>
            (material.videoId && v.videoId === material.videoId) ||
            (url && v.url === url),
        );
        if (already) continue;
        queue.push({
          id: material.id,
          title: material.title,
          url,
          videoId: material.videoId,
          embed,
          source: 'material',
          platform: resolveVideoPlatform(url, material.videoId),
        });
        continue;
      }
      files.push(material);
    }

    return { videos: queue, other: links, attachments: files };
  }, [resources, goal?.materials]);

  const notes = useMemo(
    () => (goal?.activities ?? []).filter((a) => a.type === 'note'),
    [goal?.activities],
  );

  const checklist = normalizeChecklist(goal?.checklist as any);
  const pct = goal
    ? (localPercent ?? goalDisplayProgress({ ...goal, checklist }))
    : 0;

  const canEdit =
    !!goal &&
    (goal.status === 'approved' ||
      goal.status === 'draft' ||
      goal.status === 'pending' ||
      goal.status === 'completion_requested') &&
    plan?.status !== 'rejected';

  useEffect(() => {
    setLocalPercent(null);
  }, [goal?.id, goal?.progressPercent]);

  useEffect(
    () => () => {
      if (percentTimer.current) clearTimeout(percentTimer.current);
    },
    [],
  );

  const onPercentChange = (value: number | null) => {
    if (!planId || !goal || value == null || Number.isNaN(value)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    setLocalPercent(clamped);
    if (percentTimer.current) clearTimeout(percentTimer.current);
    percentTimer.current = setTimeout(() => {
      updateProgress({
        planId,
        goalId: goal.id,
        progressPercent: clamped,
        progressStatus:
          clamped >= 100
            ? 'ready_for_review'
            : clamped > 0
              ? 'in_progress'
              : 'not_started',
      });
    }, 350);
  };

  const onAddChecklist = async () => {
    if (!goal) return;
    const values = await checklistForm.validateFields().catch(() => null);
    if (!values) return;
    addChecklistItem(
      {
        planId,
        goalId: goal.id,
        label: values.label,
        weight: Number(values.weight) || 1,
      },
      {
        onSuccess: () => {
          setChecklistOpen(false);
          checklistForm.resetFields();
        },
      },
    );
  };

  const onAddNote = async () => {
    if (!goal) return;
    const values = await noteForm.validateFields().catch(() => null);
    if (!values) return;
    const body = String(values.body || '').trim();
    const plain = body
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (!plain) {
      noteForm.setFields([{ name: 'body', errors: ['Write your note'] }]);
      return;
    }
    addActivity(
      {
        planId,
        goalId: goal.id,
        type: 'note',
        title: values.title?.trim() || 'Note',
        body,
      },
      {
        onSuccess: () => {
          noteForm.resetFields();
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="page-wrap" data-cy="pgp-skill-detail-loading">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!plan || !goal) {
    return (
      <div
        data-cy="tna-planning-planid-skill-goalid-page-div-304"
        className="page-wrap flex min-h-[280px] items-center justify-center"
      >
        <EmptyState
          title="Skill not found"
          description="This skill may have been removed from the plan."
          actionText="Back to plan"
          onAction={() => router.push(`/tna/planning/${planId}`)}
        />
      </div>
    );
  }

  const statusOpt = GROWTH_PLAN_PROGRESS_STATUS_OPTIONS.find(
    (o) => o.value === (goal.progressStatus ?? 'not_started'),
  );

  return (
    <div
      className="page-wrap flex flex-col gap-5"
      data-cy="pgp-skill-detail-page"
    >
      <div data-cy="tna-planning-planid-skill-goalid-page-div-324">
        <button
          type="button"
          onClick={() => router.push(`/tna/planning/${planId}`)}
          className="mb-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-[#8c8c8c] hover:text-[#1E40AF]"
          data-cy="pgp-skill-detail-back"
        >
          <LuArrowLeft className="text-sm" />
          {plan.categoryName || 'Growth plan'}
        </button>

        <div
          data-cy="tna-planning-planid-skill-goalid-page-div-335"
          className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
        >
          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-336"
            className="flex flex-wrap items-start justify-between gap-4"
          >
            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-337"
              className="min-w-0 flex-1"
            >
              <div
                data-cy="tna-planning-planid-skill-goalid-page-div-338"
                className="flex flex-wrap items-center gap-2"
              >
                <h1
                  data-cy="tna-planning-planid-skill-goalid-page-h1-339"
                  className="m-0 text-2xl font-bold text-gray-900"
                >
                  {goal.skillName}
                </h1>
                {goal.isCustom ? <Tag>Custom</Tag> : null}
                {goal.quarterLabel ? <Tag>{goal.quarterLabel}</Tag> : null}
                <Tag>{goal.status.replace(/_/g, ' ')}</Tag>
              </div>
              {goal.measurableOutcome &&
              !isUrlLikeOutcome(goal.measurableOutcome) ? (
                <p
                  data-cy="tna-planning-planid-skill-goalid-page-p-348"
                  className="mb-0 mt-2 text-sm text-[#595959]"
                >
                  {goal.measurableOutcome}
                </p>
              ) : null}
              {goal.targetDeadline ? (
                <p
                  data-cy="tna-planning-planid-skill-goalid-page-p-353"
                  className="mb-0 mt-1 text-xs text-[#8c8c8c]"
                >
                  Deadline {dayjs(goal.targetDeadline).format(DATE_FORMAT)}
                </p>
              ) : null}
            </div>

            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-359"
              className="flex flex-col items-center gap-1"
            >
              <Progress
                type="circle"
                percent={pct}
                size={72}
                strokeColor="#1E40AF"
              />
              <span
                data-cy="tna-planning-planid-skill-goalid-page-span-366"
                className="inline-flex items-center rounded border border-[#BFDBFE] bg-[#DBEAFE] px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {statusOpt?.label ?? 'Not started'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        data-cy="tna-planning-planid-skill-goalid-page-div-374"
        className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]"
      >
        {/* Progress / updates — OKR-like */}
        <section
          className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
          data-cy="pgp-skill-progress-panel"
        >
          <h2
            data-cy="tna-planning-planid-skill-goalid-page-h2-380"
            className="mb-3 text-sm font-semibold text-gray-900"
          >
            Progress
          </h2>

          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-382"
            className="mb-3"
          >
            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-383"
              className="mb-1 flex items-center justify-between text-xs text-[#595959]"
            >
              <span data-cy="tna-planning-planid-skill-goalid-page-span-384">
                Completion
              </span>
              <span
                data-cy="tna-planning-planid-skill-goalid-page-span-385"
                className="font-medium text-[#1E40AF]"
              >
                {pct}%
              </span>
            </div>
            <Progress
              percent={pct}
              strokeColor="#1E40AF"
              showInfo={false}
              size="small"
            />
          </div>

          {canEdit ? (
            <InputNumber
              min={0}
              max={100}
              value={localPercent ?? goal.progressPercent ?? pct}
              onChange={(v) => onPercentChange(typeof v === 'number' ? v : 0)}
              className="mb-3 w-full"
              addonAfter="%"
              data-cy="pgp-skill-percent"
            />
          ) : null}
          {savingProgress ? (
            <p
              data-cy="tna-planning-planid-skill-goalid-page-p-407"
              className="mb-2 text-[10px] text-[#8c8c8c]"
            >
              Saving…
            </p>
          ) : null}

          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-410"
            className="mb-3 border-t border-[#F0F2F5] pt-3"
          >
            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-411"
              className="mb-2 flex items-center justify-between gap-2"
            >
              <div
                data-cy="tna-planning-planid-skill-goalid-page-div-412"
                className="text-[12px] font-semibold text-gray-700"
              >
                Checklist
                {checklist.length ? (
                  <span
                    data-cy="tna-planning-planid-skill-goalid-page-span-415"
                    className="ml-1 font-normal text-[#8c8c8c]"
                  >
                    · {checklist.length}
                  </span>
                ) : null}
              </div>
              {canEdit ? (
                <Button
                  size="small"
                  type="link"
                  className="h-auto p-0 text-[#1E40AF]"
                  icon={<LuPlus className="text-xs" />}
                  onClick={() => {
                    checklistForm.setFieldsValue({ weight: 10 });
                    setChecklistOpen(true);
                  }}
                  data-cy="pgp-skill-add-checklist"
                >
                  Add item
                </Button>
              ) : null}
            </div>
            {checklist.length ? (
              <div
                data-cy="tna-planning-planid-skill-goalid-page-div-437"
                className="flex flex-col gap-1.5"
              >
                {checklist.map((item) => (
                  <div
                    data-cy="tna-planning-planid-skill-goalid-page-div-439"
                    key={item.id}
                    className="flex items-start gap-2 text-xs text-gray-700"
                  >
                    <Checkbox
                      checked={item.done}
                      disabled={!canEdit}
                      className="mt-0.5"
                      onChange={(e) =>
                        toggleChecklist({
                          planId,
                          goalId: goal.id,
                          checklistItemId: item.id,
                          done: e.target.checked,
                        })
                      }
                    />
                    <span
                      data-cy="tna-planning-planid-skill-goalid-page-span-456"
                      className={`min-w-0 flex-1 ${
                        item.done ? 'text-gray-400 line-through' : ''
                      }`}
                    >
                      {item.label}
                      <span
                        data-cy="tna-planning-planid-skill-goalid-page-span-462"
                        className="ml-1 text-[10px] text-[#8c8c8c]"
                      >
                        · w{checklistItemWeight(item)}
                      </span>
                    </span>
                    {canEdit ? (
                      <button
                        data-cy="tna-planning-planid-skill-goalid-page-button-467"
                        type="button"
                        aria-label="Remove checklist item"
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[4px] border-none bg-transparent text-red-500 hover:bg-red-50"
                        onClick={() =>
                          deleteChecklistItem({
                            planId,
                            goalId: goal.id,
                            checklistItemId: item.id,
                          })
                        }
                      >
                        <LuTrash2 className="text-xs" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p
                data-cy="tna-planning-planid-skill-goalid-page-p-486"
                className="mb-0 text-xs text-[#8c8c8c]"
              >
                Add weighted checklist items to track progress.
              </p>
            )}
          </div>
        </section>

        {/* Resources */}
        <section className="flex flex-col gap-4" data-cy="pgp-skill-resources">
          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-495"
            className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
          >
            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-496"
              className="mb-3 flex flex-wrap items-center justify-between gap-2"
            >
              <h2
                data-cy="tna-planning-planid-skill-goalid-page-h2-497"
                className="m-0 text-sm font-semibold text-gray-900"
              >
                Resources
                <span
                  data-cy="tna-planning-planid-skill-goalid-page-span-499"
                  className="ml-1 font-normal text-[#8c8c8c]"
                >
                  · {videos.length + other.length + attachments.length}
                </span>
              </h2>
              <SkillMaterialsPanel
                planId={planId}
                goalId={goal.id}
                materials={goal.materials}
                canEdit={canEdit}
                variant="buttonOnly"
              />
            </div>

            {videos.length > 0 ? (
              <SkillVideoQueue videos={videos} skillId={goal.id} />
            ) : null}

            {other.length > 0 ? (
              <ul
                data-cy="tna-planning-planid-skill-goalid-page-ul-517"
                className={`mb-0 list-none space-y-2 p-0 ${videos.length ? 'mt-3' : ''}`}
              >
                {other.map((res) => {
                  if (res.type === 'course') {
                    const live = resolveLiveCourse(res);
                    const courseId = live?.id ?? res.courseId ?? null;
                    const label = live?.title || res.courseName || res.title;
                    const href = courseId
                      ? `/tna/management/${courseId}`
                      : null;
                    const enrolled = courseId
                      ? enrolledCourseIds.has(courseId)
                      : false;
                    const completed = courseId
                      ? (goal.activities ?? []).some(
                          (a) => a.courseId === courseId,
                        )
                      : false;

                    return (
                      <li
                        key={res.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
                        data-cy={`pgp-course-resource-${res.id}`}
                      >
                        <div
                          data-cy="tna-planning-planid-skill-goalid-page-div-543"
                          className="min-w-0 flex-1"
                        >
                          <div
                            data-cy="tna-planning-planid-skill-goalid-page-div-544"
                            className="text-[10px] font-medium uppercase tracking-wide text-[#8c8c8c]"
                          >
                            Course
                            <span
                              data-cy="tna-planning-planid-skill-goalid-page-span-546"
                              className="ml-1 normal-case"
                            >
                              · Recommended
                            </span>
                            {enrolled && !completed ? (
                              <Tag className="ml-2 align-middle text-[10px]">
                                Enrolled
                              </Tag>
                            ) : null}
                          </div>
                          <div
                            data-cy="tna-planning-planid-skill-goalid-page-div-555"
                            className="truncate text-sm font-medium text-[#262626]"
                          >
                            {label}
                          </div>
                          {!live && courseCatalog.length === 0 ? (
                            <div
                              data-cy="tna-planning-planid-skill-goalid-page-div-559"
                              className="text-[11px] text-[#8c8c8c]"
                            >
                              No published TNA courses available yet.
                            </div>
                          ) : (
                            <div
                              data-cy="tna-planning-planid-skill-goalid-page-div-563"
                              className="mt-1"
                            >
                              <Checkbox
                                checked={completed}
                                disabled={
                                  !canEdit ||
                                  !courseId ||
                                  completed ||
                                  applyingCourse
                                }
                                onChange={(e) => {
                                  if (!e.target.checked || !courseId || !goal)
                                    return;
                                  applyCourseEvidence({
                                    planId,
                                    goalId: goal.id,
                                    courseId,
                                    courseTitle: label,
                                    requestCompletion: false,
                                  });
                                }}
                                data-cy={`pgp-course-complete-${courseId ?? res.id}`}
                              >
                                <span
                                  data-cy="tna-planning-planid-skill-goalid-page-span-585"
                                  className="text-xs text-gray-600"
                                >
                                  Completed
                                </span>
                              </Checkbox>
                            </div>
                          )}
                        </div>
                        <div
                          data-cy="tna-planning-planid-skill-goalid-page-div-592"
                          className="flex flex-wrap items-center gap-2"
                        >
                          {href ? (
                            <Link
                              href={href}
                              className="text-xs text-[#1E40AF] hover:underline"
                              data-cy={`pgp-course-open-${courseId}`}
                            >
                              Open
                            </Link>
                          ) : null}
                          {canEdit && courseId && !enrolled ? (
                            <Button
                              size="small"
                              type="link"
                              className="h-auto p-0 text-xs text-[#1E40AF]"
                              loading={enrolling}
                              onClick={() => enrollCourse(courseId)}
                              data-cy={`pgp-course-enroll-${courseId}`}
                            >
                              Enroll
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    );
                  }

                  const href = res.url;
                  return (
                    <li
                      data-cy="tna-planning-planid-skill-goalid-page-li-621"
                      key={res.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
                    >
                      <div data-cy="tna-planning-planid-skill-goalid-page-div-625">
                        <div
                          data-cy="tna-planning-planid-skill-goalid-page-div-626"
                          className="text-[10px] font-medium uppercase tracking-wide text-[#8c8c8c]"
                        >
                          {res.type === 'document' ? 'Document' : 'Link'}
                          <span
                            data-cy="tna-planning-planid-skill-goalid-page-span-628"
                            className="ml-1 normal-case"
                          >
                            · Recommended
                          </span>
                        </div>
                        <div
                          data-cy="tna-planning-planid-skill-goalid-page-div-632"
                          className="text-sm font-medium text-[#262626]"
                        >
                          {res.title}
                        </div>
                      </div>
                      {href ? (
                        href.startsWith('http') ? (
                          <a
                            data-cy="tna-planning-planid-skill-goalid-page-a-638"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#1E40AF] hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          <Link
                            href={href}
                            className="text-xs text-[#1E40AF] hover:underline"
                          >
                            Open
                          </Link>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {attachments.length > 0 ? (
              <div
                className={`${videos.length || other.length ? 'mt-3' : ''}`}
                data-cy="pgp-skill-attachments"
              >
                <div
                  data-cy="tna-planning-planid-skill-goalid-page-div-666"
                  className="mb-2 text-[12px] font-semibold text-gray-700"
                >
                  Documents & files
                  <span
                    data-cy="tna-planning-planid-skill-goalid-page-span-668"
                    className="ml-1 font-normal text-[#8c8c8c]"
                  >
                    · {attachments.length}
                  </span>
                </div>
                <div
                  data-cy="tna-planning-planid-skill-goalid-page-div-672"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {attachments.map((mat) => (
                    <AttachmentCard
                      key={mat.id}
                      material={mat}
                      canEdit={canEdit}
                      onDelete={() =>
                        deleteMaterial({
                          planId,
                          goalId: goal.id,
                          materialId: mat.id,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {!videos.length && !other.length && !attachments.length ? (
              <p
                data-cy="tna-planning-planid-skill-goalid-page-p-692"
                className="mb-0 text-xs text-[#8c8c8c]"
              >
                No resources yet. Add a video, PDF, or link with Add material.
              </p>
            ) : null}
          </div>

          <div
            className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
            data-cy="pgp-skill-notes"
          >
            <h2
              data-cy="tna-planning-planid-skill-goalid-page-h2-702"
              className="mb-3 text-sm font-semibold text-gray-900"
            >
              Notes
              <span
                data-cy="tna-planning-planid-skill-goalid-page-span-704"
                className="ml-1 font-normal text-[#8c8c8c]"
              >
                · {notes.length}
              </span>
            </h2>

            {canEdit ? (
              <Form
                form={noteForm}
                layout="vertical"
                onFinish={onAddNote}
                className="mb-4"
                data-cy="pgp-skill-notes-form"
              >
                <Form.Item name="title" label="Title">
                  <Input placeholder="e.g. Key takeaways" />
                </Form.Item>
                <Form.Item
                  name="body"
                  label="Note"
                  rules={[{ required: true, message: 'Write your note' }]}
                >
                  <TextEditor placeholder="Write what you learned, questions, or next steps…" />
                </Form.Item>
                <div
                  data-cy="tna-planning-planid-skill-goalid-page-div-727"
                  className="flex justify-end"
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-primary"
                    loading={addingNote}
                    data-cy="pgp-skill-save-note"
                  >
                    Save note
                  </Button>
                </div>
              </Form>
            ) : null}

            {notes.length ? (
              <ul
                data-cy="tna-planning-planid-skill-goalid-page-ul-742"
                className="mb-0 list-none space-y-2 border-t border-[#F0F2F5] p-0 pt-3"
              >
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5"
                    data-cy={`pgp-skill-note-${note.id}`}
                  >
                    <div
                      data-cy="tna-planning-planid-skill-goalid-page-div-749"
                      className="text-sm font-medium text-[#262626]"
                    >
                      {note.title || 'Note'}
                    </div>
                    {note.body ? (
                      <div
                        data-cy="tna-planning-planid-skill-goalid-page-div-753"
                        className="prose prose-sm mt-1 max-w-none text-xs text-[#595959] [&_a]:text-[#1E40AF] [&_p]:mb-1 [&_ul]:mb-1 [&_ul]:pl-4"
                        dangerouslySetInnerHTML={{ __html: note.body }}
                      />
                    ) : null}
                    <div
                      data-cy="tna-planning-planid-skill-goalid-page-div-758"
                      className="mt-1 text-[10px] text-[#8c8c8c]"
                    >
                      {dayjs(note.createdAt).format(DATE_FORMAT)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : !canEdit ? (
              <p
                data-cy="tna-planning-planid-skill-goalid-page-p-765"
                className="mb-0 text-xs text-[#8c8c8c]"
              >
                No notes for this skill yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <Modal
        title="Add checklist item"
        open={checklistOpen}
        onCancel={() => setChecklistOpen(false)}
        onOk={onAddChecklist}
        confirmLoading={addingChecklist}
        okText="Add item"
        destroyOnClose
        data-cy="pgp-skill-checklist-modal"
      >
        <Form
          form={checklistForm}
          layout="vertical"
          initialValues={{ weight: 10 }}
        >
          <Form.Item
            name="label"
            label="Item"
            rules={[{ required: true, message: 'Enter a checklist item' }]}
          >
            <Input placeholder="e.g. Complete discovery workshop" />
          </Form.Item>
          <Form.Item
            name="weight"
            label="Weight"
            rules={[
              { required: true, message: 'Enter a weight' },
              {
                type: 'number',
                min: 1,
                message: 'Weight must be at least 1',
              },
            ]}
            extra="Relative share of progress (e.g. 40 + 30 + 30 = 100)."
          >
            <InputNumber min={1} max={100} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const AttachmentCard = ({
  material,
  canEdit,
  onDelete,
}: {
  material: GrowthPlanMaterial;
  canEdit: boolean;
  onDelete: () => void;
}) => {
  const href = material.url || material.fileUrl || undefined;
  const typeLabel =
    material.category === 'document'
      ? 'Document'
      : material.category === 'image'
        ? 'Image'
        : 'Link';
  const Icon =
    material.category === 'document'
      ? LuFileText
      : material.category === 'image'
        ? LuImage
        : LuLink;

  return (
    <div
      className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB]"
      data-cy={`pgp-skill-attachment-${material.id}`}
    >
      <div
        data-cy="tna-planning-planid-skill-goalid-page-div-844"
        className="flex flex-wrap items-start justify-between gap-2 px-3 py-2.5"
      >
        <div
          data-cy="tna-planning-planid-skill-goalid-page-div-845"
          className="min-w-0 flex-1"
        >
          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-846"
            className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[#8c8c8c]"
          >
            <Icon className="text-xs" />
            {typeLabel}
            <span
              data-cy="tna-planning-planid-skill-goalid-page-span-849"
              className="normal-case text-[#1E40AF]"
            >
              · My materials
            </span>
          </div>
          <div
            data-cy="tna-planning-planid-skill-goalid-page-div-851"
            className="mt-0.5 line-clamp-2 text-sm font-medium text-[#262626]"
          >
            {material.title}
          </div>
          {material.fileName ? (
            <div
              data-cy="tna-planning-planid-skill-goalid-page-div-855"
              className="mt-0.5 truncate text-[11px] text-[#8c8c8c]"
            >
              {material.fileName}
            </div>
          ) : null}
        </div>
        <div
          data-cy="tna-planning-planid-skill-goalid-page-div-860"
          className="flex shrink-0 items-center gap-2"
        >
          {href ? (
            <>
              <a
                data-cy="tna-planning-planid-skill-goalid-page-a-863"
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#1E40AF] hover:underline"
              >
                Open
              </a>
              <a
                href={href}
                download={material.fileName || material.title || true}
                className="inline-flex h-7 items-center rounded-[4px] border border-[#E5E7EB] bg-white px-2 text-xs font-medium text-[#1E40AF] no-underline hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]"
                data-cy={`pgp-skill-attachment-download-${material.id}`}
              >
                Download
              </a>
            </>
          ) : null}
          {canEdit ? (
            <button
              data-cy="tna-planning-planid-skill-goalid-page-button-882"
              type="button"
              aria-label="Remove attachment"
              onClick={onDelete}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] border border-[#E5E7EB] bg-white text-red-500 hover:bg-red-50"
            >
              <LuTrash2 className="text-sm" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GrowthPlanSkillDetailPage;
