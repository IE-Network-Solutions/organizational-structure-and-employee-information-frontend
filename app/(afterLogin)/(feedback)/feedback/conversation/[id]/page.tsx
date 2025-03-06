'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useGetConversationById } from '@/store/server/features/CFR/conversation/queries';
import { QuestionSet, QuestionSetSkeleton } from './_components/question-set';
import { Skeleton } from 'antd';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
interface Params {
  id: string;
}

function Index({ params }: { params: Params }) {
  const { id } = params;

  const { data: conversationType, isLoading } = useGetConversationById(id);
  const questionSetListData = conversationType?.questionSets?.map(
    (item: any) => {
      const userIds = item?.conversationInstances
        .flatMap((instance: any) => instance.userId || []) // Collect and flatten userId arrays
        .filter(
          (id: string, index: number, array: any) =>
            array?.indexOf(id) === index,
        ); // Deduplicate
      return {
        id: item?.id,
        title: item?.name,
        queriesCount: item?.conversationsQuestions?.length ?? 0,
        totalAttendees: userIds.length,
        meetingsConducted: item?.conversationInstances?.length ?? 0,
      };
    },
  );

  return (
    <TabLandingLayout
      buttonDisabled={true}
      id="conversationLayoutId"
      title={conversationType?.name}
      subtitle={
        isLoading ? (
          <Skeleton.Input active size="small" style={{ width: 150 }} />
        ) : (
          `Conversations / ${conversationType?.name}`
        )
      }
    >
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? /* eslint-disable @typescript-eslint/naming-convention */
            Array.from({ length: 4 }).map((_, index) => (
              <QuestionSetSkeleton key={index} />
            ))
          : /* eslint-enable @typescript-eslint/naming-convention */

            questionSetListData?.map((item: any, index: any) => (
              <QuestionSet key={index} data={item} conversationTypeId={id} />
            ))}
      </div>
      <br />
      {questionSetListData?.length <= 0 && (
        <div className="flex flex-col align-middle h-full w-full">
          <CustomizeRenderEmpty />
          <p className="text-center text-warning">
            Info: Go to settings and define question-set under define question
            tab.
          </p>
        </div>
      )}
    </TabLandingLayout>
  );
}

export default Index;
