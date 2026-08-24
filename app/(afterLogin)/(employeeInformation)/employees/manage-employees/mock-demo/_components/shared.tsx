import type { ReactNode } from 'react';
import { Card, Col, Row } from 'antd';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export function EditButton({ dataCy }: { dataCy?: string }) {
  return (
    <button
      type="button"
      className="h-6 w-6 rounded-md border border-[#D9D9D9]"
      data-cy={dataCy}
      aria-label="Edit"
    >
      <EditOutlinedIcon className="text-sm" />
    </button>
  );
}

export function FieldBlock({
  label,
  value,
  dataCy,
}: {
  label: string;
  value: string;
  dataCy: string;
}) {
  return (
    <div className="mb-5" id={dataCy} data-cy={dataCy}>
      <p
        className="m-0 mb-0.5 text-sm font-normal text-[#4d4d4d]"
        data-cy={`${dataCy}-label`}
      >
        {label}
      </p>
      <p
        className="m-0 text-base font-normal text-[#4d4d4d]"
        data-cy={`${dataCy}-value`}
      >
        {value}
      </p>
    </div>
  );
}

export function FieldGrid({
  items,
  dataCy,
}: {
  items: Array<{ label: string; value: string; dataCy: string }>;
  dataCy: string;
}) {
  const midPoint = Math.ceil(items.length / 2);
  return (
    <Row gutter={[24, 0]} data-cy={dataCy}>
      <Col lg={12} xs={12} sm={12} className="flex flex-col">
        {items.slice(0, midPoint).map((item) => (
          <FieldBlock key={item.dataCy} {...item} />
        ))}
      </Col>
      <Col lg={12} xs={12} sm={12} className="flex flex-col">
        {items.slice(midPoint).map((item) => (
          <FieldBlock key={item.dataCy} {...item} />
        ))}
      </Col>
    </Row>
  );
}

export function InfoCard({
  title,
  extra,
  children,
  dataCy,
  titleBold = true,
}: {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
  dataCy: string;
  titleBold?: boolean;
}) {
  return (
    <Card
      title={
        <span
          className={`text-base text-[#4d4d4d] ${titleBold ? 'font-bold' : 'font-normal'}`}
          data-cy={`${dataCy}-title`}
        >
          {title}
        </span>
      }
      extra={
        extra !== undefined ? (
          extra
        ) : (
          <EditButton dataCy={`${dataCy}-edit-btn`} />
        )
      }
      className="my-6 mt-0 rounded-lg"
      bordered={false}
      style={{ background: '#F9FAFB', boxShadow: 'none' }}
      data-cy={dataCy}
      headStyle={{
        borderBottom: 'none',
        paddingLeft: 16,
        paddingRight: 16,
        background: '#F9FAFB',
      }}
      bodyStyle={{ padding: '12px 16px', background: '#F9FAFB' }}
    >
      {children}
    </Card>
  );
}
