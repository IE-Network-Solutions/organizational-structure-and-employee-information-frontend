'use client';

import { Button } from 'antd';
import { Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import CustomBreadcrumb from '@/components/common/breadCramp';
    import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useGetVpScoreCalculate } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

const Header = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { refetch, isLoading: isRefreshing, isRefetching } =
    useGetVpScoreCalculate(userId, false);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <CustomBreadcrumb
          title={
            <div className="flex items-start gap-3">
              <Link
                href="/dashboard"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                aria-label="Back to VP dashboard"
              >
                <MdKeyboardArrowLeft size={18} />
              </Link>
              <span className="text-[30px] leading-9 font-semibold text-[#1f1f1f]">
                Variable Pay
              </span>
            </div>
          }
          subtitle={
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link className="text-xs sm:text-sm text-gray-400 ml-12" href="/dashboard/vp">
                      VP
                    </Link>
                  ),
                },
              ]}
            />
          }
        />
      </div>

      <div className="pt-1">
        <Button type="primary" icon={<ReloadOutlined />} className="!bg-[#2145b7] !h-10 !rounded-md !font-medium !shadow-none" onClick={() => refetch()} disabled={isRefreshing || isRefetching}>
          <span className="hidden md:inline">Refresh VP</span>
        </Button>
      </div>
    </div>
  );
};

export default Header;
