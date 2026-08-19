// import CustomPagination from '@/components/customPagination';
// import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
// import { useIsMobile } from '@/hooks/useIsMobile';
// import { useGetReconciliationDetails } from '@/store/server/features/payroll/reconcilation/queries';
// import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
// import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
// import { Button, Modal, Select, Table, ConfigProvider } from 'antd';
// import { FaEye } from 'react-icons/fa';
// import { IoCloseOutline } from 'react-icons/io5';
// import { useQueryClient } from 'react-query';
// import { useRouter } from 'next/navigation';

// interface PayrollReconcilationModalProps {
//   isModalOpen: boolean;
//   setIsModalOpen: (open: boolean) => void;
//   previousPayPeriodId: string;
//   currentPayPeriodId: string;
//   componentType: string;
// }

// const PayrollReconcilationModal = ({
//   isModalOpen,
//   setIsModalOpen,
//   previousPayPeriodId,
//   currentPayPeriodId,
//   componentType,
// }: PayrollReconcilationModalProps) => {
//   const { isMobile, isTablet } = useIsMobile();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const {
//     currentPage,
//     pageSize,
//     setCurrentPage,
//     setPageSize,
//     search,
//     setSearch,
//   } = useReconciliationState();
//   const { data: employeeData } = useGetAllUsers();

//   const {
//     data: reconcilationDetails,
//     isLoading: isLoadingReconciliationDetails,
//   } = useGetReconciliationDetails({
//     previousPayPeriodId,
//     currentPayPeriodId,
//     componentType,
//     pageSize,
//     currentPage,
//     search,
//   });

//   const onPageChange = (page: number, pageSize?: number) => {
//     setCurrentPage(page);
//     if (pageSize) {
//       setPageSize(pageSize);
//     }
//   };

//   const onPageSizeChange = (current: number, size: number) => {
//     setCurrentPage(current);
//     setPageSize(size);
//   };

//   const handleEmployeeSelect = (value: string) => {
//     setSearch(value || '');
//     setCurrentPage(1);
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setSearch('');
//     setCurrentPage(1);
//     // Reset the query cache for reconciliation details
//     queryClient.invalidateQueries('reconciliation-details');
//   };

//   const options =
//     employeeData?.items?.map((emp: any) => ({
//       value: emp.id,
//       label:
//         `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
//       employeeData: emp,
//     })) || [];
//   const columns = [
//     {
//       title: 'Employee ',
//       dataIndex: 'employeeName',
//       key: 'employeeName',
//       minWidth: 200,
//     },
//     {
//       title: 'Description',
//       dataIndex: 'description',
//       key: 'description',
//       minWidth: 150,
//     },
//     {
//       title: 'Previous',
//       dataIndex: 'previous',
//       key: 'previous',
//       minWidth: 150,
//     },
//     {
//       title: 'Current',
//       dataIndex: 'current',
//       key: 'current',
//       minWidth: 150,
//     },

//     {
//       title: 'Difference',
//       dataIndex: 'difference',
//       key: 'difference',
//       minWidth: 150,
//       render: (key: string) => {
//         if (key == null || key === '' || key === 'NaN' || key === '--') {
//           return '--';
//         }
//         const differenceValue = Number(key);
//         if (isNaN(differenceValue)) {
//           return '--';
//         }
//         const className =
//           differenceValue < 0
//             ? 'text-green-500'
//             : differenceValue === 0
//               ? 'text-gray-500'
//               : 'text-red-500';
//         return (
//           <span
//             data-cy="reconcilation-components-modal-index-tsx-index-span-130"
//             className={className}
//           >
//             {key}
//           </span>
//         );
//       },
//     },

//     {
//       title: 'Action',
//       dataIndex: 'action',
//       key: 'action',
//       minWidth: 150,
//       render: (notused: any, record: any) => (
//         <Button
//           className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none "
//           onClick={() => {
//             if (record.userId) {
//               router.push(`/employee-information/${record.userId}`);
//             }
//           }}
//         >
//           <FaEye />
//         </Button>
//       ),
//     },
//   ];

//   const payrollVarianceData =
//     reconcilationDetails?.employeeVariances?.items?.map((item: any) => ({
//       employeeName: item.employeeName,
//       description: item.description,
//       previous: Number(item.previous).toFixed(2),
//       current: Number(item.current).toFixed(2),
//       difference:
//         item.difference != null && !isNaN(Number(item.difference))
//           ? Number(item.difference).toFixed(2)
//           : '--',
//       userId: item.userId || item.employeeId || item.id,
//     }));

//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: '#2543b5',
//           borderRadius: 6,
//           fontFamily: 'inherit',
//         },
//         components: {
//           Modal: {
//             titleFontSize: 18,
//             titleColor: '#000000',
//           },
//           Form: {
//             labelColor: '#333333',
//           },
//         },
//       }}
//     >
//       <Modal
//         open={isModalOpen}
//         onCancel={handleModalClose}
//         footer={null}
//         closeIcon={<IoCloseOutline className="text-2xl text-[#1A1C1E]" />}
//         width={1130}
//         centered
//       >
//         <div
//           data-cy="reconcilation-components-modal-index-tsx-index-div-176"
//           className="pt-2 px-1 flex flex-col h-full max-h-[80vh]"
//         >
//           <div
//             data-cy="reconcilation-components-modal-index-tsx-index-div-177"
//             className="mb-6 flex-shrink-0"
//           >
//             <h2
//               data-cy="reconcilation-components-modal-index-tsx-index-h2-178"
//               className="text-[28px] font-semibold text-[#1A1C1E] leading-none mb-2"
//             >
//               Salary
//             </h2>
//             <p
//               data-cy="reconcilation-components-modal-index-tsx-index-p-181"
//               className="text-[#74777F] text-[15px]"
//             >
//               Employee Salary Variances
//             </p>
//           </div>

//           <div
//             data-cy="reconcilation-components-modal-index-tsx-index-div-186"
//             className="mb-6 flex-shrink-0"
//           >
//             <Select
//               showSearch
//               allowClear
//               className="h-12 w-full rounded-lg border-[#C4C7CF] bg-white text-[15px] hover:border-[#4353FF] focus:border-[#4353FF] focus:shadow-none"
//               placeholder="Search Employee"
//               value={search || undefined}
//               onChange={(value) => handleEmployeeSelect(value)}
//               filterOption={(input, option) => {
//                 const label = option?.label;
//                 return (
//                   typeof label === 'string' &&
//                   label.toLowerCase().includes(input.toLowerCase())
//                 );
//               }}
//               options={options}
//             />
//           </div>

//           <div
//             data-cy="reconcilation-components-modal-index-tsx-index-div-205"
//             className="w-full overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-full"
//           >
//             <Table
//               loading={isLoadingReconciliationDetails}
//               dataSource={payrollVarianceData}
//               columns={columns}
//               pagination={false}
//               className="custom-payroll-table"
//             />
//           </div>

//           {isMobile || isTablet ? (
//             <CustomMobilePagination
//               currentPage={currentPage}
//               totalResults={
//                 reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
//               }
//               pageSize={pageSize}
//               onShowSizeChange={onPageSizeChange}
//             />
//           ) : (
//             <CustomPagination
//               current={currentPage}
//               total={
//                 reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
//               }
//               pageSize={pageSize}
//               onChange={onPageChange}
//               onShowSizeChange={(pageSize) => {
//                 setPageSize(pageSize);
//                 setCurrentPage(1);
//               }}
//             />
//           )}
//         </div>
//       </Modal>
//     </ConfigProvider>
//   );
// };

// export default PayrollReconcilationModal;

import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetReconciliationDetails } from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Button, Modal, Select, Table } from 'antd';
import { FaEye } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { SearchOutlined } from '@ant-design/icons';
import EmptyState from '@/components/empty';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  getMockEmployeeOptions,
  getMockReconciliationDetails,
  isMockPayPeriodId,
} from '@/app/(afterLogin)/(payroll)/payroll/_components/payPeriodSelect/mockPayPeriods';

interface PayrollReconcilationModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  previousPayPeriodId: string;
  currentPayPeriodId: string;
  componentType: string;
}

const PayrollReconcilationModal = ({
  isModalOpen,
  setIsModalOpen,
  previousPayPeriodId,
  currentPayPeriodId,
  componentType,
}: PayrollReconcilationModalProps) => {
  const { isMobile, isTablet } = useIsMobile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    search,
    setSearch,
  } = useReconciliationState();
  const { data: employeeData } = useGetAllUsers();
  const isMockPeriod = isMockPayPeriodId(currentPayPeriodId);

  const {
    data: apiReconcilationDetails,
    isLoading: isLoadingReconciliationDetails,
  } = useGetReconciliationDetails({
    previousPayPeriodId,
    currentPayPeriodId,
    componentType,
    pageSize,
    currentPage,
    search,
  });

  const mockReconcilationDetails = useMemo(
    () =>
      isMockPeriod && isModalOpen && componentType
        ? getMockReconciliationDetails({
            currentPayPeriodId,
            previousPayPeriodId,
            componentType,
            search,
            pageSize,
            currentPage,
          })
        : null,
    [
      isMockPeriod,
      isModalOpen,
      currentPayPeriodId,
      previousPayPeriodId,
      componentType,
      search,
      pageSize,
      currentPage,
    ],
  );

  const reconcilationDetails = isMockPeriod
    ? mockReconcilationDetails
    : apiReconcilationDetails;

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const onPageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  const handleEmployeeSelect = (value: string) => {
    setSearch(value || '');
    setCurrentPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSearch('');
    setCurrentPage(1);
    // Reset the query cache for reconciliation details
    queryClient.invalidateQueries('reconciliation-details');
  };

  const options = isMockPeriod
    ? getMockEmployeeOptions()
    : employeeData?.items?.map((emp: any) => ({
        value: emp.id,
        label:
          `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
        employeeData: emp,
      })) || [];
  const columns = [
    {
      title: 'Employee ',
      dataIndex: 'employeeName',
      key: 'employeeName',
      minWidth: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      minWidth: 150,
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
    },

    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const differenceValue = Number(key);
        if (isNaN(differenceValue)) {
          return '--';
        }
        const className =
          differenceValue < 0
            ? 'text-green-500'
            : differenceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="payroll-reconciliation-detail-difference"
            className={className}
          >
            {key}
          </span>
        );
      },
    },

    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      minWidth: 150,
      render: (notused: any, record: any) => (
        <Button
          type="primary"
          className="flex items-center justify-center !h-10 !w-10 !min-w-10 !p-0 shadow-none"
          onClick={() => {
            if (record.userId) {
              router.push(`/employee-information/${record.userId}`);
            }
          }}
          aria-label="View employee"
        >
          <FaEye />
        </Button>
      ),
    },
  ];

  const payrollVarianceData =
    reconcilationDetails?.employeeVariances?.items?.map((item: any) => ({
      employeeName: item.employeeName,
      description: item.description,
      previous: Number(item.previous).toFixed(2),
      current: Number(item.current).toFixed(2),
      difference:
        item.difference != null && !isNaN(Number(item.difference))
          ? Number(item.difference).toFixed(2)
          : '--',
      userId: item.userId || item.employeeId || item.id,
    }));

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleModalClose}
      footer={null}
      closeIcon={
        <IoCloseOutline
          size={24}
          className="text-gray-600 hover:text-gray-900"
        />
      }
      width={1130}
      centered
      data-cy="payroll-reconciliation-detail-modal"
    >
      <div
        data-cy="payroll-reconciliation-detail-modal-body"
        className="pt-2 px-1 flex flex-col h-full max-h-[80vh]"
      >
        <div
          data-cy="payroll-reconciliation-detail-modal-header"
          className="mb-6 flex-shrink-0"
        >
          <h2
            data-cy="payroll-reconciliation-detail-modal-title"
            className="text-[16px] font-normal text-gray-900 m-0 leading-tight mb-1"
          >
            Salary
          </h2>
          <p
            data-cy="payroll-reconciliation-detail-modal-subtitle"
            className="text-[13px] text-gray-400 m-0"
          >
            Employee Salary Variances
          </p>
        </div>

        <div
          data-cy="payroll-reconciliation-detail-search-wrap"
          className="mb-6 flex-shrink-0"
        >
          <Select
            showSearch
            allowClear
            className="w-full min-h-[40px] [&_.ant-select-arrow]:!top-0 [&_.ant-select-arrow]:!bottom-0 [&_.ant-select-arrow]:!mt-0 [&_.ant-select-arrow]:!h-auto [&_.ant-select-arrow]:!flex [&_.ant-select-arrow]:!items-stretch [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector:hover]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!border-gray-300 [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
            placeholder="Search Employee"
            value={search || undefined}
            onChange={(value) => handleEmployeeSelect(value)}
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === 'string' &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={options}
            suffixIcon={
              <span
                className="flex h-full min-h-full items-center self-stretch border-l border-gray-200 pl-3 text-gray-400"
                data-cy="payroll-reconciliation-detail-search-suffix"
              >
                <SearchOutlined className="text-base" />
              </span>
            }
            data-cy="payroll-reconciliation-detail-search-select"
          />
        </div>

        <div
          data-cy="payroll-reconciliation-detail-table-wrap"
          className="payroll-table-scroll-host w-full overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-full scrollbar-none rounded-lg"
        >
          {!isMockPeriod && isLoadingReconciliationDetails ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              dataSource={payrollVarianceData}
              columns={columns}
              pagination={false}
              className="payroll-table"
              rowKey={(record: any) => record.userId || record.employeeName}
              rowClassName={(record: any, index: number) => {
                void record;
                return index % 2 === 1 ? 'payroll-zebra-row' : '';
              }}
              locale={{
                emptyText: (
                  <div
                    className="payroll-table-empty-viewport-center py-10"
                    data-cy="payroll-reconciliation-detail-empty-wrap"
                  >
                    <EmptyState
                      minimal
                      description="No employee found"
                      data-cy="payroll-reconciliation-detail-empty"
                      className="!py-2"
                    />
                  </div>
                ),
              }}
            />
          )}
        </div>

        <div
          data-cy="payroll-reconciliation-detail-pagination"
          className="bg-white px-0 mt-2 flex-shrink-0"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              data-cy="payroll-reconciliation-detail-mobile-pagination"
              currentPage={currentPage}
              totalResults={
                reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
              }
              pageSize={pageSize}
              onShowSizeChange={onPageSizeChange}
            />
          ) : (
            <CustomPagination
              data-cy="payroll-reconciliation-detail-desktop-pagination"
              current={currentPage}
              total={
                reconcilationDetails?.employeeVariances?.meta?.totalItems ?? 0
              }
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(pageSize) => {
                setPageSize(pageSize);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PayrollReconcilationModal;
