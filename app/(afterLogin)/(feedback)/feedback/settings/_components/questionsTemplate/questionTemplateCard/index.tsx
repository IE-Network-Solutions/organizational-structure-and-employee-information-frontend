'use client';
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useFetchQuestionTemplate } from '@/store/server/features/feedback/settings/queries';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';
import FeedbackPagination from '../../../../_components/feedbackPagination';
import EditQuestionTemplate from './questionTemplateEdit';
import { Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const QuestionTemplateCard: React.FC<any> = () => {
  const {
    templateCurrentPage,
    templatePageSize,
    setTemplateCurrentPage,
    setTemplatePageSize,
    deletingQuestionId,
    setDeletingQuestionId,
    deleteModal,
    setQuestionModal,
    setDeleteModal,
    editingQuestion,
    setEditingQuestion,
  } = useCustomQuestionTemplateStore();

  const { data: questionTemplate, isLoading: isTemplateLoading } =
    useFetchQuestionTemplate(templatePageSize, templateCurrentPage);

  const { mutate: deleteTemplate } = useDeleteQuestionTemplate();

  const handleQuestionModalOpen = (question: any) => {
    setEditingQuestion(question);
    setQuestionModal(true);
  };
  const handleQuestionModalClose = () => {
    setQuestionModal(false);
  };

  const handleDeleteModalOpen = (questions: any) => {
    setDeleteModal(true);
    setDeletingQuestionId(questions?.id);
  };

  const handleDelete = () => {
    deleteTemplate(deletingQuestionId);
    setDeleteModal(false);
  };

  if (isTemplateLoading)
    return (
      <div
        className="flex justify-center items-center h-64"
        data-cy="question-template-card-loading"
      >
        <Spin size="large" />
      </div>
    );

  return (
    <>
      {questionTemplate?.items && questionTemplate?.items?.length > 0 ? (
        questionTemplate?.items?.map((questions: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
            data-cy={`question-template-card-${questions?.id}`}
            id={`questionTemplateCard${questions?.id}`}
          >
            <div
              className="text-medium font-medium"
              data-cy={`question-template-card-name-${questions?.id}`}
              id={`questionTemplateCardName${questions?.id}`}
            >
              {questions?.customFieldName}
            </div>
            <div
              className="flex items-center justify-center gap-2"
              data-cy={`question-template-card-actions-${questions?.id}`}
              id={`questionTemplateCardActions${questions?.id}`}
            >
              <AccessGuard
                permissions={[Permissions.UpdateCustomFields]}
                data-cy="question-template-card-edit-button-access-guard"
                id="questionTemplateCardEditButtonAccessGuard"
              >
                <div
                  className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center"
                  data-cy={`question-template-card-edit-container-${questions?.id}`}
                  id={`questionTemplateCardEditContainer${questions?.id}`}
                >
                  <Pencil
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handleQuestionModalOpen(questions)}
                    data-cy={`question-template-card-edit-icon-${questions?.id}`}
                    id={`questionTemplateCardEditIcon${questions?.id}`}
                  />
                </div>
              </AccessGuard>
              <AccessGuard
                permissions={[Permissions.DeleteCustomFields]}
                data-cy="question-template-card-delete-button-access-guard"
                id="questionTemplateCardDeleteButtonAccessGuard"
              >
                <div
                  className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center"
                  data-cy={`question-template-card-delete-container-${questions?.id}`}
                  id={`questionTemplateCardDeleteContainer${questions?.id}`}
                >
                  <Trash2
                    size={15}
                    className="text-white cursor-pointer"
                    onClick={() => handleDeleteModalOpen(questions)}
                    data-cy={`question-template-card-delete-icon-${questions?.id}`}
                    id={`questionTemplateCardDeleteIcon${questions?.id}`}
                  />
                </div>
              </AccessGuard>
            </div>
          </div>
        ))
      ) : (
        <div
          className="text-center my-5"
          data-cy="question-template-card-empty"
          id="questionTemplateCardEmpty"
        >
          No questions available.
        </div>
      )}
      <FeedbackPagination
        current={templateCurrentPage}
        total={questionTemplate?.meta?.totalItems ?? 1}
        pageSize={templatePageSize}
        onChange={(page, pageSize) => {
          setTemplateCurrentPage(page);
          setTemplatePageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setTemplatePageSize(size);
          setTemplateCurrentPage(1);
        }}
        data-cy="question-template-card-pagination"
      />
      <EditQuestionTemplate
        question={editingQuestion}
        onClose={handleQuestionModalClose}
        data-cy="question-template-card-edit-modal"
      />
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        data-cy="question-template-card-delete-modal"
      />
    </>
  );
};

export default QuestionTemplateCard;
