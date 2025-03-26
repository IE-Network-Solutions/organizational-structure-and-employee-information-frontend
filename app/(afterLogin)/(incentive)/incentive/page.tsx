'use client';
import { useParentRecognition } from '@/store/server/features/incentive/other/queries';
import { Button, Skeleton, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import PayRoleView from './payroll-detail';
import { useMemo } from 'react';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import DynamicIncentive from './compensation/dynamicRecoginition/page';
import All from './compensation/all/page';

const Page = () => {
  const {
    activeKey,
    setActiveKey,
    setProjectDrawer,
    isPayrollView,
    setIsPayrollView,
    setShowGenerateModal,
    showGenerateModal,
    setSelectedRecognition,
  } = useIncentiveStore();
  const { data: parentRecognition, isLoading: parentResponseLoading } =
    useParentRecognition();

  const items: TabsProps['items'] = parentResponseLoading
    ? [{ key: 'loading', label: <Skeleton active />, children: null }]
    : [
        {
          key: '1',
          label: <span className="font-semibold text-md p-3">All</span>,
          children: (
            <div className="mx-3">
              {isPayrollView ? (
                <PayRoleView operationSlot={''} />
              ) : (
                <All parentResponseLoading={parentResponseLoading} />
              )}
            </div>
          ),
        },
        ...(parentRecognition ?? []).map((item: any) => ({
          key: item?.id,
          label: (
            <span className="font-semibold text-md p-3">{item?.name}</span>
          ),
          children: (
            <div className="mx-3">
              <DynamicIncentive parentRecognitionId={item?.id} />
            </div>
          ),
        })),
      ];

  const OperationsSlot = useMemo(() => {
    if (activeKey === '1') {
      return (
        <div className="flex items-center justify-center gap-3">
          {isPayrollView ? (
            <Button
              onClick={() => setShowGenerateModal(!showGenerateModal)}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
            >
              Generate
            </Button>
          ) : (
            <Button className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4">
              Export
            </Button>
          )}

          <Button
            onClick={() => setIsPayrollView(!isPayrollView)}
            className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
          >
            {isPayrollView ? 'Session View' : 'Payroll View'}
          </Button>
        </div>
      );
    } else {
      // Show Import & Generate for all other tabs
      return (
        <div className="flex items-center justify-center gap-3">
          <Button className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4">
            Export
          </Button>
          <Button
            onClick={() => setProjectDrawer(true)}
            className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
          >
            Import Data
          </Button>
        </div>
      );
    }
  }, [activeKey, isPayrollView, setProjectDrawer, setIsPayrollView]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);

    if (parentRecognition.length > 0) {
      const selectedRecognition = parentRecognition.find(
        (rec: any) => rec.id === key,
      );
      setSelectedRecognition(selectedRecognition || null);
    } else {
      setSelectedRecognition(null);
    }

    if (key !== '2') {
      setIsPayrollView(false);
    }
  };

  return (
    <div className="m-1">
      <div>
        {isPayrollView && <PayRoleView operationSlot={OperationsSlot} />}
      </div>

      {!isPayrollView && (
        <>
          {/* {parentResponseLoading ? (
            <Skeleton.Button
              active
              style={{ width: '200px', height: '40px' }}
            />
          ) : ( */}
          <Tabs
            tabBarStyle={{ borderBottom: '16px solid transparent' }}
            defaultActiveKey="1"
            items={items}
            tabBarExtraContent={OperationsSlot}
            onChange={handleTabChange}
            className="mx-3 mt-5"
          />
          {/* )} */}
        </>
      )}
    </div>
  );
};

export default Page;
