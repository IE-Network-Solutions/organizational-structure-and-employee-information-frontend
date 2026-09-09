'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

/**
 * Legacy evaluation route — evaluation now happens in a modal on the
 * Evaluators view. Redirect old links back there.
 */
const SuccessionEvaluationRedirectPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleId = String(params?.roleId ?? '');
    const successorId = String(params?.successorId ?? '');
    const evaluatorId = searchParams.get('evaluatorId') ?? '';
    const query = new URLSearchParams({ view: 'evaluators' });
    if (roleId) query.set('roleId', roleId);
    if (successorId) query.set('successorId', successorId);
    if (evaluatorId) query.set('evaluatorId', evaluatorId);
    router.replace(`/employees/succession-planning?${query.toString()}`);
  }, [router, params, searchParams]);

  return null;
};

export default SuccessionEvaluationRedirectPage;
