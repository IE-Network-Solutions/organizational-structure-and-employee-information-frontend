'use client';
import TabLandingLayout from '@/components/tabLanding';
import React from 'react';
import { useGetConversationById } from '@/store/server/features/CFR/conversation/queries';
import { QuestionSet, QuestionSetSkeleton } from './_components/question-set';
import { Skeleton } from 'antd';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { Permissions } from '@/types/commons/permissionEnum';
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

  const generateReportHandler = () => {};
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => generateReportHandler}
      title={conversationType?.name}
      subtitle={
        isLoading ? (
          <Skeleton.Input active size="small" style={{ width: 150 }} />
        ) : (
          `Conversations / ${conversationType?.name}`
        )
      }
      permissionsNeeded={[Permissions.CreateConversationReport]}
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

        {questionSetListData?.length <= 0 && <CustomizeRenderEmpty />}
      </div>
    </TabLandingLayout>
  );
}

export default Index;
