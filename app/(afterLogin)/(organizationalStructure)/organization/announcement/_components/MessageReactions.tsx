'use client';

import { useMemo, useState } from 'react';
import { Popover, Spin } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import {
  useMessageReactions,
  useSetCollabMessageReaction,
  type CollabMessageReact,
} from '@/store/server/features/collaboration';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NativeEmojiPicker } from './NativeEmojiPicker';

type MessageReactionsProps = {
  messageId: string;
  initialReactions?: CollabMessageReact[];
  dataCyPrefix: string;
};

const EMOJI_BY_CONTENT: Record<string, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  haha: '😂',
  celebrate: '🎉',
  wow: '😮',
  surprised: '😮',
  sad: '😢',
  angry: '😠',
  care: '🤗',
};

const getReactionEmoji = (content: string) =>
  EMOJI_BY_CONTENT[content.trim().toLowerCase()] || content;

const getReactionDataCyKey = (content: string) => {
  const normalized = content.trim();
  if (/^[a-z0-9_-]+$/i.test(normalized)) return normalized;
  return Array.from(normalized)
    .map((character) => character.codePointAt(0)?.toString(16) || 'emoji')
    .join('-');
};

const MessageReactions = ({
  messageId,
  initialReactions,
  dataCyPrefix,
}: MessageReactionsProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const storedUserId = useAuthenticationStore((state) => state.userId);
  const userDataId = useAuthenticationStore((state) => state.userData?.id);
  const currentUserId = String(storedUserId || userDataId || '').trim();
  const { data: reactions = [], isLoading } = useMessageReactions(
    messageId,
    initialReactions,
  );
  const mutation = useSetCollabMessageReaction();

  const currentReaction = reactions.find(
    (reaction) => String(reaction.reactedBy) === currentUserId,
  );

  const groupedReactions = useMemo(() => {
    const grouped = new Map<
      string,
      { content: string; count: number; selected: boolean }
    >();

    reactions.forEach((reaction) => {
      const content = String(reaction.content || '').trim();
      if (!content) return;
      const nativeEmoji = getReactionEmoji(content);
      const existing = grouped.get(nativeEmoji);
      grouped.set(nativeEmoji, {
        content: nativeEmoji,
        count: (existing?.count ?? 0) + 1,
        selected:
          Boolean(existing?.selected) ||
          String(reaction.reactedBy) === currentUserId,
      });
    });

    return Array.from(grouped.values());
  }, [currentUserId, reactions]);

  const selectReaction = async (content: string) => {
    if (mutation.isLoading) return;
    try {
      await mutation.mutateAsync({
        messageId,
        content,
        currentReaction,
      });
      setPickerOpen(false);
    } catch {
      /* mutation toast */
    }
  };

  const picker = (
    <NativeEmojiPicker
      reactionsDefaultOpen
      dataCy={`${dataCyPrefix}-reaction-picker`}
      onSelect={(emoji) => void selectReaction(emoji)}
    />
  );

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-1.5"
      data-cy={`${dataCyPrefix}-reactions`}
    >
      {groupedReactions.map((reaction) => {
        const reactionDataCyKey = getReactionDataCyKey(reaction.content);
        return (
          <button
            key={reaction.content}
            type="button"
            disabled={mutation.isLoading}
            onClick={() => void selectReaction(reaction.content)}
            className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs transition disabled:opacity-50 ${
              reaction.selected
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label={`React with ${reaction.content}`}
            aria-pressed={reaction.selected}
            data-cy={`${dataCyPrefix}-reaction-${reactionDataCyKey}`}
          >
            <span aria-hidden="true">{getReactionEmoji(reaction.content)}</span>
            <span
              data-cy={`${dataCyPrefix}-reaction-${reactionDataCyKey}-count`}
            >
              {reaction.count}
            </span>
          </button>
        );
      })}

      <Popover
        trigger="click"
        placement="topLeft"
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        content={picker}
      >
        <button
          type="button"
          disabled={mutation.isLoading || !currentUserId}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
          aria-label="Add reaction"
          data-cy={`${dataCyPrefix}-add-reaction`}
        >
          {mutation.isLoading || isLoading ? (
            <Spin size="small" />
          ) : (
            <SmileOutlined />
          )}
        </button>
      </Popover>
    </div>
  );
};

export default MessageReactions;
