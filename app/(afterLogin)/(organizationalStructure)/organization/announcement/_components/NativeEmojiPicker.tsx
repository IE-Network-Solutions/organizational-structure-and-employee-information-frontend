'use client';

import { useState, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { Popover } from 'antd';
import { BsEmojiSmile } from 'react-icons/bs';
import {
  EmojiStyle,
  type EmojiClickData,
  type PickerProps,
} from 'emoji-picker-react';

const EmojiPicker = dynamic<PickerProps>(
  () => import('emoji-picker-react').then((module) => module.default),
  { ssr: false },
);

type NativeEmojiPickerProps = {
  onSelect: (emoji: string) => void;
  dataCy: string;
  reactionsDefaultOpen?: boolean;
};

export const NativeEmojiPicker = ({
  onSelect,
  dataCy,
  reactionsDefaultOpen = false,
}: NativeEmojiPickerProps) => {
  const handleSelect = (emojiData: EmojiClickData) => {
    // emoji-picker-react returns the native Unicode grapheme in `emoji`.
    // Persist that value directly so every Collaboration client can render it.
    onSelect(emojiData.emoji);
  };

  return (
    <div data-cy={dataCy}>
      <EmojiPicker
        width={320}
        height={380}
        emojiStyle={EmojiStyle.NATIVE}
        lazyLoadEmojis
        autoFocusSearch={false}
        previewConfig={{ showPreview: false }}
        reactionsDefaultOpen={reactionsDefaultOpen}
        allowExpandReactions
        onEmojiClick={handleSelect}
        onReactionClick={handleSelect}
      />
    </div>
  );
};

type EmojiPickerButtonProps = {
  onSelect: (emoji: string) => void;
  dataCy: string;
  disabled?: boolean;
  iconSize?: number;
  className?: string;
  style?: CSSProperties;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
};

export const EmojiPickerButton = ({
  onSelect,
  dataCy,
  disabled = false,
  iconSize = 16,
  className = 'rounded-md p-1.5 text-gray-500 hover:bg-gray-50',
  style,
  placement = 'topRight',
}: EmojiPickerButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      placement={placement}
      open={open}
      onOpenChange={setOpen}
      content={
        <NativeEmojiPicker
          dataCy={`${dataCy}-picker`}
          onSelect={(emoji) => {
            onSelect(emoji);
            setOpen(false);
          }}
        />
      }
    >
      <button
        type="button"
        disabled={disabled}
        className={className}
        style={style}
        aria-label="Emoji"
        aria-expanded={open}
        onMouseDown={(event) => event.preventDefault()}
        data-cy={dataCy}
      >
        <BsEmojiSmile size={iconSize} />
      </button>
    </Popover>
  );
};

