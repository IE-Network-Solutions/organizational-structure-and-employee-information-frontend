import React from 'react';
import { Col, Form, Pagination, Row } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedIndividualResponses } from '@/store/server/features/organization-development/categories/queries';

import { EmptyImage } from '@/components/emptyIndicator';
import { FieldType } from '@/types/enumTypes';
import MultipleChoiceField from '../questions/multipleChoiceField';
import ShortTextField from '../questions/shortTextField';
import CheckboxField from '../questions/checkboxField';
import ParagraphField from '../questions/paragraphField';
import TimeField from '../questions/timeField';
import DropdownField from '../questions/dropdownField';
import RadioField from '../questions/radioField';

interface Params {
  id: string;
}

const IndividualResponses = ({ id }: Params) => {
  const { setCurrent, current, pageSize, setPageSize } =
    useOrganizationalDevelopment();
  const { data: individualresponses } = useFetchedIndividualResponses(id, null);

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const data = individualresponses;
  return (
    <div>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <>
          {data && data.length !== 0 ? (
            <>
              {data.map((q: any) => (
                <Row gutter={16} key={q.id}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      label={q?.question?.question}
                      key={q?.question?.id}
                      required
                      labelCol={{ span: 24 }} // Label spans full width
                      wrapperCol={{ span: 24 }} // Wrapper spans full width (if needed)
                    >
                      {q?.question?.fieldType === FieldType.MULTIPLE_CHOICE && (
                        <MultipleChoiceField
                          choices={q?.question?.field}
                          selectedAnswer={q?.responseDetail}
                        />
                      )}
                      {q?.question?.fieldType === FieldType.SHORT_TEXT && (
                        <ShortTextField value={q?.responseDetail[0]} />
                      )}
                      {q?.question?.fieldType === FieldType.CHECKBOX && (
                        <CheckboxField
                          options={q?.question?.field}
                          selectedOptions={q?.responseDetail}
                        />
                      )}
                      {q?.question?.fieldType === FieldType.PARAGRAPH && (
                        <ParagraphField value={q?.responseDetail[0]} />
                      )}
                      {q?.question?.fieldType === FieldType.TIME && (
                        <TimeField value={q?.responseDetail[0]} />
                      )}
                      {q?.question?.fieldType === FieldType.DROPDOWN && (
                        <DropdownField
                          options={q?.question?.field}
                          selectedValue={q?.responseDetail[0]}
                        />
                      )}
                      {q?.question?.fieldType === FieldType.RADIO && (
                        <RadioField
                          options={q?.question?.field}
                          selectedValue={q?.responseDetail[0]}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              <Pagination
                className="flex justify-end"
                total={data?.meta?.totalItems} // Total number of items
                current={current} // Current page number
                pageSize={pageSize} // Number of items per page
                showSizeChanger={true} // Show option to change page size
                onChange={onPageChange} // Handler for page change
                onShowSizeChange={onPageChange} // Handler for page size change
              />
            </>
          ) : (
            <EmptyImage />
          )}
        </>
      </Form>
    </div>
  );
};

export default IndividualResponses;
