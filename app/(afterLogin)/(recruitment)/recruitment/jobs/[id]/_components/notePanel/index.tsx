'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Skeleton } from 'antd';
import 'react-quill/dist/quill.snow.css';
import {
  useCreateRecruiterNote,
  useDeleteRecruiterNote,
  useUpdateRecruiterNote,
} from '@/store/server/features/recruitment/recruiter-note/mutation';
import { useGetRecruiterNotes } from '@/store/server/features/recruitment/recruiter-note/queries';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

const isNoteEmpty = (html: string) => {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return text.length === 0;
};

interface NotePanelProps {
  jobId: string;
  jobTitle?: string;
}

const NotePanel = ({ jobId, jobTitle }: NotePanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');

  const { data: notesData, isLoading } = useGetRecruiterNotes(jobId, 1, 1);
  const { mutate: createNote, isLoading: isCreating } =
    useCreateRecruiterNote();
  const { mutate: updateNote, isLoading: isUpdating } =
    useUpdateRecruiterNote();
  const { mutate: deleteNote, isLoading: isDeleting } =
    useDeleteRecruiterNote();

  const note = notesData?.items?.[0] ?? null;
  const isSaving = isCreating || isUpdating || isDeleting;

  const editorModules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }, { size: [] }],
        ['bold', 'italic', 'underline'],
        [{ align: [] }, { list: 'bullet' }],
      ],
    }),
    [],
  );

  const resetEditor = () => {
    setIsEditing(false);
    setDraftHtml('');
  };

  const handleStartCreate = () => {
    setDraftHtml('');
    setIsEditing(true);
  };

  const handleStartEdit = () => {
    setDraftHtml(note?.note ?? '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetEditor();
  };

  const handleSave = () => {
    const empty = isNoteEmpty(draftHtml);

    if (empty && note) {
      deleteNote(note.id, { onSuccess: () => resetEditor() });
      return;
    }

    if (empty) {
      resetEditor();
      return;
    }

    if (note) {
      updateNote(
        { id: note.id, data: { note: draftHtml } },
        { onSuccess: () => resetEditor() },
      );
      return;
    }

    createNote({ jobId, note: draftHtml }, { onSuccess: () => resetEditor() });
  };

  const panelTitle = jobTitle ? `${jobTitle} Notes` : 'Recruiter Notes';
  const canSaveWhenEmpty = Boolean(note);

  return (
    <div
      data-cy="note-panel"
      className="h-full w-full rounded-md border border-[#D9D9D9] bg-[#F3F4F6] px-4 py-3"
    >
      <div
        data-cy="note-panel-title"
        className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] pb-4"
      >
        <h2
          data-cy="note-panel-title-text"
          className="text-[28px] font-semibold text-gray-900"
        >
          {panelTitle}
        </h2>
        <Button
          size="small"
          icon={<AddIcon />}
          onClick={!note && !isEditing ? handleStartCreate : handleStartEdit}
          className="!h-8 !w-8 !rounded-md !border !border-[#D9D9D9] !bg-[#F9FAFB] !text-gray-600"
        />
      </div>

      {isEditing ? (
        <div data-cy="note-panel-editing" className="rounded-[8px] border border-[#D9D9D9] bg-white p-3">
          <QuillEditor
            theme="snow"
            modules={editorModules}
            value={draftHtml}
            onChange={setDraftHtml}
          />
          <div data-cy="note-panel-editing-buttons" className="mt-3 flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={isNoteEmpty(draftHtml) && !canSaveWhenEmpty}
            >
              Save
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div data-cy="note-panel-loading" className="py-8">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : note ? (
        <>
          <div
            data-cy="note-panel-notes"
            className="mb-3 flex items-center justify-between"
          >
            <h3
              data-cy="note-panel-notes-title"
              className="font-bold text-black text-base"
            >
              Notes
            </h3>
            <Button
              size="small"
              icon={<EditOutlinedIcon fontSize="small" className="text-xs" />}
              onClick={handleStartEdit}
              className="!h-7 !w-7 !rounded-md !border !border-[#D9D9D9] !bg-[#F9FAFB] !text-gray-600"
            />
          </div>
          <div
            data-cy="note-panel-notes-content"
            className="prose prose-sm max-w-none text-[14px] leading-7 text-gray-700 [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: note.note }}
          />
        </>
      ) : (
        <p data-cy="note-panel-no-notes" className="text-[14px] text-gray-500">
          No notes yet. Click the + button to add one.
        </p>
      )}
    </div>
  );
};

export default NotePanel;
