/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React from 'react';
import { Card, Skeleton, Tabs, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { MdOutlineFactCheck } from 'react-icons/md';
import {
  useGetMeetings,
  useGetUserMeetings,
} from '@/store/server/features/CFR/meeting/queries';
import { useGetAllActionPlan as useGetAssignedActionPlans } from '@/store/server/features/CFR/meeting/action-plan/queries';
import { useFetchedForms } from '@/store/server/features/feedback/form/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFetchedAllIndividualResponses } from '@/store/server/features/organization-development/categories/queries';
import { ActionPlanSourceType } from '@/types/enumTypes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

const LIST_SCROLL_THRESHOLD = 5;
type DashboardListItem = {
  id: string;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  badge?: string;
  href?: string;
  subtitleTag?: 'pending' | 'solved';
};

function toShortDate(input: unknown): string | undefined {
  if (typeof input !== 'string' || !input.trim()) return undefined;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeToArray(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

function looksLikeMeetingEntry(item: any): boolean {
  if (!item || typeof item !== 'object') return false;
  const hasMeetingHint =
    item.meetingTypeId != null ||
    item.meetingType != null ||
    item.startAt != null ||
    item.endAt != null ||
    item.facilitatorId != null ||
    item.chairmanId != null ||
    item.attendees != null ||
    item.attendeesIds != null ||
    item.participants != null;
  const hasNameHint =
    item.title != null || item.name != null || item.topic != null;
  return hasMeetingHint || hasNameHint;
}

function userInMeeting(item: any, userId: string): string | null {
  const uid = String(userId);
  if (String(item?.chairmanId ?? item?.chairpersonId ?? '') === uid)
    return 'Chairman';
  if (String(item?.facilitatorId ?? '') === uid) return 'Facilitator';

  const attendeeSets = [
    normalizeToArray(item?.attendees),
    normalizeToArray(item?.attendeesIds),
    normalizeToArray(item?.participants),
    normalizeToArray(item?.participantIds),
  ];
  for (const set of attendeeSets) {
    const exists = set.some((entry: any) => {
      if (entry == null) return false;
      if (typeof entry === 'string' || typeof entry === 'number') {
        return String(entry) === uid;
      }
      return String(entry?.id ?? entry?.userId ?? '') === uid;
    });
    if (exists) return 'Attendee';
  }
  return null;
}

function isUpcomingMeeting(item: any): boolean {
  const rawDate =
    item?.startAt ?? item?.meetingDate ?? item?.scheduledAt ?? item?.date;
  if (typeof rawDate === 'string' && rawDate.trim()) {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.getTime())) {
      return d.getTime() >= Date.now();
    }
  }
  const status = String(item?.status ?? '').toLowerCase();
  return status === 'upcoming' || status === 'scheduled';
}

function isCompletedMeeting(item: any): boolean {
  const rawDate =
    item?.startAt ?? item?.meetingDate ?? item?.scheduledAt ?? item?.date;
  if (typeof rawDate === 'string' && rawDate.trim()) {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.getTime())) {
      return d.getTime() < Date.now();
    }
  }
  const status = String(item?.status ?? '').toLowerCase();
  return status === 'completed' || status === 'done' || status === 'closed';
}

function toMeetingListByMode(
  report: any,
  userId: string,
  mode: 'upcoming' | 'completed',
): DashboardListItem[] {
  const candidates = [
    ...normalizeToArray(report?.upcomingMeetings),
    ...normalizeToArray(report?.upcomingMeeting),
    ...normalizeToArray(report?.completedMeetings),
    ...normalizeToArray(report?.completedMeeting),
    ...normalizeToArray(report?.recentMeetings),
    ...normalizeToArray(report?.meetings),
    ...normalizeToArray(report?.meetingEntries),
    ...normalizeToArray(report?.data?.upcomingMeetings),
    ...normalizeToArray(report?.data?.upcomingMeeting),
    ...normalizeToArray(report?.data?.completedMeetings),
    ...normalizeToArray(report?.data?.completedMeeting),
    ...normalizeToArray(report?.data?.recentMeetings),
    ...normalizeToArray(report?.data?.meetings),
  ]
    .filter(looksLikeMeetingEntry)
    .filter(mode === 'upcoming' ? isUpcomingMeeting : isCompletedMeeting);

  const dedup = new Map<string, DashboardListItem>();
  for (let index = 0; index < candidates.length; index += 1) {
    const item = candidates[index];
    const role = userInMeeting(item, userId);
    if (!role) continue;
    const id = String(
      item?.id ??
        item?.meetingId ??
        item?.slug ??
        `${item?.title ?? item?.name ?? 'meeting'}-${item?.startAt ?? item?.createdAt ?? index}`,
    );
    const title = String(
      item?.title ?? item?.name ?? item?.topic ?? 'Untitled meeting',
    );
    const dateLabel = toShortDate(
      item?.startAt ?? item?.meetingDate ?? item?.createdAt ?? item?.updatedAt,
    );
    if (!dedup.has(id)) {
      dedup.set(id, {
        id,
        title,
        subtitle: item?.meetingType?.name
          ? String(item.meetingType.name)
          : undefined,
        dateLabel,
        badge: role,
      });
    }
  }
  return Array.from(dedup.values());
}

function toMeetingListByModeFromMeetingsApi(
  meetingsPayload: any,
  userId: string,
  mode: 'upcoming' | 'completed',
): DashboardListItem[] {
  const meetings = normalizeToArray(meetingsPayload?.items);
  const filtered = meetings
    .filter(looksLikeMeetingEntry)
    .filter((item: any) => !!userInMeeting(item, userId))
    .filter(mode === 'upcoming' ? isUpcomingMeeting : isCompletedMeeting);

  const dedup = new Map<string, DashboardListItem>();
  for (let index = 0; index < filtered.length; index += 1) {
    const item = filtered[index];
    const id = String(item?.id ?? `${item?.title ?? 'meeting'}-${index}`);
    const role = userInMeeting(item, userId);
    const title = String(
      item?.title ?? item?.name ?? item?.topic ?? 'Untitled meeting',
    );
    const dateLabel = toShortDate(
      item?.startAt ?? item?.meetingDate ?? item?.createdAt ?? item?.updatedAt,
    );
    if (!dedup.has(id)) {
      dedup.set(id, {
        id,
        title,
        subtitle: item?.meetingType?.name
          ? String(item.meetingType.name)
          : undefined,
        dateLabel,
        badge: role ?? undefined,
      });
    }
  }

  return Array.from(dedup.values());
}

function looksLikeSurveyEntry(item: any): boolean {
  if (!item || typeof item !== 'object') return false;
  return (
    item.formId != null ||
    item.surveyId != null ||
    item.responseId != null ||
    item.submittedAt != null ||
    item.completedAt != null ||
    item.formName != null ||
    item.surveyName != null
  );
}

function getSurveyFormId(item: any): string | null {
  const id =
    item?.formId ??
    item?.surveyId ??
    item?.form?.id ??
    item?.question?.formId ??
    item?.question?.form?.id;
  return id != null && String(id).trim() !== '' ? String(id) : null;
}

function toSurveyList(
  report: any,
  formNameById: Map<string, string>,
): DashboardListItem[] {
  const candidates = [
    ...normalizeToArray(report?.recentSubmittedSurveys),
    ...normalizeToArray(report?.recentSurveys),
    ...normalizeToArray(report?.submittedSurveys),
    ...normalizeToArray(report?.surveyEntries),
    ...normalizeToArray(report?.data?.recentSubmittedSurveys),
    ...normalizeToArray(report?.data?.recentSurveys),
    ...normalizeToArray(report?.data?.submittedSurveys),
  ].filter(looksLikeSurveyEntry);

  const dedup = new Map<string, DashboardListItem>();
  for (let index = 0; index < candidates.length; index += 1) {
    const item = candidates[index];
    const id = String(
      item?.responseId ??
        item?.formResponseId ??
        item?.surveyId ??
        item?.formId ??
        `${item?.surveyName ?? item?.formName ?? 'survey'}-${item?.submittedAt ?? item?.createdAt ?? index}`,
    );
    const formId = getSurveyFormId(item);
    const formNameFromMap = formId ? formNameById.get(formId) : undefined;
    const title = String(
      item?.surveyName ??
        item?.formName ??
        item?.form?.name ??
        item?.form?.title ??
        item?.question?.form?.name ??
        item?.question?.form?.title ??
        formNameFromMap ??
        item?.title ??
        item?.name ??
        (item?.formId
          ? `Form ${String(item.formId).slice(0, 8)}`
          : 'Untitled form'),
    );
    const dateLabel = toShortDate(
      item?.submittedAt ??
        item?.completedAt ??
        item?.createdAt ??
        item?.updatedAt,
    );
    if (!dedup.has(id)) {
      dedup.set(id, {
        id,
        title,
        subtitle: item?.categoryName ? String(item.categoryName) : undefined,
        dateLabel,
        href: formId ? `/surveys/${formId}` : undefined,
      });
    }
  }
  return Array.from(dedup.values());
}

function toSurveyListFromAllResponses(
  allResponses: any,
  userId: string | null | undefined,
  formNameById: Map<string, string>,
): DashboardListItem[] {
  const uid = String(userId ?? '');
  if (!uid) return [];
  const rows = normalizeToArray(allResponses).concat(
    normalizeToArray(allResponses?.responses),
  );
  const mine = rows.filter((row: any) => {
    const owner =
      row?.respondentId ??
      row?.respondent_id ??
      row?.userId ??
      row?.user_id ??
      row?.createdBy ??
      row?.created_by;
    return owner != null && String(owner) === uid;
  });

  const dedup = new Map<string, DashboardListItem & { _ts: number }>();
  for (let index = 0; index < mine.length; index += 1) {
    const item = mine[index];
    const id = String(
      item?.formResponseId ??
        item?.responseId ??
        item?.submissionId ??
        item?.id ??
        `${item?.formId ?? 'form'}-${item?.submittedAt ?? item?.createdAt ?? index}`,
    );
    const formId = getSurveyFormId(item);
    const formNameFromMap = formId ? formNameById.get(formId) : undefined;
    const title = String(
      item?.form?.name ??
        item?.form?.title ??
        item?.question?.form?.name ??
        item?.question?.form?.title ??
        formNameFromMap ??
        item?.surveyName ??
        item?.formName ??
        item?.title ??
        item?.name ??
        item?.formTitle ??
        (item?.formId
          ? `Form ${String(item.formId).slice(0, 8)}`
          : 'Untitled form'),
    );
    const dateLabel = toShortDate(
      item?.submittedAt ?? item?.createdAt ?? item?.updatedAt,
    );
    const ts =
      Date.parse(
        item?.submittedAt ?? item?.createdAt ?? item?.updatedAt ?? '',
      ) || 0;
    const existing = dedup.get(id);
    if (!existing) {
      dedup.set(id, {
        id,
        title,
        subtitle: item?.categoryName ? String(item.categoryName) : undefined,
        dateLabel,
        href: formId ? `/surveys/${formId}` : undefined,
        _ts: ts,
      });
    }
  }

  return Array.from(dedup.values())
    .sort((a, b) => b._ts - a._ts)
    .map(({ _ts, ...item }) => item);
}

function toAssignedActionPlanList(raw: any): DashboardListItem[] {
  const rows = normalizeToArray(raw).concat(normalizeToArray(raw?.items));
  const mapped: (DashboardListItem & { _ts: number })[] = rows.map(
    (row: any) => {
      const ts = Date.parse(row?.createdAt ?? row?.updatedAt ?? '') || 0;
      const title = String(
        row?.issue ??
          row?.actionToBeTaken ??
          row?.title ??
          row?.name ??
          'Assigned action plan',
      );
      const status = String(row?.status ?? '').toLowerCase();
      return {
        id: String(row?.id ?? `${title}-${ts}`),
        title,
        subtitle: row?.status ? String(row.status) : undefined,
        subtitleTag:
          status === 'solved' || status === 'pending' ? status : undefined,
        dateLabel: toShortDate(
          row?.deadline ?? row?.createdAt ?? row?.updatedAt,
        ),
        href: '/feedback/action-plan',
        _ts: ts,
      };
    },
  );
  return mapped.sort((a, b) => b._ts - a._ts).map(({ _ts, ...item }) => item);
}

function RecentList({
  title,
  items,
  emptyText,
  loading = false,
  onItemClick,
  borderless = false,
  hideHeader = false,
}: {
  title: string;
  items: DashboardListItem[];
  emptyText: string;
  loading?: boolean;
  onItemClick?: (
    item: DashboardListItem,
    e: React.MouseEvent<HTMLDivElement>,
  ) => void;
  borderless?: boolean;
  hideHeader?: boolean;
}) {
  const wrapperClass = borderless
    ? 'mt-2'
    : 'mt-6 rounded-md border border-[#e5e7eb] bg-white p-3';
  return (
    <div className={wrapperClass}>
      {!hideHeader ? (
        <div className="mb-2 flex items-center justify-between">
          <Text className="!text-[12px] !font-semibold !text-[#1f3f8f]">
            {title}
          </Text>
          <span className="rounded bg-[#e8efff] px-2 py-0.5 text-[10px] font-semibold text-[#365fbd]">
            {loading ? '-' : items.length}
          </span>
        </div>
      ) : null}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`recent-list-skeleton-${title}-${idx}`}
              className="rounded border border-[#e7ecf8] bg-white px-2.5 py-2"
            >
              <Skeleton
                active
                paragraph={{ rows: 1, width: ['75%'] }}
                title={{ width: '45%' }}
              />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Text className="!text-[12px] !text-[#7b8794]">{emptyText}</Text>
      ) : (
        <div
          className={`space-y-2 ${
            items.length > LIST_SCROLL_THRESHOLD
              ? 'conversation-list-scroll max-h-[265px] overflow-y-auto pr-1'
              : ''
          }`}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-2 rounded border border-[#e7ecf8] bg-white px-2.5 py-2 ${
                item.href
                  ? 'cursor-pointer hover:border-[#d7dff3] hover:bg-[#fafcff]'
                  : ''
              }`}
              role={item.href ? 'button' : undefined}
              tabIndex={item.href ? 0 : undefined}
              onClick={(e) => {
                if (!onItemClick || !item.href) return;
                onItemClick(item, e);
              }}
              onKeyDown={(e) => {
                if (!onItemClick || !item.href) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const mouseEvent =
                    e as unknown as React.MouseEvent<HTMLDivElement>;
                  onItemClick(item, mouseEvent);
                }
              }}
            >
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-[#1f2937]">
                  {item.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                  {item.subtitle ? (
                    item.subtitleTag ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          item.subtitleTag === 'solved'
                            ? 'bg-[#E6FBDA] text-[#2f8f2f]'
                            : 'bg-[#FFF7E6] text-[#b26a00]'
                        }`}
                      >
                        {item.subtitleTag === 'solved' ? 'Solved' : 'Pending'}
                      </span>
                    ) : (
                      <span className="truncate">{item.subtitle}</span>
                    )
                  ) : null}
                  {item.badge ? (
                    <span className="rounded bg-[#f2f6ff] px-1.5 py-0.5 text-[10px] font-medium text-[#2f66c9]">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </div>
              {item.dateLabel ? (
                <span className="shrink-0 rounded bg-[#f5f7fb] px-1.5 py-0.5 text-[10px] text-[#5b6472]">
                  {item.dateLabel}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DashboardComponent = () => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();
  const { data: userMeetings, isLoading: isMeetingsLoading } =
    useGetUserMeetings(userId);
  const { data: meetingsData, isLoading: isMeetingsListLoading } =
    useGetMeetings(200, 1, '', '', '', '', '');
  const { data: formsData, isLoading: isFormsLoading } = useFetchedForms(
    500,
    1,
  );
  const { data: allResponses, isLoading: isAllResponsesLoading } =
    useFetchedAllIndividualResponses();
  const {
    data: meetingAssignedActionPlans,
    isLoading: isMeetingAssignedActionPlansLoading,
  } = useGetAssignedActionPlans(
    200,
    1,
    userId ? String(userId) : null,
    null,
    null,
    null,
    null,
    ActionPlanSourceType.MEETING,
  );
  const {
    data: surveyAssignedActionPlans,
    isLoading: isSurveyAssignedActionPlansLoading,
  } = useGetAssignedActionPlans(
    200,
    1,
    userId ? String(userId) : null,
    null,
    null,
    null,
    null,
    ActionPlanSourceType.SURVEY,
  );
  const formNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    const rows = normalizeToArray(formsData);
    for (const row of rows) {
      const id = row?.id;
      const name = String(row?.name ?? row?.title ?? '').trim();
      if (id != null && name) m.set(String(id), name);
    }
    return m;
  }, [formsData]);
  const recentMeetingsFromReport = toMeetingListByMode(
    userMeetings,
    String(userId ?? ''),
    'upcoming',
  );
  const recentCompletedMeetingsFromReport = toMeetingListByMode(
    userMeetings,
    String(userId ?? ''),
    'completed',
  );
  const recentMeetingsFromMeetingsApi = toMeetingListByModeFromMeetingsApi(
    meetingsData,
    String(userId ?? ''),
    'upcoming',
  );
  const recentCompletedMeetingsFromMeetingsApi =
    toMeetingListByModeFromMeetingsApi(
      meetingsData,
      String(userId ?? ''),
      'completed',
    );
  const recentMeetings =
    recentMeetingsFromReport.length > 0
      ? recentMeetingsFromReport
      : recentMeetingsFromMeetingsApi;
  const completedMeetings =
    recentCompletedMeetingsFromReport.length > 0
      ? recentCompletedMeetingsFromReport
      : recentCompletedMeetingsFromMeetingsApi;
  const meetingAssignedActionPlanEntries = toAssignedActionPlanList(
    meetingAssignedActionPlans,
  );
  const surveyAssignedActionPlanEntries = toAssignedActionPlanList(
    surveyAssignedActionPlans,
  );
  const recentSurveyEntriesFromReport = toSurveyList(
    userMeetings,
    formNameById,
  );
  const recentSurveyEntriesFallback = toSurveyListFromAllResponses(
    allResponses,
    userId,
    formNameById,
  );
  const recentSurveyEntries =
    recentSurveyEntriesFromReport.length > 0
      ? recentSurveyEntriesFromReport
      : recentSurveyEntriesFallback;
  const isMeetingsSectionLoading = isMeetingsLoading || isMeetingsListLoading;
  const isSurveysSectionLoading =
    isMeetingsLoading ||
    isFormsLoading ||
    isAllResponsesLoading ||
    isSurveyAssignedActionPlansLoading;
  const isMeetingTabsLoading =
    isMeetingsSectionLoading || isMeetingAssignedActionPlansLoading;

  return (
    <div
      className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6"
      data-cy="feedback-conversation-component-conversationdashboard-div"
      id="feedback-conversation-component-conversationdashboard-div"
    >
      <style jsx global>{`
        .conversation-list-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .conversation-list-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
      <div
        className="block min-w-0"
        data-cy="feedback-conversation-component-conversationdashboard-link-meetings"
        id="feedback-conversation-component-conversationdashboard-link-meetings"
      >
        <Card
          bodyStyle={{ padding: 0 }}
          className="shadow-sm border border-[#e8e8e8] rounded-lg px-4 py-3 h-full hover:shadow-md transition-shadow"
          data-cy="feedback-conversation-component-conversationdashboard-card-meetings"
          id="feedback-conversation-component-conversationdashboard-card-meetings"
        >
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-[31.5px] h-[29.5px] gap-[10px] rounded-[3px] pt-[5px] pr-[7px] pb-[5px] pl-[7px] flex items-center justify-center bg-[#f4f8ff]">
                <CalendarOutlined className="text-[20px] text-[#4a6fd5]" />
              </div>
              <Text className="!text-[28px] !font-semibold !text-[#222]">
                Meetings
              </Text>
            </div>
            <Link href="/feedback/meeting">
              <Text className="!text-[14px] !font-medium !text-[#2f66c9]">
                Go to meeting
              </Text>
            </Link>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Text className="!text-[16px] !text-[#555]">
                  Total Action plans
                </Text>
                <span className="inline-flex items-center justify-center min-w-[29px] h-[22px] gap-[4px] rounded-[4px] border border-[#d9d9d9] pt-[1px] pr-[7px] pb-[1px] pl-[7px] text-[10px] leading-none bg-[#f5f5f5] text-[#6b7280]">
                  {isMeetingsSectionLoading ? (
                    <Skeleton.Button
                      active
                      size="small"
                      style={{ width: 28 }}
                    />
                  ) : (
                    (userMeetings?.totalActionPlans ?? 0)
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Text className="!text-[12px] !text-[#555]">
                  Total Action plans resolved
                </Text>
                <span className="inline-flex items-center justify-center min-w-[29px] h-[22px] gap-[4px] rounded-[4px] border border-[#d9d9d9] pt-[1px] pr-[7px] pb-[1px] pl-[7px] text-[10px] leading-none bg-[#E6FBDA] text-[#52C41A]">
                  {isMeetingsSectionLoading ? (
                    <Skeleton.Button
                      active
                      size="small"
                      style={{ width: 28 }}
                    />
                  ) : (
                    (userMeetings?.resolvedActionPlans ?? 0)
                  )}
                </span>
              </div>
            </div>

            <div className="min-w-[56px] rounded-md px-2 py-1 text-center bg-[#f4f8ff]">
              <div className="text-[14px] leading-4 font-semibold text-[#2f66c9]">
                {isMeetingsSectionLoading ? (
                  <Skeleton.Button active size="small" style={{ width: 28 }} />
                ) : (
                  (userMeetings?.totalUpcomingMeetings ?? 0)
                )}
              </div>
              <div className="text-[14px] leading-4 text-[#2f66c9]">
                Upcoming
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Tabs
              defaultActiveKey="upcoming-meetings"
              items={[
                {
                  key: 'upcoming-meetings',
                  label: `Upcoming (${recentMeetings.length})`,
                  children: (
                    <RecentList
                      title="Upcoming meetings"
                      items={recentMeetings}
                      emptyText="No upcoming meetings found for your participation yet."
                      loading={isMeetingTabsLoading}
                      borderless
                      hideHeader
                    />
                  ),
                },
                {
                  key: 'completed-meetings',
                  label: `Completed (${completedMeetings.length})`,
                  children: (
                    <RecentList
                      title="Completed meetings"
                      items={completedMeetings}
                      emptyText="No completed meetings found for your participation yet."
                      loading={isMeetingTabsLoading}
                      borderless
                      hideHeader
                    />
                  ),
                },
                {
                  key: 'meeting-action-plans',
                  label: 'Action plans',
                  children: (
                    <div className="mt-2 rounded-md border border-dashed border-[#d7ddea] bg-white px-3 py-4 text-[12px] text-[#6b7280]">
                      To be completed.
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>

      <div
        className="block min-w-0"
        data-cy="feedback-conversation-component-conversationdashboard-link-surveys"
        id="feedback-conversation-component-conversationdashboard-link-surveys"
      >
        <Card
          bodyStyle={{ padding: 0 }}
          className="shadow-sm border border-[#e8e8e8] rounded-lg px-4 py-3 h-full hover:shadow-md transition-shadow"
          data-cy="feedback-conversation-component-conversationdashboard-card-surveys"
          id="feedback-conversation-component-conversationdashboard-card-surveys"
        >
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-[31.5px] h-[29.5px] gap-[10px] rounded-[3px] pt-[5px] pr-[7px] pb-[5px] pl-[7px] flex items-center justify-center bg-[#f4f8ff]">
                <MdOutlineFactCheck className="text-[20px] text-[#4a6fd5]" />
              </div>
              <Text className="!text-[28px] !font-semibold !text-[#222]">
                Surveys
              </Text>
            </div>
            <Link href="/feedback/categories">
              <Text className="!text-[14px] !font-medium !text-[#2f66c9]">
                Go to survey
              </Text>
            </Link>
          </div>

          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Text className="!text-[16px] !text-[#555]">Total Survey</Text>
                <span className="inline-flex items-center justify-center min-w-[29px] h-[22px] gap-[4px] rounded-[4px] border border-[#d9d9d9] pt-[1px] pr-[7px] pb-[1px] pl-[7px] text-[10px] leading-none bg-[#f5f5f5] text-[#6b7280]">
                  {isSurveysSectionLoading ? (
                    <Skeleton.Button
                      active
                      size="small"
                      style={{ width: 28 }}
                    />
                  ) : (
                    (userMeetings?.totalSurvey ?? 0)
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Text className="!text-[16px] !text-[#555]">
                  Total Survey Completed
                </Text>
                <span className="inline-flex items-center justify-center min-w-[29px] h-[22px] gap-[4px] rounded-[4px] border border-[#d9d9d9] pt-[1px] pr-[7px] pb-[1px] pl-[7px] text-[10px] leading-none bg-[#E6FBDA] text-[#52C41A]">
                  {isSurveysSectionLoading ? (
                    <Skeleton.Button
                      active
                      size="small"
                      style={{ width: 28 }}
                    />
                  ) : (
                    (userMeetings?.totalCompletedSurvey ?? 0)
                  )}
                </span>
              </div>
            </div>

            <div className="min-w-[56px] rounded-md px-2 py-1 text-center bg-[#f4f8ff]">
              <div className="text-[14px] leading-4 font-semibold text-[#2f66c9]">
                {isSurveysSectionLoading ? (
                  <Skeleton.Button active size="small" style={{ width: 28 }} />
                ) : (
                  (userMeetings?.totalUpcomingMeetings ?? 0)
                )}
              </div>
              <div className="text-[14px] leading-4 text-[#2f66c9]">
                Upcoming
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Tabs
              defaultActiveKey="assigned-action-plans"
              items={[
                {
                  key: 'assigned-action-plans',
                  label: `Action plans (${surveyAssignedActionPlanEntries.length})`,
                  children: (
                    <RecentList
                      title="Action plans"
                      items={surveyAssignedActionPlanEntries}
                      emptyText="No action plans found yet."
                      loading={isSurveysSectionLoading}
                      borderless
                      hideHeader
                      onItemClick={(item, e) => {
                        if (!item.href) return;
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(item.href);
                      }}
                    />
                  ),
                },
                {
                  key: 'submitted-surveys',
                  label: `Submitted surveys (${recentSurveyEntries.length})`,
                  children: (
                    <RecentList
                      title="Recent submitted surveys"
                      items={recentSurveyEntries}
                      emptyText="No submitted surveys found yet."
                      loading={isSurveysSectionLoading}
                      borderless
                      hideHeader
                      onItemClick={(item, e) => {
                        if (!item.href) return;
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(item.href);
                      }}
                    />
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardComponent;
