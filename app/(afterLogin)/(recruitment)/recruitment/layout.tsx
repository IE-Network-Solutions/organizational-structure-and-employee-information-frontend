'use client';

import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { ConfigProvider } from 'antd';
import React from 'react';

const TA_FONT =
  'Calibri, Candara, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export default function RecruitmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePanel } = useJobState();
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1E40AF',
          fontFamily: TA_FONT,
        },
      }}
    >
      <div
        className={`box-border -mx-2 min-h-0 w-[calc(100%+16px)] px-2 ${activePanel === null ? 'md:-mx-6' : ''}  md:w-[calc(100%+48px)] md:px-6`}
        style={{ fontFamily: TA_FONT }}
        data-cy="talent-acquisition-recruitment-layout"
      >
        {children}
      </div>
    </ConfigProvider>
  );
}
