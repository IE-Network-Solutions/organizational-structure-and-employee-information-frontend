import React, { useState } from 'react';
import { Button } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';

const DashboardHeader: React.FC = () => {
    return (
        <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center">
                <CustomBreadcrumb
                    className="text-sm"
                    title="Talent Acquisition"
                    subtitle="Manage your Jobs"
                />
             
            </div>
        </div>
    );
};

export default DashboardHeader; 