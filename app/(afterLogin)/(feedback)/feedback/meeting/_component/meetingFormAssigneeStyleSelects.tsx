'use client';

import React, { forwardRef, useState } from 'react';
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
    background-color: #ffffff !important;
  }
  .add-meeting-form .custom-centered-select-wrapper .ant-select-focused .ant-select-selector,
  .add-meeting-form .custom-centered-select-wrapper .ant-select-open .ant-select-selector {
    background-color: #ffffff !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-placeholder {
    display: none !important;
  }
  .add-meeting-form .custom-centered-select-wrapper.always-show-placeholder-wrap .always-show-placeholder .ant-select-selection-item {
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

function HintOverlay({
  text,
  'data-cy': hintDataCy = 'meeting-form-assignee-hint-overlay',
}: {
  text: string;
  'data-cy'?: string;
}) {
  return (
    <span
      className="pointer-events-none absolute left-3 z-10 font-normal text-[#8c8c8c]"
      style={{ lineHeight: '40px' }}
      data-cy={hintDataCy}
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
      <span
        className="text-[14px] text-[#595959]"
        data-cy={dataCy ? `${dataCy}-label` : 'meeting-form-tag-chip-label'}
      >
        {label}
      </span>
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
  const [searchValue, setSearchValue] = useState('');

  return (
    <div ref={ref} data-cy={dataCy}>
      <div
        className="custom-centered-select-wrapper always-show-placeholder-wrap relative"
        data-cy={
          dataCy
            ? `${dataCy}-select-wrap`
            : 'meeting-form-user-multi-select-wrap'
        }
      >
        <Select
          mode="multiple"
          showSearch
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          maxTagCount={0}
          maxTagPlaceholder={() => null}
          searchValue={searchValue}
          onSearch={setSearchValue}
          value={ids}
          onChange={(v) => {
            setIds(Array.isArray(v) ? (v as string[]) : []);
            setSearchValue('');
          }}
          onClear={() => setSearchValue('')}
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
              <div
                className="flex items-center gap-3 py-1"
                data-cy={
                  dataCy
                    ? `${dataCy}-option-${user.id}`
                    : `meeting-form-user-multi-option-${user.id}`
                }
              >
                <Avatar
                  size={28}
                  src={user.profileImage}
                  icon={!user.profileImage && <UserOutlined />}
                />
                <div
                  className="flex flex-col"
                  data-cy={
                    dataCy
                      ? `${dataCy}-option-meta-${user.id}`
                      : `meeting-form-user-multi-meta-${user.id}`
                  }
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy={
                      dataCy
                        ? `${dataCy}-option-name-${user.id}`
                        : `meeting-form-user-multi-name-${user.id}`
                    }
                  >
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </span>
                  {user?.email ? (
                    <span
                      className="text-[12px] text-[#8c8c8c]"
                      data-cy={
                        dataCy
                          ? `${dataCy}-option-email-${user.id}`
                          : `meeting-form-user-multi-email-${user.id}`
                      }
                    >
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        {!searchValue ? (
          <HintOverlay
            text={hint}
            data-cy={dataCy ? `${dataCy}-hint` : undefined}
          />
        ) : null}
      </div>
      <div
        className="mt-2 flex flex-wrap gap-2"
        data-cy={dataCy ? `${dataCy}-tags` : 'meeting-form-user-multi-tags'}
      >
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
  const [searchValue, setSearchValue] = useState('');

  return (
    <div ref={ref} data-cy={dataCy}>
      <div
        className="custom-centered-select-wrapper always-show-placeholder-wrap relative"
        data-cy={
          dataCy
            ? `${dataCy}-select-wrap`
            : 'meeting-form-user-single-select-wrap'
        }
      >
        <Select
          showSearch
          allowClear
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          searchValue={searchValue}
          onSearch={setSearchValue}
          value={id}
          onChange={(v) => {
            setId(v as string | undefined);
            setSearchValue('');
          }}
          onClear={() => setSearchValue('')}
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
              <div
                className="flex items-center gap-3 py-1"
                data-cy={
                  dataCy
                    ? `${dataCy}-option-${user.id}`
                    : `meeting-form-user-single-option-${user.id}`
                }
              >
                <Avatar
                  size={28}
                  src={user.profileImage}
                  icon={!user.profileImage && <UserOutlined />}
                />
                <div
                  className="flex flex-col"
                  data-cy={
                    dataCy
                      ? `${dataCy}-option-meta-${user.id}`
                      : `meeting-form-user-single-meta-${user.id}`
                  }
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy={
                      dataCy
                        ? `${dataCy}-option-name-${user.id}`
                        : `meeting-form-user-single-name-${user.id}`
                    }
                  >
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </span>
                  {user?.email ? (
                    <span
                      className="text-[12px] text-[#8c8c8c]"
                      data-cy={
                        dataCy
                          ? `${dataCy}-option-email-${user.id}`
                          : `meeting-form-user-single-email-${user.id}`
                      }
                    >
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        {!searchValue ? (
          <HintOverlay
            text={hint}
            data-cy={dataCy ? `${dataCy}-hint` : undefined}
          />
        ) : null}
      </div>
      <div
        className="mt-2 flex flex-wrap gap-2"
        data-cy={dataCy ? `${dataCy}-tags` : 'meeting-form-user-single-tags'}
      >
        {id ? (
          <TagChip
            label={(() => {
              const u = allUsers?.items?.find(
                (x: any) => String(x.id) === String(id),
              );
              return u
                ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || id
                : id;
            })()}
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
    /** Portaled dropdown: use a unique class when styles are not under `add-meeting-form`. */
    dropdownClassName?: string;
    'data-cy'?: string;
  }
>(function MeetingFormOptionsMultiSelect(
  {
    value,
    onChange,
    options,
    hint,
    dropdownClassName = 'custom-assignee-dropdown',
    'data-cy': dataCy,
  },
  ref,
) {
  const ids = Array.isArray(value) ? value : [];
  const setIds = (next: string[]) => onChange?.(next);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div ref={ref} data-cy={dataCy}>
      <div
        className="custom-centered-select-wrapper always-show-placeholder-wrap relative"
        data-cy={
          dataCy
            ? `${dataCy}-select-wrap`
            : 'meeting-form-options-multi-select-wrap'
        }
      >
        <Select
          mode="multiple"
          showSearch
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          maxTagCount={0}
          maxTagPlaceholder={() => null}
          searchValue={searchValue}
          onSearch={setSearchValue}
          value={ids}
          onChange={(v) => {
            setIds(Array.isArray(v) ? (v as string[]) : []);
            setSearchValue('');
          }}
          onClear={() => setSearchValue('')}
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName={dropdownClassName}
          dropdownClassName={dropdownClassName}
          options={options}
        />
        {!searchValue ? (
          <HintOverlay
            text={hint}
            data-cy={dataCy ? `${dataCy}-hint` : undefined}
          />
        ) : null}
      </div>
      <div
        className="mt-2 flex flex-wrap gap-2"
        data-cy={dataCy ? `${dataCy}-tags` : 'meeting-form-options-multi-tags'}
      >
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
  const [searchValue, setSearchValue] = useState('');

  return (
    <div ref={ref} data-cy={dataCy}>
      <div
        className="custom-centered-select-wrapper always-show-placeholder-wrap relative"
        data-cy={
          dataCy
            ? `${dataCy}-select-wrap`
            : 'meeting-form-options-single-select-wrap'
        }
      >
        <Select
          showSearch
          allowClear
          placeholder=""
          className="always-show-placeholder h-10 w-full"
          searchValue={searchValue}
          onSearch={setSearchValue}
          value={id}
          onChange={(v) => {
            setId(v as string | undefined);
            setSearchValue('');
          }}
          onClear={() => setSearchValue('')}
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
        {!searchValue ? (
          <HintOverlay
            text={hint}
            data-cy={dataCy ? `${dataCy}-hint` : undefined}
          />
        ) : null}
      </div>
      <div
        className="mt-2 flex flex-wrap gap-2"
        data-cy={dataCy ? `${dataCy}-tags` : 'meeting-form-options-single-tags'}
      >
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
