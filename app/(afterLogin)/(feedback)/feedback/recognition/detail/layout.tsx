'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import RecognitionTypeModal from '../_components/recognitionTypeModal';
import { useGetRecognitionTypeById } from '@/store/server/features/CFR/recognition/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { Breadcrumb, Button, Skeleton } from 'antd';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { MdOutlineEmojiEvents } from 'react-icons/md';

function RecognitionDetailLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const recognitionTypeId = searchParams?.get('recognitionTypeId') ?? '1';
  const { data: recognitionData, isLoading: isRecognitionTypeLoading } =
    useGetRecognitionTypeById(recognitionTypeId);
  const { setVisible, visible } = useRecongnitionStore();

  const categoryName = recognitionData?.name ?? 'Recognition';
  const historyHref = `/feedback/recognition/detail?recognitionTypeId=${encodeURIComponent(recognitionTypeId)}`;
  const typesHref = `/feedback/recognition/detail/recognition-type?recognitionTypeId=${encodeURIComponent(recognitionTypeId)}`;

  const isHistoryActive =
    pathname?.endsWith('/feedback/recognition/detail') ||
    pathname?.endsWith('/feedback/recognition/detail/history');

  const isTypesActive = pathname?.endsWith(
    '/feedback/recognition/detail/recognition-type',
  );

  return (
    <div className="text-[#333]" data-cy="recognition-detail-layout">
      <div
        className="border-b border-[#DEE2E6] pb-1 pt-2"
        data-cy="recognition-detail-layout-toolbar"
      >
        <div
          className="w-full min-w-0"
          data-cy="recognition-detail-layout-breadcrumb-row"
        >
          <div
            className="min-w-0 w-full"
            data-cy="recognition-detail-layout-title-area"
          >
            <div
              className="min-w-0 w-full"
              data-cy="recognition-detail-layout-breadcrumb-wrap"
            >
              <CustomBreadcrumb
                href="/feedback/recognition"
                backControlDataCy="recognition-detail-back"
                showBottomSeparator={false}
                rootClassName="!mb-0"
                compact
                subtitleClassName="!text-[#6C757D] !font-normal"
                titleClassName={
                  isRecognitionTypeLoading
                    ? '!block !min-h-8'
                    : '!text-[#000] !text-2xl !font-bold !tracking-tight'
                }
                title={
                  isRecognitionTypeLoading ? (
                    <Skeleton.Input
                      active
                      size="default"
                      style={{ width: 200, height: 32, borderRadius: 4 }}
                      data-cy="recognition-detail-layout-title-skeleton"
                    />
                  ) : (
                    categoryName
                  )
                }
                subtitle={
                  isRecognitionTypeLoading ? (
                    ''
                  ) : (
                    <Breadcrumb
                      className="mt-1.5 text-sm [&_.ant-breadcrumb-separator]:text-[#6C757D]"
                      data-cy="recognition-detail-breadcrumb"
                      items={[
                        {
                          title: (
                            <Link
                              href="/feedback/conversation"
                              className="text-[#6C757D] hover:text-[#495057]"
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
                              className="text-[#6C757D] hover:text-[#495057]"
                              data-cy="recognition-breadcrumb-recognition"
                            >
                              Recognition
                            </Link>
                          ),
                        },
                      ]}
                    />
                  )
                }
                titleExtra={
                  <Button
                    type="primary"
                    icon={<MdOutlineEmojiEvents className="text-lg" />}
                    onClick={() => setVisible(true)}
                    className="shrink-0 h-10"
                    data-cy="recognition-detail-recognize-employee"
                  >
                    <span
                      data-cy="recognition-detail-recognize-employee-text"
                      className="hidden md:block"
                    >
                      Recognize Employee
                    </span>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <nav
        className="-mb-px mt-2 flex gap-10 border-b border-[#DEE2E6]"
        aria-label="Recognition sections"
        data-cy="recognition-detail-tabs"
      >
        <Link
          href={historyHref}
          className={
            `-mb-px border-b-[3px] pb-3 text-sm transition-colors ` +
            (isHistoryActive
              ? 'border-primary font-semibold text-primary'
              : 'border-transparent font-medium text-[#495057] hover:text-[#212529]')
          }
          data-cy="recognition-tab-history"
        >
          Recognition History
        </Link>
        <Link
          href={typesHref}
          className={
            `-mb-px border-b-[3px] pb-3 text-sm transition-colors ` +
            (isTypesActive
              ? 'border-primary font-semibold text-primary'
              : 'border-transparent font-medium text-[#495057] hover:text-[#212529]')
          }
          data-cy="recognition-tab-types"
        >
          Recognition Types
        </Link>
      </nav>

      <div className="mt-5" data-cy="recognition-detail-layout-children">
        {children}
      </div>

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
