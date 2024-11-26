// import CustomDrawerLayout from '@/components/common/customDrawer';
// import CustomDrawerFooterButton, {
//   CustomDrawerFooterButtonProps,
// } from '@/components/common/customDrawer/customDrawerFooterButton';
// import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
// import { useSetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
// import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
// import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
// import { DatePicker, Form, Select, Space, Spin, TimePicker } from 'antd';
// import dayjs from 'dayjs';
// import React from 'react';
// import { formatToAttendanceStatuses } from '@/helpers/formatTo';

// import { MdKeyboardArrowDown } from 'react-icons/md';
// import StatusBadge from '@/components/common/statusBadge/statusBadge';

// const EmployeeAttendanceSideBar = () => {
//   const [form] = Form.useForm();
//   const itemClass = 'font-semibold text-xs';
//   const controlClass = 'mt-2.5 h-[54px] w-full';
//   const {
//     newData,
//     isShowEmployeeAttendanceSidebar,
//     setIsShowEmployeeAttendanceSidebar,
//     employeeAttendanceId,
//     setEmployeeAttendanceId,
//     setNewData,
//   } = useEmployeeAttendanceStore();
//   const onClose = () => {
//     setIsShowEmployeeAttendanceSidebar(false);
//     form.resetFields();
//     setNewData(null);
//   };
//   const {
//     mutate: updateLeaveRequest,
//     isLoading: isLoadingRequest,
//     isSuccess: isSuccessUpdate,
//   } = useSetLeaveRequest();
//   const footerModalItems: CustomDrawerFooterButtonProps[] = [
//     {
//       label: 'Cancel',
//       key: 'cancel',
//       className: 'h-[56px] text-base',
//       size: 'large',
//       loading: isLoadingRequest,
//       onClick: () => onClose(),
//     },
//     {
//       label: 'Update',
//       key: 'create',
//       className: 'h-[56px] text-base',
//       size: 'large',
//       type: 'primary',
//       loading: isLoadingRequest,
//       onClick: () => form.submit(),
//     },
//   ];

//   const onFinish = () => {
//     console.log(newData, '**');
//     const value = form.getFieldsValue();
//     console.log('final value', value);
//   };

//   React.useEffect(() => {
//     if (newData) {
//       const formattedBreakType = {
//         ...newData,
//         startAt: dayjs(newData.startAt, 'HH:mm'),
//         endAt: dayjs(newData.endAt, 'HH:mm'),
//         status: formatToAttendanceStatuses(newData)?.[0]?.status,
//       };
//       form.setFieldsValue(formattedBreakType);
//     }
//   }, [newData, form]);
//   console.log(newData, '###');

//   return (
//     isShowEmployeeAttendanceSidebar && (
//       <div>
//         <CustomDrawerLayout
//           open={isShowEmployeeAttendanceSidebar}
//           onClose={onClose}
//           modalHeader={
//             <CustomDrawerHeader>Update Employee Attendance</CustomDrawerHeader>
//           }
//           footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
//           width="400px"
//         >
//           {employeeAttendanceId}

//           <Spin spinning={isLoadingRequest}>
//             <Form
//               layout="vertical"
//               form={form}
//               autoComplete="off"
//               onFinish={onFinish}
//             >
//               <Space className="w-full" direction="vertical" size={12}>
//                 <Form.Item
//                   name="status"
//                   label="Status"
//                   rules={[{ required: true, message: 'Required' }]}
//                   className={itemClass}
//                 >
//                   <Select
//                     className={controlClass}
//                     options={attendanceRecordTypeOption}
//                     placeholder="Select Status"
//                     suffixIcon={
//                       <MdKeyboardArrowDown
//                         size={16}
//                         className="text-gray-900"
//                       />
//                     }
//                   />
//                 </Form.Item>
//                 <Form.Item
//                   name="startAt"
//                   label="CLock In"
//                   rules={[{ required: true, message: 'Required' }]}
//                   className={itemClass}
//                 >
//                   <TimePicker format="HH:mm" />
//                 </Form.Item>
//                 <Form.Item
//                   name="startAt"
//                   label="CLock In"
//                   rules={[{ required: true, message: 'Required' }]}
//                   className={itemClass}
//                 >
//                   <DatePicker showTime />
//                 </Form.Item>
//                 <Form.Item
//                   name="endAt"
//                   label="CLock Out"
//                   rules={[{ required: true, message: 'Required' }]}
//                   className={itemClass}
//                 >
//                   <TimePicker format="HH:mm" />
//                 </Form.Item>
//               </Space>
//             </Form>
//           </Spin>
//         </CustomDrawerLayout>
//       </div>
//     )
//   );
// };

// export default EmployeeAttendanceSideBar;
