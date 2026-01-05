'use client';
import React from 'react';
import Image from 'next/image';
import { useGetTenantDetailsForCertificate } from '@/store/server/features/tenant-management/clients/queries';
import TitleCard from '@/components/common/titleCard';

interface CertificateContentProps {
  offboardingTasks?: any[];
  employeeData?: any;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

  const completedTasks =
    offboardingTasks?.filter((task) => task.isCompleted) || [];

  return (
    <div
      id="certificate-template"
      className="relative bg-white flex flex-col"
      data-cy="certificate-template"
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
      <div
        className="relative z-10 flex-grow px-4 py-2"
        id="certificate-main-content"
        data-cy="certificate-main-content"
      >
        {/* Header */}
        <div
          className="flex items-center justify-center pt-2 pb-1"
          id="certificate-header"
          data-cy="certificate-header"
        >
          <TitleCard title="SelamNew" data-cy="certificate-title-card" />
        </div>

        {/* Main Title */}
        <div
          className="text-center py-2"
          id="certificate-title-wrapper"
          data-cy="certificate-title-wrapper"
        >
          <h2
            className="text-xl font-bold text-gray-800 mb-1"
            id="certificate-title"
            data-cy="certificate-title"
          >
            Clearance Certification
          </h2>
        </div>

        {/* Off Boarding Tasks Section */}
        <div
          className="py-2"
          id="certificate-tasks-section"
          data-cy="certificate-tasks-section"
        >
          <h3
            className="text-base font-bold text-gray-800 mb-2"
            id="certificate-tasks-title"
            data-cy="certificate-tasks-title"
          >
            Off Boarding Tasks
          </h3>

          <div
            className="grid grid-cols-2 gap-4 mb-0"
            id="certificate-tasks-grid"
            data-cy="certificate-tasks-grid"
          >
            {completedTasks.map((task, index) => {
              const taskSlug = toSlug(task?.id ?? index);
              return (
                <div
                  key={task.id || index}
                  className="bg-white rounded-lg shadow-sm p-2 border border-gray-200"
                  id={`certificate-task-${taskSlug}`}
                  data-cy={`certificate-task-${taskSlug}`}
                >
                  <div
                    id={`certificate-task-inner-${taskSlug}`}
                    data-cy={`certificate-task-inner-${taskSlug}`}
                  >
                    <p
                      className="font-medium text-gray-800 text-xs mb-2"
                      id={`certificate-task-title-${taskSlug}`}
                      data-cy={`certificate-task-title-${taskSlug}`}
                    >
                      {task.title}
                    </p>
                    <div
                      className="flex items-center space-x-2"
                      id={`certificate-task-approver-${taskSlug}`}
                      data-cy={`certificate-task-approver-${taskSlug}`}
                    >
                      <div
                        className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-300"
                        id={`certificate-task-approver-inner-${taskSlug}`}
                        data-cy={`certificate-task-approver-inner-${taskSlug}`}
                      >
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
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            id={`certificate-task-approver-image-${taskSlug}`}
                            data-cy={`certificate-task-approver-image-${taskSlug}`}
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-white flex items-center justify-center text-black font-semibold text-xs border border-gray-300 leading-none"
                            id={`certificate-task-approver-first-name-${taskSlug}`}
                            data-cy={`certificate-task-approver-first-name-${taskSlug}`}
                          >
                            {`${task.approver?.firstName?.[0] || 'A'}${task.approver?.lastName?.[0] || 'P'}`.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p
                        className="text-xs text-gray-500"
                        id={`certificate-task-approver-name-${taskSlug}`}
                        data-cy={`certificate-task-approver-name-${taskSlug}`}
                      >
                        {`${task.approver?.firstName || ''} ${task.approver?.middleName || ''} ${task.approver?.lastName || ''}`.trim()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section - sticky at bottom */}
      <div
        className="relative z-10 px-4 py-2 mt-auto"
        id="certificate-bottom-section"
        data-cy="certificate-bottom-section"
      >
        {/* Employee Name */}
        <div
          className="text-center py-1"
          id="certificate-employee-name-wrapper"
          data-cy="certificate-employee-name-wrapper"
        >
          <p
            className="text-xs text-gray-600 mb-1"
            id="certificate-employee-prefix"
            data-cy="certificate-employee-prefix"
          >
            This is to certify that
          </p>
          <p
            className="text-lg font-bold text-gray-800 mb-1 border-b-2 border-blue-500 pb-1 inline-block"
            id="certificate-employee-name"
            data-cy="certificate-employee-name"
          >
            {`${employeeData?.firstName || ''} ${employeeData?.middleName || ''} ${employeeData?.lastName || ''}`.trim()}
          </p>
        </div>

        {/* Completion Statement */}
        <div
          className="text-center py-0"
          id="certificate-completion-text"
          data-cy="certificate-completion-text"
        >
          <p
            className="text-sm font-bold text-gray-800 mb-0"
            id="certificate-completion-line"
            data-cy="certificate-completion-line"
          >
            Successfully Completed these{' '}
            <span
              className="text-blue px-2 py-1 rounded"
              id="certificate-completion-line-span"
              data-cy="certificate-completion-line-span"
            >
              Off Boarding Process&apos;s on
            </span>
          </p>
          <p
            className="text-xs text-gray-700"
            id="certificate-award-date"
            data-cy="certificate-award-date"
          >
            Award Date: {currentDate}
          </p>
        </div>

        {/* Signature Section */}
        <div
          className="flex justify-between items-end space-x-6 mt-3"
          id="certificate-signature-row"
          data-cy="certificate-signature-row"
        >
          <div
            className="flex-1 text-center"
            id="certificate-signature-block"
            data-cy="certificate-signature-block"
          >
            <div
              className="border-b-2 border-gray-400 w-32 mx-auto mb-2 h-8"
              id="certificate-signature-block-divider"
              data-cy="certificate-signature-block-divider"
            ></div>
            <p
              className="text-sm font-medium text-gray-700"
              id="certificate-signature-block-text"
              data-cy="certificate-signature-block-text"
            >
              SIGNATURE
            </p>
          </div>
          <div
            className="flex-1 text-center"
            id="certificate-date-block"
            data-cy="certificate-date-block"
          >
            <div
              className="border-b-2 border-gray-400 w-32 mx-auto mb-2 h-8 flex items-center justify-center"
              id="certificate-date-block-divider"
              data-cy="certificate-date-block-divider"
            >
              <span
                className="text-sm text-gray-600"
                id="certificate-date-block-text"
                data-cy="certificate-date-block-text"
              >
                {currentDate}
              </span>
            </div>
            <p
              className="text-sm font-medium text-gray-700"
              id="certificate-date-block-text"
              data-cy="certificate-date-block-text"
            >
              DATE
            </p>
          </div>
          <div
            className="flex-1 text-center"
            id="certificate-stamp-block"
            data-cy="certificate-stamp-block"
          >
            <div
              className="w-32 h-32 mx-auto mb-6 relative rounded-full overflow-hidden "
              id="certificate-stamp-block-image"
              data-cy="certificate-stamp-block-image"
            >
              {tenantData?.stamp && (
                <Image
                  src={tenantData.stamp}
                  alt="Company Stamp"
                  fill
                  className="object-contain"
                  id="certificate-stamp-block-image-img"
                />
              )}
            </div>
            <p
              className="text-sm font-medium text-gray-700"
              id="certificate-stamp-block-text"
              data-cy="certificate-stamp-block-text"
            >
              COMPANY STAMP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateContent;
