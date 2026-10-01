'use client';

import React from 'react';
import { Card, Dropdown, MenuProps } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import ObjectiveTypeModal from './_components/objective-type-modal';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import EmptyState from '@/components/empty';
import {
  ObjectiveType,
  useObjectiveTypesStore,
} from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';

const ObjectiveTypesPage = () => {
  const {
    types,
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    selectedType,
    setSelectedType,
    removeType,
  } = useObjectiveTypesStore();

  const onClose = () => {
    setOpen(false);
    setSelectedType(null);
  };

  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };

  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeletedId('');
  };

  const handleEditModal = (value: ObjectiveType) => {
    setSelectedType(value);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    removeType(id);
    onCloseDeleteModal();
  };

  const getMenuItems = (item: ObjectiveType): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <div
          className="flex items-center gap-3 py-1"
          onClick={() => handleEditModal(item)}
          id={`okr-objective-type-card-edit-menu-item-${item.id}`}
          data-cy={`okr-objective-type-card-edit-menu-item-${item.id}`}
        >
          <MdModeEditOutline className="text-[#595959] text-xl" />
          <span
            className="text-[15px] text-[#262626]"
            data-cy={`okr-objective-type-card-edit-text-${item.id}`}
          >
            Edit
          </span>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: (
        <div
          className="flex items-center gap-3 py-1 text-red-600"
          onClick={() => showDeleteModal(item.id)}
          id={`okr-objective-type-card-delete-menu-item-${item.id}`}
          data-cy={`okr-objective-type-card-delete-menu-item-${item.id}`}
        >
          <MdDeleteForever className="text-xl" />
          <span
            className="text-[15px]"
            data-cy={`okr-objective-type-card-delete-text-${item.id}`}
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
      id="okr-objective-types-container"
      data-cy="okr-objective-types-container"
    >
      {types.length === 0 ? (
        <EmptyState
          title="No objective types yet"
          description="Add a type to get started. Weights must total 100%."
          data-cy="okr-objective-types-empty"
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          id="okr-objective-types-cards-grid"
          data-cy="okr-objective-types-cards-grid"
        >
          {types.map((item) => (
            <Card
              key={item.id}
              bordered={false}
              className="rounded-xl hover:shadow-sm transition-shadow"
              style={{ background: '#F9FAFB', boxShadow: 'none' }}
              bodyStyle={{ padding: '16px' }}
              id={`okr-objective-type-card-${item.id}`}
              data-cy={`okr-objective-type-card-${item.id}`}
            >
              <div
                className="flex items-start justify-between gap-2 mb-4"
                data-cy={`okr-objective-type-card-header-${item.id}`}
              >
                <p
                  className="flex-1 min-w-0 text-sm font-semibold text-gray-800 m-0 leading-5"
                  id={`okr-objective-type-card-name-${item.id}`}
                  data-cy={`okr-objective-type-card-name-${item.id}`}
                >
                  {item.name}
                </p>
                <div
                  className="shrink-0"
                  id={`okr-objective-type-card-menu-wrapper-${item.id}`}
                  data-cy={`okr-objective-type-card-menu-wrapper-${item.id}`}
                >
                  <Dropdown
                    menu={{ items: getMenuItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors bg-transparent border-none cursor-pointer p-0"
                      onClick={(e) => e.stopPropagation()}
                      data-cy={`okr-objective-type-card-menu-button-${item.id}`}
                    >
                      <MoreHorizIcon
                        style={{ fontSize: 18 }}
                        data-cy={`okr-objective-type-card-menu-icon-${item.id}`}
                      />
                    </button>
                  </Dropdown>
                </div>
              </div>

              <div
                className="flex items-end justify-between"
                data-cy={`okr-objective-type-card-footer-${item.id}`}
              >
                <div
                  data-cy={`okr-objective-type-card-weight-block-${item.id}`}
                >
                  <p
                    className="text-lg font-bold text-gray-800 m-0 leading-6"
                    id={`okr-objective-type-card-weight-${item.id}`}
                    data-cy={`okr-objective-type-card-weight-${item.id}`}
                  >
                    {item.weight}%
                  </p>
                  <p
                    className="text-xs text-gray-400 m-0 mt-0.5"
                    data-cy={`okr-objective-type-card-weight-label-${item.id}`}
                  >
                    Total %
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ObjectiveTypeModal
        objectiveType={selectedType}
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

export default ObjectiveTypesPage;
