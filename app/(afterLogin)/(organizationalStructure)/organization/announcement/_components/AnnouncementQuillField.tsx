'use client';

import { useRef } from 'react';
import ReactQuill from 'react-quill';
import type { ReactQuillProps } from 'react-quill';
import type { MutableRefObject } from 'react';
import 'react-quill/dist/quill.snow.css';

type AnnouncementQuillFieldProps = ReactQuillProps & {
  editorRef?: MutableRefObject<ReactQuill | null>;
  onEditorReady?: () => void;
};

const AnnouncementQuillField = ({
  editorRef,
  onEditorReady,
  ...props
}: AnnouncementQuillFieldProps) => {
  const readySent = useRef(false);

  return (
    <ReactQuill
      ref={(instance) => {
        if (editorRef) editorRef.current = instance;
        if (instance && !readySent.current) {
          readySent.current = true;
          onEditorReady?.();
        }
        if (!instance) {
          readySent.current = false;
        }
      }}
      {...props}
    />
  );
};

export default AnnouncementQuillField;
