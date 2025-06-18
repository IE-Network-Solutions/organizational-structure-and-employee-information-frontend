import React from 'react';
import { Col, Form, Pagination, Row, Tooltip, Tag, Divider } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedQuestionsByFormId } from '@/store/server/features/organization-development/categories/queries';
import { QuestionsType } from '@/store/server/features/organization-development/categories/interface';
import CheckboxField from './checkboxField';
import TimeField from './timeField';
import DropdownField from './dropdownField';
import RadioField from './radioField';
import { EmptyImage } from '@/components/emptyIndicator';
import { FieldType } from '@/types/enumTypes';
import { Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import EditQuestion from './editQuestions';
import { useDeleteQuestions } from '@/store/server/features/feedback/question/mutation';
import CustomButton from '@/components/common/buttons/customButton';
import { PlusOutlined } from '@ant-design/icons';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import Question from '../../../../_components/questions';

interface Params {
  id: string;
}

// Add a mapping for user-friendly field type labels
const FIELD_TYPE_LABELS: Record<string, string> = {
  [FieldType.MULTIPLE_CHOICE]: 'Multiple Choice',
  [FieldType.CHECKBOX]: 'Checkbox',
  [FieldType.SHORT_TEXT]: 'Short Text',
  [FieldType.PARAGRAPH]: 'Paragraph',
  [FieldType.TIME]: 'Time',
  [FieldType.DROPDOWN]: 'Dropdown',
  [FieldType.RADIO]: 'Radio',
};

// Add a mapping for tag colors
const FIELD_TYPE_COLORS: Record<string, string> = {
  [FieldType.MULTIPLE_CHOICE]: 'blue',
  [FieldType.CHECKBOX]: 'green',
  [FieldType.SHORT_TEXT]: 'gold',
  [FieldType.PARAGRAPH]: 'orange',
  [FieldType.TIME]: 'purple',
  [FieldType.DROPDOWN]: 'cyan',
  [FieldType.RADIO]: 'magenta',
};

const Questions = ({ id }: Params) => {
  const {setIsDrawerOpen} = useDynamicFormStore();
  const {setSelectedFormId} = CategoriesManagementStore();
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
  const showQuestionDrawer = (formId: string) => {
    setIsDrawerOpen(true);
    setSelectedFormId(formId);
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
        <CustomButton
            title="Create New Question"
            id="createQuestionButton"
            icon={<PlusOutlined className="mr-2" />}
            onClick={()=>{showQuestionDrawer(id)}}
            className="bg-blue-600 hover:bg-blue-700"
          />  
          {questionsData && questionsData?.meta?.totalPages !== 0 ? (
            questionsData?.items?.map((q: QuestionsType) => (
              <Row gutter={16} key={q.id}>
                <Col xs={24} sm={24}>
                  <div className="question-block mb-8 p-6 rounded-lg shadow-sm bg-gray-50 w-full">
                    <div className="flex items-center justify-between mb-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{q.question}</span>
                        <Tag
                          color={FIELD_TYPE_COLORS[q.fieldType] || 'default'}
                          className="ml-2"
                        >
                          {FIELD_TYPE_LABELS[q.fieldType] || q.fieldType}
                        </Tag>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip title="Edit" placement="top">
                          <div
                            className="bg-white w-7 h-7 rounded-md border border-[#2f78ee] flex items-center justify-center hover:bg-blue-50 transition-colors"
                            aria-label="Edit question"
                          >
                            <Pencil
                              size={16}
                              className="text-[#2f78ee] cursor-pointer"
                              onClick={() => handleEditModal(q)}
                            />
                          </div>
                        </Tooltip>
                        <Tooltip title="Delete" placement="top">
                          <div
                            className="bg-white w-7 h-7 rounded-md border border-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                            aria-label="Delete question"
                          >
                            <Trash2
                              size={16}
                              className="text-red-400 cursor-pointer"
                              onClick={() => handleDeleteModal(q)}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                    <Divider />
                    <div key={q.id} className="">
                      {q?.fieldType === FieldType.MULTIPLE_CHOICE && (
                        <div className="mt-2 flex flex-col gap-1 pl-4">
                          {q?.field?.map((choice: any, index: number) => (
                            <span
                              key={choice.id || index}
                              className="text-sm text-gray-600"
                            >
                              {index + 1}. {choice.value}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* {q?.fieldType === FieldType.SHORT_TEXT && (
                       <></>
                      )} */}
                      {q?.fieldType === FieldType.CHECKBOX && (
                        <div className="w-full px-4 py-2 rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200 mb-2">
                          <CheckboxField options={q?.field} />
                        </div>
                      )}
                      {/* {q?.fieldType === FieldType.PARAGRAPH && (
                       <></>
                      )} */}
                      {q?.fieldType === FieldType.TIME && (
                        <div className="w-full px-4 py-2 rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200 mb-2">
                          <TimeField />
                        </div>
                      )}
                      {q?.fieldType === FieldType.DROPDOWN && (
                        <div className="w-full px-4 py-2 rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200 mb-2">
                          <DropdownField options={q?.field} />
                        </div>
                      )}
                      {q?.fieldType === FieldType.RADIO && (
                        <div className="w-full px-4 py-2 rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-200 mb-2">
                          <RadioField options={q?.field} />
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <EmptyImage />
              <div className="mt-4 text-gray-500 text-lg">
                No questions found. Please add a question to get started!
              </div>
            </div>
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
      <Question selectedFormId={id} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default Questions;
