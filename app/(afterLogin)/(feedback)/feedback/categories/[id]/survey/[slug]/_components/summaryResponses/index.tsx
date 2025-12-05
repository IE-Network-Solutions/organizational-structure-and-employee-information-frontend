import React from 'react';
import { Badge, Col, Form, Progress, Row } from 'antd';
import { useGetAllSummaryResultByformId } from '@/store/server/features/organization-development/categories/queries';
import { EmptyImage } from '@/components/emptyIndicator';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
interface Params {
  id: string;
}
function SummaryResponses({ id }: Params) {
  const { data: summaryResult } = useGetAllSummaryResultByformId(id);
  const { graphType } = useOrganizationalDevelopment();
  const getTotalCount = (options: any) => {
    return options?.reduce((total: number, item: any) => total + item.count, 0);
  };

  return (
    <div id="summary-responses-container" data-cy="summary-responses-container">
      <Form id="summary-responses-form" data-cy="summary-responses-form" layout="vertical" style={{ maxWidth: 600 }}>
        {!summaryResult ||
        summaryResult?.length <= 0 ||
        graphType !== 'pieChart' ? (
          <div id="summary-responses-empty" data-cy="summary-responses-empty" className="flex justify-center">
            <EmptyImage data-cy="summary-responses-empty-image" />
          </div>
        ) : (
          summaryResult?.map((q: any, index: number) => (
            <Form.Item id={`summary-response-question-${index}-form-item`} data-cy={`summary-response-question-${index}-form-item`} label={q.question} key={index} required>
              <Row
                id={`summary-response-question-${index}-row`}
                data-cy={`summary-response-question-${index}-row`}
                gutter={16}
                style={{ marginLeft: '10px' }}
                className="flex justify-between"
              >
                {/* eslint-disable @typescript-eslint/naming-convention  */}
                <>
                  {q.fieldType !== 'checkbox'
                    ? q?.options?.map((choice: any, index: number) => (
                        <>
                          <Row key={index} style={{ marginBottom: '10px' }} data-cy={`summary-response-question-${index}-row`} id={`summary-response-question-${index}-row`}>
                            <Col span={24} data-cy={`summary-response-question-${index}-col`} id={`summary-response-question-${index}-col`}>
                              <Progress
                                type="circle"
                                percent={
                                  (choice?.count / getTotalCount(q?.options)) *
                                  100
                                }
                                size={90}
                                strokeColor={'green'}
                                data-cy={`summary-response-question-${index}-progress`}
                              />
                            </Col>
                            <Row data-cy={`summary-response-question-${index}-row-label`} id={`summary-response-question-${index}-row-label`}>
                              <span data-cy={`summary-response-question-${index}-label`} id={`summary-response-question-${index}-label`}>{`Option ${index + 1}`}</span>{' '}
                              {/* Option Label */}
                            </Row>
                          </Row>
                        </>
                      ))
                    : q?.options?.map((choice: any, index: number) => (
                        <Row key={index} id={`summary-response-question-${index}-option-${index}`} data-cy={`summary-response-question-${index}-option-${index}`} style={{ marginBottom: '10px' }}>
                          <Col span={24} data-cy={`summary-response-question-${index}-option-${index}-col`} id={`summary-response-question-${index}-option-${index}-col`}>
                            <Row data-cy={`summary-response-question-${index}-option-${index}-row`} id={`summary-response-question-${index}-option-${index}-row`}>
                              <Col span={18} data-cy={`summary-response-question-${index}-option-${index}-label-col`} id={`summary-response-question-${index}-option-${index}-label-col`}>
                                <span id={`summary-response-question-${index}-option-${index}-label`} data-cy={`summary-response-question-${index}-option-${index}-label`}>{`Option ${index + 1}`}</span>{' '}
                                {/* Option Label */}
                              </Col>
                              <Col span={6} data-cy={`summary-response-question-${index}-option-${index}-badge-col`} id={`summary-response-question-${index}-option-${index}-badge-col`}>
                                <Badge
                                  id={`summary-response-question-${index}-option-${index}-badge`}
                                  data-cy={`summary-response-question-${index}-option-${index}-badge`}
                                  count={choice?.count}
                                  overflowCount={999}
                                  style={{
                                    backgroundColor: '#52c41a',
                                    marginLeft: '10px',
                                  }}
                                />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      ))}
                </>
              </Row>
            </Form.Item>
          ))
        )}
      </Form>
    </div>
  );
}

export default SummaryResponses;
