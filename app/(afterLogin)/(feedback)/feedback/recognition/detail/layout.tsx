'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import RecognitionTypeModal from '../_components/recognitionTypeModal';
import { useGetRecognitionTypeById } from '@/store/server/features/CFR/recognition/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Breadcrumb, Button, Skeleton } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { MdOutlineArrowBackIos, MdOutlineEmojiEvents } from 'react-icons/md';

function RecognitionDetailLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const recognitionTypeId = searchParams.get('recognitionTypeId') ?? '1';
  const { data: recognitionData, isLoading: isRecognitionTypeLoading } =
    useGetRecognitionTypeById(recognitionTypeId);
  const { setVisible, visible } = useRecongnitionStore();

  const categoryName = recognitionData?.name ?? 'Recognition';
  const historyHref = `/feedback/recognition/detail?recognitionTypeId=${encodeURIComponent(recognitionTypeId)}`;
  const typesHref = `/feedback/recognition/detail/recognition-type?recognitionTypeId=${encodeURIComponent(recognitionTypeId)}`;

  const isHistoryActive =
    pathname.endsWith('/feedback/recognition/detail') ||
    pathname.endsWith('/feedback/recognition/detail/history');

  const isTypesActive = pathname.endsWith(
    '/feedback/recognition/detail/recognition-type',
  );

  return (
    <div className="" data-cy="recognition-detail-layout">
      <div
        className="flex flex-wrap  items-center justify-between gap-4 mb-1 py-3"
        data-cy="recognition-detail-layout-toolbar"
      >
        <div
          className="flex items-center gap-3 min-w-0 "
          data-cy="recognition-detail-layout-breadcrumb-row"
        >
          <Button
            icon={<MdOutlineArrowBackIos />}
            onClick={() => router.push('/feedback/recognition')}
            data-cy="recognition-detail-back"
          />
          <div
            className="min-w-0"
            data-cy="recognition-detail-layout-title-area"
          >
            {isRecognitionTypeLoading ? (
              <Skeleton.Input
                active
                size="default"
                style={{ width: 200, height: 32, borderRadius: 4 }}
                data-cy="recognition-detail-layout-title-skeleton"
              />
            ) : (
              <div data-cy="recognition-detail-layout-breadcrumb-wrap">
                <CustomBreadcrumb
                  title={categoryName}
                  subtitle={
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
                  }
                />
              </div>
            )}
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
          className={
            `-mb-px border-b-2 pb-3 text-sm font-semibold ` +
            (isHistoryActive
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700')
          }
          data-cy="recognition-tab-history"
        >
          Recognition History
        </Link>
        <Link
          href={typesHref}
          className={
            `-mb-px border-b-2 pb-3 text-sm font-medium ` +
            (isTypesActive
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700')
          }
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
