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

  const questionSetListData = conversationType?.questionSets
    ?.filter((item: any) => item.active === true)
    ?.map((item: any) => {
      const userIds = item?.conversationInstances
        .flatMap((instance: any) => instance.userId || [])
        .filter(
          (id: string, index: number, array: any) =>
            array?.indexOf(id) === index,
        );
      return {
        id: item?.id,
        title: item?.name,
        queriesCount: item?.conversationsQuestions?.length ?? 0,
        totalAttendees: userIds.length,
        meetingsConducted: item?.conversationInstances?.length ?? 0,
      };
    });

  return (
    <TabLandingLayout
      buttonDisabled={true}
      id="conversationLayoutId"
      data-cy="feedback-conversation-id-page-tab-landing-layout"
      title={conversationType?.name}
      subtitle={
        isLoading ? (
          <Skeleton.Input
            active
            size="small"
            style={{ width: 150 }}
            data-cy="feedback-conversation-id-page-skeleton-subtitle"
          />
        ) : (
          `Conversations / ${conversationType?.name}`
        )
      }
    >
      <div
        className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-cy="feedback-conversation-id-page-div-question-sets"
        id="feedback-conversation-id-page-div-question-sets"
      >
        {isLoading
          ? /* eslint-disable @typescript-eslint/naming-convention */
            Array.from({ length: 4 }).map((_, index) => (
              <QuestionSetSkeleton
                key={index}
                data-cy={`feedback-conversation-id-page-skeleton-question-set-${index}`}
              />
            ))
          : /* eslint-enable @typescript-eslint/naming-convention */

            questionSetListData?.map((item: any, index: any) => (
              <QuestionSet
                key={index}
                data={item}
                conversationTypeId={id}
                data-cy={`feedback-conversation-id-page-question-set-${index}`}
              />
            ))}
      </div>
      <br data-cy="feedback-conversation-id-page-break" />
      {questionSetListData?.length <= 0 && (
        <div
          className="flex flex-col align-middle h-full w-full"
          data-cy="feedback-conversation-id-page-div-empty"
          id="feedback-conversation-id-page-div-empty"
        >
          <CustomizeRenderEmpty data-cy="feedback-conversation-id-page-empty-indicator" />
          <p
            className="text-center text-warning"
            data-cy="feedback-conversation-id-page-p-empty-message"
            id="feedback-conversation-id-page-p-empty-message"
          >
            Info: Go to settings and define question-set under define question
            tab.
          </p>
        </div>
      )}
    </TabLandingLayout>
  );
}

export default Index;
