import React from 'react';
import { Modal, Button } from 'antd';
import Editor from './Editor';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useCreateMeetingDiscussion } from '@/store/server/features/CFR/meeting/mutations';
import { useGetMeetingDiscussion } from '@/store/server/features/CFR/meeting/queries';

interface MeetingAgendaModalProps {
  visible: boolean;
  onClose: () => void;
  meetingAgenda: any;
  meetingId: string;
  canEdit: boolean;
}

const MeetingAgendaModal: React.FC<MeetingAgendaModalProps> = ({
  visible,
  onClose,
  meetingAgenda,
  meetingId,
  canEdit,
}) => {
  const { content, setContent } = useMeetingStore();
  const { mutate: createMeetingDiscussion, isLoading } =
    useCreateMeetingDiscussion();
  const { mutate: updateMeetingDiscussion, isLoading: updateLoading } =
    useCreateMeetingDiscussion();
  const { data: meetingDiscussion } = useGetMeetingDiscussion(
    meetingId,
    meetingAgenda?.id,
  );

  const handleSubmit = () => {
    !meetingDiscussion?.items[0]?.id
      ? createMeetingDiscussion(
          {
            meetingId: meetingId,
            agendaId: meetingAgenda?.id,
            discussion: content,
          },
          {
            onSuccess: () => {
              setContent('');
              onClose();
            },
          },
        )
      : updateMeetingDiscussion(
          {
            id: meetingDiscussion?.items[0]?.id,
            meetingId: meetingId,
            agendaId: meetingAgenda?.id,
            discussion: content,
          },
          {
            onSuccess: () => {
              setContent('');
              onClose();
            },
          },
        );
    // onClose(); // Close the modal after submission
  };
  return (
    <Modal
      title={<div className="text-lg">{meetingAgenda?.agenda} </div>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80vw"
      style={{
        top: 20,
        height: '90vh',
        maxHeight: '90vh',
      }}
      bodyStyle={{
        height: 'calc(95vh - 108px)', // Adjust for title + footer
        overflowY: 'auto',
      }}
    >
      <p className="mb-5">Please add everything said for this agenda here</p>
      <Editor
        canEdit={canEdit}
        meetingAgendaId={meetingAgenda?.id}
        meetingId={meetingId}
      />
      {canEdit && (
        <div className="flex justify-center mt-4 relative">
          <Button
            loading={isLoading || updateLoading}
            onClick={onClose}
            style={{ marginRight: '8px' }}
          >
            Cancel
          </Button>
          <Button
            loading={isLoading || updateLoading}
            type="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default MeetingAgendaModal;
