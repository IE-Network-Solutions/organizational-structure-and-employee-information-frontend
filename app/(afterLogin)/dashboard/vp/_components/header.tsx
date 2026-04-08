'use client';

import { Button } from 'antd';
import { Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetVpScoreCalculate } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

const Header = () => {
  const userId = useAuthenticationStore.getState().userId;
  const {
    refetch,
    isLoading: isRefreshing,
    isRefetching,
  } = useGetVpScoreCalculate(userId, false);
  return (
    <div
      className="flex items-start justify-between gap-4"
      data-cy="vp-update-header"
    >
      <div data-cy="vp-update-header-breadcrumb-wrap">
        <CustomBreadcrumb
          title={
            <div
              className="flex items-start gap-3"
              data-cy="vp-update-header-title"
            >
              <Link
                href="/dashboard"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                aria-label="Back to VP dashboard"
                data-cy="vp-update-header-back-link"
              >
                <MdKeyboardArrowLeft size={18} />
              </Link>
              <span
                className="text-[30px] leading-9 font-semibold text-[#1f1f1f]"
                data-cy="vp-update-header-title-text"
              >
                Variable Pay
              </span>
            </div>
          }
          subtitle={
            <Breadcrumb
              data-cy="vp-update-header-subtitle-breadcrumb"
              items={[
                {
                  title: (
                    <Link
                      className="text-xs sm:text-sm text-gray-400 ml-12"
                      href="/dashboard/vp"
                      data-cy="vp-update-header-subtitle-link"
                    >
                      VP
                    </Link>
                  ),
                },
              ]}
            />
          }
        />
      </div>

      <div className="pt-1" data-cy="vp-update-header-refresh-wrap">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          className="!bg-[#2145b7] !h-10 !rounded-md !font-medium !shadow-none"
          onClick={() => refetch()}
          disabled={isRefreshing || isRefetching}
          data-cy="vp-update-header-refresh-button"
        >
          <span
            className="hidden md:inline"
            data-cy="vp-update-header-refresh-text"
          >
            Refresh VP
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Header;
