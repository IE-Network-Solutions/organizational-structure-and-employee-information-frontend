import React from 'react';
import { Col, Form, Pagination, Row } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedQuestionsByFormId } from '@/store/server/features/organization-development/categories/queries';
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';
import ShortTextField from './shortTextField';
import MultipleChoiceField from './multipleChoiceField';
import CheckboxField from './checkboxField';
import ParagraphField from './paragraphField';
import TimeField from './timeField';
import DropdownField from './dropdownField';
import RadioField from './radioField';
import { EmptyImage } from '@/components/emptyIndicator';
import { FieldType } from '@/types/enumTypes';
import { Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import EditQuestion from './editQuestions';
import { useDeleteQuestions } from '@/store/server/features/feedback/question/mutation';
interface Params {
  id: string;
}
const Questions = ({ id }: Params) => {
  const {
    current,
    setCurrent,
    pageSize,
    setPageSize,
    searchTitle,
    setIsEditModalOpen,
    isDeleteModalOpen,
    deleteItemId,
    setIsDeleteModalOpen,
    setEditItemId,
    setDeleteItemId,
  } = useOrganizationalDevelopment();
  const { data: questionsData } = useFetchedQuestionsByFormId(id, searchTitle);
  const { mutate: deleteQuestion } = useDeleteQuestions();

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handleEditModal = (question: any) => {
    setIsEditModalOpen(true);
    setEditItemId(question?.id);
  };

  const handleDeleteModal = (question: any) => {
    setDeleteItemId(question?.id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    deleteQuestion(deleteItemId);
  };

  return (
    <div className="bg-white h-auto w-full p-4">
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <>
          {questionsData && questionsData?.meta?.totalPages !== 0 ? (
            questionsData?.items?.map((q: QuestionsType) => (
              <Row gutter={16} key={q.id}>
                <Col xs={24} sm={24}>
                  <div className="flex flex-col justify-center items-start w-full h-auto">
                    <div className="flex items-center justify-end gap-8 pb-3">
                      <div> {q.question}</div>
                      <div className="flex items-center justify-center gap-1">
                        <div className="bg-white w-5 h-5 rounded-md border border-[#2f78ee] flex items-center justify-center">
                          <Pencil
                            size={12}
                            className="text-[#2f78ee] cursor-pointer"
                            onClick={() => handleEditModal(q)}
                          />
                        </div>
                        <div className="bg-white w-5 h-5 rounded-md border border-red-500 flex items-center justify-center">
                          <Trash2
                            size={12}
                            className="text-red-400 cursor-pointer"
                            onClick={() => handleDeleteModal(q)}
                          />
                        </div>
                      </div>
                    </div>
                    <Form.Item
                      key={q.id}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                      className="mx-3 mb-8"
                    >
                      {q?.fieldType === FieldType.MULTIPLE_CHOICE && (
                        <MultipleChoiceField
                          choices={q?.field}
                          selectedAnswer={[]}
                        />
                      )}
                      {q?.fieldType === FieldType.SHORT_TEXT && (
                        <ShortTextField />
                      )}
                      {q?.fieldType === FieldType.CHECKBOX && (
                        <CheckboxField options={q?.field} />
                      )}
                      {q?.fieldType === FieldType.PARAGRAPH && (
                        <ParagraphField />
                      )}
                      {q?.fieldType === FieldType.TIME && <TimeField />}
                      {q?.fieldType === FieldType.DROPDOWN && (
                        <DropdownField options={q?.field} />
                      )}
                      {q?.fieldType === FieldType.RADIO && (
                        <RadioField options={q?.field} />
                      )}
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            ))
          ) : (
            <EmptyImage />
          )}
          {questionsData && questionsData?.meta.totalPages !== 0 && (
            <Row justify="end">
              <Col>
                <Pagination
                  total={questionsData?.meta.totalPages}
                  current={current}
                  pageSize={pageSize}
                  showSizeChanger={true}
                  onChange={onPageChange}
                  onShowSizeChange={onPageChange}
                />
              </Col>
            </Row>
          )}
        </>
      </Form>

      <EditQuestion id={id} />
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Questions;
