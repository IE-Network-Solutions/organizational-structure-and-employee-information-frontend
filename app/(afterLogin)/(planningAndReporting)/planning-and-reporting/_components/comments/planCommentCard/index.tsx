import React from 'react';
import { Card, Skeleton } from 'antd';
import { CommentsData } from '@/types/okr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import CommentAuthorsAvatars from '../commentAuthorsAvatar';
import CommentList from '../commentList';
// Extend Day.js with the relative time plugin
dayjs.extend(relativeTime);

interface Props {
  data: CommentsData[];
  loading: boolean;
  planId: string;
  isPlanCard: boolean;
}

const CommentCard: React.FC<Props> = ({
  data,
  loading,
  planId,
  isPlanCard,
}) => {
  const { viewComment, setViewComment } = PlanningAndReportingStore();
  return (
    <Card
      bodyStyle={{ padding: 10 }}
      className="border-none"
      // extra={
      //   !viewComment ? (
      //     <Button
      //       className="text-xs"
      //       type="primary"
      //       onClick={() => setViewComment(!viewComment)}
      //     >
      //       Comment {data?.length}
      //     </Button>
      //   ) : (
      //     <Button
      //       className="text-xs border "
      //       onClick={() => setViewComment(!viewComment)}
      //       iconPosition="end"
      //       icon={<MdClose />}
      //     >
      //       Cancel
      //     </Button>
      //   )
      // }
    >
      <div className="flex items-center  gap-1 text-sm cursor-pointer mb-2">
        {CommentAuthorsAvatars(data)}
        <span onClick={() => setViewComment(!viewComment)}>
          {data?.length} Comments
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }}
          />
          <Skeleton.Button active shape="round" style={{ width: 100 }} />
        </>
      ) : (
        <>
          {viewComment && (
            <CommentList data={data} planId={planId} isPlanCard={isPlanCard} />
          )}
        </>
      )}
    </Card>
  );
};
export default CommentCard;
