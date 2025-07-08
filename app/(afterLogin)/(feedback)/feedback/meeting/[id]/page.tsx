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
  const canEditComment= meeting?.attendees?.some((i:any)=>i.userId===userId)
  return (
    <div className="p-1 ">
      <MeetingHeader loading={isLoading} title={meeting?.title} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 border rounded-lg h-screen overflow-y-auto scrollbar-none">
          <MeetingObjectives
            loading={isLoading}
            objective={meeting?.objective}
          />
          <MeetingAgenda canEdit={canEdit} id={meeting?.id} />
          <FinalNotes
            loading={isLoading}
            meetingId={meeting?.id}
            finalNote={meeting?.finalNote}
            canEdit={canEdit}
          />
          <ActionPlan
            canEdit={canEdit}
            loading={isLoading}
            meetingId={meeting?.id}
          />
          <UploadSection
            canEdit={canEdit}
            meetingId={meeting?.id}
            meeting={meeting}
          />
        </div>
        <div className="border rounded-lg  h-screen overflow-y-auto scrollbar-none">
          <OtherDetails
            canEdit={canEdit}
            loading={isLoading}
            meeting={meeting}
          />
          <ParticipantsList
            canEdit={canEdit}
            loading={isLoading}
            meeting={meeting}
          />
          <CommentsSection canEditComment={canEditComment} meetingId={meeting?.id} />
          <PreviousMeeting meeting={meeting} />
        </div>
      </div>
    </div>
  );
}
