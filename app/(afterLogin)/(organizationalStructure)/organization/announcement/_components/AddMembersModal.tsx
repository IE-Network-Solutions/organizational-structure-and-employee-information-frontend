'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Avatar, Checkbox, Input, Modal, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { SpaceMember } from './mockAnnouncementService';
import { collaborationColors } from './collaborationColors';

type AddMembersModalProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  members: SpaceMember[];
  loading?: boolean;
  emptyText?: string;
  onClose: () => void;
  onAdd: (memberIds: string[]) => void;
};

const AddMembersModal = ({
  open,
  title,
  description,
  members,
  loading = false,
  emptyText = 'No members available to add.',
  onClose,
  onAdd,
}: AddMembersModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setSelectedIds([]);
  }, [open]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query),
    );
  }, [members, search]);

  const toggleMember = (memberId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, memberId]))
        : current.filter((id) => id !== memberId),
    );
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    onAdd(selectedIds);
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={handleAdd}
      okText="Add"
      okButtonProps={{
        disabled: selectedIds.length === 0 || loading,
        icon: <PlusOutlined />,
      }}
      width={420}
      destroyOnClose
      data-cy="announcement-add-members-modal"
    >
      {description ? (
        <p
          data-cy="organization-announcement-components-addmembersmodal-tsx-addmembersmodal-p-77"
          className="mb-3 text-sm text-gray-500"
        >
          {description}
        </p>
      ) : null}
      <Input
        allowClear
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Search org employees..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-3"
        data-cy="announcement-add-members-search"
      />
      <div
        className="flex max-h-[280px] flex-col gap-1 overflow-y-auto"
        data-cy="announcement-add-members-list"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spin size="small" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <p
            className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-400"
            data-cy="announcement-add-members-empty"
          >
            {members.length === 0 ? emptyText : 'No members match your search.'}
          </p>
        ) : (
          filteredMembers.map((member) => (
            <label
              key={member.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 hover:bg-gray-50"
              data-cy={`announcement-add-members-row-${member.id}`}
            >
              <Checkbox
                checked={selectedIds.includes(member.id)}
                onChange={(event) =>
                  toggleMember(member.id, event.target.checked)
                }
                data-cy={`announcement-add-members-check-${member.id}`}
              />
              <Avatar
                size={32}
                src={member.avatarUrl || undefined}
                icon={!member.avatarUrl ? <UserOutlined /> : undefined}
                style={{
                  backgroundColor: member.avatarUrl
                    ? undefined
                    : collaborationColors.primary,
                }}
              />
              <span
                data-cy="organization-announcement-components-addmembersmodal-tsx-addmembersmodal-span-123"
                className="min-w-0 flex-1"
              >
                <span
                  data-cy="organization-announcement-components-addmembersmodal-tsx-addmembersmodal-span-124"
                  className="block truncate text-sm font-medium text-gray-900"
                >
                  {member.name}
                </span>
                {member.email ? (
                  <span
                    data-cy="organization-announcement-components-addmembersmodal-tsx-addmembersmodal-span-128"
                    className="block truncate text-xs text-gray-400"
                  >
                    {member.email}
                  </span>
                ) : null}
              </span>
            </label>
          ))
        )}
      </div>
    </Modal>
  );
};

export default AddMembersModal;
