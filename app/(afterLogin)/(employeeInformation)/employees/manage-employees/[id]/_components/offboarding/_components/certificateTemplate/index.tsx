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
  const toSlug = (value: string | number | null | undefined) =>
    String(value ?? 'na')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const { data: tenantData } = useGetTenantDetailsForCertificate();

  if (!isVisible) return null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedTasks =
    offboardingTasks?.filter((task) => task.isCompleted) || [];

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      id="certificate-template-overlay"
      data-cy="certificate-template-overlay"
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4"
        id="certificate-template-container"
        data-cy="certificate-template-container"
      >
        {/* Close Button at Top */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            id="certificate-template-close-btn"
            data-cy="certificate-template-close-btn"
          >
            ×
          </button>
        )}

        {/* Download Button */}
        <div
          className="absolute top-4 left-4 z-10"
          id="certificate-template-download-wrapper"
          data-cy="certificate-template-download-wrapper"
        >
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
            id="certificate-template-download-btn"
            data-cy="certificate-template-download-btn"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              id="certificate-template-download-icon"
              data-cy="certificate-template-download-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                id="certificate-template-download-icon-path"
                data-cy="certificate-template-download-icon-path"
              />
            </svg>
            <span id="certificate-template-download-text" data-cy="certificate-template-download-text">Download</span>
          </button>
        </div>

        <div
          id="certificate-template"
          className="relative w-full bg-white overflow-auto max-h-[90vh]"
          data-cy="certificate-template-modal-content"
          style={{
            backgroundImage: `url('/login-background.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '600px',
          }}
        >
          {/* Header */}
          <div
            className="relative z-10 flex items-center justify-center pt-8 pb-4"
            id="certificate-template-header"
            data-cy="certificate-template-header"
          >
            <TitleCard title="SelamNew Workspace" />
          </div>

          {/* Main Title */}
          <div
            className="relative z-10 text-center py-4"
            id="certificate-template-title-wrapper"
            data-cy="certificate-template-title-wrapper"
          >
            <h2
              className="text-4xl font-bold text-gray-800 mb-2"
              id="certificate-template-title"
              data-cy="certificate-template-title"
            >
              Clearance Certification
            </h2>
          </div>

          {/* Off Boarding Tasks Section */}
          <div
            className="relative z-10 px-8 py-6"
            id="certificate-template-tasks-section"
            data-cy="certificate-template-tasks-section"
          >
            <h3
              className="text-2xl font-bold text-gray-800 mb-6"
              id="certificate-template-tasks-title"
              data-cy="certificate-template-tasks-title"
            >
              Off Boarding Tasks
            </h3>

            <div
              className="grid grid-cols-2 gap-4 mb-8"
              id="certificate-template-tasks-grid"
              data-cy="certificate-template-tasks-grid"
            >
              {completedTasks.map((task, index) => {
                const taskSlug = toSlug(task?.id ?? index);
                return (
                <div
                  key={task.id || index}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                    id={`certificate-template-task-${taskSlug}`}
                    data-cy={`certificate-template-task-${taskSlug}`}
                >
                  <div className="flex items-center space-x-3" id="certificate-template-task-approver-wrapper" data-cy="certificate-template-task-approver-wrapper">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-300" id="certificate-template-task-approver-image-wrapper" data-cy="certificate-template-task-approver-image-wrapper">
                      {task.approver?.profilePicture ||
                      task.approver?.profileImage ||
                      task.approver?.avatar ? (
                        <Image
                          src={
                            task.approver.profilePicture ||
                            task.approver.profileImage ||
                            task.approver.avatar
                          }
                          alt={`${task.approver?.firstName || 'Approver'} ${task.approver?.lastName || ''}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center text-black font-semibold text-sm border border-gray-300" id="certificate-template-task-approver-text-wrapper" data-cy="certificate-template-task-approver-text-wrapper">
                          {`${task.approver?.firstName?.[0] || 'A'}${task.approver?.lastName?.[0] || 'P'}`.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div id="certificate-template-task-title-wrapper" data-cy="certificate-template-task-title-wrapper">
                      <p className="font-medium text-gray-800" id="certificate-template-task-title-text" data-cy="certificate-template-task-title-text">{task.title}</p>
                      <p className="text-sm text-gray-500" id="certificate-template-task-approver-text" data-cy="certificate-template-task-approver-text">
                        {`${task.approver?.firstName || ''} ${task.approver?.middleName || ''} ${task.approver?.lastName || ''}`.trim()}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Completion Statement */}
            <div className="text-center py-6" id="certificate-template-completion" data-cy="certificate-template-completion">
              <p className="text-xl font-bold text-gray-800 mb-2" id="certificate-template-completion-text" data-cy="certificate-template-completion-text">
                Successfully Completed these{' '}
                <span className=" text-blue px-2 py-1 rounded">
                  Off Boarding Process&apos;s on
                </span>
              </p>
              <p className="text-lg text-gray-700" id="certificate-template-award-date" data-cy="certificate-template-award-date">
                Award Date: {currentDate}
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="relative z-10 px-8 py-8" id="certificate-template-signature-section" data-cy="certificate-template-signature-section">
            <div className="flex justify-between items-end space-x-8" id="certificate-template-signature-row" data-cy="certificate-template-signature-row">
              <div className="flex-1 text-center">
                <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2" id="certificate-template-signature-block-divider" data-cy="certificate-template-signature-block-divider"></div>
                <p className="text-sm font-medium text-gray-700" id="certificate-template-signature-block-text" data-cy="certificate-template-signature-block-text">SIGNATURE</p>
              </div>
              <div className="flex-1 text-center" id="certificate-template-date-block-wrapper" data-cy="certificate-template-date-block-wrapper">
                <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2" id="certificate-template-date-block-divider" data-cy="certificate-template-date-block-divider">
                  {' '}
                  {currentDate}
                </div>
                <p className="text-sm font-medium text-gray-700" id="certificate-template-date-block-text" data-cy="certificate-template-date-block-text">DATE</p>
              </div>
              <div className="flex-1 text-center" id="certificate-template-stamp-block-wrapper" data-cy="certificate-template-stamp-block-wrapper">
                <div className="w-32 mx-auto mb-2 flex items-center justify-center" id="certificate-template-stamp-block-image-wrapper" data-cy="certificate-template-stamp-block-image-wrapper">
                  {tenantData?.stamp ? (
                    <Image
                      src={tenantData.stamp}
                      alt="Company Stamp"
                      width={120}
                      height={60}
                      className="max-w-full h-auto object-contain"
                      id="certificate-template-stamp-block-image-img"
                      data-cy="certificate-template-stamp-block-image-img"
                    />
                  ) : (
                    <div className="border-b-2 border-gray-400 w-full" id="certificate-template-stamp-block-image-fallback-wrapper" data-cy="certificate-template-stamp-block-image-fallback-wrapper"></div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700" id="certificate-template-stamp-block-text" data-cy="certificate-template-stamp-block-text">
                  COMPANY STAMP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
