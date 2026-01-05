// components/MeetingDetail/MeetingAgenda.tsx
import { Button, Popconfirm, Spin } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AgendaModal from './AddAgenda';
import MeetingAgendaModal from './MeetingAgendaModal';
import { useGetMeetingAgenda } from '@/store/server/features/CFR/meeting/agenda/queries';
import { useDeleteMeetingAgenda } from '@/store/server/features/CFR/meeting/agenda/mutations';

interface MeetingAgendaProps {
  id: string; // or number, depending on your usage
  canEdit: boolean;
}

export default function MeetingAgenda({ id, canEdit }: MeetingAgendaProps) {
  const {
    openAddAgenda,
    setOpenAddAgenda,
    openMeetingAgenda,
    setOpenMeetingAgenda,
    meetingAgenda,
    setMeetingAgenda,
  } = useMeetingStore();
  const { data: meetingAgendas, isLoading } = useGetMeetingAgenda(id);
  const { mutate: deleteMeetingAgenda } = useDeleteMeetingAgenda();
  const handleEdit = (value: any) => {
    setOpenAddAgenda(true);
    setMeetingAgenda(value);
  };
  const handleMeetingDiscussion = (value: any) => {
    setOpenMeetingAgenda(true);
    setMeetingAgenda(value);
  };
  const handleDelete = (id: string) => {
    deleteMeetingAgenda(id);
  };

  return (
    <div
      className="p-4"
      data-cy="feedback-meeting-components-meetingagenda-div"
      id="feedback-meeting-components-meetingagenda-div"
    >
      <div
        className="flex justify-between items-center py-2"
        data-cy="feedback-meeting-components-meetingagenda-div-header"
        id="feedback-meeting-components-meetingagenda-div-header"
      >
        <h2
          className="text-lg font-bold mb-2"
          data-cy="feedback-meeting-components-meetingagenda-heading"
          id="feedback-meeting-components-meetingagenda-heading"
        >
          Meeting Agenda
        </h2>
        {canEdit && (
          <Button
            icon={
              <FaPlus
                data-cy="feedback-meeting-components-meetingagenda-icon-add"
                id="feedback-meeting-components-meetingagenda-icon-add"
              />
            }
            onClick={() => setOpenAddAgenda(true)}
            type="primary"
            className="h-10"
            data-cy="feedback-meeting-components-meetingagenda-button-add"
            id="feedback-meeting-components-meetingagenda-button-add"
          >
            Add New
          </Button>
        )}
      </div>
      {isLoading ? (
        <div
          className="flex justify-center"
          data-cy="feedback-meeting-components-meetingagenda-div-loading"
          id="feedback-meeting-components-meetingagenda-div-loading"
        >
          <Spin data-cy="feedback-meeting-components-meetingagenda-spin" />
        </div>
      ) : (
        <div
          className="flex flex-col gap-2"
          data-cy="feedback-meeting-components-meetingagenda-div-list"
          id="feedback-meeting-components-meetingagenda-div-list"
        >
          {meetingAgendas?.items?.map((i: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-md p-3"
              data-cy={`feedback-meeting-components-meetingagenda-item-${index}`}
              id={`feedback-meeting-components-meetingagenda-item-${index}`}
            >
              <span
                className="cursor-pointer font-bold"
                onClick={() => handleMeetingDiscussion(i)}
                data-cy={`feedback-meeting-components-meetingagenda-item-text-${index}`}
                id={`feedback-meeting-components-meetingagenda-item-text-${index}`}
              >
                {i.agenda}
              </span>
              {canEdit && (
                <div
                  className="flex items-center gap-2"
                  data-cy={`feedback-meeting-components-meetingagenda-item-actions-${index}`}
                  id={`feedback-meeting-components-meetingagenda-item-actions-${index}`}
                >
                  <EditOutlined
                    key="edit"
                    className="text-gray-500 hover:text-red-blue cursor-pointer"
                    onClick={() => handleEdit(i)}
                    data-cy={`feedback-meeting-components-meetingagenda-icon-edit-${index}`}
                    id={`feedback-meeting-components-meetingagenda-icon-edit-${index}`}
                  />
                  <Popconfirm
                    title="Are you sure you want to remove this agenda?"
                    onConfirm={() => handleDelete(i.id)}
                    okText="Yes"
                    cancelText="No"
                    zIndex={0}
                    data-cy={`feedback-meeting-components-meetingagenda-popconfirm-delete-${index}`}
                    id={`feedback-meeting-components-meetingagenda-popconfirm-delete-${index}`}
                  >
                    <CloseOutlined
                      key="close"
                      className="text-gray-500 hover:text-red-500 cursor-pointer"
                      data-cy={`feedback-meeting-components-meetingagenda-icon-delete-${index}`}
                      id={`feedback-meeting-components-meetingagenda-icon-delete-${index}`}
                    />
                  </Popconfirm>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <AgendaModal
        meetingAgenda={meetingAgenda}
        meetingId={id}
        visible={openAddAgenda}
        onClose={() => setOpenAddAgenda(false)}
        data-cy="feedback-meeting-components-meetingagenda-modal-agenda"
      />
      <MeetingAgendaModal
        visible={openMeetingAgenda}
        onClose={() => setOpenMeetingAgenda(false)}
        meetingAgenda={meetingAgenda}
        meetingId={id}
        canEdit={canEdit}
        data-cy="feedback-meeting-components-meetingagenda-modal-meeting"
      />
    </div>
  );
}
