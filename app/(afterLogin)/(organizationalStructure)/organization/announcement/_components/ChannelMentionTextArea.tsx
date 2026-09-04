'use client';

import { useMemo, useRef, useState } from 'react';
import { Avatar, Input, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { collaborationColors } from './collaborationColors';
import {
  getMentionToken,
  type MentionUser,
} from './mentionUtils';

type ChannelMentionTextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  mentionUsers: MentionUser[];
  mentionUsersLoading?: boolean;
  mentionedUserIds: string[];
  onMentionedUserIdsChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  autoSize?: { minRows?: number; maxRows?: number };
  className?: string;
  dataCy?: string;
  onPressEnter?: () => void;
  singleLine?: boolean;
};

const ChannelMentionTextArea = ({
  value,
  onChange,
  mentionUsers,
  mentionUsersLoading = false,
  mentionedUserIds,
  onMentionedUserIdsChange,
  placeholder,
  disabled,
  autoSize,
  className,
  dataCy,
  onPressEnter,
  singleLine = false,
}: ChannelMentionTextAreaProps) => {
  const inputRef = useRef<any>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredUsers = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.trim().toLowerCase();
    return mentionUsers
      .filter((user) => {
        if (!query) return true;
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.name.replace(/\s+/g, '').toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [mentionQuery, mentionUsers]);

  const updateMentionState = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const match = before.match(/@([^\s@]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStartIndex(cursor - match[0].length);
      setSelectedIndex(0);
      return;
    }
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedIndex(0);
  };

  const insertMention = (user: MentionUser) => {
    if (mentionStartIndex < 0) return;
    const cursor =
      inputRef.current?.resizableTextArea?.textArea?.selectionStart ??
      inputRef.current?.input?.selectionStart ??
      value.length;
    const token = getMentionToken(user.name);
    const markup = `<@${user.id}>${token}`;
    const next =
      value.slice(0, mentionStartIndex) +
      `${markup} ` +
      value.slice(Math.max(cursor, mentionStartIndex));
    onChange(next);
    onMentionedUserIdsChange(
      Array.from(new Set([...mentionedUserIds, user.id])),
    );
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((current) =>
          Math.min(current + 1, filteredUsers.length - 1),
        );
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
        return;
      }
      if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
        event.preventDefault();
        insertMention(filteredUsers[selectedIndex]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setMentionQuery(null);
        setMentionStartIndex(-1);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey && singleLine && onPressEnter) {
      event.preventDefault();
      onPressEnter();
    }
  };

  const showMenu = mentionQuery !== null;

  const sharedProps = {
    value,
    disabled,
    placeholder,
    className,
    'data-cy': dataCy,
    onKeyDown: handleKeyDown,
    onChange: (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
      const next = event.target.value;
      const cursor = event.target.selectionStart ?? next.length;
      onChange(next);
      updateMentionState(next, cursor);
    },
    onClick: (
      event: React.MouseEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
      const target = event.currentTarget;
      updateMentionState(target.value, target.selectionStart ?? 0);
    },
    onKeyUp: (
      event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) => {
      const target = event.currentTarget;
      updateMentionState(
        target.value,
        target.selectionStart ?? target.value.length,
      );
    },
  };

  return (
    <div className="relative w-full">
      {showMenu ? (
        <div
          className="absolute bottom-full left-0 right-0 z-30 mb-2 max-h-52 overflow-y-auto rounded-xl border bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{ borderColor: collaborationColors.accent }}
          data-cy="channel-mention-dropdown"
        >
          {mentionUsersLoading ? (
            <div className="flex justify-center px-3 py-3">
              <Spin size="small" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="m-0 px-3 py-3 text-center text-sm text-gray-400">
              No channel members found
            </p>
          ) : (
            filteredUsers.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertMention(user)}
                className="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left"
                style={{
                  background:
                    index === selectedIndex
                      ? collaborationColors.surface
                      : '#fff',
                }}
                data-cy={`channel-mention-option-${user.id}`}
              >
                <Avatar
                  size={24}
                  src={user.profileImage || undefined}
                  icon={!user.profileImage ? <UserOutlined /> : undefined}
                  style={{
                    backgroundColor: user.profileImage
                      ? undefined
                      : collaborationColors.primary,
                    flexShrink: 0,
                  }}
                />
                <span className="truncate text-sm text-gray-800">{user.name}</span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {singleLine ? (
        <Input ref={inputRef} {...sharedProps} />
      ) : (
        <Input.TextArea
          ref={inputRef}
          autoSize={autoSize}
          {...sharedProps}
        />
      )}
    </div>
  );
};

export default ChannelMentionTextArea;
