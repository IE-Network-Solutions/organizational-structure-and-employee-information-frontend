'use client';
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useFetchQuestionTemplate } from '@/store/server/features/feedback/settings/queries';
import CategoryPagination from '../../../categories/_components/categoryPagination';
import { useCustomQuestionTemplateStore } from '@/store/uistate/features/feedback/settings';
import EditQuestion from './questionTemplateEdit';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteQuestionTemplate } from '@/store/server/features/feedback/settings/mutation';

const ODQuestionsDisplay: React.FC<any> = () => {
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

  const { data: questionTemplate } = useFetchQuestionTemplate(
    templatePageSize,
    templateCurrentPage,
  );

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

  return (
    <>
      {questionTemplate?.items && questionTemplate?.items?.length > 0 ? (
        questionTemplate?.items?.map((questions: any) => (
          <div className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4">
            <div className="text-medium font-medium">
              {questions?.customFieldName}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
                <Pencil
                  size={15}
                  className="text-white cursor-pointer"
                  onClick={() => handleQuestionModalOpen(questions)}
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
        <div className="text-center my-5">No questions available.</div>
      )}
      <CategoryPagination
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
      />
      <EditQuestion
        question={editingQuestion}
        onClose={handleQuestionModalClose}
      />
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ODQuestionsDisplay;
