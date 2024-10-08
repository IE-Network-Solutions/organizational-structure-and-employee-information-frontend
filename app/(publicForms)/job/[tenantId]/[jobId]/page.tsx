'use client';
import React from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetJobsByID } from '@/store/server/features/recruitment/job/queries';
import InternalApplicantForm from './_components/internalApplicant';
import ExternalApplicantForm from './_components/externalApplicant';

interface PublicJobFormProps {
  params: { jobId: string };
}

const PublicJobForm: React.FC<PublicJobFormProps> = ({ params: { jobId } }) => {
  const { data: jobDescription } = useGetJobsByID(jobId);
  const isInternalApplicant = useAuthenticationStore?.getState()?.userId;
  // const isInternalApplicant = '';

  return (
    <div className="bg-white w-full rounded-lg px-32 py-8">
      <div className="text-center text-2xl font-bold text-primary py-4">
        Submit Application
      </div>
      {isInternalApplicant ? (
        <InternalApplicantForm
          jobId={jobId}
          isInternalApplicant={isInternalApplicant}
        />
      ) : (
        <ExternalApplicantForm
          jobId={jobId}
          jobTitle={jobDescription?.jobTitle || 'Unknown Job'}
          isInternalApplicant={isInternalApplicant}
        />
      )}
    </div>
  );
};

export default PublicJobForm;
