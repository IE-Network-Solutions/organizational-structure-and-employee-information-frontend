'use client';
import { useGetRecognitionById } from '@/store/server/features/CFR/recognition/queries';
import RecognitionDetail from '../_components/RecognitionDetail';
import { Button, Tooltip } from 'antd';
import React from 'react';
import { useDownloadCertificate } from '@/store/server/features/CFR/recognition/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface Params {
  id: string;
}
interface RecognitionDetailsProps {
  params: Params;
}

function Page({ params: { id } }: RecognitionDetailsProps) {
  const { data: getRecognitionById, isLoading } = useGetRecognitionById(id);
  const tenantId = useAuthenticationStore.getState().tenantId;
  const downloadMutation = useDownloadCertificate();
  return (
    <div data-cy="recognition-detail-page" id="recognitionDetailPage">
      <div className="mt-5 flex justify-end">
        <Tooltip placement="top" overlayClassName="custom-tooltip">
          <Button
            loading={downloadMutation.isLoading}
            onClick={() => {
              downloadMutation.mutate({ recognitionId: id, tenantId });
            }}
            type="primary"
            className="h-14 px-6 rounded-lg flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <div className="text-center text-base font-bold leading-normal tracking-tight">
              {downloadMutation.isLoading ? 'Downloading...' : 'Print Certification'}
            </div>
          </Button>
        </Tooltip>
      </div>

      <div className="mt-4">
        <RecognitionDetail
          loading={isLoading}
          recognition={getRecognitionById}
          onClose={() => window.history.back()}
        />
      </div>
    </div>
  );
}

export default Page;
