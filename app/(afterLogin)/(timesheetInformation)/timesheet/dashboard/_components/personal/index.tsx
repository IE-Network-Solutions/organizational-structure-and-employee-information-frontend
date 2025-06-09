'use client'
import React from 'react';
import { Card, Tag, Button, DatePicker, Select } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PersonalStatusCard from './PersonalStatusCard';
import MyleaveBalance from './MyleaveBalance';
import MyLeaveRequest from './MyLeaveRequest';
import MyAttendanceReport from './MyAttendanceReport';

const { Option } = Select;

export default function PersonalDashboard() {
    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <PersonalStatusCard />

            {/* Leave Balance */}
            <MyleaveBalance />

            {/* Leave Requests and Attendance Report */}
            <div className="grid grid-cols-2 gap-4">
                <MyLeaveRequest />

                <MyAttendanceReport />
            </div>
        </div>
    );
}
