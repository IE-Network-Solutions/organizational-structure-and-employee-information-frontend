'use client';

import React from 'react';
import { Button, Card, Progress } from 'antd';
import { GoDotFill } from 'react-icons/go';
import { GrCircleQuestion } from 'react-icons/gr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaLongArrowAltRight } from 'react-icons/fa';

interface QuestionSetData {
  id: string;
  title: string;
  queriesCount: number;
  totalAttendees: number;
  meetingsConducted: number;
}

interface StatisticsCardProps {
  data: QuestionSetData;
  conversationTypeId: string;
}

const QuestionSet: React.FC<StatisticsCardProps> = ({ data }) => {
  const { id, title, queriesCount, totalAttendees, meetingsConducted } = data;
  const currentPath = usePathname();

  return (
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center" data-cy={`feedback-conversation-id-components-question-set-card-${id}`} id={`feedback-conversation-id-components-question-set-card-${id}`}>
      {/* <Link href={`/feedback/conversation/${conversationTypeId}/${id}`} passHref> */}
      <h3 className="text-lg font-semibold mb-2" data-cy={`feedback-conversation-id-components-question-set-h3-${id}`} id={`feedback-conversation-id-components-question-set-h3-${id}`}>{title}</h3>
      {/* </Link> */}
      <Link href={`${currentPath}/${id}/questions`} passHref data-cy={`feedback-conversation-id-components-question-set-link-questions-${id}`} id={`feedback-conversation-id-components-question-set-link-questions-${id}`}>
        <p className="flex items-center justify-center text-gray-600 mb-4 hover:text-blue" data-cy={`feedback-conversation-id-components-question-set-p-queries-${id}`} id={`feedback-conversation-id-components-question-set-p-queries-${id}`}>
          <GrCircleQuestion className="mr-1" data-cy={`feedback-conversation-id-components-question-set-icon-question-${id}`} id={`feedback-conversation-id-components-question-set-icon-question-${id}`} />
          <span data-cy={`feedback-conversation-id-components-question-set-span-queries-count-${id}`} id={`feedback-conversation-id-components-question-set-span-queries-count-${id}`}>{queriesCount} Queries </span>
        </p>
      </Link>
      <div className="flex justify-center mb-4" data-cy={`feedback-conversation-id-components-question-set-div-progress-${id}`} id={`feedback-conversation-id-components-question-set-div-progress-${id}`}>
        <Progress
          type="circle"
          percent={50}
          size={80}
          strokeColor="#3B82F6"
          trailColor="#7DD3FC"
          format={() => <span className="text-xs" data-cy={`feedback-conversation-id-components-question-set-span-status-${id}`} id={`feedback-conversation-id-components-question-set-span-status-${id}`}>Current Status</span>}
          data-cy={`feedback-conversation-id-components-question-set-progress-${id}`}
        />
      </div>
      <div className="text-sm text-gray-700 space-y-1" data-cy={`feedback-conversation-id-components-question-set-div-stats-${id}`} id={`feedback-conversation-id-components-question-set-div-stats-${id}`}>
        <p className="flex items-center justify-center text-xs" data-cy={`feedback-conversation-id-components-question-set-p-attendees-${id}`} id={`feedback-conversation-id-components-question-set-p-attendees-${id}`}>
          <GoDotFill className="text-sky-600 mr-1" data-cy={`feedback-conversation-id-components-question-set-icon-dot-attendees-${id}`} id={`feedback-conversation-id-components-question-set-icon-dot-attendees-${id}`} />
          <span data-cy={`feedback-conversation-id-components-question-set-span-attendees-label-${id}`} id={`feedback-conversation-id-components-question-set-span-attendees-label-${id}`}>Total Attendees: </span>
          <span data-cy={`feedback-conversation-id-components-question-set-span-attendees-count-${id}`} id={`feedback-conversation-id-components-question-set-span-attendees-count-${id}`}>{totalAttendees}</span>
        </p>
        <p className="flex items-center justify-center text-xs hover:text-blue" data-cy={`feedback-conversation-id-components-question-set-p-meetings-${id}`} id={`feedback-conversation-id-components-question-set-p-meetings-${id}`}>
          <GoDotFill className="text-blue mr-1" data-cy={`feedback-conversation-id-components-question-set-icon-dot-meetings-${id}`} id={`feedback-conversation-id-components-question-set-icon-dot-meetings-${id}`} />
          <span data-cy={`feedback-conversation-id-components-question-set-span-meetings-label-${id}`} id={`feedback-conversation-id-components-question-set-span-meetings-label-${id}`}>Meetings Conducted: </span>
          <span data-cy={`feedback-conversation-id-components-question-set-span-meetings-count-${id}`} id={`feedback-conversation-id-components-question-set-span-meetings-count-${id}`}>{meetingsConducted}</span>
        </p>
        <Link href={`${currentPath}/${id}/meetings`} passHref data-cy={`feedback-conversation-id-components-question-set-link-details-${id}`} id={`feedback-conversation-id-components-question-set-link-details-${id}`}>
          <Button
            color="default"
            variant="outlined"
            icon={<FaLongArrowAltRight data-cy={`feedback-conversation-id-components-question-set-icon-arrow-${id}`} id={`feedback-conversation-id-components-question-set-icon-arrow-${id}`} />}
            iconPosition="end"
            className="my-3"
            data-cy={`feedback-conversation-id-components-question-set-button-details-${id}`}
            id={`feedback-conversation-id-components-question-set-button-details-${id}`}
          >
            Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default QuestionSet;
