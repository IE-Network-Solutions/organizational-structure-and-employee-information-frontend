// components/MeetingDetail/MeetingAgenda.tsx
import type { ReactNode } from 'react';
import { Button, Popconfirm, Spin } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { CloseOutlined } from '@ant-design/icons';
import { MdOutlineEdit } from 'react-icons/md';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AgendaModal from './AddAgenda';
import MeetingAgendaModal from './MeetingAgendaModal';
import { useGetMeetingAgenda } from '@/store/server/features/CFR/meeting/agenda/queries';
import { useDeleteMeetingAgenda } from '@/store/server/features/CFR/meeting/agenda/mutations';

interface MeetingAgendaProps {
  id: string; // or number, depending on your usage
  canEdit: boolean;
  /** Matches Attendees panel shell on meeting detail split view. */
  variant?: 'default' | 'panel';
}

export default function MeetingAgenda({
  id,
  canEdit,
  variant = 'default',
}: MeetingAgendaProps) {
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

  const agendaItems = meetingAgendas?.items ?? [];
  const hasAgendaItems = agendaItems.length > 0;

  const itemRowClass =
    variant === 'panel'
      ? 'flex items-center justify-between gap-2 rounded-[6px] border border-solid border-[#D9D9D9] bg-white p-2 shadow-sm'
      : 'flex items-center justify-between rounded-[6px] border p-2';

  const renderAgendaRows = (rowClass: string, textPanel: boolean) =>
    agendaItems.map((i: any, index: number) => (
      <div
        key={index}
        className={rowClass}
        data-cy={`feedback-meeting-components-meetingagenda-item-${index}`}
        id={`feedback-meeting-components-meetingagenda-item-${index}`}
      >
        <span
          className={
            textPanel
              ? 'min-w-0 flex-1 cursor-pointer text-sm font-normal text-black'
              : 'cursor-pointer font-bold'
          }
          onClick={() => handleMeetingDiscussion(i)}
          data-cy={`feedback-meeting-components-meetingagenda-item-text-${index}`}
          id={`feedback-meeting-components-meetingagenda-item-text-${index}`}
        >
          {i.agenda}
        </span>
        {canEdit && (
          <div
            className="flex shrink-0 items-center gap-[8px]"
            data-cy={`feedback-meeting-components-meetingagenda-item-actions-${index}`}
            id={`feedback-meeting-components-meetingagenda-item-actions-${index}`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(i);
              }}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white p-0 text-[#595959] outline-none transition-colors hover:border-[#BFBFBF] hover:text-[#262626] focus-visible:ring-2 focus-visible:ring-blue-500/30"
              data-cy={`feedback-meeting-components-meetingagenda-icon-edit-${index}`}
              id={`feedback-meeting-components-meetingagenda-icon-edit-${index}`}
              aria-label="Edit agenda"
            >
              <MdOutlineEdit className="text-[12px] leading-none" aria-hidden />
            </button>
            <Popconfirm
              title="Are you sure you want to remove this agenda?"
              onConfirm={() => handleDelete(i.id)}
              okText="Yes"
              cancelText="No"
              zIndex={0}
              data-cy={`feedback-meeting-components-meetingagenda-popconfirm-delete-${index}`}
              id={`feedback-meeting-components-meetingagenda-popconfirm-delete-${index}`}
            >
              <button
                type="button"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-solid border-[#FF4D4F] bg-white p-0 text-[#FF4D4F] outline-none transition-colors hover:border-[#FF7875] hover:bg-[#FFF1F0] focus-visible:ring-2 focus-visible:ring-red-500/30"
                data-cy={`feedback-meeting-components-meetingagenda-icon-delete-${index}`}
                id={`feedback-meeting-components-meetingagenda-icon-delete-${index}`}
                aria-label="Delete agenda"
              >
                <CloseOutlined
                  className="text-[12px] leading-none"
                  aria-hidden
                />
              </button>
            </Popconfirm>
          </div>
        )}
      </div>
    ));

  const listSection = isLoading ? (
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
      {renderAgendaRows(itemRowClass, false)}
    </div>
  );

  const modals = (
    <>
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
    </>
  );

  if (variant === 'panel') {
    const panelFixedHeight = !hasAgendaItems;
    const panelShellClass = [
      'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100',
      panelFixedHeight ? 'h-[81px] overflow-hidden' : 'min-h-[81px]',
    ].join(' ');

    let panelBody: ReactNode;
    if (isLoading) {
      panelBody = (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spin
            size="small"
            data-cy="feedback-meeting-components-meetingagenda-spin"
          />
        </div>
      );
    } else if (!hasAgendaItems) {
      panelBody = (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1">
          <p
            className="m-0 text-center text-[14px] font-bold text-black/70"
            data-cy="feedback-meeting-agenda-panel-empty"
          >
            Add Meeting Agenda to view
          </p>
        </div>
      );
    } else {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col gap-[9px] overflow-y-auto scrollbar-none"
          data-cy="feedback-meeting-components-meetingagenda-div-list"
          id="feedback-meeting-components-meetingagenda-div-list"
        >
          {renderAgendaRows(itemRowClass, true)}
        </div>
      );
    }

    return (
      <>
        <div
          className={panelShellClass}
          data-cy="feedback-meeting-agenda-panel"
          id="feedback-meeting-agenda-panel"
        >
          <div className="flex h-[24px] w-full shrink-0 items-center justify-between">
            <h2
              className="m-0 text-[14px] font-normal leading-none text-black"
              data-cy="feedback-meeting-components-meetingagenda-heading"
              id="feedback-meeting-components-meetingagenda-heading"
            >
              Agenda
            </h2>
            {canEdit ? (
              <Button
                type="primary"
                size="small"
                onClick={() => setOpenAddAgenda(true)}
                className="box-border inline-flex !h-[22px] min-h-0 min-w-[52px] items-center justify-center rounded-md px-3 py-0 text-xs font-normal leading-none shadow-none"
                data-cy="feedback-meeting-components-meetingagenda-button-add"
                id="feedback-meeting-components-meetingagenda-button-add"
              >
                Create
              </Button>
            ) : null}
          </div>
          {panelBody}
        </div>
        {modals}
      </>
    );
  }

  return (
    <div
      className="p-0"
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
      {listSection}
      {modals}
    </div>
  );
}
