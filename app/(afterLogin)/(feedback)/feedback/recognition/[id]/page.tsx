'use client';
import TabLandingLayout from '@/components/tabLanding';
import { useGetRecognitionById } from '@/store/server/features/CFR/recognition/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Card, Col, Row, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
interface Params {
  id: string;
}
interface RecognitionDetailsProps {
  params: Params;
}

function Page({ params: { id } }: RecognitionDetailsProps) {
  const { data: allUserData } = useGetAllUsers();
  const { data: getRecognitionById } = useGetRecognitionById(id);

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };
  const columns: TableColumnsType = [
    {
      title: 'Criteria',
      dataIndex: 'criterionKey',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (value) => <span>{value ?? '-'}</span>,
    },
    {
      title: 'Score',
      dataIndex: 'age',
      render: (notUsed, record) => <span>{record?.score ?? '-'}</span>,
    },
  ];
  return (
    <div>
      <>
        <TabLandingLayout
          id="conversationLayoutId"
          onClickHandler={() => {}}
          title="  ← Best Employee"
          buttonTitle="print Certification"
          buttonIcon={''}
        >
          <Card>
            <Row gutter={[16, 16]} style={{ width: 'auto' }}>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Employee
                  </Col>
                  <Col span={12}>
                    {`${getEmployeeData(getRecognitionById?.issuerId)?.firstName || 'N/A'} ${getEmployeeData(getRecognitionById?.issuerId)?.middleName || 'N/A'} ${
                      getEmployeeData(getRecognitionById?.issuerId)?.lastName ||
                      'N/A'
                    }`}
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Issued Date
                  </Col>
                  <Col span={12}>
                    {getRecognitionById?.dateIssued
                      ? dayjs(getRecognitionById.dateIssued).format(
                          'MMMM D, YYYY',
                        ) // Format as "Month Day, Year"
                      : 'N/A'}
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Recognized By
                  </Col>
                  <Col span={12}>
                    {`${getEmployeeData(getRecognitionById?.issuerId)?.firstName || 'N/A'} ${getEmployeeData(getRecognitionById?.issuerId)?.middleName || 'N/A'} ${
                      getEmployeeData(getRecognitionById?.issuerId)?.lastName ||
                      'N/A'
                    }`}
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Total Number of Appreciation
                  </Col>
                  <Col span={12}>0</Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Total Number of Reprimand
                  </Col>
                  <Col span={12}>0</Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8} style={{ fontWeight: 'bold' }}>
                    Details
                  </Col>
                  <Col span={12}>
                    {getRecognitionById?.recognitionType?.description || 'N/A'}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          <Table
            columns={columns}
            bordered={false}
            pagination={false}
            dataSource={getRecognitionById?.recognitionType?.criteria ?? []}
            style={{
              border: 'none',
              borderCollapse: 'collapse',
            }}
          />
        </TabLandingLayout>
      </>
    </div>
  );
}

export default Page;
