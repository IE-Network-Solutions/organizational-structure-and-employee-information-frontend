'use client';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Button, ConfigProvider, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import Department from './_components/department-team/department';
import CustomBreadcrumb from '@/components/common/breadCramp';
import FilterPopover from './_components/FilterPopover';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
import { isHomePath } from '@/utils/navigation/personalRoutes';
import { useIsMobile } from '@/hooks/useIsMobile';

const viewSegmentedClassName = classNames(
  'weekly-priority-toolbar-segmented !inline-flex !w-max max-w-full !shrink-0 !rounded-xl !border !border-slate-100 !bg-slate-50/70 !p-1.5',
  '!h-[50px] sm:!h-[50px] sm:!self-center',
  '[&_.ant-segmented-group]:!w-max [&_.ant-segmented-group]:!min-h-0 [&_.ant-segmented-group]:!items-stretch [&_.ant-segmented-group]:!justify-start',
  '[&_.ant-segmented-thumb]:!h-full [&_.ant-segmented-thumb]:!bg-white [&_.ant-segmented-thumb]:!py-0 [&_.ant-segmented-thumb]:!shadow-sm',
  '[&_.ant-segmented-item]:!flex [&_.ant-segmented-item]:!flex-none [&_.ant-segmented-item]:!items-center [&_.ant-segmented-item]:!justify-center [&_.ant-segmented-item]:!self-stretch [&_.ant-segmented-item]:!bg-transparent',
  '[&_.ant-segmented-item-selected]:!z-[1] [&_.ant-segmented-item-selected]:!rounded-md [&_.ant-segmented-item-selected]:!shadow-sm',
  '[&_.ant-segmented-item-label]:!flex [&_.ant-segmented-item-label]:!h-9 [&_.ant-segmented-item-label]:!min-h-9 [&_.ant-segmented-item-label]:!items-center [&_.ant-segmented-item-label]:!justify-center [&_.ant-segmented-item-label]:!whitespace-nowrap [&_.ant-segmented-item-label]:!font-medium [&_.ant-segmented-item-label]:!text-slate-600 [&_.ant-segmented-item-label]:!px-3.5 [&_.ant-segmented-item-label]:!py-0 [&_.ant-segmented-item-label]:!text-[14px] sm:[&_.ant-segmented-item-label]:!h-9 sm:[&_.ant-segmented-item-label]:!min-h-9 sm:[&_.ant-segmented-item-label]:!px-4.5 sm:[&_.ant-segmented-item-label]:!py-0 sm:[&_.ant-segmented-item-label]:!text-[14px]',
  '[&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-slate-900',
);

function Page(): JSX.Element {
  const pathname = usePathname();
  const embeddedInHome = isHomePath(pathname);
  const { isMobile } = useIsMobile();
  const { activeTab, setActiveTab, setModalOpen, setDepartmentId } =
    useWeeklyPriorityStore();
  const { tab: deepLinkTab, departmentId } = useNotificationDeepLink();

  useEffect(() => {
    if (deepLinkTab === 'team' || deepLinkTab === '2') {
      setActiveTab(2);
    } else if (deepLinkTab === 'department' || deepLinkTab === '1') {
      setActiveTab(1);
    }
    if (departmentId) setDepartmentId(departmentId);
  }, [deepLinkTab, departmentId, setActiveTab, setDepartmentId]);

  const createPriorityButton = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => setModalOpen(true)}
      className="!inline-flex !h-9 !min-h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border-none bg-[#1E40AF] px-0 text-sm font-semibold hover:bg-[#1E3A8A] md:w-auto md:px-4"
      data-cy="weekly-priority-create-button"
    >
      <span
        className="ml-1 hidden md:inline"
        data-cy="weekly-priority-create-button-text"
      >
        Create Priority
      </span>
    </Button>
  );

  return (
    <div
      data-cy="weekly-priority-page"
      className="h-auto min-w-0 w-full max-w-full bg-white rounded-md"
    >
      <div data-cy="weekly-priority-content">
        {!embeddedInHome && (
          <CustomBreadcrumb
            title={
              <span data-cy="weekly-priority-title">Weekly priority</span>
            }
            subtitle={
              <div
                className="flex items-center gap-1 text-[12px] md:text-[13px] text-gray-400"
                data-cy="weekly-priority-breadcrumb"
              >
                <Link
                  className=" !text-gray-400"
                  data-cy="weekly-priority-breadcrumb-okr"
                  href="/okr"
                >
                  OKR
                </Link>
                <span data-cy="weekly-priority-breadcrumb-separator">/</span>
                <span
                  className=" !text-gray-800"
                  data-cy="weekly-priority-breadcrumb-current"
                >
                  Weekly priority
                </span>
              </div>
            }
          />
        )}

        <div
          data-cy="weekly-priority-main-card"
          className="home-embed-main flex min-w-0 max-w-full w-full flex-col gap-3 p-0 sm:gap-4 sm:rounded-xl sm:p-4"
        >
          <div
            data-cy="weekly-priority-toolbar-row"
            className={classNames(
              'sticky top-0 z-20 flex w-full min-w-0 max-w-full flex-col items-stretch gap-2 border-b border-shell-line bg-white pb-2 pt-1',
              'sm:flex-row sm:items-end sm:gap-3 sm:pb-0 lg:gap-x-8 sm:[&>*:not(:first-child)]:pb-2',
            )}
          >
            <div
              className="flex w-full shrink-0 items-center sm:w-auto sm:justify-center"
              data-cy="weekly-priority-view-segmented-wrap"
            >
              <ConfigProvider
                theme={{
                  components: {
                    Segmented: {
                      trackBg: '#f1f5f9',
                      itemSelectedBg: '#ffffff',
                      itemSelectedColor: '#0f172a',
                    },
                  },
                }}
              >
                <Segmented
                  size={isMobile ? 'middle' : 'large'}
                  value={activeTab}
                  onChange={(value) => setActiveTab(Number(value))}
                  options={[
                    { label: 'Department', value: 1 },
                    { label: 'Team', value: 2 },
                  ]}
                  className={viewSegmentedClassName}
                  data-cy="weekly-priority-view-segmented"
                />
              </ConfigProvider>
            </div>

            <div
              className="flex min-w-0 w-full flex-1 flex-wrap items-center justify-end gap-2 overflow-visible sm:min-h-10 sm:flex-nowrap sm:gap-3"
              data-cy="weekly-priority-tab-actions"
            >
              <div
                className="shrink-0 self-center"
                data-cy="weekly-priority-create-action"
              >
                {createPriorityButton}
              </div>
              <div
                className="shrink-0 self-center"
                data-cy="weekly-priority-filter-action"
              >
                <FilterPopover />
              </div>
            </div>
          </div>

          <div
            data-cy="weekly-priority-content-area"
            className="min-w-0 max-w-full w-full"
          >
            <Department />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
