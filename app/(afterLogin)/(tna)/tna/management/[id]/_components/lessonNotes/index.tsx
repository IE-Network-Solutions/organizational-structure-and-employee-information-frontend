'use client';

import { CourseLessonMaterialNote } from '@/types/tna/course';
import { useGetCourseLessonMaterialNotes } from '@/store/server/features/tna/lessonMaterialNote/queries';
import {
  useDeleteCourseLessonMaterialNote,
  useSetCourseLessonMaterialNote,
} from '@/store/server/features/tna/lessonMaterialNote/mutation';
import TextEditor from '@/components/form/textEditor';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { Button, Empty, Form, Input, Popconfirm, Spin } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useMemo, useState } from 'react';
import { LuNotebookPen, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

interface LessonNotesProps {
  courseLessonMaterialId: string;
}

interface NoteFormValues {
  title: string;
  content?: string;
}

const NOTE_PREVIEW_MAX_CHARS = 240;

function noteHtmlToPlainText(html: string | null): string {
  if (!html) {
    return '';
  }
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quill emits `<p><br></p>` for an empty document; treat that as no content. */
function noteContentToNull(content: string | undefined): string | null {
  return noteHtmlToPlainText(content ?? '') === '' ? null : (content ?? null);
}

const LessonNoteCard: FC<{
  note: CourseLessonMaterialNote;
  onEdit: (note: CourseLessonMaterialNote) => void;
  onDelete: (note: CourseLessonMaterialNote) => void;
  disabled: boolean;
}> = ({ note, onEdit, onDelete, disabled }) => {
  const [expanded, setExpanded] = useState(false);
  const plainText = noteHtmlToPlainText(note.content);
  const needsTruncate = plainText.length > NOTE_PREVIEW_MAX_CHARS;
  const savedAt = note.updatedAt ?? note.createdAt;

  return (
    <div
      className="rounded-lg border border-[#D9D9D9] p-3"
      data-cy={`tna-lesson-note-card-${note.id}`}
    >
      <div
        className="flex items-start justify-between gap-2"
        data-cy={`tna-lesson-note-card-head-${note.id}`}
      >
        <div
          className="min-w-0 flex-1"
          data-cy={`tna-lesson-note-card-heading-${note.id}`}
        >
          <div
            className="break-words text-sm font-bold text-gray-900"
            data-cy={`tna-lesson-note-card-title-${note.id}`}
          >
            {note.title}
          </div>
          {dayjs(savedAt).isValid() ? (
            <div
              className="mt-0.5 text-xs text-gray-500"
              data-cy={`tna-lesson-note-card-date-${note.id}`}
            >
              {dayjs(savedAt).format('D MMM YYYY, h:mm A')}
            </div>
          ) : null}
        </div>
        <div
          className="flex shrink-0 items-center"
          data-cy={`tna-lesson-note-card-actions-${note.id}`}
        >
          <Button
            type="text"
            size="small"
            className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md !border-none !bg-transparent !p-0 leading-none text-gray-400 hover:!bg-gray-100 hover:!text-gray-700 [&_.ant-btn-icon]:m-0"
            aria-label={`Edit note ${note.title}`}
            disabled={disabled}
            onClick={() => onEdit(note)}
            data-cy={`tna-lesson-note-card-edit-${note.id}`}
          >
            <LuPencil size={16} className="block shrink-0" aria-hidden />
          </Button>
          <Popconfirm
            title="Delete note"
            description="This note will be permanently removed."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(note)}
            data-cy={`tna-lesson-note-card-delete-confirm-${note.id}`}
          >
            <Button
              type="text"
              size="small"
              className="inline-flex h-8 w-8 min-w-8 items-center justify-center rounded-md !border-none !bg-transparent !p-0 leading-none text-gray-400 hover:!bg-gray-100 hover:!text-error [&_.ant-btn-icon]:m-0"
              aria-label={`Delete note ${note.title}`}
              disabled={disabled}
              data-cy={`tna-lesson-note-card-delete-${note.id}`}
            >
              <LuTrash2 size={16} className="block shrink-0" aria-hidden />
            </Button>
          </Popconfirm>
        </div>
      </div>

      {plainText ? (
        <div
          className="mt-2 text-sm font-normal leading-relaxed text-gray-900"
          data-cy={`tna-lesson-note-card-body-${note.id}`}
        >
          {needsTruncate && !expanded ? (
            <>
              {plainText.slice(0, NOTE_PREVIEW_MAX_CHARS)}
              <span data-cy={`tna-lesson-note-card-ellipsis-${note.id}`}>
                ...
              </span>{' '}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline border-0 bg-transparent p-0 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                data-cy={`tna-lesson-note-card-more-${note.id}`}
              >
                More
              </button>
            </>
          ) : (
            <>
              <div
                className="lesson-material-article"
                dangerouslySetInnerHTML={{ __html: note.content ?? '' }}
                data-cy={`tna-lesson-note-card-content-${note.id}`}
              />
              {needsTruncate ? (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="mt-1 border-0 bg-transparent p-0 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                  data-cy={`tna-lesson-note-card-less-${note.id}`}
                >
                  Less
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

/**
 * Employee-owned notes for a single training session. Notes are private: the
 * API scopes every read and write to the authenticated user.
 */
const LessonNotes: FC<LessonNotesProps> = ({ courseLessonMaterialId }) => {
  const [form] = Form.useForm<NoteFormValues>();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] =
    useState<CourseLessonMaterialNote | null>(null);

  const {
    data: notesData,
    isLoading,
    isFetching,
  } = useGetCourseLessonMaterialNotes(
    { filter: { courseLessonMaterialId: [courseLessonMaterialId] } },
    !!courseLessonMaterialId,
  );

  const { mutate: setNote, isLoading: isSaving } =
    useSetCourseLessonMaterialNote();
  const { mutate: deleteNote, isLoading: isDeleting } =
    useDeleteCourseLessonMaterialNote();

  const notes = useMemo(() => {
    const items = notesData?.items ?? [];
    return [...items].sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    );
  }, [notesData]);

  /** Switching sessions must not carry a half-written note across. */
  useEffect(() => {
    setIsEditorOpen(false);
    setEditingNote(null);
    form.resetFields();
  }, [courseLessonMaterialId, form]);

  const openCreate = () => {
    setEditingNote(null);
    form.resetFields();
    setIsEditorOpen(true);
  };

  const openEdit = (note: CourseLessonMaterialNote) => {
    setEditingNote(note);
    form.setFieldsValue({ title: note.title, content: note.content ?? '' });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    form.resetFields();
  };

  const handleFinish = (values: NoteFormValues) => {
    setNote(
      [
        {
          ...(editingNote ? { id: editingNote.id } : {}),
          courseLessonMaterialId,
          title: values.title.trim(),
          content: noteContentToNull(values.content),
        },
      ],
      { onSuccess: () => closeEditor() },
    );
  };

  const isBusy = isSaving || isDeleting;

  return (
    <div
      className="mt-4"
      id="tnaLessonNotesContainerId"
      data-cy="tna-lesson-notes-container"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2"
        data-cy="tna-lesson-notes-header"
      >
        <div
          className="flex items-center gap-2 text-lg font-bold text-gray-900"
          id="tnaLessonNotesTitleId"
          data-cy="tna-lesson-notes-title"
        >
          <LuNotebookPen size={18} className="shrink-0" aria-hidden />
          My Notes
        </div>
        {!isEditorOpen ? (
          <Button
            type="primary"
            size="middle"
            className="!font-normal"
            icon={<LuPlus size={16} aria-hidden />}
            disabled={isBusy}
            onClick={openCreate}
            data-cy="tna-lesson-notes-add"
          >
            Add Note
          </Button>
        ) : null}
      </div>

      {isEditorOpen ? (
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          disabled={isSaving}
          onFinish={handleFinish}
          className="mt-3 rounded-xl bg-[#F9FAFB] p-4"
          id="tnaLessonNotesFormId"
          data-cy="tna-lesson-notes-form"
        >
          <Form.Item
            name="title"
            label="Note Title"
            rules={[{ required: true, message: 'Required' }]}
            className="[&_.ant-form-item-label>label]:!font-normal"
            data-cy="tna-lesson-notes-title-item"
          >
            <Input
              className="control !h-[40px] min-h-[40px] py-0 leading-normal !font-normal"
              placeholder="e.g. Key takeaways"
              data-cy="tna-lesson-notes-title-field"
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="Note"
            className="[&_.ant-form-item-label>label]:!font-normal"
            data-cy="tna-lesson-notes-content-item"
          >
            <TextEditor
              placeholder="Write what you want to remember from this session"
              data-cy="tna-lesson-notes-content-editor"
            />
          </Form.Item>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
            data-cy="tna-lesson-notes-form-actions"
          >
            <Button
              size="middle"
              className="w-full !border-[#D9D9D9] !font-normal !text-black/70 hover:!border-[#D9D9D9] hover:!text-black/70 sm:w-auto"
              onClick={closeEditor}
              disabled={isSaving}
              data-cy="tna-lesson-notes-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="middle"
              className="w-full !font-normal sm:w-auto"
              loading={isSaving}
              onClick={() => form.submit()}
              data-cy="tna-lesson-notes-save"
            >
              {editingNote ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </Form>
      ) : null}

      <Spin
        spinning={isLoading || isFetching || isDeleting}
        data-cy="tna-lesson-notes-spinner"
      >
        <div
          className="mt-3 flex flex-col gap-2"
          data-cy="tna-lesson-notes-list"
        >
          {notes.length ? (
            notes.map((note) => (
              <LessonNoteCard
                key={note.id}
                note={note}
                onEdit={openEdit}
                onDelete={(item) => deleteNote([item.id])}
                disabled={isBusy}
              />
            ))
          ) : !isLoading && !isEditorOpen ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="You have no notes for this session yet."
              data-cy="tna-lesson-notes-empty"
            />
          ) : null}
        </div>
      </Spin>
    </div>
  );
};

export default LessonNotes;
