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
    <div>
      <Form id={id} layout="vertical" style={{ maxWidth: 600 }}>
        {!summaryResult ||
        summaryResult?.length < 0 ||
        graphType !== 'pieChart' ? (
          <div className="flex justify-center">
            <EmptyImage />
          </div>
        ) : (
          summaryResult?.map((q: any, index: number) => (
            <Form.Item label={q.question} key={index} required>
              <Row
                gutter={16}
                style={{ marginLeft: '10px' }}
                className="flex justify-between"
              >
                {/* eslint-disable @typescript-eslint/naming-convention  */}
                <>
                  {q.fieldType !== 'checkbox'
                    ? q?.options?.map((choice: any, index: number) => (
                        <>
                          <Row key={index} style={{ marginBottom: '10px' }}>
                            <Col span={24}>
                              <Progress
                                type="circle"
                                percent={
                                  (choice?.count / getTotalCount(q?.options)) *
                                  100
                                }
                                size={90}
                                strokeColor={'green'}
                              />
                            </Col>
                            <Row>
                              <span>{`Option ${index + 1}`}</span>{' '}
                              {/* Option Label */}
                            </Row>
                          </Row>
                        </>
                      ))
                    : q?.options?.map((choice: any, index: number) => (
                        <Row key={index} style={{ marginBottom: '10px' }}>
                          <Col span={24}>
                            <Row>
                              <Col span={18}>
                                <span>{`Option ${index + 1}`}</span>{' '}
                                {/* Option Label */}
                              </Col>
                              <Col span={6}>
                                <Badge
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
