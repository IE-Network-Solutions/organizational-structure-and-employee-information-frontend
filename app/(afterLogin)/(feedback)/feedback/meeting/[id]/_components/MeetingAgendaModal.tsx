import React from 'react';
import { Modal, Button } from 'antd';
import Editor from './Editor';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useCreateMeetingDiscussion } from '@/store/server/features/CFR/meeting/mutations';

interface MeetingAgendaModalProps {
  visible: boolean;
  onClose: () => void;
  meetingAgenda: any;
  meetingId: string;
}

const MeetingAgendaModal: React.FC<MeetingAgendaModalProps> = ({
  visible,
  onClose,
  meetingAgenda,
  meetingId,
}) => {
  const { content, setContent } = useMeetingStore();
  const { mutate: createMeetingDiscussion, isLoading } =
    useCreateMeetingDiscussion();
  const handleSubmit = () => {
    createMeetingDiscussion(
      {
        meetingId: meetingId,
        agendaId: meetingAgenda?.id,
        discussion: content,
        order: 1,
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
      <Editor meetingId={meetingId} />
      <div className="flex justify-center mt-4 relative">
        <Button
          loading={isLoading}
          onClick={onClose}
          style={{ marginRight: '8px' }}
        >
          Cancel
        </Button>
        <Button loading={isLoading} type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default MeetingAgendaModal;
