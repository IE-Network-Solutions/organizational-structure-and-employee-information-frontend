'use client';
import { useParentRecognition } from '@/store/server/features/incentive/other/queries';
import { Skeleton, Tabs } from 'antd';
import { TabsProps } from 'antd/lib';
import PayRoleView from './payroll-detail';
import { useEffect, useMemo } from 'react';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import AllIncentives from './compensation/all/page';
import DynamicIncentive from './compensation/dynamicRecoginition';
import ExportModal from './compensation/all/export';
import ConfirmModal from '@/components/common/confirmModal';
import { useSendIncentiveToPayroll } from '@/store/server/features/incentive/all/mutation';
import { Eye, FileDown, FileUp } from 'lucide-react';
import CustomButton from '@/components/common/buttons/customButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useExportIncentiveData } from '@/store/server/features/incentive/all/mutation';
import { MdOutlineSend } from 'react-icons/md';

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
    selectedRowKeys,
    setSelectedRowKeys,
    confirmationModal,
    setConfirmationModal,
  } = useIncentiveStore();
  const { mutate: exportIncentiveData, isLoading: exportIncentiveLoading } =
    useExportIncentiveData();

  const { searchParams } = useIncentiveStore();
  const handleExport = (values: any, generateAll: boolean) => {
    const formattedValues = {
      parentRecognitionTypeId: selectedRecognition?.id || '',
      generateAll: generateAll,
      sessionId: values?.bySession || [],
      userId: values?.employee_name || '',
      monthId: values?.byMonth || '',
    };
    exportIncentiveData(formattedValues);
  };
  const { data: parentRecognition, isLoading: parentResponseLoading } =
    useParentRecognition();

  const { mutate: sendIncentiveToPayroll, isLoading } =
    useSendIncentiveToPayroll();

  const { isMobile, isTablet } = useIsMobile();

  useEffect(() => {
    setParentResponseIsLoading(parentResponseLoading);
  }, [parentResponseLoading]);

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
        <div id="incentives-page-operations-slot-all" data-cy="incentives-page-operations-slot-all" className="flex items-center justify-center gap-3">
          <CustomButton
            data-cy="incentives-page-send-to-payroll-button"
            title={
              !(isMobile || isTablet) && (
                <span id="incentives-page-send-to-payroll-text" data-cy="incentives-page-send-to-payroll-text" className="hidden sm:inline">Send to Payroll</span>
              )
            }
            id="createUserButton"
            icon={<MdOutlineSend className="md:mr-0 ml-2" size={18} id="incentives-page-send-to-payroll-icon" data-cy="incentives-page-send-to-payroll-icon" />}
            onClick={() => handleSendToPayrollClick()}
            textClassName="!text-sm !font-lg"
            className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
          />

          {isPayrollView ? (
            <CustomButton
              data-cy="incentives-page-generate-button"
              title={
                !(isMobile || isTablet) && (
                  <span id="incentives-page-generate-text" data-cy="incentives-page-generate-text" className="hidden sm:inline">Generate</span>
                )
              }
              id="createUserButton"
              icon={<FileDown className="md:mr-0 ml-2" size={18} d="incentives-page-generate-icon" data-cy="incentives-page-generate-icon" />}
              onClick={() => setShowGenerateModal(!showGenerateModal)}
              textClassName="!text-sm !font-lg"
              className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
            />
          ) : (
            <CustomButton
              data-cy="incentives-page-export-button"
              title={
                !(isMobile || isTablet) && (
                  <span id="incentives-page-export-text" data-cy="incentives-page-export-text" className="hidden sm:inline">Export</span>
                )
              }
              id="createUserButton"
              icon={<FileDown className="md:mr-0 ml-2" size={18} d="incentives-page-export-icon" data-cy="incentives-page-export-icon" />}
              onClick={() => handleExport(searchParams, true)}
              textClassName="!text-sm !font-lg"
              className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
              loading={exportIncentiveLoading}
              disabled={exportIncentiveLoading}
            />
          )}

          <CustomButton
            data-cy="incentives-page-view-toggle-button"
            title={
              !(isMobile || isTablet) && (
                <span id="incentives-page-view-toggle-text" data-cy="incentives-page-view-toggle-text" className="hidden sm:inline">
                  {isPayrollView ? 'Session View' : 'Payroll View'}
                </span>
              )
            }
            id="createUserButton"
            icon={<Eye className="md:mr-0 ml-2" size={18} id="incentives-page-view-toggle-icon" data-cy="incentives-page-view-toggle-icon" />}
            onClick={() => setIsPayrollView(!isPayrollView)}
            textClassName="!text-sm !font-lg"
            className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
          />
        </div>
      );
    } else {
      // Show Import & Generate for all other tabs
      return (
        <div id="incentives-page-operations-slot-other" data-cy="incentives-page-operations-slot-other" className="flex items-center justify-center gap-3">
          <CustomButton
            data-cy="incentives-page-send-to-payroll-button-other"
            title={
              !(isMobile || isTablet) && (
                <span id="incentives-page-send-to-payroll-text-other" data-cy="incentives-page-send-to-payroll-text-other" className="hidden sm:inline">Send to Payroll</span>
              )
            }
            id="createUserButton"
            icon={<MdOutlineSend className="md:mr-0 ml-2" size={18} id="incentives-page-send-to-payroll-icon-other" data-cy="incentives-page-send-to-payroll-icon-other" />}
            onClick={() => handleSendToPayrollClick()}
            textClassName="!text-sm !font-lg"
            className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
          />

          <CustomButton
            data-cy="incentives-page-export-button-other"
            title={
              !(isMobile || isTablet) && (
                <span id="incentives-page-export-text-other" data-cy="incentives-page-export-text-other" className="hidden sm:inline">Export</span>
              )
            }
            id="createUserButton"
            icon={<FileUp className="md:mr-0 ml-2" size={18} id="incentives-page-export-icon-other" data-cy="incentives-page-export-icon-other" />}
            onClick={() => handleExport(searchParams, false)}
            textClassName="!text-sm !font-lg"
            className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
          />

          <CustomButton
            data-cy="incentives-page-import-button"
            title={
              !(isMobile || isTablet) && (
                <span id="incentives-page-import-text" data-cy="incentives-page-import-text" className="hidden sm:inline">Import Data</span>
              )
            }
            id="createUserButton"
            icon={<FileDown className="md:mr-0 ml-2" size={18} id="incentives-page-import-icon" data-cy="incentives-page-import-icon" />}
            onClick={() => setProjectDrawer(true)}
            textClassName="!text-sm !font-lg"
            className="bg-blue-600 hover:bg-blue-700 w-8 sm:w-auto !h-6 !py-4 sm:h-6 sm:px-5 px-4 "
          />
        </div>
      );
    }
  }, [
    activeKey,
    isPayrollView,
    setProjectDrawer,
    setIsPayrollView,
    selectedRowKeys,
    isMobile,
    isTablet,
    exportIncentiveLoading,
    searchParams,
    handleExport,
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
    <div id="incentives-page-container" data-cy="incentives-page-container" className="!pt-12 sm:pt-2 !mt:5 sm:m-1 ">
      <div id="incentives-page-payroll-view-wrapper" data-cy="incentives-page-payroll-view-wrapper">
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
            id="incentives-page-tabs"
            data-cy="incentives-page-tabs"
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
      <ExportModal data-cy="incentives-page-export-modal" selectedRecognition={selectedRecognition?.id} />

      <ConfirmModal
        data-cy="incentives-page-confirm-modal"
        open={confirmationModal}
        onConfirm={handleYesSendToPayroll}
        onCancel={() => setConfirmationModal(false)}
        loading={isLoading}
        description={'You want to send to payroll'}
      />
    </div>
  );
};

export default Page;
