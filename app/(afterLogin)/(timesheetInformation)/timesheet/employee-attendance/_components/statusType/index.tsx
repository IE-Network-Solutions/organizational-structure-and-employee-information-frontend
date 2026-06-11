import { Button, Tag } from 'antd';
import {
  AttendanceCheckInSource,
  AttendanceCheckOutSource,
  attendanceCheckInSourceLabels,
  attendanceCheckOutSourceLabels,
} from '@/types/timesheet/attendance';

const statusType = (val: string | null | undefined) => {
  if (val === 'present') {
    return (
      <Tag
        id="roleTypeOwner"
        data-cy="roleTypeOwner"
        className="bg-[#e6f4ff] text-[#1677ff] text-xs font-medium py-0.5 px-2  border border-[#91caff] hover:bg-sky-50 h-[22px]"
      >
        PRESENT
      </Tag>
    );
  } else if (val === 'absent') {
    return (
      <Tag
        id="roleTypeAdmin"
        data-cy="roleTypeAdmin"
        className="text-[#f5222d] text-sm font-normal px-2 bg-[#fff1f0] border border-[#ffa39e] h-[22px]"
      >
        ABSENT
      </Tag>
    );
  } else if (val === 'late') {
    return (
      <Tag
        id="roleTypeSuper"
        data-cy="roleTypeProbation"
        className="text-[#fa8c16] text-sm font-normal px-2 bg-[#fff7e6] border border-[#ffd591] h-[22px]"
      >
        LATE
      </Tag>
    );
  } else if (val === 'early') {
    return (
      <Tag
        id="roleTypeOnLeave" // Note: I changed this id because it's same with the above Button
        data-cy="roleTypeOnLeave"
        className="text-green-600 text-xs font-medium py-0.5 px-2 bg-white border border-green-600 hover:bg-green-50 h-[22px]"
      >
        EARLY
      </Tag>
    );
  } else if (val === 'remote') {
    return (
      <Tag
        id="roleTypeRemoteCheckIn"
        data-cy="roleTypeRemoteCheckIn"
        className="bg-[#f9f0ff] text-[#722ed1] text-xs font-medium py-0.5 px-2 border border-[#d3adf7] hover:bg-purple-50 h-[22px]"
      >
        REMOTE
      </Tag>
    );
  } else if (val === 'onsite') {
    return (
      <Tag
        id="roleTypeOnsiteCheckIn"
        data-cy="roleTypeOnsiteCheckIn"
        className="text-green-700 text-xs font-medium py-0.5 px-2 bg-[#f6ffed] border border-[#b7eb8f] hover:bg-green-50 h-[22px]"
      >
        ON-SITE
      </Tag>
    );
  } else if (val === 'imported') {
    return (
      <Tag
        id="roleTypeImportedAttendance"
        data-cy="roleTypeImportedAttendance"
        className="text-amber-700 text-xs font-medium py-0.5 px-2 bg-[#fffbe6] border border-[#ffe58f] hover:bg-amber-50 h-[22px]"
      >
        {attendanceCheckInSourceLabels[AttendanceCheckInSource.IMPORTED]}
      </Tag>
    );
  } else if (val === 'IMPORTED') {
    return (
      <Tag
        id="roleTypeImportedAttendance"
        data-cy="roleTypeImportedAttendance"
        className="text-amber-700 text-xs font-medium py-0.5 px-2 bg-[#fffbe6] border border-[#ffe58f] hover:bg-amber-50 h-[22px]"
      >
        {attendanceCheckInSourceLabels[AttendanceCheckInSource.IMPORTED]}
      </Tag>
    );
  } else if (val === 'REMOTE_CHECKED_IN' || val === 'REMOTE_CHECKED_OUT') {
    const label =
      val === 'REMOTE_CHECKED_IN'
        ? attendanceCheckInSourceLabels[
            AttendanceCheckInSource.REMOTE_CHECKED_IN
          ]
        : attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.REMOTE_CHECKED_OUT
          ];
    return (
      <Tag
        id="roleTypeRemoteCheckIn"
        data-cy="roleTypeRemoteCheckIn"
        className="bg-[#f9f0ff] text-[#722ed1] text-xs font-medium py-0.5 px-2 border border-[#d3adf7] hover:bg-purple-50 h-[22px]"
      >
        {label}
      </Tag>
    );
  } else if (
    val === 'ATTENDANCE_DEVICE_CHECKED_IN' ||
    val === 'ATTENDANCE_DEVICE_CHECKED_OUT'
  ) {
    const label =
      val === 'ATTENDANCE_DEVICE_CHECKED_IN'
        ? attendanceCheckInSourceLabels[
            AttendanceCheckInSource.ATTENDANCE_DEVICE_CHECKED_IN
          ]
        : attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.ATTENDANCE_DEVICE_CHECKED_OUT
          ];
    return (
      <Tag
        id="roleTypeOnsiteCheckIn"
        data-cy="roleTypeOnsiteCheckIn"
        className="text-green-700 text-xs font-medium py-0.5 px-2 bg-[#f6ffed] border border-[#b7eb8f] hover:bg-green-50 h-[22px]"
      >
        {label}
      </Tag>
    );
  } else if (
    val === AttendanceCheckInSource.SYSTEM_UPDATED ||
    val === AttendanceCheckOutSource.SYSTEM_UPDATED
  ) {
    const label =
      val === AttendanceCheckInSource.SYSTEM_UPDATED
        ? attendanceCheckInSourceLabels[AttendanceCheckInSource.SYSTEM_UPDATED]
        : attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.SYSTEM_UPDATED
          ];
    return (
      <Tag
        id="roleTypeSystemUpdated"
        data-cy="roleTypeSystemUpdated"
        className="text-[#1677ff] text-xs font-medium py-0.5 px-2 bg-[#e6f4ff] border border-[#91caff] hover:bg-sky-50 h-[22px]"
      >
        {label}
      </Tag>
    );
  } else if (val === null || val === '' || val === undefined) {
    return (
      <Button
        id="roleTypeNull"
        data-cy="roleTypeNull"
        className="text-sky-600 text-xs font-medium w-[90px] px-[30px] bg-white border border-sky-600 hover:bg-sky-50 h-[22px]"
      >
        Unknown
      </Button>
    );
  } else if (val === 'Active') {
    return (
      <Tag
        id="roleTypeActive"
        data-cy="roleTypeActive"
        className="text-[#1677ff] text-xs font-medium py-1 px-2 bg-[#e6f4ff] border border-[#91caff]"
      >
        Active
      </Tag>
    );
  } else if (val === 'InActive') {
    return (
      <Tag
        id="roleTypeInActive"
        data-cy="roleTypeInActive"
        className="text-[#ff4d4f] text-xs font-medium py-1 px-2 bg-[#fff1f0] border border-[#ffccc7]"
      >
        InActive
      </Tag>
    );
  } else if (val === 'SALARY_DEDUCTION') {
    return (
      <Tag
        id="SalaryDeduction"
        data-cy="roleTypeInActive"
        className="text-[#ff4d4f] text-xs font-medium py-1 px-2 bg-[#fff1f0] border border-[#ffccc7]"
      >
        Salary Deduction
      </Tag>
    );
  } else if (val === 'WARNING_LETTER') {
    return (
      <Tag
        id="warningLetter"
        data-cy="warningLetter"
        className="text-[#1677FF] text-xs font-medium py-1 px-2 bg-[#e6f4ff] border border-[#91caff]"
      >
        Warning Letter
      </Tag>
    );
  } else if (val === 'REPRIMAND') {
    return (
      <Tag
        id="Reprimand"
        data-cy="Reprimand"
        className="text-[#FA8C16] text-xs font-medium py-0.5 px-2 bg-[#fff7e6] border border-[#ffd591] h-[22px]"
      >
        Reprimand
      </Tag>
    );
  } else if (val === 'VP_DEDUCTION') {
    return (
      <Tag
        id="VpDeduction"
        data-cy="VpDeduction"
        className="text-[#722ed1] text-xs font-medium py-1 px-2 bg-[#f9f0ff] border border-[#d3adf7]"
      >
        VP Deduction
      </Tag>
    );
  } else if (val === 'LATE') {
    return (
      <Tag
        id="LateArrival"
        data-cy="LateArrival"
        className="text-[#FA8C16] text-xs font-medium py-0.5 px-2 bg-[#fff7e6] border border-[#ffd591] h-[22px]"
      >
        Late Arrival
      </Tag>
    );
  } else if (val === 'ABSENT') {
    return (
      <Tag
        id="Absent"
        data-cy="Absent"
        className="text-[#ff4d4f] text-xs font-medium py-1 px-2 bg-[#fff1f0] border border-[#ffccc7]"
      >
        Absent
      </Tag>
    );
  } else if (val === 'EARLY_CLOCK_OUT') {
    return (
      <Tag
        id="EarlyCheckout"
        data-cy="EarlyCheckout"
        className="text-[#1677FF] text-xs font-medium py-0.5 px-2 bg-[#e6f4ff] border border-[#91caff] h-[22px]"
      >
        Early Checkout
      </Tag>
    );
  } else if (val === 'MISSED_CHECK_IN_OUT') {
    return (
      <Tag
        id="MissedCheckinOut"
        data-cy="MissedCheckinOut"
        className="text-[#595959] text-xs font-medium py-0.5 px-2 bg-[#fafafa] border border-[#d9d9d9] h-[22px]"
      >
        Missed Check-in / Out
      </Tag>
    );
  } else {
    return (
      <Button
        id="roleTypeOther"
        data-cy="roleTypeOther"
        className="bg-white text-indigo-600 text-xs font-medium px-[30px] border border-indigo-600 hover:bg-indigo-50"
        title={val}
      >
        {val?.slice(0, 20)}
      </Button>
    );
  }
};

export default statusType;
