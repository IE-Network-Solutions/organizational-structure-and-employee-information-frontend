// components/MeetingDetail/MeetingAgenda.tsx
import { useGetPrevMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card } from 'antd';
import Link from 'next/link';
import React from 'react';

export default function PreviousMeeting({ meeting }: { meeting?: any }) {
  const { userId } = useAuthenticationStore();

  const { data: meetings, isLoading: meetingLoading } = useGetPrevMeetings(
    meeting?.meetingTypeId ?? '',
    userId,
  );
  return (
    <Card
      loading={meetingLoading}
      bodyStyle={{ padding: 0 }}
      className="p-4 border-none"
    >
      {meetings?.items?.filter((ifm: any) => ifm?.id != meeting.id)?.length !=
        0 && (
          <>
            <div className="flex justify-between items-center py-2">
              <h2 className="text-lg font-semibold mb-2">Previous Meeting</h2>
            </div>

            <div className="flex flex-col gap-2">
              {meetings?.items
                ?.filter((ifm: any) => ifm?.id != meeting.id)
                ?.map((i: any, index: number) => (
                  <Link
                    key={index}
                    href={`/feedback/meeting/${i.id}`}
                    className="flex items-center justify-between border rounded-md p-3 bg-gray-50"
                  >
                    <span className="font-semibold text-gray-400">{i.title}</span>
                  </Link>
                ))}
            </div>
          </>
        )}
    </Card>
  );
}
