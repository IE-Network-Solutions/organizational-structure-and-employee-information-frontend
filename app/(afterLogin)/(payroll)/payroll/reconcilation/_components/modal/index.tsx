import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Input, Modal, Table } from 'antd';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { FaEye } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';

interface PayrollReconcilationModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const PayrollReconcilationModal = ({
  isModalOpen,
  setIsModalOpen,
}: PayrollReconcilationModalProps) => {
  const { isMobile, isTablet } = useIsMobile();

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div className="flex items-center gap-2">
          <span>{record.types}</span>
        </div>
      ),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const previous = record.previous || '--';
        return <span>{previous}</span>;
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return <span>{current}</span>;
      },
    },

    {
      title: 'Variance(AMT)',
      dataIndex: 'variance',
      key: 'variance',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Variance(%)',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      minWidth: 150,
      render: (key: string) => Number(key)?.toLocaleString(),
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      minWidth: 150,
      render: (notused: any, record: any) => record.impact || '--',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      minWidth: 150,
      render: (notused: any, record: any) => (
        <div className="flex items-center gap-2">
          <span>{record.action}</span>
        </div>
      ),
    },
  ];

  const payrollVarianceData = [
    {
      key: '1',
      types: 'Basic Salary',
      previous: '6,900,000',
      current: '8,900,000',
      variance: 2000000,
      variancePercentage: 12.7,
      impact: 'Increase due to new hires',
      action: (
        <Button className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none ">
          <FaEye />
        </Button>
      ),
    },
    {
      key: '2',
      types: 'Overtime Payment',
      previous: '450,000',
      current: '520,000',
      variance: 70000,
      variancePercentage: 15.5,
      impact: 'High OT hours',
      action: (
        <Button className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none">
          <FaEye />
        </Button>
      ),
    },
    {
      key: '3',
      types: 'Allowances',
      previous: '1,200,000',
      current: '1,260,000',
      variance: 60000,
      variancePercentage: 5,
      impact: 'Minor adjustment',
      action: (
        <Button className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none ">
          <FaEye />
        </Button>
      ),
    },
    {
      key: '4',
      types: 'Benefits',
      previous: '800,000',
      current: '820,000',
      variance: 20000,
      variancePercentage: 2.5,
      impact: '--',
      action: (
        <Button className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none ">
          <FaEye />
        </Button>
      ),
    },
    {
      key: '5',
      types: 'Deductions',
      previous: '300,000',
      current: '280,000',
      variance: -20000,
      variancePercentage: -6.6,
      impact: 'Reduction in penalties',
      action: (
        <Button className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none ">
          <FaEye />
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      closeIcon={<IoCloseOutline className="text-2xl text-[#1A1C1E]" />}
      width={1130}
      centered
      className="overflow-y-auto"
    >
      <div className="pt-2 px-1">
        <div className="mb-6">
          <h2 className="text-[28px] font-semibold text-[#1A1C1E] leading-none mb-2">
            Salary
          </h2>
          <p className="text-[#74777F] text-[15px]">
            Employee Salary Variances
          </p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search Employee"
            prefix={<Search className="w-4 h-4 text-[#74777F] mr-2" />}
            className="h-12 rounded-lg border-[#C4C7CF] bg-white text-[15px] hover:border-[#4353FF] focus:border-[#4353FF] focus:shadow-none"
          />
        </div>

        <div className="w-full overflow-x-auto">
          <Table
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
            className="custom-payroll-table"
          />
        </div>

        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="payroll-mobile-pagination-view-component"
            totalResults={0}
            pageSize={1}
            onChange={() => {}}
            onShowSizeChange={() => {}}
          />
        ) : (
          <CustomPagination
            data-cy="payroll-desktop-pagination-view-component"
            current={1}
            total={0}
            pageSize={1}
            onChange={() => {}}
            onShowSizeChange={() => {}}
          />
        )}
      </div>
    </Modal>
  );
};

export default PayrollReconcilationModal;
