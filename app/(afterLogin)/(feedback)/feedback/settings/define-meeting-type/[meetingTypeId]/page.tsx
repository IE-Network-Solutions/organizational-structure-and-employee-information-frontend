'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useGetMeetingTypeById } from '@/store/server/features/CFR/meeting/type/queries';
import MeetingTypeDetail from '../_components/meetingTypeDetail';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

const MeetingTypeDetailPage = () => {
  const params = useParams<{ meetingTypeId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setMeetingTypeDetail } = useMeetingStore();

  const meetingTypeId = params?.meetingTypeId ?? '';
  const meetingNameFromQuery = searchParams?.get('name') ?? '';

  const { data: meetingTypeData, isLoading } = useGetMeetingTypeById(
    meetingTypeId || null,
  );

  React.useEffect(() => {
    if (!meetingTypeId) return;

    const name =
      meetingTypeData?.name ||
      meetingNameFromQuery ||
      meetingTypeData?.data?.name ||
      '';

    const description = meetingTypeData?.description || '';

    setMeetingTypeDetail({
      id: meetingTypeId,
      name,
      description,
    });
  }, [
    meetingTypeId,
    meetingTypeData,
    meetingNameFromQuery,
    setMeetingTypeDetail,
  ]);

  if (!meetingTypeId) {
    router.push('/feedback/settings/define-meeting-type');
    return null;
  }

  return (
    <Spin spinning={isLoading}>
      <MeetingTypeDetail data-cy="settings-define-meeting-type-detail" />
    </Spin>
  );
};

export default MeetingTypeDetailPage;
