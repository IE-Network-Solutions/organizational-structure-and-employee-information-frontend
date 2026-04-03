'use client';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/mutation';
import { useGetCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/queries';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import CustomFieldsDrawer from '../customFieldsDrawer';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

function fieldTypeToLabel(fieldType: string | undefined): string {
  if (!fieldType) return 'Short text';
  const map: Record<string, string> = {
    short_text: 'Short text',
    paragraph: 'Paragraph',
    multiple_choice: 'Multiple choice',
    checkbox: 'Checkbox',
  };
  return map[fieldType] ?? fieldType;
}

const canUpdate = () =>
  AccessGuard.checkAccess({ permissions: [Permissions.UpdateCustomFields] });
const canDelete = () =>
  AccessGuard.checkAccess({ permissions: [Permissions.DeleteCustomFields] });

const CustomFieldsCard: React.FC = () => {
  const {
    setEditCustomFieldsModalOpen,
    setEditingQuestion,
    editingQuestion,
    deletingQuestionId,
    editCustomFieldsModalOpen,
    setDeletingQuestionId,
    deleteModal,
    setDeleteModal,
  } = useRecruitmentSettingsStore();

  const { data: customFields, isLoading: isCustomFieldsLoading } =
    useGetCustomFieldsTemplate(100, 1);

  const { mutate: deleteCustomField } = useDeleteCustomFieldsTemplate();
  const handleCustomFieldsModalOpen = (question: any) => {
    setEditingQuestion(question);
    setEditCustomFieldsModalOpen(true);
  };

  const handleDeleteModalOpen = (questions: any) => {
    setDeleteModal(true);
    setDeletingQuestionId(questions?.id);
  };

  const handleDelete = () => {
    deleteCustomField(deletingQuestionId);
    setDeleteModal(false);
  };

  const handleCloseDrawer = () => {
    setEditCustomFieldsModalOpen(false);
  };

  if (isCustomFieldsLoading)
    return (
      <div
        className="flex justify-center items-center h-64"
        data-cy="talent-acquisition-custom-fields-card-loading"
      >
        <Spin
          size="large"
          data-cy="talent-acquisition-custom-fields-card-spin"
        />
      </div>
    );

  return (
    <>
      {customFields?.items && customFields?.items?.length > 0 ? (
        customFields?.items.map((templateItem: any, index: number) => {
          const form = templateItem?.form;
          const formFirst = Array.isArray(form) ? form[0] : form;
          const firstQuestion = templateItem?.questions?.[0] ?? formFirst;
          const fieldType = firstQuestion?.fieldType;
          const typeLabel = fieldTypeToLabel(fieldType);
          const displayTitle =
            templateItem?.title ?? firstQuestion?.question ?? 'Untitled';

          const menuItems: MenuProps['items'] = [
            canUpdate() && {
              key: 'edit',
              label: 'Edit',
              icon: <Pencil size={14} />,
              onClick: () => handleCustomFieldsModalOpen(templateItem),
            },
            canDelete() && {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDeleteModalOpen(templateItem),
            },
          ].filter(Boolean) as MenuProps['items'];

          const showMenu = menuItems && menuItems.length > 0;

          return (
            <div
              key={templateItem?.id ?? index}
              className="recruitment-settings-card relative p-4"
              data-cy="recruitment-recruitment-settings-customfields-customfieldscard-index-tsx-div-85"
            >
              {showMenu && (
                <div
                  className="absolute top-3 right-3"
                  data-cy="talent-acquisition-custom-fields-card-menu-wrapper"
                >
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="recruitment-settings-dropdown-overlay"
                  >
                    <button
                      type="button"
                      className="recruitment-settings-more-btn p-1 text-gray-500"
                      data-cy={`talent-acquisition-custom-fields-card-menu-${templateItem?.id}`}
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </Dropdown>
                </div>
              )}
              <h3
                className="recruitment-settings-question-title text-[16px] font-normal pr-8"
                data-cy={`talent-acquisition-custom-fields-card-title-${templateItem?.id}`}
              >
                {displayTitle}
              </h3>
              <span
                className="recruitment-settings-card-type-pill inline-block mt-2 px-2.5 py-0.5 rounded"
                data-cy={`talent-acquisition-custom-fields-card-type-${templateItem?.id}`}
              >
                {typeLabel}
              </span>
            </div>
          );
        })
      ) : (
        <div
          data-cy="settings-customfields-customfieldscard-index-tsx-index-div-122"
          className="text-center py-8 text-gray-500 rounded-lg border border-gray-200"
        >
          No custom fields available.
        </div>
      )}
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
      {editCustomFieldsModalOpen && (
        <CustomFieldsDrawer
          question={editingQuestion}
          onClose={handleCloseDrawer}
          isEdit={editCustomFieldsModalOpen}
        />
      )}
    </>
  );
};

export default CustomFieldsCard;
