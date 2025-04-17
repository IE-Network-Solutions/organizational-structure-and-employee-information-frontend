'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { LuPlus } from 'react-icons/lu';
import React, { useEffect } from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { Button, Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const TnaCategoryPage = () => {
  const { isShowTnaCategorySidebar, setIsShowTnaCategorySidebar } =
    useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetTnaCategory({});

  useEffect(() => {
    if (!isShowTnaCategorySidebar) {
      refetch();
    }
  }, [isShowTnaCategorySidebar]);

  return (
    <>
      <PageHeader title="TNA Category" size="small">
        <AccessGuard permissions={[Permissions.CreateTnaCategory]}>
          <Button
            id="tnaNewCategoryButtonId"
            icon={<LuPlus size={18} />}
            type="primary"
            size="large"
            onClick={() => {
              setIsShowTnaCategorySidebar(true);
            }}
          >
            <span className="hidden lg:inline">New Category</span>
          </Button>
        </AccessGuard>
      </PageHeader>

      <Spin spinning={isFetching}>
        {data?.items ? (
          data.items.map((item) => (
            <TnaCategoryCard key={item.id} item={item} />
          ))
        ) : (
          <div className="p-5"></div>
        )}
      </Spin>

      <TnaCategorySidebar />
    </>
  );
};

export default TnaCategoryPage;
