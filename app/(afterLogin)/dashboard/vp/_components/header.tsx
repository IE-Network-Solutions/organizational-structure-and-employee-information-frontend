'use client';

import { Button } from 'antd';
import { Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
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
      className=""
      data-cy="vp-update-header"
    >
      <div data-cy="vp-update-header-breadcrumb-wrap">
        <CustomBreadcrumb
          href="/dashboard"
          title={
            <div
              className="flex items-start gap-3"
              data-cy="vp-update-header-title"
            >
             
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
                      className="text-xs sm:text-sm text-gray-400"
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
          titleExtra={
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
          }
        />
      </div>

     
    </div>
  );
};

export default Header;
