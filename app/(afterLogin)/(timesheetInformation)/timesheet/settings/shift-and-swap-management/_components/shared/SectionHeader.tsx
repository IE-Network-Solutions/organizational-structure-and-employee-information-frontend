'use client';

import { Flex, Typography } from 'antd';
import { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  description?: string;
  extra?: ReactNode;
};

const SectionHeader = ({ title, description, extra }: SectionHeaderProps) => (
  <Flex justify="space-between" align="start" gap={12} className="mb-4" wrap>
    <Flex vertical gap={4}>
      <Typography.Title
        level={5}
        className="!text-base !font-semibold !text-[#4d4d4d] !m-0"
      >
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Text className="text-sm text-gray-500">
          {description}
        </Typography.Text>
      ) : null}
    </Flex>
    {extra}
  </Flex>
);

export default SectionHeader;
