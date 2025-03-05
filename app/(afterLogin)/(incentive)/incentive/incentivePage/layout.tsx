'use client';
import React, { useMemo } from 'react';
import { Button, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import All from './_components/all/page';
import Projects from './_components/projects/page';
import Sales from './_components/sales/page';
import Management from './_components/management/page';
import Others from './_components/others/page';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import PayRoleView from './_components/all/payrollView';
import { useAllRecognition } from '@/store/server/features/incentive/other/queries';

const IncentivePage: React.FC = () => {
  const {
    activeKey,
    setActiveKey,
    setProjectDrawer,
    isPayrollView,
    setIsPayrollView,
    setShowGenerateModal,
    showGenerateModal,
  } = useIncentiveStore();

  const { data: recognitionData, isLoading: responseLoading } =
    useAllRecognition();

  console.log(recognitionData, 'recognitionDatahsvfhsfd');

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <span className="font-semibold text-md p-3">All</span>,
      children: (
        <div className="mx-3">
          {isPayrollView ? <PayRoleView operationSlot={''} /> : <All />}
        </div>
      ),
    },
    {
      key: '2',
      label: <span className="font-semibold text-md p-3">Projects</span>,
      children: (
        <div className="mx-3">
          <Projects />
        </div>
      ),
    },
    {
      key: '3',
      label: <span className="font-semibold text-md p-3">Sales</span>,
      children: (
        <div className="mx-3">
          <Sales />
        </div>
      ),
    },
    {
      key: '4',
      label: <span className="font-semibold text-md p-3">Management</span>,
      children: (
        <div className="mx-3">
          <Management />
        </div>
      ),
    },
    {
      key: '5',
      label: <span className="font-semibold text-md p-3">Other</span>,
      children: (
        <div className="mx-3">
          <Others />
        </div>
      ),
    },
  ];

  const OperationsSlot = useMemo(() => {
    switch (activeKey) {
      case '1':
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
              <Button
                // onClick={() => setShowGenerateModal(!showGenerateModal)}
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
      case '2':
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
      case '3':
        return (
          <div className="flex items-center justify-center gap-3">
            <Button className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4">
              Export Sales
            </Button>
          </div>
        );
      case '4':
        return (
          <div className="flex items-center justify-center gap-3">
            <Button className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4">
              Export Management
            </Button>
          </div>
        );
      case '5':
        return (
          <div className="flex items-center justify-center gap-3">
            <Button className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4">
              Export Others
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [activeKey, isPayrollView, setProjectDrawer, setIsPayrollView]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (key !== '2') {
      setIsPayrollView(false);
    }
  };

  return (
    <div className="m-1">
      <div className="flex items-center justify-between">
        {isPayrollView && <PayRoleView operationSlot={OperationsSlot} />}
      </div>

      {!isPayrollView && (
        <Tabs
          tabBarStyle={{ borderBottom: '16px solid transparent' }}
          defaultActiveKey="1"
          items={items}
          tabBarExtraContent={OperationsSlot}
          onChange={handleTabChange}
        />
      )}
    </div>
  );
};

export default IncentivePage;
