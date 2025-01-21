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

const IncentivePage: React.FC = () => {
  const {
    activeKey,
    setActiveKey,
    setOpenProjectDrawer,
    isPayrollView,
    setIsPayrollView,
    setShowGenerateModal,
    showGenerateModal,
  } = useIncentiveStore();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: <span className="font-semibold text-md p-3">All</span>,
      children: isPayrollView ? <PayRoleView /> : <All />,
    },
    {
      key: '2',
      label: <span className="font-semibold text-md p-3">Projects</span>,
      children: <Projects />,
    },
    {
      key: '3',
      label: <span className="font-semibold text-md p-3">Sales</span>,
      children: <Sales />,
    },
    {
      key: '4',
      label: <span className="font-semibold text-md p-3">Management</span>,
      children: <Management />,
    },
    {
      key: '5',
      label: <span className="font-semibold text-md p-3">Other</span>,
      children: <Others />,
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
              onClick={() => setOpenProjectDrawer(true)}
              className="bg-[#B2B2FF] border-none text-md font-md text-primary px-4"
            >
              Import Project Data
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
  }, [
    activeKey,
    isPayrollView,
    setOpenProjectDrawer,
    setOpenProjectDrawer,
    setIsPayrollView,
  ]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (key !== '2') {
      setIsPayrollView(false);
    }
  };

  return (
    <div className="m-1">
      <Tabs
        tabBarStyle={{ borderBottom: '16px solid transparent' }}
        defaultActiveKey="1"
        items={items}
        tabBarExtraContent={OperationsSlot}
        onChange={handleTabChange}
      />
    </div>
  );
};

export default IncentivePage;
