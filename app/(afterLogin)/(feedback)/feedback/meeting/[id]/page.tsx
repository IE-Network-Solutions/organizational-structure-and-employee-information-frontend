// pages/meeting/[id].tsx
'use client';
import { useRouter } from 'next/router';
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


export default function MeetingDetailPage() {
//   const router = useRouter();
//   const { id } = router.query;

  // You can fetch meeting data here based on `id`

  return (
    <div className="p-6">
      <MeetingHeader title={`Meeting Title`} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-lg">
          <MeetingObjectives />
          <MeetingAgenda />
          <FinalNotes />
          <ActionPlan />
          <UploadSection/>
        </div>
        <div className="border rounded-lg">
          <OtherDetails />
          <ParticipantsList />
          <CommentsSection />
          <PreviousMeeting/>
        </div>
      </div>
    </div>
  );
}
