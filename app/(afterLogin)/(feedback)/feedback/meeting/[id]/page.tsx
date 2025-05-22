// pages/meeting/[id].tsx
'use client';
import MeetingHeader from './_components/meetingHeader';
import MeetingObjectives from './_components/MeetingObjectives';
import MeetingAgenda from './_components/MeetingAgenda';
import FinalNotes from './_components/FinalNotes';
import ActionPlan from './_components/ActionPlan';
import CommentsSection from './_components/CommentsSection';
import OtherDetails from './_components/OtherDetails';
import ParticipantsList from './_components/ParticipantsList';
import UploadSection from './_components/UploadSection';
import PreviousMeeting from './_components/PreviousMeeting';
import { useGetMeetingsById } from '@/store/server/features/CFR/meeting/queries';

type Params = {
  id: string;
};

export default function MeetingDetailPage({ params }: { params: Params }) {
  const { data: meeting, isLoading } = useGetMeetingsById(params?.id);
  return (
    <div className="p-1">
      <MeetingHeader loading={isLoading} title={meeting?.title} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 border rounded-lg h-screen">
          <MeetingObjectives
            loading={isLoading}
            objective={meeting?.objective}
          />
          <MeetingAgenda id={meeting?.id} />
          <FinalNotes
            loading={isLoading}
            meetingId={meeting?.id}
            finalNote={meeting?.finalNote}
          />
          <ActionPlan loading={isLoading} meetingId={meeting?.id} />
          <UploadSection meetingId={meeting?.id} />
        </div>
        <div className="border rounded-lg h-screen">
          <OtherDetails loading={isLoading} meeting={meeting} />
          <ParticipantsList loading={isLoading} meeting={meeting} />
          <CommentsSection />
          <PreviousMeeting />
        </div>
      </div>
    </div>
  );
}
