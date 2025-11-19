import { Col, Row } from 'antd';
import { ReactNode } from 'react';

interface InfoLineType {
  title: string;
  value: string | ReactNode;
}

export const InfoLine = ({ title, value }: InfoLineType) => {
  const toSlug = (value: string | number | null | undefined) =>
    String(value ?? 'na')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  
  const titleSlug = toSlug(title);
  
  return (
    <Row className="my-3" id={`info-line-${titleSlug}`} data-cy={`info-line-${titleSlug}`}>
      <Col xs={24} md={12} className="mb-1 md:mb-0" id={`info-line-title-col-${titleSlug}`} data-cy={`info-line-title-col-${titleSlug}`}>
        <p className="font-light" id={`info-line-title-${titleSlug}`} data-cy={`info-line-title-${titleSlug}`}>{title}</p>
      </Col>
      <Col xs={24} md={12} id={`info-line-value-col-${titleSlug}`} data-cy={`info-line-value-col-${titleSlug}`}>
        <p className="font-bold" id={`info-line-value-${titleSlug}`} data-cy={`info-line-value-${titleSlug}`}>{value}</p>
      </Col>
    </Row>
  );
};
