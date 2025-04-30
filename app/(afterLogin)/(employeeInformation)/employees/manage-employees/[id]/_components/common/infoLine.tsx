import { Col, Row } from 'antd';
import { ReactNode } from 'react';

interface InfoLineType {
  title: string;
  value: string | ReactNode;
}
export const InfoLine = ({ title, value }: InfoLineType) => (
  <Row className="my-3">
    <Col span={12}>
      {' '}
      <p className="font-light">{title}</p>
    </Col>
    <Col span={12}>
      <p className="font-bold">{value}</p>
    </Col>
  </Row>
);
