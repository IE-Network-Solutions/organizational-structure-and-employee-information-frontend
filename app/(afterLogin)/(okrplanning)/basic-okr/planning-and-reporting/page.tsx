'use client';
import React from 'react';
import Planning from './_components/planning';
import CreatePlan from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/createPlan';
import EditPlan from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/editPlan';
import CreateReport from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/createReport';
import EditReport from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/editReport';

export default function BasicPlanningAndReportingPage() {
    return (
        <div className="p-4 md:p-6 min-h-screen bg-white">
            <Planning />
            <CreatePlan />
            <EditPlan />
            <CreateReport />
            <EditReport />
        </div>
    );
}








