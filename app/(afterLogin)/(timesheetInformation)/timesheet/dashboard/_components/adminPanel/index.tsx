'use client';

import React from 'react';
import StatsCards from './StatsCards';
import LeaveSection from './LeaveSection';
import AttendanceReport from './AttendanceReport';
import LeaveRequest from './LeaveRequest';


export default function AdminPanel() {
    return (
        <div className="space-y-4">
            <StatsCards />
            <LeaveSection />
            <AttendanceReport />
            <LeaveRequest />

        </div>
    );
}
