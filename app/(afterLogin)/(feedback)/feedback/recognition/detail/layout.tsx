'use client';

import EmployeeRecognitionModal from '../_components/EmployeeRecognitionModal';
import RecognitionTypeModal from '../_components/recognitionTypeModal';
import { useGetAllRecognitionData } from '@/store/server/features/CFR/recognition/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Breadcrumb, Button } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { MdOutlineArrowBackIos, MdOutlineEmojiEvents } from 'react-icons/md';

function RecognitionDetailLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recognitionTypeId = searchParams.get('recognitionTypeId') ?? '1';
  const { data: recognitionData } = useGetAllRecognitionData();
  const { setVisible, visible, visibleEmployee, setVisibleEmployee } =
    useRecongnitionStore();

  const categoryName = useMemo(() => {
    const items = recognitionData?.items ?? [];
    const found = items.find(
      (item: { id: string }) => item.id === recognitionTypeId,
    );
    return found?.name ?? 'Recognition';
  }, [recognitionData?.items, recognitionTypeId]);

  const historyHref = `/feedback/recognition/detail?recognitionTypeId=${encodeURIComponent(recognitionTypeId)}`;

  return (
    <div className="" data-cy="recognition-detail-layout">
      <div className="flex flex-wrap  items-center justify-between gap-4 mb-1 p-3">
        <div className="flex items-center gap-3 min-w-0 ">
          <Button
            icon={<MdOutlineArrowBackIos />}
            onClick={() => router.push('/feedback/recognition')}
            data-cy="recognition-detail-back"
          />
          <div className="min-w-0">
            <h2
              className="text-gray-900 text-2xl font-bold leading-tight truncate"
              data-cy="recognition-detail-layout-title"
            >
              {categoryName}
            </h2>
            <Breadcrumb
              className="mt-1 text-sm"
              data-cy="recognition-detail-breadcrumb"
              items={[
                {
                  title: (
                    <Link
                      href="/feedback/conversation"
                      className="text-gray-500 hover:text-gray-700"
                      data-cy="recognition-breadcrumb-cfr"
                    >
                      CFR
                    </Link>
                  ),
                },
                {
                  title: (
                    <Link
                      href="/feedback/recognition"
                      className="text-gray-500 hover:text-gray-700"
                      data-cy="recognition-breadcrumb-recognition"
                    >
                      Recognition
                    </Link>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <Button
          type="primary"
          icon={<MdOutlineEmojiEvents className="text-lg" />}
          onClick={() => setVisible(true)}
          className="shrink-0 h-10"
          data-cy="recognition-detail-recognize-employee"
        >
          Recognize Employee
        </Button>
      </div>

      <nav
        className="flex gap-8 border-b border-gray-200 mt-4 mb-4"
        aria-label="Recognition sections"
        data-cy="recognition-detail-tabs"
      >
        <Link
          href={historyHref}
          className="-mb-px border-b-2 border-primary pb-3 text-sm font-semibold text-primary"
          data-cy="recognition-tab-history"
        >
          Recognition History
        </Link>
        <Link
          href="/feedback/recognition"
          className="-mb-px border-b-2 border-transparent pb-3 text-sm font-medium text-gray-500 hover:text-gray-700"
          data-cy="recognition-tab-types"
        >
          Recognition Types
        </Link>
      </nav>

      {children}

      <RecognitionTypeModal
        visible={visible}
        onCancel={() => setVisible(false)}
      />
      
    </div>
  );
}

export default function RecognitionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <RecognitionDetailLayoutShell>{children}</RecognitionDetailLayoutShell>
    </Suspense>
  );
}
