'use client';

import { ConfigProvider } from 'antd';
import React from 'react';

const TA_FONT =
  'Calibri, Candara, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export default function RecruitmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        className="min-h-0 max-w-full overflow-x-hidden"
        style={{ fontFamily: TA_FONT }}
        data-cy="talent-acquisition-recruitment-layout"
      >
        {children}
      </div>
    </ConfigProvider>
  );
}
