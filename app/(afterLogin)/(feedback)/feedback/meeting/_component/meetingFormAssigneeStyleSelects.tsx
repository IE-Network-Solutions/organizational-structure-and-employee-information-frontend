'use client';

import React, { forwardRef } from 'react';
import { Select, Avatar } from 'antd';
import { CloseOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

/** Scoped styles: parent must have class `add-meeting-form`. */
export const ADD_MEETING_ASSIGNEE_SELECT_STYLES = `
  .add-meeting-form .custom-centered-select-wrapper .ant-select-selector {
    display: flex !important;
    align-items: center !important;
    height: 40px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    position: relative !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-placeholder {
    display: none !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-item {
    display: none !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-search {
    display: none !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-overflow {
    display: none !important;
  }
  .add-meeting-form .custom-assignee-dropdown .ant-select-item-option-selected {
    background-color: #e6f7ff !important;
    font-weight: 500;
  }
  .add-meeting-form .custom-assignee-dropdown .ant-select-item-option-selected .ant-select-item-option-state {
    color: #1890ff;
  }
`;

function HintOverlay({ text }: { text: string }) {
  return (
    <span
      className="pointer-events-none absolute left-3 z-10 font-normal text-[#8c8c8c]"
      style={{ lineHeight: '40px' }}
    >
      {text}
    </span>
  );
}

function TagChip({
  label,
  onRemove,
  'data-cy': dataCy,
}: {
  label: string;
  onRemove: () => void;
  'data-cy'?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-[6px] border border-[#d9d9d9] bg-[rgba(0,0,0,0.02)] px-2 py-[1px]"
      data-cy={dataCy}
    >
      <span className="text-[14px] text-[#595959]">{label}</span>
      <CloseOutlined
        className="cursor-pointer text-[10px] text-[#8c8c8c] hover:text-red-500"
        onClick={onRemove}
      />
    </div>
  );
}

/** Multiple users: empty trigger + hint always; tags below (first name in chip). */
export const MeetingFormUserMultiSelect = forwardRef<
  HTMLDivElement,
  {
    value?: string[];
    onChange?: (ids: string[]) => void;
    allUsers?: { items?: any[] };
    hint: string;
    'data-cy'?: string;
  }
>(function MeetingFormUserMultiSelect(
  { value, onChange, allUsers, hint, 'data-cy': dataCy },
  ref,
) {
  const ids = Array.isArray(value) ? value : [];
  const setIds = (next: string[]) => onChange?.(next);

  return (
    <div ref={ref} data-cy={dataCy}>
      <div className="custom-centered-select-wrapper always-show-placeholder-wrap relative">
        <Select
          mode="multiple"
          showSearch
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          maxTagCount={0}
          maxTagPlaceholder={() => null}
          value={ids}
          onChange={(v) => setIds(Array.isArray(v) ? (v as string[]) : [])}
          optionLabelProp="label"
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName="custom-assignee-dropdown"
          dropdownClassName="custom-assignee-dropdown"
        >
          {allUsers?.items?.map((user: any) => (
            <Option
              key={user.id}
              value={user.id}
              label={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
            >
              <div className="flex items-center gap-3 py-1">
                <Avatar
                  size={28}
                  src={user.profileImage}
                  icon={!user.profileImage && <UserOutlined />}
                />
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#262626]">
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </span>
                  {user?.email ? (
                    <span className="text-[12px] text-[#8c8c8c]">
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        <HintOverlay text={hint} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => {
          const user = allUsers?.items?.find(
            (u: any) => String(u.id) === String(id),
          );
          if (!user) return null;
          return (
            <TagChip
              key={id}
              label={user.firstName}
              onRemove={() => setIds(ids.filter((x) => x !== id))}
              data-cy={`${dataCy}-tag-${id}`}
            />
          );
        })}
      </div>
    </div>
  );
});
MeetingFormUserMultiSelect.displayName = 'MeetingFormUserMultiSelect';

/** Single user: empty trigger + hint always; one tag below when selected. */
export const MeetingFormUserSingleSelect = forwardRef<
  HTMLDivElement,
  {
    value?: string;
    onChange?: (id: string | undefined) => void;
    allUsers?: { items?: any[] };
    hint: string;
    'data-cy'?: string;
  }
>(function MeetingFormUserSingleSelect(
  { value, onChange, allUsers, hint, 'data-cy': dataCy },
  ref,
) {
  const id = value;
  const setId = (next: string | undefined) => onChange?.(next);

  return (
    <div ref={ref} data-cy={dataCy}>
      <div className="custom-centered-select-wrapper always-show-placeholder-wrap relative">
        <Select
          showSearch
          allowClear
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          value={id}
          onChange={(v) => setId(v as string | undefined)}
          optionLabelProp="label"
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName="custom-assignee-dropdown"
          dropdownClassName="custom-assignee-dropdown"
        >
          {allUsers?.items?.map((user: any) => (
            <Option
              key={user.id}
              value={user.id}
              label={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
            >
              <div className="flex items-center gap-3 py-1">
                <Avatar
                  size={28}
                  src={user.profileImage}
                  icon={!user.profileImage && <UserOutlined />}
                />
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[#262626]">
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </span>
                  {user?.email ? (
                    <span className="text-[12px] text-[#8c8c8c]">
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        <HintOverlay text={hint} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {id ? (
          <TagChip
            label={
              (() => {
                const u = allUsers?.items?.find(
                  (x: any) => String(x.id) === String(id),
                );
                return u
                  ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || id
                  : id;
              })()
            }
            onRemove={() => setId(undefined)}
            data-cy={`${dataCy}-tag`}
          />
        ) : null}
      </div>
    </div>
  );
});
MeetingFormUserSingleSelect.displayName = 'MeetingFormUserSingleSelect';

/** Multiple plain options (e.g. departments). */
export const MeetingFormOptionsMultiSelect = forwardRef<
  HTMLDivElement,
  {
    value?: string[];
    onChange?: (ids: string[]) => void;
    options: { value: string; label: string }[];
    hint: string;
    'data-cy'?: string;
  }
>(function MeetingFormOptionsMultiSelect(
  { value, onChange, options, hint, 'data-cy': dataCy },
  ref,
) {
  const ids = Array.isArray(value) ? value : [];
  const setIds = (next: string[]) => onChange?.(next);

  return (
    <div ref={ref} data-cy={dataCy}>
      <div className="custom-centered-select-wrapper always-show-placeholder-wrap relative">
        <Select
          mode="multiple"
          showSearch
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          maxTagCount={0}
          maxTagPlaceholder={() => null}
          value={ids}
          onChange={(v) => setIds(Array.isArray(v) ? (v as string[]) : [])}
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName="custom-assignee-dropdown"
          dropdownClassName="custom-assignee-dropdown"
          options={options}
        />
        <HintOverlay text={hint} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => {
          const opt = options.find((o) => String(o.value) === String(id));
          return (
            <TagChip
              key={id}
              label={opt?.label ?? id}
              onRemove={() => setIds(ids.filter((x) => x !== id))}
              data-cy={`${dataCy}-tag-${id}`}
            />
          );
        })}
      </div>
    </div>
  );
});
MeetingFormOptionsMultiSelect.displayName = 'MeetingFormOptionsMultiSelect';

/** Single plain option (meeting type, template). */
export const MeetingFormOptionsSingleSelect = forwardRef<
  HTMLDivElement,
  {
    value?: string;
    onChange?: (v: string | undefined) => void;
    options: { value: string; label: string }[];
    hint: string;
    'data-cy'?: string;
  }
>(function MeetingFormOptionsSingleSelect(
  { value, onChange, options, hint, 'data-cy': dataCy },
  ref,
) {
  const id = value;
  const setId = (next: string | undefined) => onChange?.(next);

  return (
    <div ref={ref} data-cy={dataCy}>
      <div className="custom-centered-select-wrapper always-show-placeholder-wrap relative">
        <Select
          showSearch
          allowClear
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          value={id}
          onChange={(v) => setId(v as string | undefined)}
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName="custom-assignee-dropdown"
          dropdownClassName="custom-assignee-dropdown"
          options={options}
        />
        <HintOverlay text={hint} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {id ? (
          <TagChip
            label={
              options.find((o) => String(o.value) === String(id))?.label ?? id
            }
            onRemove={() => setId(undefined)}
            data-cy={`${dataCy}-tag`}
          />
        ) : null}
      </div>
    </div>
  );
});
MeetingFormOptionsSingleSelect.displayName = 'MeetingFormOptionsSingleSelect';
