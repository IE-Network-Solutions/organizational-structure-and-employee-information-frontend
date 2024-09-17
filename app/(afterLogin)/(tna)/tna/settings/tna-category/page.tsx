'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import CustomButton from '@/components/common/buttons/customButton';
import { LuPlus } from 'react-icons/lu';
import React, { useEffect } from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { Spin } from 'antd';

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
        <CustomButton
          title="New Category"
          icon={<LuPlus size={18} />}
          type="primary"
          size="large"
          onClick={() => {
            setIsShowTnaCategorySidebar(true);
          }}
        />
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
