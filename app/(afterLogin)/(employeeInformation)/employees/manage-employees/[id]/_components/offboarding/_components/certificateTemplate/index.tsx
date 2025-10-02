'use client';
import React from 'react';
import Image from 'next/image';
import { useGetTenantDetailsForCertificate } from '@/store/server/features/tenant-management/clients/queries';
import TitleCard from '@/components/common/titleCard';

interface CertificateTemplateProps {
  offboardingTasks?: any[];
  isVisible?: boolean;
  onClose?: () => void;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  offboardingTasks = [],
  isVisible = false,
  onClose,
}) => {
  const { data: tenantData } = useGetTenantDetailsForCertificate();
  
  if (!isVisible) return null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedTasks = offboardingTasks?.filter(task => task.isCompleted) || [];

  const handleDownload = () => {
    const certificateElement = document.getElementById('certificate-template');
    if (certificateElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Clearance Certificate</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }
                @media print {
                  body { margin: 0; }
                  @page { margin: 0.5in; }
                }
              </style>
            </head>
            <body>
              ${certificateElement.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close Button at Top */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        )}
        
        {/* Download Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>

        <div
          id="certificate-template"
          className="relative w-full bg-white overflow-auto max-h-[90vh]"
          style={{
            backgroundImage: `url('/login-background.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '600px',
          }}
        >

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center pt-8 pb-4">
        <TitleCard title="SelamNew Workspace" />
      </div>

      {/* Main Title */}
      <div className="relative z-10 text-center py-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Clearance Certification</h2>
      </div>

      {/* Off Boarding Tasks Section */}
      <div className="relative z-10 px-8 py-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Off Boarding Tasks</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {completedTasks.map((task, index) => (
            <div
              key={task.id || index}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-300">
                  {task.approver?.profilePicture || task.approver?.profileImage || task.approver?.avatar ? (
                    <Image
                      src={task.approver.profilePicture || task.approver.profileImage || task.approver.avatar}
                      alt={`${task.approver?.firstName || 'Approver'} ${task.approver?.lastName || ''}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center text-black font-semibold text-sm border border-gray-300">
                      {`${task.approver?.firstName?.[0] || 'A'}${task.approver?.lastName?.[0] || 'P'}`.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    {`${task.approver?.firstName || ''} ${task.approver?.middleName || ''} ${task.approver?.lastName || ''}`.trim()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Statement */}
        <div className="text-center py-6">
          <p className="text-xl font-bold text-gray-800 mb-2">
            Successfully Completed these <span className=" text-blue px-2 py-1 rounded">Off Boarding Process's on</span>
          </p>
          <p className="text-lg text-gray-700">
            Award Date: {currentDate}
          </p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="relative z-10 px-8 py-8">
        <div className="flex justify-between items-end space-x-8">
          <div className="flex-1 text-center">
            <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2"></div>
            <p className="text-sm font-medium text-gray-700">SIGNATURE</p>
          </div>
          <div className="flex-1 text-center">
            <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2"> {currentDate}</div>
            <p className="text-sm font-medium text-gray-700">DATE</p>
          </div>
          <div className="flex-1 text-center">
            <div className="w-32 mx-auto mb-2 flex items-center justify-center">
              {tenantData?.stamp ? (
                <Image
                  src={tenantData.stamp}
                  alt="Company Stamp"
                  width={120}
                  height={60}
                  className="max-w-full h-auto object-contain"
                />
              ) : (
                <div className="border-b-2 border-gray-400 w-full"></div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">COMPANY STAMP</p>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
