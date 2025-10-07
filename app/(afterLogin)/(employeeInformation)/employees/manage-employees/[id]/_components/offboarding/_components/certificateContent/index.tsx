'use client';
import React from 'react';
import Image from 'next/image';
import { useGetTenantDetailsForCertificate } from '@/store/server/features/tenant-management/clients/queries';
import TitleCard from '@/components/common/titleCard';

interface CertificateContentProps {
    offboardingTasks?: any[];
    employeeData?: any;
}

const CertificateContent: React.FC<CertificateContentProps> = ({
    offboardingTasks = [],
    employeeData,
}) => {
    const { data: tenantData } = useGetTenantDetailsForCertificate();

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const completedTasks = offboardingTasks?.filter(task => task.isCompleted) || [];

    return (
        <div
            id="certificate-template"
            className="relative bg-white flex flex-col"
            style={{
                backgroundImage: `url('/login-background.png')`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '832px', // A4 height in pixels
                width: '595px', // A4 width in pixels
                margin: '0 auto',
            }}
        >
            {/* Main Content - grows to fill space */}
            <div className="relative z-10 flex-grow px-4 py-2">
                {/* Header */}
                <div className="flex items-center justify-center pt-2 pb-1">
                    <TitleCard title="SelamNew" />
                </div>

                {/* Main Title */}
                <div className="text-center py-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Clearance Certification</h2>
                </div>

                {/* Off Boarding Tasks Section */}
                <div className="py-2">
                    <h3 className="text-base font-bold text-gray-800 mb-2">Off Boarding Tasks</h3>

                    <div className="grid grid-cols-2 gap-4 mb-0">
                        {completedTasks.map((task, index) => (
                            <div
                                key={task.id || index}
                                className="bg-white rounded-lg shadow-sm p-2 border border-gray-200"
                            >
                                <div>
                                    <p className="font-medium text-gray-800 text-xs mb-2">{task.title}</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
                                            {task.approver?.profilePicture || task.approver?.profileImage || task.approver?.avatar ? (
                                                <Image
                                                    src={task.approver.profilePicture || task.approver.profileImage || task.approver.avatar}
                                                    alt={`${task.approver?.firstName || 'Approver'} ${task.approver?.lastName || ''}`}
                                                    width={20}
                                                    height={20}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white flex items-center justify-center text-black font-semibold text-xs border border-gray-300 leading-none">
                                                    {`${task.approver?.firstName?.[0] || 'A'}${task.approver?.lastName?.[0] || 'P'}`.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {`${task.approver?.firstName || ''} ${task.approver?.middleName || ''} ${task.approver?.lastName || ''}`.trim()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Bottom Section - sticky at bottom */}
            <div className="relative z-10 px-4 py-2 mt-auto">
                {/* Employee Name */}
                <div className="text-center py-1">
                    <p className="text-xs text-gray-600 mb-1">This is to certify that</p>
                    <p className="text-lg font-bold text-gray-800 mb-1 border-b-2 border-blue-500 pb-1 inline-block">
                        {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim()}
                    </p>
                </div>

                {/* Completion Statement */}
                <div className="text-center py-0">
                    <p className="text-sm font-bold text-gray-800 mb-0">
                        Successfully Completed these <span className="text-blue px-2 py-1 rounded">Off Boarding Process&apos;s on</span>
                    </p>
                    <p className="text-xs text-gray-700">Award Date: {currentDate}</p>
                </div>

                {/* Signature Section */}
                <div className="flex justify-between items-end space-x-6 mt-3">
                    <div className="flex-1 text-center">
                        <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2 h-8"></div>
                        <p className="text-sm font-medium text-gray-700">SIGNATURE</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2 h-8 flex items-center justify-center">
                            <span className="text-sm text-gray-600">{currentDate}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">DATE</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="w-32 h-32 mx-auto mb-6 relative rounded-full overflow-hidden ">
                            {tenantData?.stamp && (
                                <Image
                                    src={tenantData.stamp}
                                    alt="Company Stamp"
                                    fill
                                    className="object-contain"
                                />
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-700">COMPANY STAMP</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateContent;
