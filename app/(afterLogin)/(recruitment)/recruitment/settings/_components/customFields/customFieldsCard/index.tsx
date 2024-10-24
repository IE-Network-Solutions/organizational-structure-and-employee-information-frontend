import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/mutation';
import { useGetCustomFieldsTemplate } from '@/store/server/features/recruitment/settings/queries';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import { Spin } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import CustomFieldsDrawer from '../customFieldsDrawer';
import RecruitmentPagination from '../../../../_components';

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

  const { data: customFields, isLoading: isCustomFieldsLoading } =
    useGetCustomFieldsTemplate();

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
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  return (
    <>
      {customFields?.items && customFields?.items?.length > 0 ? (
        customFields?.items.map((questions: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
          >
            <div className="text-medium font-medium">{questions?.title}</div>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
                <Pencil
                  size={15}
                  className="text-white cursor-pointer"
                  onClick={() => handleCustomFieldsModalOpen(questions)}
                />
              </div>
              <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
                <Trash2
                  size={15}
                  className="text-white cursor-pointer"
                  onClick={() => handleDeleteModalOpen(questions)}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center my-5">No custom fields available.</div>
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
      <RecruitmentPagination
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
      />
    </>
  );
};

export default CustomFieldsCard;
