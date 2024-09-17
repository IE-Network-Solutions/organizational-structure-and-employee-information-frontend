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
interface Params {
  id: string;
}
const Questions = ({ id }: Params) => {
  const { current, setCurrent, pageSize, setPageSize, searchTitle } =
    useOrganizationalDevelopment();
  // const { data: questionsData } = useFetchedQuestions(id,searchTitle);
  const { data: questionsData } = useFetchedQuestionsByFormId(id, searchTitle);

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  return (
    <div>
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
                  <div className="flex items-center justify-start">
                    <Form.Item
                      label={q.question}
                      key={q.id}
                      required
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
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
                      <div className="flex items-center justify-end gap-2">
                        <div className="bg-[#2f78ee] w-5 h-5 rounded-md flex items-center justify-center">
                          <Pencil
                            size={12}
                            className="text-white cursor-pointer"
                            // onClick={() => handleQuestionModalOpen(questions)}
                          />
                        </div>
                        <div className="bg-[#e03137] w-5 h-5 rounded-md flex items-center justify-center">
                          <Trash2
                            size={12}
                            className="text-white cursor-pointer"
                            // onClick={() => handleDeleteModalOpen(questions)}
                          />
                        </div>
                      </div>
                    </Form.Item>
                    <Form.Item>Hello</Form.Item>
                  </div>
                </Col>
              </Row>
            ))
          ) : (
            <EmptyImage />
          )}
          {questionsData && questionsData?.meta.totalPages !== 0 && (
            <Pagination
              className="flex justify-end"
              total={questionsData?.meta.totalPages}
              current={current}
              pageSize={pageSize}
              showSizeChanger={true}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
            />
          )}
        </>
      </Form>
    </div>
  );
};

export default Questions;
