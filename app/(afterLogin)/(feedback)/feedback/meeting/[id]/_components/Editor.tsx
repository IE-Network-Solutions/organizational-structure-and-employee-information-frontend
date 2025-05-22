// components/Editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useMemo } from 'react';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/queries';
import { createMentionExtension } from './CustomMention';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import TextStyle from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
interface EditorProps {
  meetingId: string;
}

export default function Editor({ meetingId }: EditorProps) {
  const { data: attendeesData, isLoading: loadingAttendees } =
    useGetMeetingAttendees(meetingId);
  const { data: employeeData, isLoading: loadingEmployees } = useGetAllUsers();
  const { setContent } = useMeetingStore();
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
    },
    [loadingAttendees, loadingEmployees, attendees],
  );

  if (loadingAttendees || loadingEmployees || !editor)
    return <p>Loading editor...</p>;
  editor.on('update', () => {
    const html = editor.getHTML();
    setContent(html);
  });

  return (
    <div className=" border rounded ">
      <div className="px-4 flex gap-6 flex-wrap border-b border-b-gray-300 py-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal' }}
          aria-label="Bold"
          className={getBtnClass(editor.isActive('bold'))}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          style={{ fontStyle: editor.isActive('italic') ? 'italic' : 'normal' }}
          aria-label="Italic"
          className={getBtnClass(editor.isActive('italic'))}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          style={{
            textDecoration: editor.isActive('strike') ? 'line-through' : 'none',
          }}
          aria-label="Strikethrough"
          className={getBtnClass(editor.isActive('strike'))}
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
        >
          “ ”
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{
            fontWeight: editor.isActive('codeBlock') ? 'bold' : 'normal',
          }}
          aria-label="Code Block"
          className={getBtnClass(editor.isActive('codeBlock'))}
        >
          {'</>'}
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            fontWeight: editor.isActive('bulletList') ? 'bold' : 'normal',
          }}
          aria-label="Bullet List"
          className={getBtnClass(editor.isActive('bulletList'))}
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
        >
          1. List
        </button>
      </div>

      <EditorContent editor={editor} />
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
