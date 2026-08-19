'use client';

import { Space, Tag, Typography } from 'antd';

const { Text } = Typography;

interface PayslipInfoItemProps {
  label: string;
  value: string | number;
  tags?: { label: string; value: string | number }[];
  large?: boolean;
  'data-cy'?: string;
}

const PayslipInfoItem = ({
  label,
  value,
  tags,
  large,
  'data-cy': dataCy = 'payslip-info-item',
}: PayslipInfoItemProps) => (
  <div className="info-item" data-cy={dataCy}>
    <Text
      style={{
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.65)',
        display: 'block',
        marginBottom: '4px',
      }}
      data-cy={`${dataCy}-label`}
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: large ? '16px' : '16px',
        color: 'rgba(0, 0, 0, 0.65)',
        display: 'block',
        marginBottom: '4px',
      }}
      data-cy={`${dataCy}-value`}
    >
      {value}
    </Text>
    {tags && tags.length > 0 && (
      <Space wrap size={[8, 8]} data-cy={`${dataCy}-tags`}>
        {tags.map((tag, index) => (
          <Tag
            key={`${tag.label}-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid #D9D9D9',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '12px',
              margin: 0,
            }}
            data-cy={`${dataCy}-tag`}
          >
            <span
              style={{
                color: 'rgba(0, 0, 0, 0.65)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px',
              }}
              data-cy={`${dataCy}-tag-label`}
            >
              {tag.label}
            </span>
            <span
              style={{
                color: 'rgba(0, 0, 0, 0.65)',
                whiteSpace: 'nowrap',
              }}
              data-cy={`${dataCy}-tag-value`}
            >
              {' '}
              : {tag.value}
            </span>
          </Tag>
        ))}
      </Space>
    )}
  </div>
);

export default PayslipInfoItem;
