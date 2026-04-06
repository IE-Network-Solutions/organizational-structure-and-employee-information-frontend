'use client';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/mutation';
import { useGetCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/queries';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { Spin } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import CustomFieldsDrawer from '../customFieldsDrawer';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

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
    templateCurrentPage,
    setTemplateCurrentPage,
    templatePageSize,
    setTemplatePageSize,
  } = useRecruitmentSettingsStore();

  const { isMobile, isTablet } = useIsMobile();

  const { data: customFields, isLoading: isCustomFieldsLoading } =
    useGetCustomFieldsTemplate(templatePageSize, templateCurrentPage);

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

  const onPageChange = (page: number, pageSize?: number) => {
    setTemplateCurrentPage(page);
    if (pageSize) {
      setTemplatePageSize(pageSize);
    }
  };
  const onSizeChange = (size: number) => {
    setTemplatePageSize(size);
    setTemplateCurrentPage(1);
  };

  return (
    <>
      {customFields?.items && customFields?.items?.length > 0 ? (
        customFields?.items.map((questions: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
            data-cy="recruitment-recruitment-settings-customfields-customfieldscard-index-tsx-div-85"
          >
            <div
              className="text-medium font-medium"
              data-cy={`talent-acquisition-custom-fields-card-title-${questions?.id}`}
            >
              {questions?.title}
            </div>
            <div
              data-cy="settings-customfields-customfieldscard-index-tsx-index-div-95"
              className="flex items-center justify-center gap-2"
            >
              <AccessGuard permissions={[Permissions.UpdateCustomFields]}>
                <div
                  data-cy="settings-customfields-customfieldscard-index-tsx-index-div-97"
                  className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center"
                >
                  <Pencil
                    id={`talent-acquisition-custom-fields-button-edit-${questions?.id}`}
                    data-cy={`talent-acquisition-custom-fields-button-edit-${questions?.id}`}
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handleCustomFieldsModalOpen(questions)}
                  />
                </div>
              </AccessGuard>
              <AccessGuard permissions={[Permissions.DeleteCustomFields]}>
                <div
                  data-cy="settings-customfields-customfieldscard-index-tsx-index-div-108"
                  className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center"
                >
                  <Trash2
                    id={`talent-acquisition-custom-fields-button-delete-${questions?.id}`}
                    data-cy={`talent-acquisition-custom-fields-button-delete-${questions?.id}`}
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handleDeleteModalOpen(questions)}
                  />
                </div>
              </AccessGuard>
            </div>
          </div>
        ))
      ) : (
        <div
          data-cy="settings-customfields-customfieldscard-index-tsx-index-div-122"
          className="text-center my-5"
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

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={customFields?.meta?.totalItems ?? 1}
          pageSize={templatePageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={templateCurrentPage}
          total={customFields?.meta?.totalItems ?? 1}
          pageSize={templatePageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
        />
      )}
      {/* <RecruitmentPagination
        current={templateCurrentPage}
        total={customFields?.meta?.totalItems ?? 1}
        pageSize={templatePageSize}
        onChange={(page, pageSize) => {
          setTemplateCurrentPage(page);
          setTemplatePageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setTemplatePageSize(size);
          setTemplateCurrentPage(1);
        }}
      /> */}
    </>
  );
};

export default CustomFieldsCard;
