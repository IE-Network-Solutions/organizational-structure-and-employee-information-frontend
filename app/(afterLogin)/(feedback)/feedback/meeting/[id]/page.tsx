// pages/meeting/[id].tsx
'use client';
import MeetingHeader from './_components/meetingHeader';
import MeetingObjectives from './_components/MeetingObjectives';
import MeetingAgenda from './_components/MeetingAgenda';
import FinalNotes from './_components/FinalNotes';
import ActionPlan from './_components/ActionPlan';
import OtherDetails from './_components/OtherDetails';
import ParticipantsList from './_components/ParticipantsList';
import UploadSection from './_components/UploadSection';
import { useGetMeetingsById } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CommentsSection from './_components/CommentsSection';
import PreviousMeeting from './_components/PreviousMeeting';

type Params = {
  id: string;
};

export default function MeetingDetailPage({ params }: { params: Params }) {
  const { data: meeting, isLoading } = useGetMeetingsById(params?.id);
  const { userId } = useAuthenticationStore();

  const canEdit =
    userId === meeting?.chairpersonId || userId === meeting?.facilitatorId;
  const canEditComment = meeting?.attendees?.some(
    (i: any) => i.userId === userId,
  );
  return (
    <div
      className="p-1 "
      data-cy={`feedback-meeting-id-page-div-${params?.id}`}
      id={`feedback-meeting-id-page-div-${params?.id}`}
    >
      <MeetingHeader
        loading={isLoading}
        title={meeting?.title}
        meetingData={meeting}
        data-cy="feedback-meeting-id-page-meeting-header"
      />
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-2"
        data-cy={`feedback-meeting-id-page-div-grid-${params?.id}`}
        id={`feedback-meeting-id-page-div-grid-${params?.id}`}
      >
        <div
          className="lg:col-span-2 border rounded-lg h-screen overflow-y-auto scrollbar-none"
          data-cy={`feedback-meeting-id-page-div-main-content-${params?.id}`}
          id={`feedback-meeting-id-page-div-main-content-${params?.id}`}
        >
          <MeetingObjectives
            loading={isLoading}
            objective={meeting?.objective}
            data-cy="feedback-meeting-id-page-meeting-objectives"
          />
          <MeetingAgenda
            canEdit={canEdit}
            id={meeting?.id}
            data-cy="feedback-meeting-id-page-meeting-agenda"
          />
          <FinalNotes
            loading={isLoading}
            meetingId={meeting?.id}
            finalNote={meeting?.finalNote}
            canEdit={canEdit}
            data-cy="feedback-meeting-id-page-final-notes"
          />
          <ActionPlan
            canEdit={canEdit}
            loading={isLoading}
            meetingId={meeting?.id}
            data-cy="feedback-meeting-id-page-action-plan"
          />
          <UploadSection
            canEdit={canEdit}
            meetingId={meeting?.id}
            meeting={meeting}
            data-cy="feedback-meeting-id-page-upload-section"
          />
        </div>
        <div
          className="border rounded-lg  h-screen overflow-y-auto scrollbar-none"
          data-cy={`feedback-meeting-id-page-div-sidebar-${params?.id}`}
          id={`feedback-meeting-id-page-div-sidebar-${params?.id}`}
        >
          <OtherDetails
            canEdit={canEdit}
            loading={isLoading}
            meeting={meeting}
            data-cy="feedback-meeting-id-page-other-details"
          />
          <ParticipantsList
            canEdit={canEdit}
            loading={isLoading}
            meeting={meeting}
            data-cy="feedback-meeting-id-page-participants-list"
          />
          <CommentsSection
            canEditComment={canEditComment}
            meetingId={meeting?.id}
            data-cy="feedback-meeting-id-page-comments-section"
          />
          <PreviousMeeting
            meeting={meeting}
            data-cy="feedback-meeting-id-page-previous-meeting"
          />
        </div>
      </div>
    </div>
  );
}
