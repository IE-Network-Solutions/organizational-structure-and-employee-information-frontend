// components/MeetingDetail/MeetingAgenda.tsx
import { Button, Popconfirm, Spin } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AgendaModal from './AddAgenda';
import MeetingAgendaModal from './MeetingAgendaModal';
import { useGetMeetingAgenda } from '@/store/server/features/CFR/meeting/queries';
import { useDeleteMeetingAgenda } from '@/store/server/features/CFR/meeting/mutations';

interface MeetingAgendaProps {
  id: string; // or number, depending on your usage
}

export default function MeetingAgenda({ id }: MeetingAgendaProps) {
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
    <div className="p-4">
      <div className="flex justify-between items-center py-2">
        <h2 className="text-lg font-semibold mb-2">Meeting Agenda</h2>
        <Button
          icon={<FaPlus />}
          onClick={() => setOpenAddAgenda(true)}
          type="primary"
        >
          Add New
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Spin />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {meetingAgendas?.items?.map((i: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <span
                className="cursor-pointer"
                onClick={() => handleMeetingDiscussion(i)}
              >
                {i.agenda}
              </span>
              <div className="flex items-center gap-2">
                <EditOutlined
                  key="edit"
                  className="text-gray-500 hover:text-red-blue cursor-pointer"
                  onClick={() => handleEdit(i)}
                />
                <Popconfirm
                  title="Are you sure you want to remove this agenda?"
                  onConfirm={() => handleDelete(i.id)}
                  okText="Yes"
                  cancelText="No"
                  zIndex={0}
                >
                  <CloseOutlined
                    key="close"
                    className="text-gray-500 hover:text-red-500 cursor-pointer"
                  />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}
      <AgendaModal
        meetingAgenda={meetingAgenda}
        meetingId={id}
        visible={openAddAgenda}
        onClose={() => setOpenAddAgenda(false)}
      />
      <MeetingAgendaModal
        visible={openMeetingAgenda}
        onClose={() => setOpenMeetingAgenda(false)}
        meetingAgenda={meetingAgenda}
        meetingId={id}
      />
    </div>
  );
}
