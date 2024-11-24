'use client';

import React from 'react';
import { Card, Progress } from 'antd';
import { GoDotFill } from 'react-icons/go';
import { GrCircleQuestion } from 'react-icons/gr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface QuestionSetData {
  id: string;
  title: string;
  queriesCount: number;
  totalAttendees: number;
  meetingsConducted: number;
}

interface StatisticsCardProps {
  data: QuestionSetData;
  conversationTypeId:string;
}

const QuestionSet: React.FC<StatisticsCardProps> = ({ data,conversationTypeId }) => {
  const { id, title, queriesCount, totalAttendees, meetingsConducted } = data;
  const currentPath = usePathname();

  return (
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center">
      {/* <Link href={`/feedback/conversation/${conversationTypeId}/${id}`} passHref> */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {/* </Link> */}
      <Link href={`${currentPath}/${id}/questions`} passHref>
        <p className="flex items-center justify-center text-gray-600 mb-4 hover:text-blue">
          <GrCircleQuestion className="mr-1" />
          <span>{queriesCount} Queries </span>
        </p>
      </Link>
      <div className="flex justify-center mb-4">
        <Progress
          type="circle"
          percent={50}
          size={80}
          strokeColor="#3B82F6"
          trailColor="#7DD3FC"
          format={() => <span className="text-xs">Current Status</span>}
        />
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <p className="flex items-center justify-center text-xs">
          <GoDotFill className="text-sky-600 mr-1" />
          <span>Total Attendees: </span>
          <span>{totalAttendees}</span>
        </p>
        <Link href={`${currentPath}/${id}/meetings`} passHref>
          <p className="flex items-center justify-center text-xs hover:text-blue">
            <GoDotFill className="text-blue mr-1" />
            <span>Meetings Conducted: </span>
            <span>{meetingsConducted}</span>
          </p>
        </Link>
      </div>
    </Card>
  );
};

export default QuestionSet;
