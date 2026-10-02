'use client';

import React from 'react';
import { Card, Dropdown, MenuProps, Tag } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import ObjectiveTypeAssignmentModal from './_components/assignment-modal';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import EmptyState from '@/components/empty';
import {
  ObjectiveTypeAssignment,
  useObjectiveTypeAssignmentStore,
} from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypeAssignmentStore';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';

const assigneeTypeLabel: Record<string, string> = {
  role: 'Role',
  department: 'Department',
  individual: 'Individual',
};

const ObjectiveTypeAssignmentPage = () => {
  const {
    assignments,
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    selectedAssignment,
    setSelectedAssignment,
    removeAssignment,
  } = useObjectiveTypeAssignmentStore();
  const objectiveTypes = useObjectiveTypesStore((s) => s.types);

  const onClose = () => {
    setOpen(false);
    setSelectedAssignment(null);
  };

  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };

  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeletedId('');
  };

  const handleEdit = (value: ObjectiveTypeAssignment) => {
    setSelectedAssignment(value);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    removeAssignment(id);
    onCloseDeleteModal();
  };

  const getTypeName = (typeId: string) =>
    objectiveTypes.find((t) => t.id === typeId)?.name || 'Unknown type';

  const getMenuItems = (item: ObjectiveTypeAssignment): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <div
          className="flex items-center gap-3 py-1"
          onClick={() => handleEdit(item)}
          data-cy={`okr-objective-type-assignment-edit-${item.id}`}
        >
          <MdModeEditOutline className="text-[#595959] text-xl" />
          <span
            className="text-[15px] text-[#262626]"
            data-cy={`okr-objective-type-assignment-edit-label-${item.id}`}
          >
            Edit
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: (
        <div
          className="flex items-center gap-3 py-1 text-red-600"
          onClick={() => showDeleteModal(item.id)}
          data-cy={`okr-objective-type-assignment-delete-${item.id}`}
        >
          <MdDeleteForever className="text-xl" />
          <span
            className="text-[15px]"
            data-cy={`okr-objective-type-assignment-delete-label-${item.id}`}
          >
            Delete
          </span>
        </div>
      ),
    },
  ];

  return (
    <div
      className="w-full"
      id="okr-objective-type-assignment-container"
      data-cy="okr-objective-type-assignment-container"
    >
      {assignments.length === 0 ? (
        <EmptyState
          title="No type assignments yet"
          description="Assign objective types and weights to roles, departments, or individuals. Weights must total 100% per assignee."
          data-cy="okr-objective-type-assignment-empty"
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-cy="okr-objective-type-assignment-cards-grid"
        >
          {assignments.map((item) => (
            <Card
              key={item.id}
              bordered={false}
              className="rounded-xl hover:shadow-sm transition-shadow"
              style={{ background: '#F9FAFB', boxShadow: 'none' }}
              bodyStyle={{ padding: '16px' }}
              data-cy={`okr-objective-type-assignment-card-${item.id}`}
            >
              <div
                className="flex items-start justify-between gap-2 mb-3"
                data-cy={`okr-objective-type-assignment-card-header-${item.id}`}
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy={`okr-objective-type-assignment-card-meta-${item.id}`}
                >
                  <p
                    className="text-sm font-semibold text-gray-800 m-0 leading-5 truncate"
                    data-cy={`okr-objective-type-assignment-card-title-${item.id}`}
                  >
                    {item.assigneeLabel}
                  </p>
                  <p
                    className="text-xs text-gray-400 m-0 mt-1"
                    data-cy={`okr-objective-type-assignment-card-type-${item.id}`}
                  >
                    {assigneeTypeLabel[item.assigneeType] || item.assigneeType}
                  </p>
                </div>
                <Dropdown
                  menu={{ items: getMenuItems(item) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors bg-transparent border-none cursor-pointer p-0"
                    onClick={(e) => e.stopPropagation()}
                    data-cy={`okr-objective-type-assignment-menu-${item.id}`}
                  >
                    <MoreHorizIcon style={{ fontSize: 18 }} />
                  </button>
                </Dropdown>
              </div>

              <div
                className="flex flex-wrap gap-2"
                data-cy={`okr-objective-type-assignment-chips-${item.id}`}
              >
                {item.items.map((row) => (
                  <Tag
                    key={`${item.id}-${row.objectiveTypeId}`}
                    className="m-0 rounded-md border border-gray-200 bg-white text-gray-700 px-2 py-0.5"
                  >
                    {getTypeName(row.objectiveTypeId)} · {row.weight}%
                  </Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ObjectiveTypeAssignmentModal
        assignment={selectedAssignment}
        open={open}
        onClose={onClose}
      />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => handleDelete(deletedId)}
        onCancel={onCloseDeleteModal}
      />
    </div>
  );
};

export default ObjectiveTypeAssignmentPage;
