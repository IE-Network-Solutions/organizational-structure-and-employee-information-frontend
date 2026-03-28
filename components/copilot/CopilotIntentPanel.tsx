'use client';

import React, { useState } from 'react';
import { Collapse, Dropdown, Input, type MenuProps } from 'antd';
import {
  RightOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import type { IntentCategory } from './intents';
import { COPILOT_INTENTS } from './intents';
import type { SavedChatSession } from '@/utils/copilotShare';

interface CopilotIntentPanelProps {
  /** Avoid duplicate DOM ids when desktop + mobile panels both mount */
  variant?: 'desktop' | 'mobile';
  onIntentSelect: (intent: string) => void;
  onHide?: () => void;
  onCloseWorkspace?: () => void;
  activeIntentLabel?: string | null;
  savedChats: SavedChatSession[];
  onOpenSavedChat: (id: string) => void;
  onDeleteSavedChat: (id: string, e?: React.MouseEvent) => void;
  sharedView: boolean;
  onStartNewChat: () => void;
  onRenameSavedChat: (id: string, title: string) => void;
}

/**
 * Side panel: light header, Saved card with ⋯ menu (Edit inline + Delete),
 * Available Reports accordion.
 */
const CopilotIntentPanel: React.FC<CopilotIntentPanelProps> = ({
  variant = 'desktop',
  onIntentSelect,
  onHide,
  onCloseWorkspace,
  activeIntentLabel,
  savedChats,
  onOpenSavedChat,
  onDeleteSavedChat,
  sharedView,
  onStartNewChat,
  onRenameSavedChat,
}) => {
  const uid = (base: string) => `${base}-${variant}`;
  const ucy = (base: string) => `${base}-${variant}`;
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['employee']);
  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);
  const [editSavedTitle, setEditSavedTitle] = useState('');

  const handleExpand = (keys: string | string[]) => {
    setExpandedKeys(Array.isArray(keys) ? keys : [keys]);
  };

  const isActive = (label: string) =>
    activeIntentLabel != null &&
    activeIntentLabel.trim().toLowerCase() === label.trim().toLowerCase();

  const formatSavedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

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
      label: 'Edit Saved report',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        startInlineEdit(s);
      },
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined className="text-red-500" />,
      label: 'Delete Saved Report',
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onDeleteSavedChat(s.id);
      },
    },
  ];

  const ellipsisBtn =
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700';

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      id={uid('copilot-intent-panel')}
      data-cy={ucy('copilot-intent-panel')}
    >
      {/* Header — light gray bar, title + chevron (reference) */}
      <div
        className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-[#F5F5F5] px-4 py-3"
        id={uid('copilot-intent-panel-header')}
        data-cy={ucy('copilot-intent-panel-header')}
      >
        <span
          id={uid('copilot-intent-panel-title')}
          className="pr-2 text-[15px] font-semibold leading-tight text-slate-900"
          data-cy={ucy('copilot-intent-panel-title')}
        >
          Saved and available reports
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {onCloseWorkspace && (
            <button
              type="button"
              onClick={onCloseWorkspace}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-800"
              id={uid('copilot-panel-close-workspace')}
              data-cy={ucy('copilot-panel-close-workspace')}
            >
              Close
            </button>
          )}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              title="Collapse panel"
              aria-label="Collapse reports panel"
              id={uid('copilot-hide-intents-button')}
              data-cy={ucy('copilot-hide-intents-button')}
            >
              <RightOutlined className="text-[11px]" />
            </button>
          )}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-white px-4 pb-4 pt-4"
        id={uid('copilot-intent-panel-content')}
        data-cy={ucy('copilot-intent-panel-content')}
      >
        {/* Saved — nested card */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          id={uid('copilot-saved-reports-section')}
          data-cy={ucy('copilot-saved-reports-section')}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              id={uid('copilot-saved-section-label')}
              className="text-sm font-semibold text-slate-900"
              data-cy={ucy('copilot-saved-section-label')}
            >
              Saved
            </span>
            {!sharedView && (
              <button
                type="button"
                onClick={onStartNewChat}
                className="text-xs font-medium text-[#1677ff] hover:underline"
                id={uid('copilot-panel-new-chat')}
                data-cy={ucy('copilot-panel-new-chat')}
              >
                New conversation
              </button>
            )}
          </div>

          {savedChats.length === 0 ? (
            <div
              id={uid('copilot-saved-empty')}
              className="rounded-lg border border-dashed border-slate-200 bg-slate-50/90 px-4 py-10 text-center text-sm text-slate-400"
              data-cy={ucy('copilot-saved-empty')}
            >
              You Have No Saved Reports
            </div>
          ) : savedChats.length > 0 ? (
            <ul
              className="space-y-0.5"
              id={uid('copilot-saved-chats-list')}
              data-cy={ucy('copilot-saved-chats-list')}
            >
              {savedChats.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-slate-100 bg-white p-2.5"
                  id={uid(`copilot-saved-chat-li-${s.id}`)}
                  data-cy={`copilot-saved-chat-${variant}-${s.id}`}
                >
                  {editingSavedId === s.id ? (
                    <div
                      id={uid(`copilot-saved-edit-inline-${s.id}`)}
                      data-cy={`copilot-saved-edit-inline-${variant}-${s.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={editSavedTitle}
                          onChange={(e) => setEditSavedTitle(e.target.value)}
                          onPressEnter={confirmInlineEdit}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 !px-3 !py-2 text-sm font-medium !text-slate-800 shadow-none hover:border-slate-300"
                          autoFocus
                          id={uid(`copilot-saved-edit-input-${s.id}`)}
                          data-cy={`copilot-saved-edit-input-${variant}-${s.id}`}
                        />
                        <button
                          type="button"
                          onClick={cancelInlineEdit}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-red-400 bg-white text-red-500 transition-colors hover:bg-red-50"
                          aria-label="Cancel edit"
                          id={uid(`copilot-saved-edit-cancel-${s.id}`)}
                          data-cy={`copilot-saved-edit-cancel-${variant}-${s.id}`}
                        >
                          <CloseOutlined className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={confirmInlineEdit}
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1677ff] text-white shadow-sm transition-colors hover:bg-[#4096ff]"
                          aria-label="Save name"
                          id={uid(`copilot-saved-edit-confirm-${s.id}`)}
                          data-cy={`copilot-saved-edit-confirm-${variant}-${s.id}`}
                        >
                          <CheckOutlined className="text-sm" />
                        </button>
                      </div>
                      <p
                        className="mt-1.5 pl-0.5 text-[11px] text-slate-400"
                        id={uid(`copilot-saved-chat-meta-${s.id}`)}
                        data-cy={`copilot-saved-chat-meta-${variant}-${s.id}`}
                      >
                        {formatSavedAt(s.savedAt)} · {s.messages?.length ?? 0}{' '}
                        messages
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenSavedChat(s.id)}
                          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900 transition-colors hover:text-[#1677ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677ff]/25"
                          id={uid(`copilot-saved-chat-title-${s.id}`)}
                          data-cy={`copilot-saved-chat-pill-${variant}-${s.id}`}
                        >
                          {s.title || 'Saved chat'}
                        </button>
                        {!sharedView && (
                          <Dropdown
                            menu={{
                              items: savedMenuItems(s),
                              className:
                                'min-w-[200px] rounded-lg !p-1 shadow-[0_6px_16px_rgba(15,23,42,0.12)] copilot-saved-actions-dropdown',
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                            getPopupContainer={(n) =>
                              n.parentElement ?? document.body
                            }
                          >
                            <button
                              type="button"
                              className={ellipsisBtn}
                              aria-label="Saved report actions"
                              id={uid(`copilot-saved-more-${s.id}`)}
                              data-cy={`copilot-saved-more-${variant}-${s.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EllipsisOutlined className="text-base" />
                            </button>
                          </Dropdown>
                        )}
                      </div>
                      <p
                        className="mt-1.5 pl-0.5 text-[11px] text-slate-400"
                        id={uid(`copilot-saved-chat-meta-${s.id}`)}
                        data-cy={`copilot-saved-chat-meta-${variant}-${s.id}`}
                      >
                        {formatSavedAt(s.savedAt)} · {s.messages?.length ?? 0}{' '}
                        messages
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Available Reports */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          id={uid('copilot-available-reports-section')}
          data-cy={ucy('copilot-available-reports-section')}
        >
          <span
            id={uid('copilot-available-reports-title')}
            className="mb-3 block text-sm font-semibold text-slate-900"
            data-cy={ucy('copilot-available-reports-title')}
          >
            Available Reports
          </span>
          <div
            id={uid('copilot-intent-collapse')}
            data-cy={ucy('copilot-intent-collapse')}
          >
            <Collapse
              activeKey={expandedKeys}
              onChange={handleExpand}
              expandIconPosition="end"
              bordered={false}
              expandIcon={({ isActive }) => (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 shadow-sm"
                  aria-hidden
                >
                  <CaretDownOutlined
                    className="text-[10px] text-slate-600 transition-transform duration-200"
                    rotate={isActive ? 180 : 0}
                  />
                </span>
              )}
              className="copilot-intent-collapse bg-transparent [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-slate-100 [&_.ant-collapse-item]:last:border-b-0 [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!pb-2 [&_.ant-collapse-content-box]:!pt-0 [&_.ant-collapse-expand-icon]:!p-0"
            >
              {COPILOT_INTENTS.map((category: IntentCategory) => (
                <Collapse.Panel
                  key={category.id}
                  header={
                    <span
                      id={uid(`copilot-intent-category-header-${category.id}`)}
                      className="text-sm font-medium text-slate-800"
                      data-cy={`copilot-intent-category-header-${category.id}`}
                    >
                      {category.label}
                    </span>
                  }
                  className="!border-0 bg-transparent"
                >
                  <div
                    id={uid(`copilot-intent-category-content-${category.id}`)}
                    className="space-y-0.5 pl-1"
                    data-cy={`copilot-intent-category-content-${category.id}`}
                  >
                    {category.intents.map((intent) => {
                      const active = isActive(intent);
                      const slug = intent.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => onIntentSelect(intent)}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? 'border-transparent font-medium text-[#1677ff]'
                              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          id={uid(`copilot-intent-${category.id}-${slug}`)}
                          data-cy={`copilot-intent-${category.id}-${slug}`}
                        >
                          {intent}
                        </button>
                      );
                    })}
                  </div>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotIntentPanel;
