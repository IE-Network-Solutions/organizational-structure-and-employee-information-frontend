import React from 'react';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const ApproverListTableComponent = ({
  onPageChange,
  pageSize,
  data,
  allFilterData,
}: {
  onPageChange: (a: number, b?: number) => void;
  pageSize: number;
  data: {
    key?: string | number;
    workflow_name: string;
    applied_to: string;
    assigned: React.ReactNode;
    level: number;
    action: React.ReactNode;
  }[];
  isEmployeeLoading: boolean;
  allFilterData?: {
    meta?: {
      totalItems: number;
      currentPage: number;
    };
  };
}) => {
  const { isMobile, isTablet } = useIsMobile();
  return (
    <div data-cy="approval-list-table-container">
      <div className="mt-2 w-full" data-cy="approval-list-table-wrapper">
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          data-cy="approval-list-cards-grid"
        >
          {data?.map((item, index) => (
            <div
              key={item.key ?? index}
              className="rounded-xl border border-[#D9D9D9] bg-white p-4 shadow-sm"
              data-cy={`approval-list-card-${index}`}
            >
              <div
                className="flex items-center justify-end"
                data-cy={`approval-list-card-header-${index}`}
              >
                <div data-cy={`approval-list-card-action-${index}`}>
                  {item.action}
                </div>
              </div>

              {item.workflow_name ? (
                <p
                  className="mt-3 mb-2 text-[20px] font-semibold text-[#2f2f2f]"
                  data-cy={`approval-list-card-title-${index}`}
                >
                  {item.workflow_name}
                </p>
              ) : null}

              <div
                className="mb-3"
                data-cy={`approval-list-card-applied-wrap-${index}`}
              >
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[#555]"
                  data-cy={`approval-list-card-applied-${index}`}
                >
                  <span
                    className="text-xs"
                    data-cy={`approval-list-card-applied-label-${index}`}
                  >
                    Applied to:
                  </span>
                  <span
                    className="text-base"
                    data-cy={`approval-list-card-applied-value-${index}`}
                  >
                    {item.applied_to || '-'}
                  </span>
                </span>
              </div>

              <div
                className="pt-2"
                data-cy={`approval-list-card-assigned-section-${index}`}
              >
                <div data-cy={`approval-list-card-assigned-value-${index}`}>
                  {item.assigned}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allFilterData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          current={allFilterData?.meta?.currentPage ?? 1}
          total={allFilterData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            onPageChange(1, pageSize);
          }}
        />
      )}
    </div>
  );
};

export default ApproverListTableComponent;
