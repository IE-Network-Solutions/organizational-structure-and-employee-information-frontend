import React from 'react';
import { Card, Button, Skeleton } from 'antd';
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
      title={
        <div className="flex flex-col gap-1 text-sm">
          {CommentAuthorsAvatars(data)} Comments
        </div>
      }
      extra={
        <Button
          className="text-xs"
          type="primary"
          onClick={() => setViewComment(!viewComment)}
        >
          Comment {data?.length}
        </Button>
      }
    >
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
