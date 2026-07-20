/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  Card,
  Skeleton,
  Tabs,
  Typography,
  Tag,
  Space,
  Avatar,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
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

const { Text, Title } = Typography;

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

  const matchesUid = (entry: any): boolean => {
    if (entry == null) return false;

    // Raw id values or comma-separated list.
    if (typeof entry === 'string' || typeof entry === 'number') {
      const s = String(entry).trim();
      if (!s) return false;
      if (s === uid) return true;
      if (s.includes(',')) {
        return s
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
          .some((x) => x === uid);
      }
      return false;
    }

    // Common nested/id fields we see across APIs.
    const candidateIds = [
      entry?.id,
      entry?.userId,
      entry?.employeeId,
      entry?.attendeeId,
      entry?.participantId,
      entry?.accountId,
      entry?.uid,
      entry?.user?.id,
      entry?.employee?.id,
      entry?.attendee?.id,
      entry?.participant?.id,
    ]
      .filter((x) => x != null && String(x).trim() !== '')
      .map((x) => String(x));

    return candidateIds.some((x) => x === uid);
  };

  const attendeeSets = [
    normalizeToArray(item?.attendees),
    normalizeToArray(item?.attendeesIds),
    normalizeToArray(item?.participants),
    normalizeToArray(item?.participantIds),
    normalizeToArray(item?.attendeeIds),
    normalizeToArray(item?.participantUsers),
    normalizeToArray(item?.attendeeUsers),
    normalizeToArray(item?.meetingAttendees),
    normalizeToArray(item?.meetingParticipants),
  ];
  for (const set of attendeeSets) {
    const exists = set.some(matchesUid);
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
        href: `/feedback/meeting/${id}`,
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
        href: `/feedback/meeting/${id}`,
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
  onItemClick?: (item: DashboardListItem, e: React.MouseEvent<unknown>) => void;
  borderless?: boolean;
  hideHeader?: boolean;
}) {
  return (
    <div
      className={
        borderless
          ? 'mt-1'
          : 'mt-4 rounded-xl border border-[#e8eeff] bg-white p-3'
      }
    >
      {!hideHeader ? (
        <div className="mb-2.5 flex items-center justify-between">
          <Text className="!text-[12px] !font-semibold !text-[#1f3f8f]">
            {title}
          </Text>
          {!loading && (
            <Tag
              bordered={false}
              color="geekblue"
              style={{
                fontSize: 10,
                padding: '0 6px',
                lineHeight: '18px',
                borderRadius: 10,
              }}
            >
              {items.length}
            </Tag>
          )}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2 pt-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`recent-list-skeleton-${title}-${idx}`}
              className="rounded-lg bg-[#f8faff] px-3 py-2.5"
            >
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Text className="!text-[12px] !text-[#9ca3af]">{emptyText}</Text>
        </div>
      ) : (
        <div
          className={`space-y-1.5 ${
            items.length > LIST_SCROLL_THRESHOLD
              ? 'conversation-list-scroll max-h-[265px] overflow-y-auto pr-1'
              : ''
          }`}
        >
          {items.map((item) =>
            (() => {
              const cardClass = `flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 transition-all ${
                item.href
                  ? 'cursor-pointer border-[#e6edff] bg-white hover:border-[#adc6ff] hover:bg-[#f0f5ff] hover:shadow-sm'
                  : 'border-[#f0f0f0] bg-[#fafafa]'
              }`;

              const inner = (
                <>
                  <div className="min-w-0 flex-1">
                    <Text className="!block !truncate !text-[12.5px] !font-medium !text-[#1f2937]">
                      {item.title}
                    </Text>
                    <Space size={4} className="mt-1 flex-wrap">
                      {item.subtitle ? (
                        item.subtitleTag ? (
                          <Tag
                            bordered={false}
                            color={
                              item.subtitleTag === 'solved'
                                ? 'success'
                                : 'warning'
                            }
                            style={{
                              fontSize: 10,
                              lineHeight: '16px',
                              padding: '0 5px',
                              margin: 0,
                            }}
                          >
                            {item.subtitleTag === 'solved'
                              ? 'Solved'
                              : 'Pending'}
                          </Tag>
                        ) : (
                          <Text className="!truncate !text-[11px] !text-[#6b7280]">
                            {item.subtitle}
                          </Text>
                        )
                      ) : null}
                      {item.badge ? (
                        <Tag
                          bordered={false}
                          color="geekblue"
                          style={{
                            fontSize: 10,
                            lineHeight: '16px',
                            padding: '0 5px',
                            margin: 0,
                          }}
                        >
                          {item.badge}
                        </Tag>
                      ) : null}
                    </Space>
                  </div>
                  {item.dateLabel ? (
                    <Tag
                      bordered={false}
                      style={{
                        backgroundColor: '#f0f4ff',
                        color: '#4a6fd5',
                        fontSize: 10,
                        lineHeight: '16px',
                        padding: '0 6px',
                        flexShrink: 0,
                        margin: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.dateLabel}
                    </Tag>
                  ) : null}
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cardClass}
                    onClick={(e) => {
                      if (!onItemClick) return;
                      onItemClick(item, e);
                    }}
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <div key={item.id} className={cardClass}>
                  {inner}
                </div>
              );
            })(),
          )}
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

      {/* ── MEETINGS CARD ── */}
      <div
        className="block min-w-0"
        data-cy="feedback-conversation-component-conversationdashboard-link-meetings"
        id="feedback-conversation-component-conversationdashboard-link-meetings"
      >
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          className="h-full overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
          style={{ border: '1px solid #e8e8f0' }}
          data-cy="feedback-conversation-component-conversationdashboard-card-meetings"
          id="feedback-conversation-component-conversationdashboard-card-meetings"
        >
          <div className="px-5 py-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  shape="square"
                  size={38}
                  icon={<CalendarOutlined />}
                  style={{
                    backgroundColor: '#e8f0fe',
                    color: '#4a6fd5',
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                />
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: '#1a1a2e',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  Meetings
                </Title>
              </div>
              <Link href="/feedback/meeting">
                <Text
                  className="!text-[13px] !font-medium !text-[#4a6fd5] hover:!text-[#365fbd] hover:!underline"
                  style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Go to meeting →
                </Text>
              </Link>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Stats row */}
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-xl px-4 py-3"
                style={{ background: '#f8faff' }}
              >
                <Text className="!block !text-[11px] !font-medium !text-[#6b7280]">
                  Total Action Plans
                </Text>
                {isMeetingsSectionLoading ? (
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 56, height: 28, marginTop: 6 }}
                  />
                ) : (
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[26px] font-bold leading-none text-[#1a1a2e]">
                      {userMeetings?.totalActionPlans ?? 0}
                    </span>
                  </div>
                )}
                {isMeetingsSectionLoading ? null : (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    bordered={false}
                    color="success"
                    style={{ marginTop: 6, fontSize: 11 }}
                  >
                    {userMeetings?.resolvedActionPlans ?? 0} resolved
                  </Tag>
                )}
              </div>

              <div
                className="flex-1 rounded-xl px-4 py-3"
                style={{ background: '#eef3ff' }}
              >
                <div className="flex items-center gap-1.5">
                  <ClockCircleOutlined
                    style={{ color: '#4a6fd5', fontSize: 12 }}
                  />
                  <Text className="!text-[11px] !font-medium !text-[#4a6fd5]">
                    Upcoming
                  </Text>
                </div>
                {isMeetingsSectionLoading ? (
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 56, height: 28, marginTop: 6 }}
                  />
                ) : (
                  <span className="mt-1 block text-[26px] font-bold leading-none text-[#0958d9]">
                    {userMeetings?.totalUpcomingMeetings ?? 0}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <div className="px-5 pb-4 pt-2">
            <Tabs
              defaultActiveKey="upcoming-meetings"
              size="small"
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
                    <div className="mt-2 rounded-lg border border-dashed border-[#d7ddea] bg-white px-4 py-5 text-center text-[12px] text-[#9ca3af]">
                      To be completed.
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* ── SURVEYS CARD ── */}
      <div
        className="block min-w-0"
        data-cy="feedback-conversation-component-conversationdashboard-link-surveys"
        id="feedback-conversation-component-conversationdashboard-link-surveys"
      >
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          className="h-full overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
          style={{ border: '1px solid #e8e8f0' }}
          data-cy="feedback-conversation-component-conversationdashboard-card-surveys"
          id="feedback-conversation-component-conversationdashboard-card-surveys"
        >
          <div className="px-5 py-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  shape="square"
                  size={38}
                  icon={<AuditOutlined />}
                  style={{
                    backgroundColor: '#e6f7e9',
                    color: '#13a554',
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                />
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: '#1a1a2e',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  Surveys
                </Title>
              </div>
              <Link href="/feedback/categories">
                <Text
                  className="!text-[13px] !font-medium !text-[#13a554] hover:!text-[#0e8040] hover:!underline"
                  style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Go to survey →
                </Text>
              </Link>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Stats row */}
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-xl px-4 py-3"
                style={{ background: '#f6fff8' }}
              >
                <Text className="!block !text-[11px] !font-medium !text-[#6b7280]">
                  Total Surveys
                </Text>
                {isSurveysSectionLoading ? (
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 56, height: 28, marginTop: 6 }}
                  />
                ) : (
                  <span className="mt-1 block text-[26px] font-bold leading-none text-[#1a1a2e]">
                    {userMeetings?.totalSurvey ?? 0}
                  </span>
                )}
                {isSurveysSectionLoading ? null : (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    bordered={false}
                    color="success"
                    style={{ marginTop: 6, fontSize: 11 }}
                  >
                    {userMeetings?.totalCompletedSurvey ?? 0} completed
                  </Tag>
                )}
              </div>

              <div
                className="flex-1 rounded-xl px-4 py-3"
                style={{ background: '#e6f7e9' }}
              >
                <div className="flex items-center gap-1.5">
                  <ClockCircleOutlined
                    style={{ color: '#13a554', fontSize: 12 }}
                  />
                  <Text className="!text-[11px] !font-medium !text-[#13a554]">
                    Upcoming
                  </Text>
                </div>
                {isSurveysSectionLoading ? (
                  <Skeleton.Button
                    active
                    size="small"
                    style={{ width: 56, height: 28, marginTop: 6 }}
                  />
                ) : (
                  <span className="mt-1 block text-[26px] font-bold leading-none text-[#0e8040]">
                    {userMeetings?.totalUpcomingMeetings ?? 0}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <div className="px-5 pb-4 pt-2">
            <Tabs
              defaultActiveKey="assigned-action-plans"
              size="small"
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
