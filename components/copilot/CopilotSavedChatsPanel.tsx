'use client';

import React, { useState } from 'react';
import { Dropdown, Input, Skeleton, type MenuProps } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import type { SavedChatSession } from '@/utils/copilotShare';
import { COPILOT_THEME } from './copilotTheme';

interface CopilotSavedChatsPanelProps {
  variant?: 'desktop' | 'mobile';
  compact?: boolean;
  savedChats: SavedChatSession[];
  isLoading?: boolean;
  onOpenSavedChat: (id: string) => void;
  onDeleteSavedChat: (id: string, e?: React.MouseEvent) => void;
  sharedView: boolean;
  onRenameSavedChat: (id: string, title: string) => void;
}

/**
 * Right rail — saved chats only (Selamnew Copilot workspace mockup).
 */
const CopilotSavedChatsPanel: React.FC<CopilotSavedChatsPanelProps> = ({
  variant = 'desktop',
  compact = false,
  savedChats,
  isLoading = false,
  onOpenSavedChat,
  onDeleteSavedChat,
  sharedView,
  onRenameSavedChat,
}) => {
  const uid = (base: string) => `${base}-${variant}`;
  const ucy = (base: string) => `${base}-${variant}`;
  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);
  const [editSavedTitle, setEditSavedTitle] = useState('');

  const startInlineEdit = (s: SavedChatSession) => {
    setEditingSavedId(s.id);
    setEditSavedTitle(s.title || '');
  };

  const cancelInlineEdit = () => {
    setEditingSavedId(null);
    setEditSavedTitle('');
  };

  const confirmInlineEdit = () => {
    if (!editingSavedId) return;
    const t = editSavedTitle.trim();
    if (t) onRenameSavedChat(editingSavedId, t);
    cancelInlineEdit();
  };

  const savedMenuItems = (s: SavedChatSession): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined className="text-slate-600" />,
      label: 'Rename',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        startInlineEdit(s);
      },
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined className="text-red-500" />,
      label: 'Delete',
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onDeleteSavedChat(s.id);
      },
    },
  ];

  const showActions = !sharedView && !compact;

  const isDesktop = variant === 'desktop';
  const railGap = COPILOT_THEME.workspaceRailGapPx;
  const railPad = isDesktop ? COPILOT_THEME.workspaceRailPaddingPx : 16;
  const railRadius = isDesktop ? COPILOT_THEME.workspaceRailRadiusPx : 0;

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={{
        backgroundColor: COPILOT_THEME.workspaceRailBg,
        borderRadius: railRadius,
        gap: railGap,
        padding: railPad,
      }}
      id={uid('copilot-saved-chats-panel')}
      data-cy={ucy('copilot-saved-chats-panel')}
    >
      <div
        className="flex-shrink-0"
        id={uid('copilot-saved-chats-header')}
        data-cy={ucy('copilot-saved-chats-header')}
      >
        <span
          className="text-[15px] font-semibold leading-6 text-[#111827]"
          id={uid('copilot-saved-chats-title')}
          data-cy={ucy('copilot-saved-chats-title')}
        >
          Saved chats
        </span>
      </div>

      <div
        className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto"
        id={uid('copilot-saved-chats-content')}
        data-cy={ucy('copilot-saved-chats-content')}
      >
        {isLoading ? (
          <div
            className="flex flex-col"
            style={{ gap: railGap }}
            data-cy={`copilot-saved-chats-loading-${variant}`}
          >
            {[0, 1, 2].map((i) => (
              <Skeleton.Input
                key={i}
                active
                block
                size="small"
                style={{
                  height: 20,
                  borderRadius: 4,
                  maxWidth: '85%',
                  backgroundColor: '#E5E7EB',
                }}
              />
            ))}
          </div>
        ) : savedChats.length > 0 ? (
          <ul
            className="m-0 flex list-none flex-col p-0"
            style={{ gap: railGap }}
            id={uid('copilot-saved-chats-list')}
            data-cy={ucy('copilot-saved-chats-list')}
          >
            {savedChats.map((s) => (
              <li
                key={s.id}
                className="m-0 p-0"
                id={uid(`copilot-saved-chat-li-${s.id}`)}
                data-cy={`copilot-saved-chat-${variant}-${s.id}`}
              >
                {editingSavedId === s.id ? (
                  <div
                    className="flex items-center gap-2 py-1"
                    data-cy={`copilot-saved-edit-row-${variant}-${s.id}`}
                  >
                    <Input
                      value={editSavedTitle}
                      onChange={(e) => setEditSavedTitle(e.target.value)}
                      onPressEnter={confirmInlineEdit}
                      className="min-w-0 flex-1 rounded-md border border-[#E5E7EB] !px-2 !py-1.5 text-sm !text-[#333333] shadow-none"
                      autoFocus
                      id={uid(`copilot-saved-edit-input-${s.id}`)}
                      data-cy={`copilot-saved-edit-input-${variant}-${s.id}`}
                    />
                    <button
                      type="button"
                      onClick={cancelInlineEdit}
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]"
                      aria-label="Cancel edit"
                      id={uid(`copilot-saved-edit-cancel-${s.id}`)}
                      data-cy={`copilot-saved-edit-cancel-${variant}-${s.id}`}
                    >
                      <CloseOutlined className="text-[12px]" />
                    </button>
                    <button
                      type="button"
                      onClick={confirmInlineEdit}
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#2A48B1] hover:bg-[#EFF6FF]"
                      aria-label="Save name"
                      id={uid(`copilot-saved-edit-confirm-${s.id}`)}
                      data-cy={`copilot-saved-edit-confirm-${variant}-${s.id}`}
                    >
                      <CheckOutlined className="text-[12px]" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-1"
                    data-cy={`copilot-saved-chat-row-${variant}-${s.id}`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenSavedChat(s.id)}
                      className="min-w-0 flex-1 truncate text-left text-[14px] font-normal leading-5 text-[#333333] transition-colors hover:text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A48B1]/20"
                      id={uid(`copilot-saved-chat-title-${s.id}`)}
                      data-cy={`copilot-saved-chat-pill-${variant}-${s.id}`}
                    >
                      {s.title || 'Saved chat'}
                    </button>
                    {showActions && (
                      <Dropdown
                        menu={{
                          items: savedMenuItems(s),
                          className:
                            'min-w-[160px] rounded-lg !p-1 shadow-[0_6px_16px_rgba(15,23,42,0.12)]',
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                        getPopupContainer={(n) =>
                          n.parentElement ?? document.body
                        }
                      >
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9CA3AF] opacity-0 transition-opacity hover:bg-white hover:text-[#6B7280] group-hover:opacity-100"
                          aria-label="Saved chat actions"
                          id={uid(`copilot-saved-more-${s.id}`)}
                          data-cy={`copilot-saved-more-${variant}-${s.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisOutlined className="text-[14px]" />
                        </button>
                      </Dropdown>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default CopilotSavedChatsPanel;
