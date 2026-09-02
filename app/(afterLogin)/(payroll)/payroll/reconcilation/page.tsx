// 'use client';

// import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
// import CustomBreadcrumb from '@/components/common/breadCramp';
// import CustomPagination from '@/components/customPagination';
// import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
// import { useIsMobile } from '@/hooks/useIsMobile';
// import {
//   Button,
//   Card,
//   Col,
//   Modal,
//   Row,
//   Select,
//   Table,
//   Tag,
//   Tabs,
//   notification,
// } from 'antd';
// import { PiExportLight } from 'react-icons/pi';
// import { MdKeyboardArrowLeft } from 'react-icons/md';
// import { useState, useEffect } from 'react';
// import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
// import ReconciliationDetailTable from './_components/reconciliationDetailTable';

// import {
//   useGetPayPeriod,
//   useGetActivePayroll,
// } from '@/store/server/features/payroll/payroll/queries';
// import dayjs from 'dayjs';
// import {
//   useGetReconciliation,
//   useGetReconciliationDetails,
// } from '@/store/server/features/payroll/reconcilation/queries';
// import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
// import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
// import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
// import { useRouter } from 'next/navigation';
// import {
//   useGetPayrollApprovalByPayPeriodId,
//   useGetPendingPayrollApprovals,
// } from '@/store/server/features/payroll/payrollApproval/queries';
// import {
//   useApprovePayrollApproval,
//   useLastApprovingPayroll,
// } from '@/store/server/features/payroll/payrollApproval/mutation';
// import { useAuthenticationStore } from '@/store/uistate/features/authentication';

// const { Option } = Select;

// const impactColors: Record<string, string> = {
//   Low: '#52c41a',
//   Medium: '#faad14',
//   High: '#ff4d4f',
// };

// const reconciliationTabs = [
//   { key: 'all', label: 'All Category' },
//   { key: 'basic', label: 'Basic' },
//   { key: 'allowance', label: 'Allowance' },
//   { key: 'benefit', label: 'Benefit' },
//   { key: 'vp', label: 'VP' },
//   { key: 'incentive', label: 'Incentive' },
//   { key: 'gross', label: 'Gross' },
//   { key: 'tax', label: 'Tax' },
//   { key: 'pension', label: 'Pension' },
//   { key: 'cost-sharing', label: 'Cost sharing' },
//   { key: 'deduction', label: 'Deduction' },
//   { key: 'net-pay', label: 'Net Pay' },
// ];

// const filterComponentByTab = (item: any, activeKey: string) => {
//   const label = String(item.label || '').toLowerCase();
//   const type = String(item.type || '').toLowerCase();

//   switch (activeKey) {
//     case 'basic':
//       return (
//         label.includes('basic') ||
//         type.includes('basic_salary') ||
//         type.includes('basic')
//       );
//     case 'allowance':
//       return label.includes('allowance') || type.includes('allowance');
//     case 'benefit':
//       return label.includes('benefit') || type.includes('benefit');
//     case 'vp':
//       return (
//         label.includes('vp') ||
//         type.includes('vp') ||
//         label.includes('variable') ||
//         type.includes('variable')
//       );
//     case 'incentive':
//       return label.includes('incentive') || type.includes('incentive');
//     case 'gross':
//       return label.includes('gross') || type.includes('gross');
//     case 'tax':
//       return label.includes('tax') || type.includes('tax');
//     case 'pension':
//       return label.includes('pension') || type.includes('pension');
//     case 'cost-sharing':
//       return (
//         label.includes('cost sharing') ||
//         label.includes('cost-sharing') ||
//         type.includes('cost_sharing')
//       );
//     case 'deduction':
//       return label.includes('deduction') || type.includes('deduction');
//     case 'net-pay':
//       return label.includes('net pay') || type.includes('net_pay');
//     default:
//       return true;
//   }
// };

// const PayrollReconcilation = () => {
//   const [activeTabKey, setActiveTabKey] = useState<string>('all');
//   const { isMobile, isTablet } = useIsMobile();
//   const router = useRouter();
//   const {
//     previousPayPeriodId,
//     currentPayPeriodId,
//     componentType,
//     currentPage,
//     pageSize,
//     search,
//     setPreviousPayPeriodId,
//     setCurrentPayPeriodId,
//     setComponentType,
//     setCurrentPage,
//     setPageSize,
//     setSearch,
//   } = useReconciliationState();

//   const { data, isLoading } = useGetReconciliation({
//     previousPayPeriodId,
//     currentPayPeriodId,
//   });

//   const { data: payPeriodData } = useGetPayPeriod();
//   const { pageSize: employeePageSize, currentPage: employeeCurrentPage } =
//     useEmployeeStore();
//   const [activeTab, setActiveTab] = useState('1');
//   const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

//   const authStore = useAuthenticationStore.getState();
//   const { userId } = useAuthenticationStore();
//   const tenantId = authStore.tenantId;
//   const userRollId = authStore.userData?.roleId;

//   // Fetch pending approvals with payPeriodId
//   const { data: pendingApprovals, refetch: refetchPendingApprovals } =
//     useGetPendingPayrollApprovals(currentPayPeriodId, 1, 10);
//   const pendingApproval = pendingApprovals?.items?.[0] ?? null;
//   const { mutate: approvePayroll, isLoading: isApproving } =
//     useApprovePayrollApproval();
//   const { mutate: lastApproving, isLoading: isLastApproving } =
//     useLastApprovingPayroll();
//   // Fetch payroll approval by payPeriodId
//   const { refetch: refetchPayrollApprovalByPayPeriod } =
//     useGetPayrollApprovalByPayPeriodId(currentPayPeriodId);
//   const { data: payroll, refetch } = useGetActivePayroll(
//     '',
//     employeePageSize || 10,
//     employeeCurrentPage || 1,
//   );

//   const { data: reconciliationDetails, isLoading: isLoadingDetails } =
//     useGetReconciliationDetails({
//       previousPayPeriodId,
//       currentPayPeriodId,
//       componentType,
//       pageSize,
//       currentPage,
//       search,
//     });

//   const { data: employeeData } = useGetAllUsers();

//   const formatNumber = (value: number | string | undefined | null): string => {
//     if (value === undefined || value === null || value === '') return '0';
//     const num = typeof value === 'string' ? Number(value) : value;
//     if (!Number.isFinite(num)) return '0';
//     return num
//       .toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
//       .replace(/\.0+$/, '')
//       .replace(/(\.\d*[1-9])0+$/, '$1');
//   };
//   const formatETB = (value: number | string | undefined | null): string => {
//     if (value === undefined || value === null || value === '') return 'ETB 0';
//     const num = typeof value === 'string' ? Number(value) : value;
//     if (!Number.isFinite(num)) return 'ETB 0';
//     const formatted = num.toLocaleString('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//     return `ETB ${formatted}`;
//   };

//   const employeeOptions =
//     employeeData?.items?.map((emp: any) => ({
//       value: emp.id,
//       label:
//         `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
//     })) || [];

//   useEffect(() => {
//     if (payroll?.items?.length > 0 && payPeriodData?.length > 0) {
//       // Set current pay period if not already set
//       if (!currentPayPeriodId) {
//         const defaultPayPeriodId = payroll.items[0]?.payPeriodId;
//         const defaultPayPeriod = payPeriodData?.find(
//           (period: any) => period.id === defaultPayPeriodId,
//         );

//         if (defaultPayPeriod) {
//           setCurrentPayPeriodId(defaultPayPeriodId);
//         }
//       }
//     }
//   }, [
//     payroll?.items,
//     payPeriodData,
//     currentPayPeriodId,
//     setCurrentPayPeriodId,
//   ]);

//   useEffect(() => {
//     // Set previous pay period based on current pay period
//     if (
//       payPeriodData?.length > 0 &&
//       currentPayPeriodId &&
//       !previousPayPeriodId
//     ) {
//       // Sort pay periods by start date to find the previous one
//       const sortedPayPeriods = [...payPeriodData].sort(
//         (a: any, b: any) =>
//           new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
//       );

//       const currentIndex = sortedPayPeriods.findIndex(
//         (period: any) => period.id === currentPayPeriodId,
//       );

//       if (currentIndex > 0) {
//         const previousPayPeriod = sortedPayPeriods[currentIndex - 1];
//         setPreviousPayPeriodId(previousPayPeriod.id);
//       }
//     }
//   }, [
//     payPeriodData,
//     currentPayPeriodId,
//     previousPayPeriodId,
//     setPreviousPayPeriodId,
//   ]);

//   // Keep componentType in sync with active tab and available components
//   useEffect(() => {
//     if (activeTabKey === 'all') {
//       if (componentType) {
//         setComponentType('');
//       }
//       return;
//     }

//     const componentsForTab =
//       data?.components?.filter((item: any) =>
//         filterComponentByTab(item, activeTabKey),
//       ) || [];

//     if (componentsForTab.length > 0) {
//       const firstType = componentsForTab[0]?.type;
//       if (firstType && firstType !== componentType) {
//         setComponentType(firstType);
//       }
//     }
//   }, [activeTabKey, data?.components, componentType, setComponentType]);

//   const handleGoBack = () => {
//     router.back();
//   };

//   const columns = [
//     {
//       title: (
//         <span
//           id="payroll-reconciliation-types-title"
//           data-cy="payroll-reconciliation-types-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Types
//         </span>
//       ),
//       dataIndex: 'types',
//       key: 'types',
//       minWidth: 200,
//       render: (notused: any, record: any) => (
//         <div
//           data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-122"
//           className="flex items-center gap-2"
//         >
//           <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-123">
//             {record.types}
//           </span>
//         </div>
//       ),
//     },
//     {
//       title: (
//         <span
//           id="payroll-reconciliation-previous-title"
//           data-cy="payroll-reconciliation-previous-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Previous
//         </span>
//       ),
//       dataIndex: 'previous',
//       key: 'previous',
//       minWidth: 150,
//       render: (notused: any, record: any) => {
//         const previous = record.previous || '--';
//         return (
//           <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-134">
//             {previous}
//           </span>
//         );
//       },
//     },
//     {
//       title: (
//         <span
//           id="payroll-reconciliation-current-title"
//           data-cy="payroll-reconciliation-current-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Current
//         </span>
//       ),
//       dataIndex: 'current',
//       key: 'current',
//       minWidth: 150,
//       render: (nonused: any, record: any) => {
//         const current = record.current || '--';
//         return (
//           <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-144">
//             {current}
//           </span>
//         );
//       },
//     },

//     {
//       title: (
//         <span
//           id="payroll-reconciliation-variance-title"
//           data-cy="payroll-reconciliation-variance-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Variance(AMT)
//         </span>
//       ),
//       dataIndex: 'variance',
//       key: 'variance',
//       minWidth: 150,
//       render: (key: string) => {
//         if (key == null || key === '' || key === 'NaN' || key === '--') {
//           return '--';
//         }
//         const varianceValue = Number(key);
//         if (isNaN(varianceValue)) {
//           return '--';
//         }
//         const className =
//           varianceValue < 0
//             ? 'text-green-500'
//             : varianceValue === 0
//               ? 'text-gray-500'
//               : 'text-red-500';
//         return (
//           <span
//             data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-167"
//             className={className}
//           >
//             {key}
//           </span>
//         );
//       },
//     },
//     {
//       title: (
//         <span
//           id="payroll-reconciliation-variance-percentage-title"
//           data-cy="payroll-reconciliation-variance-percentage-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Variance(%)
//         </span>
//       ),
//       dataIndex: 'variancePercentage',
//       key: 'variancePercentage',
//       minWidth: 150,
//       render: (key: string) => {
//         if (key == null || key === '' || key === 'NaN' || key === '--') {
//           return '--';
//         }
//         // Extract numeric value from string (handles percentage signs, etc.)
//         const numericString = String(key).replace(/[^\d.-]/g, '');
//         const varianceValue = Number(numericString);
//         if (isNaN(varianceValue)) {
//           return '--';
//         }
//         const className =
//           varianceValue < 0
//             ? 'text-green-500'
//             : varianceValue === 0
//               ? 'text-gray-500'
//               : 'text-red-500';
//         return (
//           <span
//             data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-191"
//             className={className}
//           >
//             {key}
//           </span>
//         );
//       },
//     },
//     {
//       title: (
//         <span
//           id="payroll-reconciliation-impact-title"
//           data-cy="payroll-reconciliation-impact-title"
//           className="text-sm font-bold text-[#4b4b4b]"
//         >
//           Impact
//         </span>
//       ),
//       dataIndex: 'impact',
//       key: 'impact',
//       minWidth: 150,
//       render: (notused: any, record: any) => record.impact || '--',
//     },
//   ];

//   const filteredComponents =
//     data?.components?.filter((item: any) =>
//       filterComponentByTab(item, activeTabKey),
//     ) || [];

//   const payrollVarianceData = filteredComponents.map((item: any) => ({
//     key: item.type || item.label,
//     types: item.label,
//     previous: Number(item.previous).toLocaleString(),
//     current: Number(item.current).toLocaleString(),
//     variance:
//       item.variance != null && !isNaN(Number(item.variance))
//         ? Number(item.variance).toLocaleString()
//         : '--',
//     variancePercentage:
//       item?.variancePercentage != null && item?.variancePercentage !== ''
//         ? item.variancePercentage
//         : '--',
//     impact: (
//       <Tag color={impactColors[item.impact as keyof typeof impactColors]}>
//         {item.impact}
//       </Tag>
//     ),
//   }));

//   // Tab key -> category label (used to find component type from data?.components)
//   const TAB_KEY_TO_LABEL: Record<string, string> = {
//     '2': 'Basic',
//     '3': 'Allowance',
//     '4': 'Benefit',
//     '5': 'VP',
//     '6': 'Incentive',
//     '7': 'Gross',
//     '8': 'Tax',
//     '9': 'Pension',
//     '10': 'Cost Sharing',
//     '11': 'Deduction',
//     '12': 'Net Pay',
//   };

//   /** Resolve API componentType for a tab (e.g. BASIC_SALARY for Basic) from reconciliation components */
//   const getComponentForTabKey = (tabKey: string): any | undefined => {
//     if (!data?.components?.length) return undefined;

//     const label = TAB_KEY_TO_LABEL[tabKey];
//     let matched = label
//       ? data.components.find((c: any) =>
//           c.label?.toLowerCase().includes(label.toLowerCase()),
//         )
//       : undefined;

//     // Special handling for VP tab: fall back to VARIABLE_PAY type
//     if (!matched && tabKey === '5') {
//       matched = data.components.find(
//         (c: any) => c.type === 'VARIABLE_PAY' || c.label === 'Variable Pay',
//       );
//     }

//     return matched;
//   };

//   /** Tab 1: summary table (All Category). Tabs 2–12: detail table (same as modal). */
//   const renderTabContent = (tabKey: string) => {
//     if (tabKey === '1') {
//       return (
//         <div
//           data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-405"
//           className="w-full overflow-x-auto scrollbar-hide"
//         >
//           <Table
//             loading={isLoading}
//             dataSource={payrollVarianceData}
//             columns={columns}
//             pagination={false}
//             rowHoverable={false}
//             rowClassName={(notUsed, index) =>
//               index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
//             }
//           />
//         </div>
//       );
//     }
//     const component = getComponentForTabKey(tabKey);
//     const componentType = component?.type;
//     return (
//       <ReconciliationDetailTable
//         previousPayPeriodId={previousPayPeriodId ?? ''}
//         currentPayPeriodId={currentPayPeriodId ?? ''}
//         componentType={componentType ?? ''}
//         enabled={Boolean(componentType)}
//         componentSummary={component}
//       />
//     );
//   };

//   const getTabLabel = (key: string, text: string) => (
//     <span
//       data-cy="payroll-reconciliation-tab-label"
//       className={activeTab === key ? 'font-bold' : 'font-normal'}
//     >
//       {text}
//     </span>
//   );

//   const items: any = [
//     {
//       key: '1',
//       label: getTabLabel('1', 'All Category'),
//       children: renderTabContent('1'),
//     },
//     {
//       key: '2',
//       label: getTabLabel('2', 'Basic'),
//       children: renderTabContent('2'),
//     },
//     {
//       key: '3',
//       label: getTabLabel('3', 'Allowance'),
//       children: renderTabContent('3'),
//     },
//     {
//       key: '4',
//       label: getTabLabel('4', 'Benefit'),
//       children: renderTabContent('4'),
//     },
//     {
//       key: '5',
//       label: getTabLabel('5', 'VP'),
//       children: renderTabContent('5'),
//     },
//     {
//       key: '6',
//       label: getTabLabel('6', 'Incentive'),
//       children: renderTabContent('6'),
//     },
//     {
//       key: '7',
//       label: getTabLabel('7', 'Gross'),
//       children: renderTabContent('7'),
//     },
//     {
//       key: '8',
//       label: getTabLabel('8', 'Tax'),
//       children: renderTabContent('8'),
//     },
//     {
//       key: '9',
//       label: getTabLabel('9', 'Pension'),
//       children: renderTabContent('9'),
//     },
//     {
//       key: '10',
//       label: getTabLabel('10', 'Cost Sharing'),
//       children: renderTabContent('10'),
//     },
//     {
//       key: '11',
//       label: getTabLabel('11', 'Deduction'),
//       children: renderTabContent('11'),
//     },
//     {
//       key: '12',
//       label: getTabLabel('12', 'Net Pay'),
//       children: renderTabContent('12'),
//     },
//   ];

//   const handleApprovePayroll = () => {
//     if (!pendingApproval) return;

//     const approvalWorkflowId = String(pendingApproval.approvalWorkflowId || '');
//     const stepOrder = Number(pendingApproval.nextApprover?.[0]?.stepOrder || 0);

//     if (!approvalWorkflowId || stepOrder === 0) {
//       notification.error({
//         message: 'Invalid Approval Data',
//         description: 'Missing required approval information. Please try again.',
//       });
//       return;
//     }

//     const approvalData = {
//       approvalWorkflowId,
//       stepOrder,
//       requestId: pendingApproval.id,
//       approvedUserId: userId,
//       approverRoleId: userRollId,
//       action: 'Approved',
//       tenantId,
//     };

//     const handleSuccess = () => {
//       setIsApproveModalOpen(false);
//       refetchPendingApprovals();
//       refetchPayrollApprovalByPayPeriod();
//       refetch();
//     };

//     approvePayroll(approvalData, {
//       onSuccess: (data) => {
//         if (data?.last === true) {
//           lastApproving(undefined, { onSuccess: handleSuccess });
//         } else {
//           handleSuccess();
//         }
//       },
//     });
//   };

//   const MobileFilters = () => (
//     <div
//       data-cy="reconciliation-detail-table-mobile-filters-container"
//       className="flex flex-col gap-4 bg-white border border-[#D9D9D9] rounded-lg p-4"
//     >
//       <BlockWrapper className="h-auto w-full bg-white">
//         {/* Header */}
//         <div
//           className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
//           id="manage-employees-header"
//           data-cy="manage-employees-header"
//         >
//           <div
//             className="flex items-center gap-3"
//             data-cy="payroll-reconciliation-header-left"
//           >
//             <Button
//               value={'back'}
//               name="back"
//               onClick={handleGoBack}
//               className="border-none bg-transparent p-0 mr-2 flex items-center justify-center"
//               id="payroll-reconciliation-back-btn"
//               data-cy="payroll-reconciliation-back-btn"
//             >
//               <MdKeyboardArrowLeft className="text-xl leading-none block" />
//             </Button>
//             <div data-cy="payroll-reconciliation-title-wrapper">
//               <CustomBreadcrumb
//                 title="Payroll Reconciliation"
//                 subtitle="Employee Payroll Reconciliation"
//               />
//             </div>
//           </div>

//           <div
//             data-cy="payroll-reconciliation-header-actions"
//             className="flex flex-wrap items-center gap-3"
//           >
//             <Button
//               type="default"
//               size="large"
//               className="flex items-center gap-2 border-gray-300 text-gray-700"
//               icon={<PiExportLight />}
//             >
//               <span data-cy="payroll-reconciliation-export-text">Export</span>
//             </Button>
//             <Button
//               type="primary"
//               size="large"
//               className="flex items-center gap-2 bg-primary hover:bg-primary/90 border-none"
//               data-cy="payroll-reconciliation-approve-btn"
//             >
//               <span data-cy="payroll-reconciliation-approve-text">
//                 Approve Payroll
//               </span>
//             </Button>
//             {true && (
//               <Button
//                 id="payroll-approve-button"
//                 data-cy="payroll-approve-button"
//                 type="primary"
//                 icon={<DoneOutlineIcon className="text-[10px]" />}
//                 className="h-8 w-8 sm:w-auto sm:px-4"
//                 onClick={() => setIsApproveModalOpen(true)}
//                 loading={isApproving || isLastApproving}
//                 size="small"
//               >
//                 {!isMobile && 'Approve Payroll'}
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Filters */}
//         <Row
//           gutter={[16, 16]}
//           align="middle"
//           className="mb-6 justify-end"
//           data-cy="payroll-reconciliation-filters-row"
//         >
//           <Col xs={24} sm={12} md={6} lg={5} xl={4}>
//             <div data-cy="payroll-reconciliation-previous-period-select">
//               <Select
//                 placeholder="Previous Pay Period"
//                 allowClear
//                 style={{ width: '100%', height: '48px' }}
//                 value={previousPayPeriodId}
//                 onChange={(value) => setPreviousPayPeriodId(value)}
//               >
//                 {payPeriodData?.map((period: any) => (
//                   <Option key={period.id} value={period.id}>
//                     {dayjs(period.startDate).format('MMM DD, YYYY')} --
//                     {dayjs(period.endDate).format('MMM DD, YYYY')}
//                   </Option>
//                 ))}
//               </Select>
//             </div>
//           </Col>
//           <Col xs={24} sm={12} md={6} lg={5} xl={4}>
//             <div data-cy="payroll-reconciliation-current-period-select">
//               <Select
//                 allowClear
//                 className="min-h-12 w-full"
//                 placeholder="Current Pay Period"
//                 value={currentPayPeriodId}
//                 onChange={(value) => setCurrentPayPeriodId(value)}
//               >
//                 {payPeriodData?.map((period: any) => (
//                   <Option key={period.id} value={period.id}>
//                     {dayjs(period.startDate).format('MMM DD, YYYY')} --
//                     {dayjs(period.endDate).format('MMM DD, YYYY')}
//                   </Option>
//                 ))}
//               </Select>
//             </div>
//           </Col>
//         </Row>

//         {/* Summary cards */}
//         <div
//           data-cy="payroll-reconciliation-summary-cards"
//           className="grid grid-cols-1 md:grid-cols-3 gap-6"
//         >
//           <Card
//             className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
//             loading={isLoading}
//           >
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-329"
//               className="text-[#707070] text-base mb-2 font-normal"
//             >
//               Total Payroll Cost
//             </p>
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-332"
//               className="text-3xl font-bold text-black"
//             >
//               {formatETB(data?.summary?.totalPayrollCost)}
//             </p>

//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-338"
//               className="text-sm text-[#4d4d4d] mt-3 font-normal"
//             >
//               Previous:{' '}
//               <span
//                 data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-340"
//                 className="font-normal text-[#4d4d4d]"
//               >
//                 {formatNumber(data?.summary?.previousPayrollCost)}
//               </span>
//             </p>
//           </Card>
//           {/* Net Variance */}
//           <Card
//             className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
//             loading={isLoading}
//           >
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-349"
//               className="text-[#707070] text-base mb-2 font-normal"
//             >
//               Net Variance
//             </p>
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-352"
//               className="text-3xl font-bold text-black"
//             >
//               {formatETB(data?.summary?.netVariance)}
//             </p>
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-355"
//               className="text-sm text-[#4d4d4d] mt-3 font-normal"
//             >
//               <span
//                 data-cy="reconciliation-detail-table-net-variance-negative-container"
//                 className="text-[#F04438]"
//               >
//                 -4
//               </span>{' '}
//               <span
//                 data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-357"
//                 className="font-normal text-[#4d4d4d]"
//               >
//                 Since Last pay period
//               </span>
//             </p>
//           </Card>
//           {/* Headcount Impact */}
//           <Card
//             className="w-full rounded-lg border border-[#D0D7E2] shadow-none"
//             loading={isLoading}
//           >
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-381"
//               className="text-[#707070] text-base mb-2 font-normal"
//             >
//               Headcount Impact
//             </p>
//             <p
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-384"
//               className="text-3xl font-bold text-black"
//             >
//               {formatNumber(data?.summary?.headcount)} Employees
//             </p>

//             <div
//               data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-388"
//               className="flex gap-4 text-sm mt-3 text-black"
//             >
//               <p
//                 className="font-normal text-[#4d4d4d]"
//                 data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-389"
//               >
//                 Previous:{' '}
//                 <span
//                   data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-391"
//                   className="font-normal text-[#4d4d4d]"
//                 >
//                   {formatNumber(data?.summary?.previousHeadcount)}
//                 </span>
//               </p>
//               <p
//                 className="font-normal text-[#4d4d4d]"
//                 data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-395"
//               >
//                 Termination:{' '}
//                 <span
//                   data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-397"
//                   className="font-normal text-[#4d4d4d]"
//                 >
//                   {formatNumber(data?.summary?.terminations)}
//                 </span>
//               </p>
//             </div>
//           </Card>
//         </div>
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           items={items}
//           tabBarGutter={24}
//           size="large"
//           tabBarStyle={{ textAlign: 'center' }}
//           data-cy="employee-detail-tabs"
//         />
//         <Modal
//           data-cy="payroll-approve-modal"
//           open={isApproveModalOpen}
//           onCancel={() => setIsApproveModalOpen(false)}
//           footer={null}
//           centered
//           width={600}
//           className="p-6"
//         >
//           <div
//             data-cy="payroll-reconciliation-tabs"
//             className="w-full mt-8 overflow-x-auto"
//           >
//             <Tabs
//               activeKey={activeTabKey}
//               onChange={(key) => setActiveTabKey(key)}
//               items={reconciliationTabs}
//               className="mb-2"
//             />
//           </div>

//           {activeTabKey === 'all' && payrollVarianceData.length > 0 && (
//             <div
//               data-cy="payroll-reconciliation-all-category-table"
//               className="w-full mt-4 overflow-x-auto"
//             >
//               <Table
//                 loading={isLoading}
//                 dataSource={payrollVarianceData}
//                 columns={columns}
//                 pagination={false}
//               />
//             </div>
//           )}

//           {activeTabKey !== 'all' && payrollVarianceData.length > 0 && (
//             <div
//               data-cy="payroll-reconciliation-detail-section"
//               className="mt-8 flex flex-col md:flex-row gap-6 items-start"
//             >
//               {/* Left summary panel for selected component */}
//               <div
//                 data-cy="payroll-reconciliation-detail-summary-card"
//                 className="w-full md:w-[260px] border border-[#f0f0f0] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] bg-white shrink-0"
//               >
//                 {(() => {
//                   const selected = payrollVarianceData[0] as any;
//                   const impactLabel = selected?.impact?.props?.children || '';
//                   const impactKey =
//                     typeof impactLabel === 'string'
//                       ? (impactLabel as keyof typeof impactColors)
//                       : 'Low';

//                   return (
//                     <>
//                       <div
//                         className="mb-4"
//                         data-cy="payroll-reconciliation-detail-summary-previous"
//                       >
//                         <div
//                           className="text-[#00000073] mb-1 text-[13px]"
//                           data-cy="payroll-reconciliation-detail-summary-previous-label"
//                         >
//                           Total Previous
//                         </div>
//                         <div
//                           className="text-[15px]"
//                           data-cy="payroll-reconciliation-detail-summary-previous-value"
//                         >
//                           {selected?.previous ?? '--'}
//                         </div>
//                       </div>

//                       <div
//                         className="mb-5"
//                         data-cy="payroll-reconciliation-detail-summary-current"
//                       >
//                         <div
//                           className="text-[#00000073] mb-1 text-[13px]"
//                           data-cy="payroll-reconciliation-detail-summary-current-label"
//                         >
//                           Current
//                         </div>
//                         <div
//                           className="text-[15px]"
//                           data-cy="payroll-reconciliation-detail-summary-current-value"
//                         >
//                           {selected?.current ?? '--'}
//                         </div>
//                       </div>

//                       <div
//                         className="border-t border-[#f0f0f0] pt-4 mb-4"
//                         data-cy="payroll-reconciliation-detail-summary-variance-amt"
//                       >
//                         <div
//                           className="text-[#00000073] mb-1 text-[13px]"
//                           data-cy="payroll-reconciliation-detail-summary-variance-amt-label"
//                         >
//                           Variance(AMT)
//                         </div>
//                         <div
//                           className="text-[#ff4d4f]"
//                           data-cy="payroll-reconciliation-detail-summary-variance-amt-value"
//                         >
//                           {selected?.variance ?? '--'}
//                         </div>
//                       </div>

//                       <div
//                         className="mb-5"
//                         data-cy="payroll-reconciliation-detail-summary-variance-pct"
//                       >
//                         <div
//                           className="text-[#00000073] mb-1 text-[13px]"
//                           data-cy="payroll-reconciliation-detail-summary-variance-pct-label"
//                         >
//                           Variance(%)
//                         </div>
//                         <div
//                           className="text-[#52c41a]"
//                           data-cy="payroll-reconciliation-detail-summary-variance-pct-value"
//                         >
//                           {selected?.variancePercentage ?? '--'}
//                         </div>
//                       </div>

//                       <div
//                         className="border-t border-[#f0f0f0] pt-4"
//                         data-cy="payroll-reconciliation-detail-summary-impact"
//                       >
//                         <div
//                           className="text-[#00000073] mb-2 text-[13px]"
//                           data-cy="payroll-reconciliation-detail-summary-impact-label"
//                         >
//                           Impact
//                         </div>
//                         <div
//                           className="flex items-center gap-2"
//                           data-cy="payroll-reconciliation-detail-summary-impact-value"
//                         >
//                           <span
//                             className="w-1.5 h-1.5 rounded-full"
//                             style={{
//                               backgroundColor:
//                                 impactColors[impactKey] || impactColors.Low,
//                             }}
//                             data-cy="payroll-reconciliation-detail-summary-impact-value-color"
//                           />
//                           <span
//                             className="text-[13px]"
//                             data-cy="payroll-reconciliation-detail-summary-impact-text"
//                           >
//                             {impactLabel || '--'}
//                           </span>
//                         </div>
//                       </div>
//                     </>
//                   );
//                 })()}
//               </div>

//               {/* Right panel: employees table for selected component */}
//               <div
//                 data-cy="payroll-reconciliation-detail-table-panel"
//                 className="flex-1 w-full bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
//               >
//                 {/* Search / employee select */}
//                 <div
//                   data-cy="payroll-reconciliation-detail-search-wrap"
//                   className="w-full max-w-xs mb-5"
//                 >
//                   <Select
//                     showSearch
//                     allowClear
//                     className="h-11 w-full rounded-lg border-[#d9d9d9] bg-white text-[14px]"
//                     placeholder="Search Employee"
//                     value={search || undefined}
//                     onChange={(value) => {
//                       setSearch(value || '');
//                       setCurrentPage(1);
//                     }}
//                     filterOption={(input, option) => {
//                       const label = option?.label as string | undefined;
//                       return (
//                         typeof label === 'string' &&
//                         label.toLowerCase().includes(input.toLowerCase())
//                       );
//                     }}
//                     data-cy="payroll-reconciliation-detail-search-select"
//                     options={employeeOptions}
//                   />
//                 </div>

//                 <div
//                   data-cy="payroll-reconciliation-detail-table-wrapper"
//                   className="bg-white rounded-lg overflow-hidden border-b border-[#f0f0f0]"
//                 >
//                   <table
//                     className="w-full text-left border-collapse"
//                     data-cy="payroll-reconciliation-detail-table"
//                   >
//                     <thead
//                       className="bg-[#fafafa]"
//                       data-cy="payroll-reconciliation-detail-table-head"
//                     >
//                       <tr data-cy="payroll-reconciliation-detail-table-head-row">
//                         <th
//                           className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
//                           data-cy="payroll-reconciliation-detail-table-head-employee"
//                         >
//                           Employee
//                         </th>
//                         <th
//                           className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
//                           data-cy="payroll-reconciliation-detail-table-head-current"
//                         >
//                           Current
//                         </th>
//                         <th
//                           className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
//                           data-cy="payroll-reconciliation-detail-table-head-previous"
//                         >
//                           Previous
//                         </th>
//                         <th
//                           className="py-3.5 px-4 font-medium text-[#000000d9] border-b border-[#f0f0f0]"
//                           data-cy="payroll-reconciliation-detail-table-head-diff"
//                         >
//                           Difference
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody
//                       className="divide-y divide-[#f0f0f0]"
//                       data-cy="payroll-reconciliation-detail-table-body"
//                     >
//                       {isLoadingDetails && (
//                         <tr data-cy="payroll-reconciliation-detail-table-loading-row">
//                           <td
//                             colSpan={4}
//                             className="py-8 text-center text-[#00000073]"
//                             data-cy="payroll-reconciliation-detail-table-loading-cell"
//                           >
//                             Loading...
//                           </td>
//                         </tr>
//                       )}
//                       {!isLoadingDetails &&
//                         reconciliationDetails?.employeeVariances?.items?.map(
//                           (item: any) => {
//                             const employeeName = item.employeeName || '--';
//                             const current = Number(item.current).toFixed(2);
//                             const previous = Number(item.previous).toFixed(2);
//                             const rawDiff =
//                               item.difference != null &&
//                               !isNaN(Number(item.difference))
//                                 ? Number(item.difference).toFixed(2)
//                                 : '--';
//                             const diffNum = Number(rawDiff);
//                             const diffClass =
//                               rawDiff === '--'
//                                 ? 'text-[#000000d9]'
//                                 : diffNum > 0
//                                   ? 'text-[#ff4d4f]'
//                                   : diffNum < 0
//                                     ? 'text-[#52c41a]'
//                                     : 'text-[#000000d9]';

//                             return (
//                               <tr
//                                 data-cy="payroll-reconciliation-detail-table-body-row"
//                                 key={
//                                   item.userId ||
//                                   item.employeeId ||
//                                   item.id ||
//                                   employeeName
//                                 }
//                                 className="hover:bg-[#fafafa] transition-colors"
//                               >
//                                 <td
//                                   className="py-4 px-4 text-[#000000d9]"
//                                   data-cy="payroll-reconciliation-detail-table-body-employee"
//                                 >
//                                   {employeeName}
//                                 </td>
//                                 <td
//                                   className="py-4 px-4 text-[#000000d9]"
//                                   data-cy="payroll-reconciliation-detail-table-body-current"
//                                 >
//                                   {current}
//                                 </td>
//                                 <td
//                                   className="py-4 px-4 text-[#000000d9]"
//                                   data-cy="payroll-reconciliation-detail-table-body-previous"
//                                 >
//                                   {previous}
//                                 </td>
//                                 <td
//                                   className={`py-4 px-4 ${diffClass}`}
//                                   data-cy="payroll-reconciliation-detail-table-body-diff"
//                                 >
//                                   {rawDiff}
//                                 </td>
//                               </tr>
//                             );
//                           },
//                         )}
//                       {!isLoadingDetails &&
//                         !reconciliationDetails?.employeeVariances?.items
//                           ?.length && (
//                           <tr data-cy="payroll-reconciliation-detail-table-empty-row">
//                             <td
//                               colSpan={4}
//                               className="py-8 text-center text-[#00000073]"
//                               data-cy="payroll-reconciliation-detail-table-empty-cell"
//                             >
//                               No employee found
//                             </td>
//                           </tr>
//                         )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 <div
//                   data-cy="payroll-reconciliation-detail-pagination"
//                   className="mt-4 flex justify-end"
//                 >
//                   {isMobile || isTablet ? (
//                     <CustomMobilePagination
//                       currentPage={currentPage}
//                       totalResults={
//                         reconciliationDetails?.employeeVariances?.meta
//                           ?.totalItems ?? 0
//                       }
//                       pageSize={pageSize}
//                       onShowSizeChange={(current, size) => {
//                         setCurrentPage(current);
//                         setPageSize(size);
//                       }}
//                     />
//                   ) : (
//                     <CustomPagination
//                       current={currentPage}
//                       total={
//                         reconciliationDetails?.employeeVariances?.meta
//                           ?.totalItems ?? 0
//                       }
//                       pageSize={pageSize}
//                       onChange={(page, size) => {
//                         setCurrentPage(page);
//                         if (size) {
//                           setPageSize(size);
//                         }
//                       }}
//                       onShowSizeChange={(newPageSize) => {
//                         setPageSize(newPageSize);
//                         setCurrentPage(1);
//                       }}
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div
//             className="mt-6 flex justify-end gap-2 border-t border-[#f0f0f0] pt-4"
//             data-cy="payroll-approve-modal-actions"
//           >
//             <Button onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
//             <Button
//               type="primary"
//               data-cy="payroll-approve-modal-confirm"
//               loading={isApproving || isLastApproving}
//               onClick={handleApprovePayroll}
//             >
//               Approve Payroll
//             </Button>
//           </div>
//         </Modal>
//       </BlockWrapper>
//     </div>
//   );

//   return <MobileFilters />;
// };

// export default PayrollReconcilation;

'use client';

import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { TableSkeleton } from '@/components/tableSkeleton';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, Card, Select, Table, Tag } from 'antd';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { ArrowRightOutlined } from '@ant-design/icons';
import { FaEye } from 'react-icons/fa';
import PayrollReconcilationModal from './_components/modal';
import { useState, useEffect, useMemo } from 'react';

import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import {
  useExportReconciliation,
  useGetReconciliation,
} from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useRouter, usePathname } from 'next/navigation';

const { Option } = Select;
const impactColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const PayrollReconcilation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isEmbedded = /\/payroll\/[^/]+\/reconciliation/.test(pathname);
  const {
    previousPayPeriodId,
    currentPayPeriodId,
    componentType,
    setPreviousPayPeriodId,
    setCurrentPayPeriodId,
    setComponentType,
  } = useReconciliationState();

  const { data, isLoading } = useGetReconciliation({
    previousPayPeriodId,
    currentPayPeriodId,
  });

  const { mutate: exportReconciliation, isLoading: isExporting } =
    useExportReconciliation();

  const { data: payPeriodData } = useGetPayPeriod();
  const { pageSize: employeePageSize, currentPage: employeeCurrentPage } =
    useEmployeeStore();
  const { data: payroll } = useGetActivePayroll(
    '',
    employeePageSize || 10,
    employeeCurrentPage || 1,
  );

  useEffect(() => {
    if (payroll?.items?.length > 0 && payPeriodData?.length > 0) {
      // Set current pay period if not already set
      if (!currentPayPeriodId) {
        const defaultPayPeriodId = payroll.items[0]?.payPeriodId;
        const defaultPayPeriod = payPeriodData?.find(
          (period: any) => period.id === defaultPayPeriodId,
        );

        if (defaultPayPeriod) {
          setCurrentPayPeriodId(defaultPayPeriodId);
        }
      }
    }
  }, [
    payroll?.items,
    payPeriodData,
    currentPayPeriodId,
    setCurrentPayPeriodId,
  ]);

  useEffect(() => {
    // Set previous pay period based on current pay period
    if (
      payPeriodData?.length > 0 &&
      currentPayPeriodId &&
      !previousPayPeriodId
    ) {
      // Sort pay periods by start date to find the previous one
      const sortedPayPeriods = [...payPeriodData].sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      const currentIndex = sortedPayPeriods.findIndex(
        (period: any) => period.id === currentPayPeriodId,
      );

      if (currentIndex > 0) {
        const previousPayPeriod = sortedPayPeriods[currentIndex - 1];
        setPreviousPayPeriodId(previousPayPeriod.id);
      }
    }
  }, [
    payPeriodData,
    currentPayPeriodId,
    previousPayPeriodId,
    setPreviousPayPeriodId,
  ]);

  // Reset componentType when modal closes
  useEffect(() => {
    if (!isModalOpen && componentType) {
      setComponentType('');
    }
  }, [isModalOpen, componentType, setComponentType]);

  const handleGoBack = () => {
    router.back();
  };

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-122"
          className="flex items-center gap-2"
        >
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-123">
            {record.types}
          </span>
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
        return (
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-134">
            {previous}
          </span>
        );
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return (
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-144">
            {current}
          </span>
        );
      },
    },

    {
      title: 'Variance(AMT)',
      dataIndex: 'variance',
      key: 'variance',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const varianceValue = Number(key);
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-167"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
    {
      title: 'Variance(%)',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        // Extract numeric value from string (handles percentage signs, etc.)
        const numericString = String(key).replace(/[^\d.-]/g, '');
        const varianceValue = Number(numericString);
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-191"
            className={className}
          >
            {key}
          </span>
        );
      },
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
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-207"
          className="flex items-center gap-2"
        >
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-208">
            {record.action}
          </span>
        </div>
      ),
    },
  ];

  const handleViewDetails = (type: string) => {
    setComponentType(type);
    setIsModalOpen(true);
  };

  const formatAmount = (value: number | string | undefined | null) => {
    const n = Number(value);
    if (value == null || value === '' || Number.isNaN(n)) return '0';
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  const summaryMetrics = useMemo(() => {
    const totalCost = Number(data?.summary?.totalPayrollCost || 0);
    const previousCost = Number(data?.summary?.previousPayrollCost || 0);
    const netVariance = Number(data?.summary?.netVariance || 0);
    const netVariancePct = Number(data?.summary?.netVariancePercentage || 0);
    const headcount = data?.summary?.headcount ?? 0;
    const previousHeadcount = data?.summary?.previousHeadcount ?? 0;
    const terminations = data?.summary?.terminations ?? 0;
    const isVarianceIncrease = netVariance > 0;
    const isVarianceDecrease = netVariance < 0;

    return {
      totalCost,
      previousCost,
      netVariance,
      netVariancePct,
      headcount,
      previousHeadcount,
      terminations,
      isVarianceIncrease,
      isVarianceDecrease,
      varianceColorClass: isVarianceIncrease
        ? 'text-[#F04438]'
        : isVarianceDecrease
          ? 'text-[#12B76A]'
          : 'text-gray-800',
      varianceIconBg: isVarianceIncrease
        ? 'bg-[#FFF2F0]'
        : isVarianceDecrease
          ? 'bg-[#ECFDF3]'
          : 'bg-gray-100',
      varianceIconText: isVarianceIncrease
        ? 'text-[#F04438]'
        : isVarianceDecrease
          ? 'text-[#12B76A]'
          : 'text-gray-500',
    };
  }, [data?.summary]);

  const payrollVarianceData = data?.components?.map((item: any) => ({
    types: item.label,
    previous: Number(item.previous).toLocaleString(),
    current: Number(item.current).toLocaleString(),
    variance:
      item.variance != null && !isNaN(Number(item.variance))
        ? Number(item.variance).toLocaleString()
        : '--',
    variancePercentage:
      item?.variancePercentage != null && item?.variancePercentage !== ''
        ? item.variancePercentage
        : '--',
    impact: (
      <Tag color={impactColors[item.impact as keyof typeof impactColors]}>
        {item.impact}
      </Tag>
    ),
    action: (
      <Button
        className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none "
        onClick={() => handleViewDetails(item.type)}
        disabled={
          item.type === 'BASIC_SALARY' &&
          (item.current == '0' ||
            item.previous == '0' ||
            Number(item.current) === 0 ||
            Number(item.previous) === 0)
        }
      >
        <FaEye />
      </Button>
    ),
  }));
  return (
    <div
      className="min-h-screen w-full  "
      id="manage-employees-page"
      data-cy="manage-employees-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        {!isEmbedded && (
        <div
          className="w-full"
          id="manage-employees-header"
          data-cy="manage-employees-header"
        >
          <CustomBreadcrumb
            onBack={handleGoBack}
            title="Payroll Reconciliation"
            subtitle="Employee Payroll Reconciliation"
            rootClassName="w-full !mb-0"
            titleExtra={
              <div
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-278"
                className="flex flex-wrap justify-start items-center gap-4 md:gap-8"
              >
                <Button
                  type="default"
                  size="small"
                  className="h-8 w-8 sm:w-auto sm:px-4 text-[#3A3A3A] border-[#D9D9D9] pl-3 rounded-md"
                  icon={<SaveAltIcon className="text-sm" />}
                  loading={isExporting}
                  disabled={!previousPayPeriodId || !currentPayPeriodId}
                  onClick={() =>
                    exportReconciliation({
                      previousPayPeriodId,
                      currentPayPeriodId,
                    })
                  }
                >
                  <span
                    data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-285"
                    className="hidden sm:inline"
                  >
                    Export
                  </span>
                </Button>
              </div>
            }
          />
        </div>
        )}
        <div
          className="mb-5 flex flex-wrap items-end gap-3"
          data-cy="payroll-reconciliation-period-compare-bar"
        >
          <div
            className="min-w-[220px] flex-1 sm:max-w-[280px]"
            data-cy="payroll-reconciliation-previous-period-select"
          >
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
              Previous
            </p>
            <Select
              placeholder="Previous Pay Period"
              allowClear
              className="w-full [&_.ant-select-selector]:!bg-gray-50 [&_.ant-select-selector]:!border-gray-200"
              style={{ height: 44 }}
              value={previousPayPeriodId}
              onChange={(value) => setPreviousPayPeriodId(value)}
            >
              {payPeriodData?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} —{' '}
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </div>

          <div className="mb-3 hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 sm:flex">
            <ArrowRightOutlined />
          </div>

          <div
            className="min-w-[220px] flex-1 sm:max-w-[280px]"
            data-cy="payroll-reconciliation-current-period-select"
          >
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-primary">
              Current
            </p>
            <Select
              allowClear
              className="w-full [&_.ant-select-selector]:!border-primary/30 [&_.ant-select-selector]:!bg-[#F0F5FF]"
              style={{ height: 44 }}
              placeholder="Current Pay Period"
              value={currentPayPeriodId}
              onChange={(value) => setCurrentPayPeriodId(value)}
            >
              {payPeriodData?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} —{' '}
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div
          data-cy="payroll-reconciliation-summary-cards"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {/* Total Payroll Cost */}
          <Card
            className="rounded-xl border border-[#D0D7E2] shadow-none"
            loading={isLoading}
            styles={{ body: { padding: '16px 18px' } }}
            data-cy="payroll-reconciliation-total-cost-card"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#E6F4FF] text-[#1677FF]">
                <LocalAtmIcon className="h-4 w-4" />
              </span>
              <p className="m-0 text-sm font-medium text-gray-500">
                Total Payroll Cost
              </p>
            </div>
            <p className="m-0 text-2xl font-bold leading-tight text-gray-900">
              {formatAmount(summaryMetrics.totalCost)}
            </p>
            <p className="mt-2 mb-0 text-sm text-gray-500">
              vs{' '}
              <span className="font-medium text-gray-700">
                {formatAmount(summaryMetrics.previousCost)}
              </span>{' '}
              previous
            </p>
          </Card>

          {/* Net Variance */}
          <Card
            className="rounded-xl border border-[#D0D7E2] shadow-none"
            loading={isLoading}
            styles={{ body: { padding: '16px 18px' } }}
            data-cy="payroll-reconciliation-net-variance-card"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${summaryMetrics.varianceIconBg} ${summaryMetrics.varianceIconText}`}
              >
                {summaryMetrics.isVarianceIncrease ? (
                  <TrendingUpOutlinedIcon className="h-4 w-4" />
                ) : (
                  <TrendingDownOutlinedIcon className="h-4 w-4" />
                )}
              </span>
              <p className="m-0 text-sm font-medium text-gray-500">
                Net Variance
              </p>
            </div>
            <p
              className={`m-0 text-2xl font-bold leading-tight ${summaryMetrics.varianceColorClass}`}
            >
              {formatAmount(summaryMetrics.netVariance)}
            </p>
            <p className="mt-2 mb-0 flex items-center gap-1.5 text-sm text-gray-500">
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${summaryMetrics.varianceColorClass}`}
              >
                {summaryMetrics.isVarianceIncrease ? (
                  <TrendingUpOutlinedIcon className="!h-3.5 !w-3.5" />
                ) : summaryMetrics.isVarianceDecrease ? (
                  <TrendingDownOutlinedIcon className="!h-3.5 !w-3.5" />
                ) : null}
                {Number.isNaN(summaryMetrics.netVariancePct)
                  ? '--'
                  : `${summaryMetrics.netVariancePct > 0 ? '+' : ''}${summaryMetrics.netVariancePct}%`}
              </span>
              <span>vs previous period</span>
            </p>
          </Card>

          {/* Headcount Impact */}
          <Card
            className="rounded-xl border border-[#D0D7E2] shadow-none"
            loading={isLoading}
            styles={{ body: { padding: '16px 18px' } }}
            data-cy="payroll-reconciliation-headcount-card"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#F9F0FF] text-[#722ED1]">
                <PeopleAltOutlinedIcon className="h-4 w-4" />
              </span>
              <p className="m-0 text-sm font-medium text-gray-500">
                Headcount Impact
              </p>
            </div>
            <p className="m-0 text-2xl font-bold leading-tight text-gray-900">
              {summaryMetrics.headcount}{' '}
              <span className="text-base font-semibold text-gray-500">
                Employees
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                Previous{' '}
                <span className="ml-1 font-semibold text-gray-800">
                  {summaryMetrics.previousHeadcount}
                </span>
              </span>
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                Terminations{' '}
                <span className="ml-1 font-semibold text-gray-800">
                  {summaryMetrics.terminations}
                </span>
              </span>
            </div>
          </Card>
        </div>

        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-405"
          className="w-full mt-6 overflow-x-auto"
        >
          {isLoading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              dataSource={payrollVarianceData}
              columns={columns}
              pagination={false}
            />
          )}
        </div>
        <PayrollReconcilationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          previousPayPeriodId={previousPayPeriodId}
          currentPayPeriodId={currentPayPeriodId}
          componentType={componentType}
        />
      </BlockWrapper>
    </div>
  );
};

export default PayrollReconcilation;
