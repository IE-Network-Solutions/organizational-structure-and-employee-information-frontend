'use client';

import { forwardRef } from 'react';
import { Input } from 'antd';
import type { TextAreaProps, TextAreaRef } from 'antd/es/input/TextArea';

/**
 * Shared textarea for feedback/settings: default 2 rows (matches define-feedback).
 * Pass `rows` to override (e.g. 3 or 4 for larger fields).
 */
const SettingsTextArea = forwardRef<TextAreaRef, TextAreaProps>(
  function SettingsTextArea(props, ref) {
    return <Input.TextArea ref={ref} rows={2} {...props} />;
  },
);

SettingsTextArea.displayName = 'SettingsTextArea';

export default SettingsTextArea;
