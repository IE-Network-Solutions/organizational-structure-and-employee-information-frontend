'use client';

import { useParams, useSearchParams } from 'next/navigation';

export default function RecognitionDetailPage() {
  const params = useParams<{ recognitionId: string }>();
  const searchParams = useSearchParams();

  const recognitionId = params?.recognitionId;
  const recognitionName = searchParams?.get('name') ?? '';

  return (
    <div className="p-5 rounded-2xl bg-white h-full" data-cy="recognition-detail-page">
      <div className="text-lg font-semibold text-gray-900" data-cy="recognition-detail-title">
        Recognition
      </div>
      <div className="mt-4" data-cy="recognition-detail-content">
        <div className="text-sm text-gray-500" data-cy="recognition-detail-id">
          ID: <span className="text-gray-900">{recognitionId}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500" data-cy="recognition-detail-name">
          Name: <span className="text-gray-900">{recognitionName || '-'}</span>
        </div>
      </div>
    </div>
  );
}

