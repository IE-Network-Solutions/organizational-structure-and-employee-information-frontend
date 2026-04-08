'use client';

import { useState } from 'react';
import MeetingPanelHeader from './MeetingPanelHeader';
import MeetingObjectives from '../[id]/_components/MeetingObjectives';
import MeetingAgenda from '../[id]/_components/MeetingAgenda';
import FinalNotes from '../[id]/_components/FinalNotes';
import ActionPlan from '../[id]/_components/ActionPlan';
import OtherDetails from '../[id]/_components/OtherDetails';
import ParticipantsList from '../[id]/_components/ParticipantsList';
import UploadSection from '../[id]/_components/UploadSection';
import { useGetMeetingsById } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export interface MeetingDetailPanelProps {
  meetingId: string;
}

export default function MeetingDetailPanel({
  meetingId,
}: MeetingDetailPanelProps) {
  const { data: meeting, isLoading } = useGetMeetingsById(meetingId);
  const { userId } = useAuthenticationStore();
  const [otherDetailsEditTrigger, setOtherDetailsEditTrigger] = useState(0);

  const canEdit =
    userId === meeting?.chairpersonId || userId === meeting?.facilitatorId;

  return (
    <div
      className="box-border flex h-[720px] w-full max-w-full min-w-0 flex-col gap-[15px] overflow-y-auto scrollbar-none rounded-[8px] border-[1px] border-solid border-[#D9D9D9] bg-white pt-[15px] pr-[14px] pb-[15px] pl-[14px] opacity-100"
      data-cy={`feedback-meeting-detail-panel-${meetingId}`}
      id={`feedback-meeting-detail-panel-${meetingId}`}
    >
      <div
        className="shrink-0"
        data-cy="feedback-meeting-detail-panel-header-wrap"
      >
        <MeetingPanelHeader
          loading={isLoading}
          meetingTitle={meeting?.title}
          meetingData={meeting}
          canEdit={canEdit}
          onEditDetails={() => setOtherDetailsEditTrigger((n) => n + 1)}
        />
      </div>

      <OtherDetails
        variant="panelSummary"
        editTrigger={otherDetailsEditTrigger}
        canEdit={canEdit}
        loading={isLoading}
        meeting={meeting as any}
      />
      <ParticipantsList
        variant="panel"
        canEdit={canEdit}
        loading={isLoading}
        meeting={meeting}
        data-cy="feedback-meeting-detail-panel-participants-list"
      />
      <MeetingObjectives
        variant="panel"
        loading={isLoading}
        objective={meeting?.objective}
        data-cy="feedback-meeting-detail-panel-meeting-objectives"
      />
      <MeetingAgenda
        variant="panel"
        canEdit={canEdit}
        id={meetingId}
        data-cy="feedback-meeting-detail-panel-meeting-agenda"
      />
      <ActionPlan
        variant="panel"
        canEdit={canEdit}
        loading={isLoading}
        meetingId={meetingId}
        data-cy="feedback-meeting-detail-panel-action-plan"
      />
      <FinalNotes
        variant="panel"
        canEdit={canEdit}
        loading={isLoading}
        meetingId={meetingId}
        finalNote={meeting?.finalNote ?? ''}
        data-cy="feedback-meeting-detail-panel-final-notes"
      />
      <UploadSection
        variant="panel"
        canEdit={canEdit}
        meetingId={meetingId}
        meeting={meeting}
        data-cy="feedback-meeting-detail-panel-upload-section"
      />
    </div>
  );
}
