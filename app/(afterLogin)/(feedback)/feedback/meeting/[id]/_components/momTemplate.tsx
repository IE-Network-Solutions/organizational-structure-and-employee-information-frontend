import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetMeetingDiscussion } from '@/store/server/features/CFR/meeting/discussion/queries';
import React from 'react';
import Html from 'react-pdf-html';

dayjs.extend(duration);

// Helper component to fetch and display employee name
const EmployeeName = ({ userId, style }: { userId: string; style?: any }) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(userId);
  if (isLoading) return <Text style={style}>...</Text>;
  if (error || !userDetails) return <Text style={style}>-</Text>;

  const userName =
    `${userDetails?.firstName ?? ''} ${userDetails?.middleName ?? ''} ${userDetails?.lastName ?? ''}`.trim() ||
    '-';
  return <Text style={style}>{userName || 'Unknown User'}</Text>;
};

const EmployeeRole = ({ userId, style }: { userId: string; style?: any }) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(userId);
  if (isLoading) return <Text style={style}>...</Text>;
  if (error || !userDetails) return <Text style={style}>-</Text>;

  return (
    <Text style={style}>
      {userDetails?.employeeJobInformation[0]?.position?.name || '-'}
    </Text>
  );
};

const MeetingDiscussion = ({
  meetingId,
  meetingAgendaId,
}: {
  meetingId: string;
  meetingAgendaId: string;
}) => {
  const {
    data: meetingDiscussion,
    isLoading,
    error,
  } = useGetMeetingDiscussion(meetingId, meetingAgendaId);

  if (isLoading) return <Text>...</Text>;
  if (error || !meetingDiscussion) return <Text>-</Text>;

  const discussionHtml = meetingDiscussion?.items[0]?.discussion || '';
  const styledHtml = `
    <style>
      img { display: none !important; }
    </style>
    ${discussionHtml}
  `;

  return (
    <View>
      <Html style={{ fontSize: 10, color: '#687588' }}>{styledHtml}</Html>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  workspaceText: {
    color: '#3636F0',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginBottom: 20,
    borderBottom: '1px solid #EEE',
    paddingBottom: 10,
  },
  metaInfoColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '48%',
  },
  metaInfoItem: {
    marginBottom: 5,
  },
  metaLabel: {
    color: '#687588',
    fontWeight: 'bold',
    marginRight: 5,
  },
  attendeesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1px solid #EEE',
    paddingBottom: 5,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomColor: '#bfbfbf',
    borderBottomWidth: 0.5,
  },
  tableColHeader: {
    width: '33.33%',
    backgroundColor: '#b2b2ff',
    padding: 15,
    textAlign: 'left',
    fontSize: 10,
  },
  tableColHeaderStart: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  tableColHeaderEnd: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  tableCol: {
    width: '33.33%',
    padding: 10,
    fontSize: 10,
  },
  objectiveSection: {
    marginBottom: 20,
  },
  objectiveText: {
    fontSize: 10,
  },
  agendaSection: {
    marginBottom: 20,
  },
  agendaItem: {
    marginBottom: 15,
  },
  agendaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  finalNoteSection: {
    marginBottom: 20,
  },
  finalNoteText: {
    fontSize: 10,
  },
  actionPlanSection: {
    marginTop: 20,
  },
  actionPlanTableColHeader: {
    width: '25%',
    backgroundColor: '#b2b2ff',
    padding: 15,
    textAlign: 'left',
    fontSize: 10,
  },
  actionPlanTableColHeaderStart: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  actionPlanTableColHeaderEnd: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  actionPlanTableCol: {
    width: '25%',
    padding: 5,
    fontSize: 10,
  },
  subtleText: {
    fontSize: 8,
    color: '#687588',
    fontWeight: 600, // semibold
  },
  priorityHigh: {
    color: 'red',
  },
  priorityMedium: {
    color: 'orange',
  },
  priorityLow: {
    color: 'green',
  },
});

const MomTemplate = ({ meetingData }: { meetingData: any }) => {
  const meetingDuration =
    meetingData?.startAt && meetingData?.endAt
      ? dayjs
          .duration(dayjs(meetingData.endAt).diff(dayjs(meetingData.startAt)))
          .humanize()
      : 'N/A';
  const location =
    `${meetingData?.physicalLocation ?? ''} ${meetingData?.virtualLink ? `(${meetingData.virtualLink})` : ''}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Selamnew <Text style={styles.workspaceText}>Workspace</Text>
          </Text>
          <Text style={styles.subtitle}>Minutes of Meeting</Text>
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.metaInfoColumn}>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Meeting Name:</Text>
              <Text>{meetingData?.title}</Text>
            </View>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Date of Meeting:</Text>
              <Text>{dayjs(meetingData?.startAt).format('MMM DD, YYYY')}</Text>
            </View>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Meeting Chair:</Text>
              <EmployeeName userId={meetingData?.chairpersonId} />
            </View>
          </View>
          <View style={styles.metaInfoColumn}>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Meeting time:</Text>
              <Text>{meetingDuration}</Text>
            </View>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Meeting Facilitator:</Text>
              <EmployeeName userId={meetingData?.facilitatorId} />
            </View>
            <View style={{ ...styles.metaInfoItem, flexDirection: 'row' }}>
              <Text style={styles.metaLabel}>Meeting Location:</Text>
              <Text style={{ flex: 1 }}>{location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendeesSection}>
          <Text style={styles.sectionTitle}>Attendees</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColHeader, styles.tableColHeaderStart]}>
                Attendees
              </Text>
              <Text style={styles.tableColHeader}>Role</Text>
              <Text style={[styles.tableColHeader, styles.tableColHeaderEnd]}>
                Attendance
              </Text>
            </View>
            {meetingData?.attendees?.map((attendee: any, index: number) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  {attendee.userId ? (
                    <EmployeeName userId={attendee.userId} />
                  ) : (
                    <Text>{attendee.guestUser?.name}</Text>
                  )}
                </View>
                <View style={styles.tableCol}>
                  <EmployeeRole userId={attendee.userId} />
                </View>
                <View style={styles.tableCol}>
                  <Text>{attendee.attendanceStatus}</Text>
                  {attendee.attendanceStatus === 'late' &&
                    attendee.lateBy > 0 && (
                      <Text style={styles.subtleText}>
                        {attendee.lateBy} min
                      </Text>
                    )}
                  {attendee.attendanceStatus === 'absent' &&
                    attendee.absentismReason && (
                      <Text style={styles.subtleText}>
                        Reason: {attendee.absentismReason}
                      </Text>
                    )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.objectiveSection} break>
          <Text style={styles.sectionTitle}>Meeting Objective</Text>
          <Text style={styles.objectiveText}>{meetingData?.objective}</Text>
        </View>

        <View style={styles.agendaSection}>
          <Text style={styles.sectionTitle}>{"Meeting Agenda's"}</Text>
          {meetingData?.agenda?.map((item: any, index: number) => (
            <View style={styles.agendaItem} key={index}>
              <Text
                style={styles.agendaTitle}
              >{`${index + 1}. ${item.agenda}`}</Text>
              <MeetingDiscussion
                meetingId={meetingData?.id}
                meetingAgendaId={item?.id}
              />
            </View>
          ))}
        </View>

        {meetingData?.finalNote && (
          <View style={styles.finalNoteSection}>
            <Text style={[styles.sectionTitle, { textAlign: 'left' }]}>
              Discussion notes
            </Text>
            <Text style={styles.finalNoteText}>{meetingData.finalNote}</Text>
          </View>
        )}

        <View style={styles.actionPlanSection}>
          <Text style={styles.sectionTitle}>Action Plans</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.actionPlanTableColHeader,
                  styles.actionPlanTableColHeaderStart,
                ]}
              >
                Action Item
              </Text>
              <Text style={styles.actionPlanTableColHeader}>
                Responsible Person
              </Text>
              <Text style={styles.actionPlanTableColHeader}>Priority</Text>
              <Text
                style={[
                  styles.actionPlanTableColHeader,
                  styles.actionPlanTableColHeaderEnd,
                ]}
              >
                Deadline
              </Text>
            </View>
            {meetingData?.actionPlans?.map((plan: any, index: number) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.actionPlanTableCol}>{plan.issue}</Text>
                <View style={styles.actionPlanTableCol}>
                  {plan.responsibleUsers.map((user: any) => (
                    <EmployeeName
                      key={user.responsibleId}
                      userId={user.responsibleId}
                      style={{ fontSize: 10 }}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.actionPlanTableCol,
                    plan.priority?.toLowerCase() === 'high'
                      ? styles.priorityHigh
                      : {},
                    plan.priority?.toLowerCase() === 'medium'
                      ? styles.priorityMedium
                      : {},
                    plan.priority?.toLowerCase() === 'low'
                      ? styles.priorityLow
                      : {},
                  ]}
                >
                  {plan.priority}
                </Text>
                <Text style={styles.actionPlanTableCol}>
                  {dayjs(plan.deadline).format('MMM DD, YYYY')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MomTemplate;
