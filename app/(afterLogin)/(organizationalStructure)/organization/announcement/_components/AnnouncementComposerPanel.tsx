'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Avatar, Form, Input, Popover, Select, Spin, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  BsCodeSlash,
  BsEmojiSmile,
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
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { collaborationColors } from './collaborationColors';
import { createAnnouncement } from './mockAnnouncementService';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';

const AnnouncementQuillField = dynamic(() => import('./AnnouncementQuillField'), {
  ssr: false,
});

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

type MentionUser = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
};

const normalizeUsers = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
};

const getUserName = (user: any) => {
  const employeeInfo = user?.employeeInformation;
  const fullName =
    user?.fullName ||
    employeeInfo?.fullName ||
    [
      user?.firstName || employeeInfo?.firstName,
      user?.middleName || employeeInfo?.middleName,
      user?.lastName || employeeInfo?.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    user?.email;

  return String(fullName || 'Unknown user').trim();
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

const getMentionToken = (name: string) =>
  `@${name.trim().replace(/\s+/g, '')}`;

const toMentionUser = (user: any): MentionUser | null => {
  if (!user?.id) return null;
  return {
    id: String(user.id),
    name: getUserName(user),
    email: String(user?.email || ''),
    profileImage:
      user?.profileImage ||
      user?.employeeInformation?.profileImage ||
      user?.avatar ||
      undefined,
  };
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
  const spaces = useAnnouncementChannelsStore((state) => state.spaces);
  const enabledChannelIds = useAnnouncementChannelsStore(
    (state) => state.enabledChannelIds,
  );
  const findSpaceById = useAnnouncementChannelsStore(
    (state) => state.findSpaceById,
  );
  const findChannel = useAnnouncementChannelsStore((state) => state.findChannel);
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
  const canSend = !isQuillEmpty(bodyValue) && !submitting;
  const onBodyActivityRef = useRef(onBodyActivity);
  onBodyActivityRef.current = onBodyActivity;

  const notifyBodyActivity = (hasContent: boolean) => {
    onBodyActivityRef.current?.(hasContent);
  };

  useLayoutEffect(() => {
    if (active) return;
    form.resetFields();
    setMentionedUserIds([]);
    notifyBodyActivity(false);
  }, [active, form]);

  useEffect(() => {
    if (!active) return;
    setMentionedUserIds([]);
    const defaultChannel =
      (lockedSpaceId &&
        lockedChannelId &&
        channelOptions.find(
          (item) =>
            item.spaceId === lockedSpaceId && item.id === lockedChannelId,
        )) ||
      channelOptions[0];
    form.setFieldsValue({
      body: '',
      spaceId: defaultChannel?.spaceId,
      channelId: defaultChannel?.id,
    });
    notifyBodyActivity(false);
  }, [active, form, lockedSpaceId, lockedChannelId, channelOptions]);

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
    notifyBodyActivity(false);
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createAnnouncement(
        {
          body: values.body,
          spaceId: values.spaceId,
          channelId: values.channelId,
          mentionedUserIds,
        },
        { findSpaceById, findChannel },
      );
      NotificationMessage.success({
        message: 'Posted to Collaboration',
        description: 'Your announcement was sent to Selamnew Collaboration.',
      });
      form.setFieldsValue({ body: '' });
      setMentionedUserIds([]);
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

  const lockedSpace = lockedSpaceId ? findSpaceById(lockedSpaceId) : undefined;
  const lockedChannel =
    lockedSpaceId && lockedChannelId
      ? findChannel(lockedSpaceId, lockedChannelId)
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

        <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
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
                    <span className="inline-flex items-center gap-1.5">
                      <MdTag
                        size={14}
                        style={{ color: collaborationColors.primary }}
                      />
                      <span className="truncate">{channel.name}</span>
                    </span>
                  ),
                  channel,
                }))}
                optionRender={(option) => {
                  const channel = option.data.channel as (typeof channelOptions)[number];
                  return (
                    <span
                      className="flex items-center gap-2 py-0.5"
                      data-cy={`create-announcement-space-option-${channel.id}`}
                    >
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded"
                        style={{
                          background: collaborationColors.surface,
                          color: collaborationColors.primary,
                        }}
                      >
                        <MdTag size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-gray-900">
                          {channel.name}
                        </span>
                        <span className="block text-[11px] text-gray-400">
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

        <div className="mt-auto flex shrink-0 flex-col">
          <Form.Item className="!mb-0" name="body">
            <CollaborationComposer
              active={active}
              submitting={submitting}
              canSend={canSend}
              growUpward={growWithContent}
              onSend={() => void handleSubmit()}
              onMentionUser={(userId) =>
                setMentionedUserIds((current) =>
                  Array.from(new Set([...current, userId])),
                )
              }
            />
          </Form.Item>

          {!hideSpaceSelect ? (
            <div className="mt-2 flex justify-end border-t border-[#F0F0F0] pt-2">
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
  onSend,
  onMentionUser,
}: CollaborationComposerProps) => {
  const { userId: currentUserId } = useAuthenticationStore();
  const { data: usersData } = useGetAllUsers();
  const quillRef = useRef<ReactQuillType | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; name: string; kind: 'file' | 'image' }[]
  >([]);
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
      setAttachments([]);
    }
  }, [active]);

  const mentionableUsers = useMemo(() => {
    return normalizeUsers(usersData)
      .map(toMentionUser)
      .filter((user): user is MentionUser => {
        if (!user) return false;
        if (currentUserId && user.id === currentUserId) return false;
        return user.name !== 'Unknown user';
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentUserId, usersData]);

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
    const mentionMatch = textBeforeCursor.match(/@([A-Za-z0-9._-]*)$/);

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
    const selection = quill.getSelection(true);
    const cursor = selection?.index ?? quill.getLength();
    const deleteLength = Math.max(cursor - mentionStartIndex, 0);

    quill.focus();
    if (deleteLength > 0) {
      quill.deleteText(mentionStartIndex, deleteLength, 'user');
    }
    quill.insertText(mentionStartIndex, `${mentionToken} `, 'user');
    quill.setSelection(mentionStartIndex + mentionToken.length + 1, 0, 'user');

    onMentionUser(user.id);
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);
  };

  const applyFormat = (format: string, value: string | boolean = true) => {
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
      quill.format('color', current.color ? false : collaborationColors.primary);
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
    _delta: unknown,
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
  }, [
    editorReady,
    filteredMentionUsers,
    mentionQuery,
    selectedMentionIndex,
  ]);

  const handleAttachFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'file' | 'image',
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${kind}-${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        kind,
      })),
    ]);
    setAttachOpen(false);
    event.target.value = '';
  };

  const attachMenu = (
    <div
      className="w-[148px] py-1"
      data-cy="create-announcement-attach-menu"
    >
      <p className="m-0 px-3 pb-1 pt-1 text-[11px] font-semibold tracking-wide text-gray-400">
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

  const showMentionMenu =
    mentionQuery !== null && filteredMentionUsers.length > 0;

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
          {filteredMentionUsers.map((user, index) => {
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
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-sm font-medium"
                    style={{ color: collaborationColors.primary }}
                  >
                    {user.name}
                  </div>
                  {user.email ? (
                    <div className="truncate text-xs text-gray-500">
                      {user.email}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
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

          <span className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]" />

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

          <span className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]" />

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
            <span className="font-semibold text-[#334155]">Aa</span>
            Default
            <MdKeyboardArrowDown size={14} />
          </button>

          <span className="mx-1 h-4 w-px shrink-0 bg-[#D8DEE6]" />

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

      <div className="flex flex-col gap-2">
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
                  setAttachments((current) =>
                    current.filter((item) => item.id !== file.id),
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
                <span className="max-w-[140px] truncate">{file.name}</span>
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

          <div className="mb-1 flex shrink-0 items-center gap-1">
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
            <button
              type="button"
              className="p-1"
              style={{ color: collaborationColors.primary, opacity: 0.55 }}
              aria-label="Emoji"
              tabIndex={-1}
              data-cy="create-announcement-emoji"
            >
              <BsEmojiSmile size={18} />
            </button>
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
