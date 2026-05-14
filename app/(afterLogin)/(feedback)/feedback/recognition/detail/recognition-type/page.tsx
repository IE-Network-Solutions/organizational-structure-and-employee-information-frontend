'use client';

import CustomPagination from '@/components/customPagination';
import { useGetRecognitionTypeChildById } from '@/store/server/features/CFR/recognition/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Empty, Spin } from 'antd';
import React, { useMemo } from 'react';
import RecognitionTypesCriteriaList from './_components/RecognitionTypesCriteriaList';
import { useSearchParams } from 'next/navigation';

function Page() {
  const { currentType, pageSizeType, setCurrentType, setPageSizeType } =
    useRecongnitionStore();
  const searchParams = useSearchParams();
  const recognitionTypeId = searchParams?.get('recognitionTypeId');
  const { data: recognitionTypeResponse, isLoading } =
    useGetRecognitionTypeChildById(
      recognitionTypeId ?? '',
      pageSizeType,
      currentType,
    );

  const { data: departments } = useGetDepartments();

  const departmentNameById = useMemo(() => {
    const m = new Map<string, string>();
    const arr = Array.isArray(departments) ? departments : [];
    for (const d of arr as { id?: string; name?: string }[]) {
      if (d?.id) {
        m.set(d.id, d.name ?? 'Department');
      }
    }
    return m;
  }, [departments]);

  return (
    <div
      className="min-w-0"
      data-cy="recognition-type-page"
      id="recognitionTypePage"
    >
      <div
        className="min-h-[120px]"
        data-cy="recognition-type-criteria-card-wrapper"
      >
        {isLoading ? (
          <div
            className="flex min-h-[220px] items-center justify-center rounded-lg border border-[#DEE2E6] bg-[#F8F9FA] py-16"
            data-cy="recognition-type-page-loading"
          >
            <Spin size="large" />
          </div>
        ) : !recognitionTypeResponse?.items?.length ? (
          <div
            className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-[#DEE2E6] bg-white py-12"
            data-cy="recognition-type-criteria-empty-wrap"
          >
            <Empty description="No recognition types found" />
          </div>
        ) : (
          <RecognitionTypesCriteriaList
            items={recognitionTypeResponse?.items}
            departmentNameById={departmentNameById}
          />
        )}

        {!isLoading && recognitionTypeResponse?.items?.length > 0 ? (
          <div className="mt-6" data-cy="recognition-type-pagination-wrap">
            <CustomPagination
              current={currentType}
              total={recognitionTypeResponse?.meta?.totalItems ?? 0}
              pageSize={pageSizeType}
              onChange={(page, size) => {
                setCurrentType(page);
                setPageSizeType(size);
              }}
              onShowSizeChange={(size: number) => {
                setPageSizeType(size);
                setCurrentType(1);
              }}
              data-cy="recognition-type-pagination"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Page;
