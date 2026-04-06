import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Card, Form, Input, Spin } from 'antd';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';

interface FinalNotesProps {
  meetingId: string;
  finalNote?: string | null;
  loading: boolean;
  canEdit: boolean;
  /** Same shell as Agenda / Action Plan / Attendees on meeting detail panel. */
  variant?: 'default' | 'panel';
}

const panelAddButtonClass =
  'box-border inline-flex !h-[22px] min-h-0 items-center justify-center rounded-[6px] border-none bg-[#254EDB] px-[15px] py-0 text-xs font-normal leading-none !text-white shadow-none hover:!bg-[#1e40af] hover:!text-white focus:!text-white';

export default function FinalNotes({
  meetingId,
  finalNote,
  loading,
  canEdit,
  variant = 'default',
}: FinalNotesProps) {
  const [editing, setEditing] = useState(false);
  const { mutate: updateMeeting, isLoading } = useUpdateMeeting();
  const [form] = Form.useForm();

  const trimmedNote =
    finalNote != null && typeof finalNote === 'string' ? finalNote.trim() : '';
  const hasNote = trimmedNote.length > 0;

  useEffect(() => {
    form.setFieldsValue({ finalNote });
  }, [finalNote, form, editing]);

  const handleSave = (value: any) => {
    updateMeeting(
      { ...value, id: meetingId },
      {
        onSuccess() {
          setEditing(false);
        },
      },
    );
  };

  const editFormBlock = (
    <div
      className="relative min-h-0 flex-1"
      data-cy="feedback-meeting-components-finalnotes-div-editing"
      id="feedback-meeting-components-finalnotes-div-editing"
    >
      <Form
        form={form}
        initialValues={{ finalNote }}
        onFinish={handleSave}
        data-cy="feedback-meeting-components-finalnotes-form"
        id="feedback-meeting-components-finalnotes-form"
      >
        <Form.Item
          name="finalNote"
          className="mb-2"
          data-cy="feedback-meeting-components-finalnotes-form-item"
          id="feedback-meeting-components-finalnotes-form-item"
        >
          <Input.TextArea
            name="finalNote"
            autoSize={{ minRows: variant === 'panel' ? 3 : 4 }}
            autoFocus
            className="border-gray-300 text-sm"
            data-cy="feedback-meeting-components-finalnotes-textarea"
            id="feedback-meeting-components-finalnotes-textarea"
          />
        </Form.Item>
      </Form>
      <div
        className={`flex justify-end gap-2 ${variant === 'panel' ? 'pt-0' : 'absolute bottom-2 right-2'}`}
        data-cy="feedback-meeting-components-finalnotes-div-actions"
        id="feedback-meeting-components-finalnotes-div-actions"
      >
        <Button
          size="small"
          type="default"
          onClick={() => setEditing(false)}
          loading={isLoading}
          data-cy="feedback-meeting-components-finalnotes-button-cancel"
          id="feedback-meeting-components-finalnotes-button-cancel"
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={() => form.submit()}
          loading={isLoading}
          data-cy="feedback-meeting-components-finalnotes-button-save"
          id="feedback-meeting-components-finalnotes-button-save"
        >
          Save
        </Button>
      </div>
    </div>
  );

  if (variant === 'panel') {
    const panelCompact = loading || (!hasNote && !editing);
    const panelShellClass = [
      'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100',
      panelCompact ? 'h-[81px] overflow-hidden' : 'min-h-[81px]',
    ].join(' ');

    let panelBody: ReactNode;
    if (loading) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          data-cy="feedback-meeting-finalnotes-panel-loading"
        >
          <Spin
            size="small"
            data-cy="feedback-meeting-components-finalnotes-spin"
          />
        </div>
      );
    } else if (editing) {
      panelBody = editFormBlock;
    } else if (!hasNote) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-1"
          data-cy="feedback-meeting-finalnotes-panel-empty-wrap"
        >
          <p
            className="m-0 text-center text-[14px] font-bold text-black/70"
            data-cy="feedback-meeting-components-finalnotes-panel-empty"
          >
            You have No Notes Yet
          </p>
        </div>
      );
    } else {
      panelBody = (
        <div
          className={`min-h-0 flex-1 overflow-y-auto text-[14px] font-normal leading-snug text-[#323B49] ${canEdit ? 'cursor-pointer hover:opacity-90' : ''}`}
          onClick={() => (canEdit ? setEditing(true) : undefined)}
          onKeyDown={(e) => {
            if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setEditing(true);
            }
          }}
          role={canEdit ? 'button' : undefined}
          tabIndex={canEdit ? 0 : undefined}
          data-cy="feedback-meeting-components-finalnotes-div-display"
          id="feedback-meeting-components-finalnotes-div-display"
        >
          <span
            className="whitespace-pre-wrap"
            data-cy="feedback-meeting-components-finalnotes-text"
          >
            {finalNote}
          </span>
        </div>
      );
    }

    return (
      <div
        className={panelShellClass}
        data-cy="feedback-meeting-final-notes-panel"
        id="feedback-meeting-final-notes-panel"
      >
        <div
          className="flex h-[24px] w-full shrink-0 items-center justify-between"
          data-cy="feedback-meeting-finalnotes-panel-header-row"
        >
          <h2
            className="m-0 text-[14px] font-normal leading-none text-black"
            data-cy="feedback-meeting-components-finalnotes-heading"
            id="feedback-meeting-components-finalnotes-heading"
          >
            Notes
          </h2>
          {canEdit && !editing ? (
            <Button
              type="primary"
              size="small"
              onClick={() => setEditing(true)}
              className={panelAddButtonClass}
              data-cy="feedback-meeting-components-finalnotes-button-add"
              id="feedback-meeting-components-finalnotes-button-add"
            >
              {hasNote ? 'Edit' : 'Add'}
            </Button>
          ) : null}
        </div>
        {panelBody}
      </div>
    );
  }

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="rounded-xl border-none p-4"
      data-cy="feedback-meeting-components-finalnotes-card"
      id="feedback-meeting-components-finalnotes-card"
    >
      <h2
        className="mb-2 text-lg font-bold"
        data-cy="feedback-meeting-components-finalnotes-heading"
        id="feedback-meeting-components-finalnotes-heading"
      >
        Final Notes
      </h2>

      {editing ? (
        editFormBlock
      ) : (
        <div
          className="cursor-pointer rounded-md border p-3 text-sm whitespace-pre-wrap text-gray-700 hover:bg-gray-50"
          onClick={() => (canEdit ? setEditing(true) : null)}
          data-cy="feedback-meeting-components-finalnotes-div-display"
          id="feedback-meeting-components-finalnotes-div-display"
        >
          {finalNote?.trim() ? finalNote : '—'}
        </div>
      )}
    </Card>
  );
}
