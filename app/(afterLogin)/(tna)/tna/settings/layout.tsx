'use client';
import { FC, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useApprovalStore } from '@/store/uistate/features/approval';
import CustomBreadcrumb from '@/components/common/breadCramp';

interface TnaSettingsLayoutProps {
  children: ReactNode;
}

const TABS = [
  {
    key: 'course-category',
    label: 'Course Category',
    href: '/tna/settings/course-category',
  },
  {
    key: 'approvals',
    label: 'Approval Workflow',
    href: '/tna/settings/approvals',
  },
  {
    key: 'commitment-configuration',
    label: 'Commitment Configuration',
    href: '/tna/settings/commitment-configuration',
  },
];

const TnaSettingsLayout: FC<TnaSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const requestOpenCourseCategoryCreate = useTnaSettingsStore(
    (s) => s.requestOpenCourseCategoryCreate,
  );
  // The approvals page renders the workflow modal off this same store, so the
  // tab strip can open it without extra plumbing.
  const { setOpenModal: setOpenApprovalModal, setApproverType } =
    useApprovalStore();

  const activeTabKey =
    TABS.find((t) => pathname.includes(t.key))?.key ?? TABS[0].key;

  return (
    <div
      className="min-h-screen bg-white"
      id="tnaSettingsLayoutId"
      data-cy="tna-settings-layout"
    >
      {/* Title + breadcrumb */}
      <div className="" data-cy="tna-settings-header">
        <CustomBreadcrumb
          title={<span data-cy="tna-settings-title">Settings</span>}
          subtitle={
            <div
              className="flex items-center gap-1 mt-1"
              data-cy="tna-settings-breadcrumb"
            >
              <span
                data-cy="tna-settings-breadcrumb-root"
                className="text-[13px] lg:text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
              >
                Learning and Growth
              </span>
              <span
                data-cy="tna-settings-breadcrumb-separator"
                className="text-[13px] lg:text-[14px] font-normal text-[rgba(0,0,0,0.45)] mx-0.5"
              >
                /
              </span>
              <span
                data-cy="tna-settings-breadcrumb-current"
                className="text-[13px] lg:text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
              >
                Settings
              </span>
            </div>
          }
        />
      </div>

      {/* Full viewport–width rule under breadcrumbs (tab strip bottom rule stays padded below) */}

      {/* Course Category tab (+ mobile add when on this tab) */}
      <div
        className="pt-3 border-b border-[#D9D9D9]"
        data-cy="tna-settings-tabs"
      >
        <div
          className="flex items-end gap-2 min-w-0 pb-0"
          data-cy="tna-settings-tabs-row"
        >
          <div
            className="flex-1 min-w-0 overflow-x-auto scrollbar-thin"
            data-cy="tna-settings-tabs-scroll"
          >
            <div
              className="flex items-end gap-0 w-max min-w-full"
              data-cy="tna-settings-tabs-inner"
            >
              {TABS.map((tab) => {
                const isActive = activeTabKey === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => router.push(tab.href)}
                    className={[
                      'relative px-3 lg:px-4 pb-[10px] pt-0 text-[14px] lg:text-[16px] whitespace-nowrap',
                      'transition-colors duration-150 bg-transparent border-none outline-none cursor-pointer shrink-0',
                      isActive
                        ? 'text-[#1E40AF] font-bold'
                        : 'text-[rgba(0,0,0,0.7)] font-normal hover:text-[#1E40AF]',
                    ].join(' ')}
                    data-cy={`tna-settings-tab-${tab.key}`}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        data-cy={`tna-settings-tab-indicator-${tab.key}`}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {activeTabKey === 'approvals' && (
            <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setApproverType('');
                  setOpenApprovalModal(true);
                }}
                className="shrink-0 mb-[6px] h-8 rounded-md border-none bg-primary"
                data-cy="tna-settings-approvals-create"
                id="tnaSettingsApprovalsCreateId"
              >
                <span
                  className="hidden sm:inline"
                  data-cy="tna-settings-approvals-create-text"
                >
                  Create Approval Workflow
                </span>
              </Button>
            </AccessGuard>
          )}
          {activeTabKey === 'course-category' && (
            <AccessGuard permissions={[Permissions.CreateCourseCategory]}>
              <button
                type="button"
                aria-label="Add course category"
                onClick={() => requestOpenCourseCategoryCreate()}
                className="lg:hidden shrink-0 mb-[6px] w-8 h-8 min-w-8 min-h-8 flex items-center justify-center rounded-md bg-primary text-white border-none outline-none cursor-pointer hover:opacity-90"
                data-cy="tna-settings-course-category-add-mobile"
                id="tnaSettingsCourseCategoryAddMobileId"
              >
                <PlusOutlined className="text-sm" />
              </button>
            </AccessGuard>
          )}
        </div>
      </div>

      {/* Tab page content */}
      <div className=" pt-5 pb-8" data-cy="tna-settings-content">
        {children}
      </div>
    </div>
  );
};

export default TnaSettingsLayout;
