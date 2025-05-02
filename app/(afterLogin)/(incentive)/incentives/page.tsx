'use client';
import { useParentRecognition } from '@/store/server/features/incentive/other/queries';
import { Button, Skeleton, Tabs, Tooltip } from 'antd';
import { TabsProps } from 'antd/lib';
import PayRoleView from './payroll-detail';
import { useEffect, useMemo } from 'react';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import AllIncentives from './compensation/all/page';
import DynamicIncentive from './compensation/dynamicRecoginition';
import ExportModal from './compensation/all/export';
import ConfirmModal from '@/components/common/confirmModal';
import { useSendIncentiveToPayroll } from '@/store/server/features/incentive/all/mutation';

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
    selectedRecognition,
    setParentResponseIsLoading,
    setIsOpen,
    selectedRowKeys,
    setSelectedRowKeys,
    confirmationModal,
    setConfirmationModal,
  } = useIncentiveStore();

  const { data: parentRecognition, isLoading: parentResponseLoading } =
    useParentRecognition();
  const { mutate: sendIncentiveToPayroll, isLoading } =
    useSendIncentiveToPayroll();
  useEffect(() => {
    setParentResponseIsLoading(parentResponseLoading);
  }, [parentResponseLoading]);

  const handleExportClick = () => {
    setIsOpen(true);
  };
  const handleSendToPayrollClick = () => {
    setConfirmationModal(true);
  };
  const handleYesSendToPayroll = () => {
    setConfirmationModal(false);
    setShowGenerateModal(true);
    sendIncentiveToPayroll(
      { data: selectedRowKeys },
      {
        onSuccess: () => {
          setShowGenerateModal(false);
          setSelectedRowKeys([]);
        },
      },
    );
  };
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
                <AllIncentives />
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
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [activeKey]);
  const OperationsSlot = useMemo(() => {
    if (activeKey === '1') {
      return (
        <div className="flex items-center justify-center gap-3">
          <Tooltip
            title={
              selectedRowKeys.length == 0
                ? 'Please Select At Least One User'
                : ''
            }
          >
            <Button
              onClick={() => handleSendToPayrollClick()}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
              disabled={selectedRowKeys.length == 0 ? true : false}
            >
              {'Send to Payroll'}
            </Button>
          </Tooltip>
          {isPayrollView ? (
            <Button
              onClick={() => setShowGenerateModal(!showGenerateModal)}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
            >
              Generate
            </Button>
          ) : (
            <Button
              onClick={() => handleExportClick()}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
            >
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
          <Tooltip
            title={
              selectedRowKeys.length == 0
                ? 'Please Select At Least One User'
                : ''
            }
          >
            <Button
              onClick={() => handleSendToPayrollClick()}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
              disabled={selectedRowKeys.length != 0 ? true : false}
            >
              {'Send to Payroll'}
            </Button>
          </Tooltip>
          <Button
            onClick={() => handleExportClick()}
            className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
          >
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
  }, [
    activeKey,
    isPayrollView,
    setProjectDrawer,
    setIsPayrollView,
    selectedRowKeys,
  ]);

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
      <ExportModal selectedRecognition={selectedRecognition?.id} />

      <ConfirmModal
        open={confirmationModal}
        onConfirm={handleYesSendToPayroll}
        onCancel={() => setConfirmationModal(false)}
        loading={isLoading}
        description={'You want to send to payroll'}
      />
      {/* <DeleteModal 
        open={confirmationModal}
        description="Are you sure you want to send this recognition to payroll?"
        onYes={handleYesSendToPayroll}
        onNo={() => setConfirmationModal(false)}/> */}
    </div>
  );
};

export default Page;
