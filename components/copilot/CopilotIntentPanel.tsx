'use client';

import React, { useState } from 'react';
import { Collapse, Dropdown, Input, type MenuProps } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  EllipsisOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { IntentCategory } from './intents';
import { COPILOT_INTENTS } from './intents';
import type { SavedChatSession } from '@/utils/copilotShare';

interface CopilotIntentPanelProps {
  /** Avoid duplicate DOM ids when desktop + mobile panels both mount */
  variant?: 'desktop' | 'mobile';
  onIntentSelect: (intent: string) => void;
  /** Collapse the reports panel (square chevron control in header — circular open-only control lives in CopilotModule). */
  onHide?: () => void;
  activeIntentLabel?: string | null;
  savedChats: SavedChatSession[];
  onOpenSavedChat: (id: string) => void;
  onDeleteSavedChat: (id: string, e?: React.MouseEvent) => void;
  sharedView: boolean;
  onRenameSavedChat: (id: string, title: string) => void;
}

/**
 * Side panel: header “Saved and available reports” + square chevron collapse,
 * Saved card, Available Reports accordion. (Sparkle circle only when panel is closed, in CopilotModule.)
 */
const CopilotIntentPanel: React.FC<CopilotIntentPanelProps> = ({
  variant = 'desktop',
  onIntentSelect,
  onHide,
  activeIntentLabel,
  savedChats,
  onOpenSavedChat,
  onDeleteSavedChat,
  sharedView,
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
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#D1D5DB] bg-white text-[#6B7280] shadow-sm transition-colors hover:border-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#374151]';

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6]"
      id={uid('copilot-intent-panel')}
      data-cy={ucy('copilot-intent-panel')}
    >
      <div
        className="flex flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-[#E8EAED] px-4 py-3"
        id={uid('copilot-intent-panel-header')}
        data-cy={ucy('copilot-intent-panel-header')}
      >
        <span
          id={uid('copilot-intent-panel-title')}
          className="pr-2 text-[15px] font-semibold leading-tight text-[#111827]"
          data-cy={ucy('copilot-intent-panel-title')}
        >
          Saved and available reports
        </span>
        {onHide ? (
          <button
            type="button"
            onClick={onHide}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#D1D5DB] bg-white text-[#595959] shadow-sm transition-colors hover:border-[#2563EB]/35 hover:text-[#2563EB]"
            title="Hide saved and available reports"
            aria-label="Hide saved and available reports"
            id={uid('copilot-hide-intents-button')}
            data-cy={ucy('copilot-hide-intents-button')}
          >
            <RightOutlined className="text-[11px]" />
          </button>
        ) : null}
      </div>

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3"
        id={uid('copilot-intent-panel-content')}
        data-cy={ucy('copilot-intent-panel-content')}
      >
        {/* Saved — nested card */}
        <div
          className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-sm"
          id={uid('copilot-saved-reports-section')}
          data-cy={ucy('copilot-saved-reports-section')}
        >
          <div
            className="mb-3"
            data-cy={ucy('copilot-saved-section-label-wrap')}
          >
            <span
              id={uid('copilot-saved-section-label')}
              className="text-[14px] font-semibold text-[#333333]"
              data-cy={ucy('copilot-saved-section-label')}
            >
              Saved
            </span>
          </div>

          {savedChats.length === 0 ? (
            <div
              id={uid('copilot-saved-empty')}
              className="rounded-[8px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-4 py-10 text-center text-[14px] text-[#9CA3AF]"
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
                  className="rounded-lg border-0 bg-transparent px-0 py-2"
                  id={uid(`copilot-saved-chat-li-${s.id}`)}
                  data-cy={`copilot-saved-chat-${variant}-${s.id}`}
                >
                  {editingSavedId === s.id ? (
                    <div
                      id={uid(`copilot-saved-edit-inline-${s.id}`)}
                      data-cy={`copilot-saved-edit-inline-${variant}-${s.id}`}
                    >
                      <div
                        className="flex items-center gap-2"
                        data-cy={`copilot-saved-edit-row-${variant}-${s.id}`}
                      >
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
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-sm transition-colors hover:brightness-105"
                          aria-label="Save name"
                          id={uid(`copilot-saved-edit-confirm-${s.id}`)}
                          data-cy={`copilot-saved-edit-confirm-${variant}-${s.id}`}
                        >
                          <CheckOutlined className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex items-center gap-2"
                        data-cy={`copilot-saved-chat-row-${variant}-${s.id}`}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenSavedChat(s.id)}
                          className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#262626] transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
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
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Available Reports */}
        <div
          className="rounded-[8px] border border-[#E5E7EB] bg-white p-4 shadow-sm"
          id={uid('copilot-available-reports-section')}
          data-cy={ucy('copilot-available-reports-section')}
        >
          <span
            id={uid('copilot-available-reports-title')}
            className="mb-3 block text-[14px] font-semibold text-[#333333]"
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm"
                  aria-hidden
                  data-cy={ucy('copilot-intent-collapse-expand-icon')}
                >
                  <CaretDownOutlined
                    className="text-[10px] transition-transform duration-200"
                    rotate={isActive ? 180 : 0}
                  />
                </span>
              )}
              className="copilot-intent-collapse bg-transparent [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-[#F3F4F6] [&_.ant-collapse-item]:last:border-b-0 [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!bg-transparent [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-header:hover]:!bg-transparent [&_.ant-collapse-content-box]:!pb-2 [&_.ant-collapse-content-box]:!pt-0 [&_.ant-collapse-expand-icon]:!p-0"
            >
              {COPILOT_INTENTS.map((category: IntentCategory) => (
                <Collapse.Panel
                  key={category.id}
                  header={
                    <span
                      id={uid(`copilot-intent-category-header-${category.id}`)}
                      className={`text-[14px] font-semibold ${
                        expandedKeys.includes(category.id)
                          ? 'text-[#2563EB]'
                          : 'text-[#111827]'
                      }`}
                      data-cy={`copilot-intent-category-header-${category.id}`}
                    >
                      {category.label}
                    </span>
                  }
                  className="!border-0 bg-transparent"
                >
                  <div
                    id={uid(`copilot-intent-category-content-${category.id}`)}
                    className="w-full max-w-[248px] space-y-0"
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
                          className={`flex h-[38px] w-full max-w-[248px] items-center border-0 bg-transparent px-0 text-left text-[14px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/25 focus-visible:ring-offset-1 ${
                            active
                              ? 'font-medium text-[#2563EB]'
                              : 'font-normal text-[#4B5563]'
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
