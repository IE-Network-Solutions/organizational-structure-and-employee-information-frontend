// components/Editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo } from 'react';

import { createMentionExtension } from './CustomMention';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import TextStyle from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import EditorSkeleton from './EditorSkeleton';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/attendees/queries';
import { useGetMeetingDiscussion } from '@/store/server/features/CFR/meeting/discussion/queries';

interface EditorProps {
  meetingId: string;
  meetingAgendaId: string;
  canEdit: boolean;
}

export default function Editor({
  meetingId,
  meetingAgendaId,
  canEdit,
}: EditorProps) {
  const { data: attendeesData, isLoading: loadingAttendees } =
    useGetMeetingAttendees(meetingId);
  const { data: employeeData, isLoading: loadingEmployees } = useGetAllUsers();
  const { data: meetingDiscussion, isLoading: meetingDiscussionLoading } =
    useGetMeetingDiscussion(meetingId, meetingAgendaId);
  const { setContent, content, openMeetingAgenda } = useMeetingStore();

  // Update content when meeting discussion data changes
  useEffect(() => {
    setContent(meetingDiscussion?.items[0]?.discussion);
  }, [
    meetingDiscussion,
    meetingDiscussionLoading,
    meetingAgendaId,
    setContent,
    openMeetingAgenda,
  ]);

  // Lookup function
  const getEmployeeData = (id: string) => {
    return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
  };

  // 🧠 Memoize attendees
  const attendees = useMemo(() => {
    if (!attendeesData?.items || !employeeData?.items) return [];

    return attendeesData.items
      .filter((item: any) => item.userId)
      .map((item: any) => {
        const user = getEmployeeData(item.userId);
        return {
          id: item.userId,
          label:
            user?.firstName + ' ' + user?.middleName + ' ' + user?.lastName,
          profileImage: user?.profileImage,
        };
      });
  }, [attendeesData, employeeData]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
          placeholder: 'Type @ to mention attendees...',
        }),
        createMentionExtension(attendees),
      ],
      content: '',
      editable: canEdit,
    },
    [
      loadingAttendees,
      loadingEmployees,
      attendees,
      meetingDiscussionLoading,
      meetingAgendaId,
    ],
  );

  // Update editor content when content from store changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  // Set up editor update listener
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      setContent(html);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  if (
    loadingAttendees ||
    loadingEmployees ||
    !editor ||
    meetingDiscussionLoading
  )
    return (
      <EditorSkeleton data-cy="feedback-meeting-components-editor-skeleton" />
    );
  return (
    <div
      className=" border rounded "
      data-cy="feedback-meeting-components-editor-container"
      id="feedback-meeting-components-editor-container"
    >
      {canEdit && (
        <div
          className="px-4 flex gap-6 flex-wrap border-b border-b-gray-300 py-2"
          data-cy="feedback-meeting-components-editor-toolbar"
          id="feedback-meeting-components-editor-toolbar"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}
            aria-label="Bold"
            className={getBtnClass(editor.isActive('bold'))}
            data-cy="feedback-meeting-components-editor-btn-bold"
            id="feedback-meeting-components-editor-btn-bold"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            style={{
              fontStyle: editor.isActive('italic') ? 'italic' : 'normal',
            }}
            aria-label="Italic"
            className={getBtnClass(editor.isActive('italic'))}
            id="feedback-meeting-components-editor-btn-italic"
            data-cy="feedback-meeting-components-editor-btn-italic"
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            style={{
              textDecoration: editor.isActive('strike')
                ? 'line-through'
                : 'none',
            }}
            aria-label="Strikethrough"
            className={getBtnClass(editor.isActive('strike'))}
            id="feedback-meeting-components-editor-btn-strike"
            data-cy="feedback-meeting-components-editor-btn-strike"
          >
            S
          </button>

          <button
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
            aria-label="Clear Formatting"
            className={getBtnClass(
              editor.can().chain().focus().unsetAllMarks().clearNodes().run(),
            )}
            id="feedback-meeting-components-editor-btn-clear"
            data-cy="feedback-meeting-components-editor-btn-clear"
          >
            ✖
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            style={{
              fontWeight: editor.isActive({ textAlign: 'left' })
                ? 'bold'
                : 'normal',
            }}
            aria-label="Align Left"
            className={getBtnClass(editor.isActive({ textAlign: 'left' }))}
            id="feedback-meeting-components-editor-btn-align-left"
            data-cy="feedback-meeting-components-editor-btn-align-left"
          >
            L
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            style={{
              fontWeight: editor.isActive('blockquote') ? 'bold' : 'normal',
            }}
            aria-label="Blockquote"
            className={getBtnClass(editor.isActive('blockquote'))}
            id="feedback-meeting-components-editor-btn-blockquote"
            data-cy="feedback-meeting-components-editor-btn-blockquote"
          >
            `&quot;`
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={{
              fontWeight: editor.isActive('bulletList') ? 'bold' : 'normal',
            }}
            aria-label="Bullet List"
            className={getBtnClass(editor.isActive('bulletList'))}
            id="feedback-meeting-components-editor-btn-bullet-list"
            data-cy="feedback-meeting-components-editor-btn-bullet-list"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            style={{
              fontWeight: editor.isActive('orderedList') ? 'bold' : 'normal',
            }}
            aria-label="Ordered List"
            className={getBtnClass(editor.isActive('orderedList'))}
            id="feedback-meeting-components-editor-btn-ordered-list"
            data-cy="feedback-meeting-components-editor-btn-ordered-list"
          >
            1. List
          </button>
        </div>
      )}

      <EditorContent
        className="px-5 py-2"
        disabled={canEdit}
        editor={editor}
        data-cy="feedback-meeting-components-editor-content"
        id="feedback-meeting-components-editor-content"
      />
    </div>
  );
}
function getBtnClass(active: boolean) {
  return `px-3 py-1 rounded border text-sm ${
    active
      ? 'font-bold'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
  }`;
}
