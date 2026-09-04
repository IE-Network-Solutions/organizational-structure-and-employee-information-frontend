'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Avatar, Form, Input, Popover, Select, Spin, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  BsCodeSlash,
  BsFileEarmarkText,
  BsHighlighter,
  BsImage,
  BsLink45Deg,
  BsListOl,
  BsListUl,
  BsPalette,
  BsPaperclip,
  BsSendFill,
  BsTypeBold,
  BsTypeItalic,
  BsTypeStrikethrough,
  BsTypeUnderline,
} from 'react-icons/bs';
import { MdKeyboardArrowDown, MdTag } from 'react-icons/md';
import type ReactQuillType from 'react-quill';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { collaborationColors } from './collaborationColors';
import {
  useChannelMembers,
  useCollaborationCatalog,
  useCreateCollabMessage,
} from '@/store/server/features/collaboration';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import { useCollaborationMemberLookup } from './useCollaborationMemberLookup';
import {
  getMentionToken,
  resolveMentionsForPayload,
  spaceMembersToMentionUsers,
  type MentionUser,
} from './mentionUtils';
import { EmojiPickerButton } from './NativeEmojiPicker';

const AnnouncementQuillField = dynamic(
  () => import('./AnnouncementQuillField'),
  {
    ssr: false,
  },
);

const quillHtmlToPlainText = (html?: string) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isQuillEmpty = (html?: string) => quillHtmlToPlainText(html) === '';

const ANNOUNCEMENT_QUILL_FORMATS = [
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'background',
  'color',
  'code',
  'code-block',
  'header',
];

const ANNOUNCEMENT_QUILL_MODULES = {
  toolbar: false,
  clipboard: { matchVisual: false },
};

type AnnouncementComposerPanelProps = {
  active: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  onBodyActivity?: (hasContent: boolean) => void;
  growWithContent?: boolean;
  /** When set with channelId, posts to this target and can hide the picker. */
  spaceId?: string;
  channelId?: string;
  hideSpaceSelect?: boolean;
};

type AnnouncementFormValues = {
  body: string;
  spaceId: string;
  channelId: string;
};

type PendingAttachment = {
  id: string;
  name: string;
  kind: 'file' | 'image';
  file: File;
};

const getUserAvatarText = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const AVATAR_COLORS = [
  collaborationColors.primary,
  '#F97316',
  '#059669',
  '#7C3AED',
  '#DB2777',
];

const getAvatarColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const AnnouncementComposerPanel = ({
  active,
  onCancel,
  onSuccess,
  onBodyActivity,
  growWithContent = false,
  spaceId: lockedSpaceId,
  channelId: lockedChannelId,
  hideSpaceSelect = false,
}: AnnouncementComposerPanelProps) => {
  const [form] = Form.useForm<AnnouncementFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const createMessage = useCreateCollabMessage();
  const memberLookup = useCollaborationMemberLookup();
  const { userId: currentUserId } = useAuthenticationStore();
  const { data: spaces = [] } = useCollaborationCatalog(memberLookup);
  const enabledChannelIds = useAnnouncementChannelsStore(
    (state) => state.enabledChannelIds,
  );
  const findSpaceById = useAnnouncementChannelsStore(
    (state) => state.findSpaceById,
  );
  const findChannel = useAnnouncementChannelsStore(
    (state) => state.findChannel,
  );
  const channelOptions = useMemo(
    () =>
      spaces.flatMap((space) =>
        space.channels
          .filter((channel) => enabledChannelIds.includes(channel.id))
          .map((channel) => ({
            id: channel.id,
            name: `#${channel.name}`,
            kind: channel.kind,
            spaceId: space.id,
            spaceName: space.name,
          })),
      ),
    [spaces, enabledChannelIds],
  );
  const bodyValue = Form.useWatch('body', form);
  const spaceIdValue = Form.useWatch('spaceId', form);
  const channelIdValue = Form.useWatch('channelId', form);
  const canSend =
    (!isQuillEmpty(bodyValue) || pendingFiles.length > 0) && !submitting;
  const onBodyActivityRef = useRef(onBodyActivity);
  onBodyActivityRef.current = onBodyActivity;

  const notifyBodyActivity = (hasContent: boolean) => {
    onBodyActivityRef.current?.(hasContent);
  };

  useLayoutEffect(() => {
    if (active) return;
    form.resetFields();
    setMentionedUserIds([]);
    setPendingFiles([]);
    notifyBodyActivity(false);
  }, [active, form]);

  useEffect(() => {
    if (!active) return;
    setMentionedUserIds([]);
    setPendingFiles([]);
    form.setFieldsValue({ body: '' });
    notifyBodyActivity(false);
  }, [active, form, lockedSpaceId, lockedChannelId]);

  // Fill default channel once catalog is ready, without wiping an in-progress draft.
  useEffect(() => {
    if (!active) return;
    const currentChannelId = form.getFieldValue('channelId');
    if (currentChannelId && !lockedChannelId) return;

    const options = spaces.flatMap((space) =>
      space.channels
        .filter((channel) => enabledChannelIds.includes(channel.id))
        .map((channel) => ({
          id: channel.id,
          spaceId: space.id,
        })),
    );
    const defaultChannel =
      (lockedSpaceId &&
        lockedChannelId &&
        options.find(
          (item) =>
            item.spaceId === lockedSpaceId && item.id === lockedChannelId,
        )) ||
      options[0];
    if (!defaultChannel) return;

    form.setFieldsValue({
      spaceId: defaultChannel.spaceId,
      channelId: defaultChannel.id,
    });
  }, [
    active,
    form,
    spaces,
    enabledChannelIds,
    lockedSpaceId,
    lockedChannelId,
  ]);

  useEffect(() => {
    if (!active || !lockedSpaceId || !lockedChannelId) return;
    form.setFieldsValue({
      spaceId: lockedSpaceId,
      channelId: lockedChannelId,
    });
  }, [active, form, lockedSpaceId, lockedChannelId]);

  // Avoid toggling parent overlay state when the boolean is unchanged.
  const lastBodyActivityRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!active) {
      if (lastBodyActivityRef.current !== false) {
        lastBodyActivityRef.current = false;
        notifyBodyActivity(false);
      }
      return;
    }
    const hasContent = !isQuillEmpty(bodyValue);
    if (lastBodyActivityRef.current === hasContent) return;
    lastBodyActivityRef.current = hasContent;
    notifyBodyActivity(hasContent);
  }, [active, bodyValue]);

  const handleClose = () => {
    if (submitting) return;
    form.resetFields();
    setMentionedUserIds([]);
    setPendingFiles([]);
    notifyBodyActivity(false);
    onCancel();
  };

  const selectedChannelId = channelIdValue || lockedChannelId || undefined;
  const selectedSpaceId = spaceIdValue || lockedSpaceId || undefined;
  const selectedSpace = selectedSpaceId
    ? findSpaceById(spaces, selectedSpaceId)
    : undefined;
  const {
    data: channelMembers = [],
    isLoading: channelMembersLoading,
  } = useChannelMembers(selectedChannelId, memberLookup, active);

  // Public channels inherit space members — mention list is space roster ∪
  // GET /channel-members.
  const mentionableUsers = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; email?: string; avatarUrl?: string }>();
    (selectedSpace?.members ?? []).forEach((member) =>
      byId.set(member.id, member),
    );
    channelMembers.forEach((member) => byId.set(member.id, member));
    return spaceMembersToMentionUsers(
      Array.from(byId.values()),
      currentUserId,
    );
  }, [selectedSpace?.members, channelMembers, currentUserId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hasBody = !isQuillEmpty(values.body);
      if (!hasBody && pendingFiles.length === 0) {
        NotificationMessage.warning({
          message: 'Add a message or attachment',
        });
        return;
      }

      setSubmitting(true);
      const mentions = resolveMentionsForPayload(
        values.body || '',
        mentionedUserIds,
        mentionableUsers,
      );

      if (mentionedUserIds.length > 0 && mentions.length === 0) {
        NotificationMessage.warning({
          message: 'Mentioned users could not be resolved',
          description: 'Pick a person from the @ list and try again.',
        });
        setSubmitting(false);
        return;
      }

      await createMessage.mutateAsync({
        channelId: values.channelId,
        content: hasBody
          ? values.body
          : `<p>${pendingFiles.map((file) => file.name).join(', ')}</p>`,
        mentions,
        files: pendingFiles.map((item) => item.file),
      });
      NotificationMessage.success({
        message: 'Posted to Collaboration',
        description: 'Your announcement was sent to Selamnew Collaboration.',
      });
      form.setFieldsValue({ body: '' });
      setMentionedUserIds([]);
      setPendingFiles([]);
      notifyBodyActivity(false);
      onSuccess();
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      NotificationMessage.error({
        message: 'Could not post announcement',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const lockedSpace = lockedSpaceId
    ? findSpaceById(spaces, lockedSpaceId)
    : undefined;
  const lockedChannel =
    lockedSpaceId && lockedChannelId
      ? findChannel(spaces, lockedSpaceId, lockedChannelId)
      : undefined;
  const selectedChannelOption = channelOptions.find(
    (item) => item.id === channelIdValue,
  );

  return (
    <div
      className="flex h-full min-h-full flex-col"
      data-cy="create-announcement-panel"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="flex min-h-0 flex-1 flex-col"
        data-cy="create-announcement-form"
        onValuesChange={(changed) => {
          if (!('channelId' in changed)) return;
          const next = channelOptions.find(
            (item) => item.id === changed.channelId,
          );
          if (next) form.setFieldsValue({ spaceId: next.spaceId });
        }}
      >
        <Form.Item name="spaceId" hidden rules={[{ required: true }]}>
          <Input type="hidden" />
        </Form.Item>

        <div
          data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-339"
          className="mb-3 flex shrink-0 flex-wrap items-center gap-2"
        >
          <Tag
            className="text-[12px] font-medium px-2 py-0 rounded-md"
            style={{
              marginInlineEnd: 0,
              background: collaborationColors.surface,
              borderColor: collaborationColors.accent,
              color: collaborationColors.primary,
            }}
            data-cy="create-announcement-helper"
          >
            Posts to Selamnew Collaboration
          </Tag>

          {hideSpaceSelect && lockedChannel ? (
            <Tag
              icon={<MdTag />}
              className="text-[12px] font-medium px-2 py-0 rounded-md inline-flex items-center gap-1"
              style={{
                marginInlineEnd: 0,
                background: collaborationColors.surface,
                borderColor: collaborationColors.accent,
                color: collaborationColors.primary,
              }}
              data-cy="create-announcement-locked-channel"
            >
              #{lockedChannel.name}
              {lockedSpace ? ` · ${lockedSpace.name}` : ''}
            </Tag>
          ) : (
            <Form.Item
              name="channelId"
              className="!mb-0"
              rules={[{ required: true, message: 'Choose a channel' }]}
            >
              <Select
                size="small"
                popupMatchSelectWidth={240}
                className="min-w-[160px] max-w-[220px] [&_.ant-select-selector]:!h-7 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-item]:!text-xs"
                optionLabelProp="label"
                placeholder="Channel"
                data-cy="create-announcement-space"
                options={channelOptions.map((channel) => ({
                  value: channel.id,
                  label: (
                    <span
                      data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-384"
                      className="inline-flex items-center gap-1.5"
                    >
                      <MdTag
                        size={14}
                        style={{ color: collaborationColors.primary }}
                      />
                      <span
                        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-389"
                        className="truncate"
                      >
                        {channel.name}
                      </span>
                    </span>
                  ),
                  channel,
                }))}
                optionRender={(option) => {
                  const channel = option.data
                    .channel as (typeof channelOptions)[number];
                  return (
                    <span
                      className="flex items-center gap-2 py-0.5"
                      data-cy={`create-announcement-space-option-${channel.id}`}
                    >
                      <span
                        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-402"
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded"
                        style={{
                          background: collaborationColors.surface,
                          color: collaborationColors.primary,
                        }}
                      >
                        <MdTag size={13} />
                      </span>
                      <span
                        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-411"
                        className="min-w-0 flex-1"
                      >
                        <span
                          data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-412"
                          className="block truncate text-sm text-gray-900"
                        >
                          {channel.name}
                        </span>
                        <span
                          data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-415"
                          className="block text-[11px] text-gray-400"
                        >
                          {channel.spaceName}
                        </span>
                      </span>
                    </span>
                  );
                }}
              />
            </Form.Item>
          )}
          {hideSpaceSelect ? (
            <Form.Item
              name="channelId"
              hidden
              rules={[{ required: true, message: 'Choose a channel' }]}
            >
              <Input type="hidden" />
            </Form.Item>
          ) : null}
          {selectedChannelOption || lockedChannel ? (
            <span className="sr-only" data-cy="create-announcement-space-kind">
              {(selectedChannelOption || lockedChannel)?.kind}
            </span>
          ) : null}
          <span className="sr-only" data-cy="create-announcement-space-id">
            {spaceIdValue}
          </span>
        </div>

        <div
          data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-444"
          className="mt-auto flex shrink-0 flex-col"
        >
          <Form.Item className="!mb-0" name="body">
            <CollaborationComposer
              active={active}
              submitting={submitting}
              canSend={canSend}
              growUpward={growWithContent}
              attachments={pendingFiles}
              mentionableUsers={mentionableUsers}
              mentionUsersLoading={channelMembersLoading}
              onAttachmentsChange={setPendingFiles}
              onSend={() => void handleSubmit()}
              onMentionUser={(userId) =>
                setMentionedUserIds((current) =>
                  Array.from(new Set([...current, userId])),
                )
              }
            />
          </Form.Item>

          {!hideSpaceSelect ? (
            <div
              data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-461"
              className="mt-2 flex justify-end border-t border-[#F0F0F0] pt-2"
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                data-cy="create-announcement-cancel"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
};

type CollaborationComposerProps = {
  value?: string;
  onChange?: (value: string) => void;
  active: boolean;
  submitting: boolean;
  canSend: boolean;
  growUpward?: boolean;
  attachments: PendingAttachment[];
  mentionableUsers: MentionUser[];
  mentionUsersLoading?: boolean;
  onAttachmentsChange: (files: PendingAttachment[]) => void;
  onSend: () => void;
  onMentionUser: (userId: string) => void;
};

const CollaborationComposer = ({
  value = '',
  onChange,
  active,
  submitting,
  canSend,
  growUpward = false,
  attachments,
  mentionableUsers,
  mentionUsersLoading = false,
  onAttachmentsChange,
  onSend,
  onMentionUser,
}: CollaborationComposerProps) => {
  const quillRef = useRef<ReactQuillType | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const canSendRef = useRef(canSend);
  const onSendRef = useRef(onSend);
  canSendRef.current = canSend;
  onSendRef.current = onSend;

  useEffect(() => {
    if (!active) {
      setShowFormatToolbar(false);
      setAttachOpen(false);
      setMentionQuery(null);
      setMentionStartIndex(-1);
    }
  }, [active]);

  const filteredMentionUsers = useMemo(() => {
    if (mentionQuery === null) return [];
    const query = mentionQuery.trim().toLowerCase();
    return mentionableUsers
      .filter((user) => {
        if (!query) return true;
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.name.replace(/\s+/g, '').toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [mentionQuery, mentionableUsers]);

  const getQuill = () => quillRef.current?.getEditor?.() ?? null;

  const updateMentionState = () => {
    const quill = getQuill();
    if (!quill) return;
    const selection = quill.getSelection();
    if (!selection) return;

    const textBeforeCursor = quill.getText(0, selection.index);
    // Allow letters/digits/._- after @ (same idea as employee name search).
    const mentionMatch = textBeforeCursor.match(/@([^\s@]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionStartIndex(selection.index - mentionMatch[0].length);
      setSelectedMentionIndex(0);
      return;
    }

    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);
  };

  const insertMention = (user: MentionUser) => {
    const quill = getQuill();
    if (!quill || mentionStartIndex < 0) return;

    const mentionToken = getMentionToken(user.name);
    // Invisible Collab mention marker + visible @Name (Quill strips custom protocols like mention://).
    const mentionMarkup = `<@${user.id}>${mentionToken}`;
    const selection = quill.getSelection(true);
    const cursor = selection?.index ?? quill.getLength();
    const deleteLength = Math.max(cursor - mentionStartIndex, 0);

    quill.focus();
    if (deleteLength > 0) {
      quill.deleteText(mentionStartIndex, deleteLength, 'user');
    }
    quill.insertText(
      mentionStartIndex,
      mentionMarkup,
      {
        bold: true,
        color: collaborationColors.primary,
      },
      'user',
    );
    quill.insertText(
      mentionStartIndex + mentionMarkup.length,
      ' ',
      { bold: false, color: false },
      'user',
    );
    quill.setSelection(mentionStartIndex + mentionMarkup.length + 1, 0, 'user');

    onMentionUser(user.id);
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);
  };

  const insertEmoji = (emoji: string) => {
    const quill = getQuill();
    if (!quill) return;
    const selection = quill.getSelection(true);
    const index = selection?.index ?? Math.max(quill.getLength() - 1, 0);

    quill.focus();
    quill.insertText(index, emoji, 'user');
    quill.setSelection(index + emoji.length, 0, 'user');
  };

  const applyFormat = (
    format: string,
    value: string | boolean | number = true,
  ) => {
    const quill = getQuill();
    if (!quill) return;
    quill.focus();
    const current = quill.getFormat();

    if (format === 'list') {
      quill.format('list', current.list === value ? false : value);
      return;
    }
    if (format === 'header') {
      quill.format('header', current.header === value ? false : value);
      return;
    }
    if (format === 'link') {
      if (current.link) {
        quill.format('link', false);
        return;
      }
      const url = window.prompt('Enter link URL');
      if (url) quill.format('link', url);
      return;
    }
    if (format === 'color') {
      quill.format(
        'color',
        current.color ? false : collaborationColors.primary,
      );
      return;
    }
    if (format === 'background') {
      quill.format('background', current.background ? false : '#FEF08A');
      return;
    }

    quill.format(format, current[format] ? false : value);
  };

  const handleQuillChange = (
    nextHtml: string,
    delta: unknown,
    source: string,
  ) => {
    // Ignore Quill's own value sync (`api`/`silent`) — propagating those
    // back into Form.Item causes an infinite dashboard re-render loop.
    if (source !== 'user') return;
    onChange?.(nextHtml);
    requestAnimationFrame(() => updateMentionState());
  };

  useEffect(() => {
    const quill = getQuill();
    if (!quill) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (mentionQuery !== null && filteredMentionUsers.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedMentionIndex((current) =>
            Math.min(current + 1, filteredMentionUsers.length - 1),
          );
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedMentionIndex((current) => Math.max(current - 1, 0));
          return;
        }
        if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
          event.preventDefault();
          insertMention(filteredMentionUsers[selectedMentionIndex]);
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setMentionQuery(null);
          setMentionStartIndex(-1);
          return;
        }
      }

      if (event.key === 'Enter' && !event.shiftKey && canSendRef.current) {
        event.preventDefault();
        onSendRef.current();
      }
    };

    const root = quill.root;
    root.addEventListener('keydown', onKeyDown);
    root.addEventListener('keyup', updateMentionState);
    root.addEventListener('click', updateMentionState);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
      root.removeEventListener('keyup', updateMentionState);
      root.removeEventListener('click', updateMentionState);
    };
  }, [editorReady, filteredMentionUsers, mentionQuery, selectedMentionIndex]);

  const handleAttachFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'file' | 'image',
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    onAttachmentsChange([
      ...attachments,
      ...files.map((file) => ({
        id: `${kind}-${file.name}-${file.size}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name: file.name,
        kind,
        file,
      })),
    ]);
    setAttachOpen(false);
    event.target.value = '';
  };

  const attachMenu = (
    <div className="w-[148px] py-1" data-cy="create-announcement-attach-menu">
      <p
        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-p-720"
        className="m-0 px-3 pb-1 pt-1 text-[11px] font-semibold tracking-wide text-gray-400"
      >
        ATTACH
      </p>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 border-0 bg-transparent px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-[#F8FAFB]"
        onClick={() => fileInputRef.current?.click()}
        data-cy="create-announcement-attach-files"
      >
        <BsFileEarmarkText size={16} className="text-gray-600" />
        Files
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 border-0 bg-transparent px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-[#F8FAFB]"
        onClick={() => imageInputRef.current?.click()}
        data-cy="create-announcement-attach-images"
      >
        <BsImage size={16} className="text-gray-600" />
        Images
      </button>
    </div>
  );

  const showMentionMenu = mentionQuery !== null;

  const formatIconClass =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#334155] transition hover:bg-[#F1F5F9]';

  return (
    <div className="relative" data-cy="create-announcement-composer-wrap">
      {showMentionMenu ? (
        <div
          className="absolute bottom-full left-0 right-0 z-30 mb-2 max-h-60 overflow-y-auto rounded-xl border bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{ borderColor: collaborationColors.accent }}
          data-cy="create-announcement-mention-dropdown"
        >
          {mentionUsersLoading ? (
            <div className="flex items-center justify-center px-3 py-4">
              <Spin size="small" />
            </div>
          ) : filteredMentionUsers.length === 0 ? (
            <p className="m-0 px-3 py-3 text-center text-sm text-gray-400">
              No channel members found
            </p>
          ) : (
            filteredMentionUsers.map((user, index) => {
              const selected = index === selectedMentionIndex;
              return (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertMention(user)}
                  className="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left transition"
                  style={{
                    background: selected
                      ? collaborationColors.surface
                      : '#ffffff',
                  }}
                  data-cy={`create-announcement-mention-option-${user.id}`}
                >
                  <Avatar
                    size={28}
                    src={user.profileImage || undefined}
                    icon={!user.profileImage ? <UserOutlined /> : undefined}
                    style={{
                      backgroundColor: user.profileImage
                        ? undefined
                        : getAvatarColor(user.id),
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {!user.profileImage ? getUserAvatarText(user.name) : null}
                  </Avatar>
                  <div
                    data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-788"
                    className="min-w-0 flex-1"
                  >
                    <div
                      data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-789"
                      className="truncate text-sm font-medium"
                      style={{ color: collaborationColors.primary }}
                    >
                      {user.name}
                    </div>
                    {user.email ? (
                      <div
                        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-796"
                        className="truncate text-xs text-gray-500"
                      >
                        {user.email}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}

      {showFormatToolbar ? (
        <div
          className="mb-2 flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-[#E8EDF2] bg-[#F8FAFB] px-1.5 py-1 scrollbar-none"
          data-cy="create-announcement-format-toolbar"
        >
          <button
            type="button"
            className={formatIconClass}
            aria-label="Bold"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('bold')}
            data-cy="create-announcement-format-bold"
          >
            <BsTypeBold size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Italic"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('italic')}
            data-cy="create-announcement-format-italic"
          >
            <BsTypeItalic size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Underline"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('underline')}
            data-cy="create-announcement-format-underline"
          >
            <BsTypeUnderline size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Strikethrough"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('strike')}
            data-cy="create-announcement-format-strike"
          >
            <BsTypeStrikethrough size={15} />
          </button>

          <span
            data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-853"
            className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]"
          />

          <button
            type="button"
            className={formatIconClass}
            aria-label="Bulleted list"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('list', 'bullet')}
            data-cy="create-announcement-format-bullet"
          >
            <BsListUl size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Numbered list"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('list', 'ordered')}
            data-cy="create-announcement-format-numbered"
          >
            <BsListOl size={15} />
          </button>

          <span
            data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-876"
            className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]"
          />

          <button
            type="button"
            className={formatIconClass}
            aria-label="Insert link"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('link')}
            data-cy="create-announcement-format-link"
          >
            <BsLink45Deg size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Highlight"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('background')}
            data-cy="create-announcement-format-highlight"
          >
            <BsHighlighter size={15} />
          </button>
          <button
            type="button"
            className={formatIconClass}
            aria-label="Text color"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('color')}
            data-cy="create-announcement-format-color"
          >
            <BsPalette size={15} />
          </button>
          <button
            type="button"
            className="ml-0.5 flex h-7 shrink-0 items-center gap-1 rounded-md border-0 bg-transparent px-1.5 text-[12px] font-medium text-[#64748B] transition hover:bg-[#F1F5F9]"
            aria-label="Text style"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('header', 2)}
            data-cy="create-announcement-format-style"
          >
            <span
              data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-916"
              className="font-semibold text-[#334155]"
            >
              Aa
            </span>
            Default
            <MdKeyboardArrowDown size={14} />
          </button>

          <span
            data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-921"
            className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]"
          />

          <button
            type="button"
            className={formatIconClass}
            aria-label="Code block"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyFormat('code-block')}
            data-cy="create-announcement-format-code"
          >
            <BsCodeSlash size={15} />
          </button>
        </div>
      ) : null}

      <div
        data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-936"
        className="flex flex-col gap-2"
      >
        {attachments.length > 0 ? (
          <div
            className="flex flex-wrap gap-1.5"
            data-cy="create-announcement-attachments"
          >
            {attachments.map((file) => (
              <Tag
                key={file.id}
                closable
                onClose={() =>
                  onAttachmentsChange(
                    attachments.filter((item) => item.id !== file.id),
                  )
                }
                className="m-0 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                style={{
                  background: collaborationColors.surface,
                  borderColor: collaborationColors.accent,
                  color: collaborationColors.primary,
                }}
                data-cy={`create-announcement-attachment-${file.id}`}
              >
                {file.kind === 'image' ? (
                  <BsImage size={12} />
                ) : (
                  <BsFileEarmarkText size={12} />
                )}
                <span
                  data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-span-964"
                  className="max-w-[140px] truncate"
                >
                  {file.name}
                </span>
              </Tag>
            ))}
          </div>
        ) : null}

        <div
          className="flex items-end gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm"
          style={{ borderColor: collaborationColors.accent }}
          data-cy="create-announcement-composer"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => handleAttachFiles(event, 'file')}
            data-cy="create-announcement-attach-files-input"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            onChange={(event) => handleAttachFiles(event, 'image')}
            data-cy="create-announcement-attach-images-input"
          />

          <Popover
            trigger="click"
            placement="topLeft"
            open={attachOpen}
            onOpenChange={setAttachOpen}
            arrow={false}
            content={attachMenu}
            overlayInnerStyle={{
              padding: 0,
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <button
              type="button"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 transition"
              style={{
                color: collaborationColors.primary,
                background: attachOpen
                  ? collaborationColors.accent
                  : collaborationColors.surface,
              }}
              aria-label="Attach"
              aria-expanded={attachOpen}
              data-cy="create-announcement-attach"
            >
              <BsPaperclip size={18} />
            </button>
          </Popover>

          <div
            className={`announcement-quill min-w-0 flex-1 [&_.ql-container]:border-0 [&_.ql-container]:text-sm [&_.ql-editor]:min-h-[28px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-0 [&_.ql-editor]:py-1 [&_.ql-editor]:text-sm [&_.ql-editor.ql-blank]::before:left-0 [&_.ql-editor.ql-blank]::before:right-0 [&_.ql-editor.ql-blank]::before:text-sm [&_.ql-toolbar]:hidden ${
              growUpward
                ? '[&_.ql-editor]:max-h-[min(70vh,560px)]'
                : '[&_.ql-editor]:max-h-[160px]'
            }`}
            style={{ color: collaborationColors.primary }}
            data-cy="create-announcement-body"
          >
            <AnnouncementQuillField
              editorRef={quillRef}
              onEditorReady={() => setEditorReady(true)}
              theme="snow"
              value={value}
              onChange={handleQuillChange}
              modules={ANNOUNCEMENT_QUILL_MODULES}
              formats={ANNOUNCEMENT_QUILL_FORMATS}
              placeholder="Message in Selamnew"
            />
          </div>

          <div
            data-cy="organization-announcement-components-announcementcomposerpanel-tsx-announcementcomposerpanel-div-1044"
            className="mb-1 flex shrink-0 items-center gap-1"
          >
            <button
              type="button"
              className="rounded-md p-1 transition"
              style={{
                color: collaborationColors.primary,
                opacity: showFormatToolbar ? 1 : 0.55,
                background: showFormatToolbar
                  ? collaborationColors.surface
                  : 'transparent',
              }}
              aria-label="Formatting"
              aria-pressed={showFormatToolbar}
              onClick={() => setShowFormatToolbar((current) => !current)}
              data-cy="create-announcement-format"
            >
              <BsTypeUnderline size={18} />
            </button>
            <EmojiPickerButton
              onSelect={insertEmoji}
              iconSize={18}
              className="p-1"
              style={{ color: collaborationColors.primary, opacity: 0.55 }}
              dataCy="create-announcement-emoji"
            />
            <button
              type="button"
              disabled={!canSend}
              onClick={onSend}
              className="flex h-8 w-8 items-center justify-center rounded-lg p-1 transition disabled:cursor-not-allowed disabled:opacity-35"
              style={{ color: collaborationColors.primary }}
              aria-label="Send announcement"
              data-cy="create-announcement-submit"
            >
              {submitting ? <Spin size="small" /> : <BsSendFill size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementComposerPanel;
