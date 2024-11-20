'use client';  // Ensure this file is only rendered client-side

import React from 'react';
import { Card, Progress } from 'antd';
import { GoDotFill } from 'react-icons/go';
import { GrCircleQuestion } from 'react-icons/gr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';  // Use usePathname for the App Router

interface QuestionSetData {
  id: string;
  title: string;
  queriesCount: number;
  totalAttendees: number;
  meetingsConducted: number;
}

interface StatisticsCardProps {
  data: QuestionSetData;
}

const QuestionSet: React.FC<StatisticsCardProps> = ({ data }) => {
  const { id, title, queriesCount, totalAttendees, meetingsConducted } = data;
  const currentPath = usePathname();  // Get the current path using usePathname

  return (
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center">
      <Link href={`/feedback/conversation/bi-weekly/${id}`} passHref>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      </Link>
      <Link
        href={`${currentPath}/${id}/questions`}  // Append to the current path
        passHref
      >
        <p className="flex items-center justify-center text-gray-600 mb-4 hover:text-blue">
          <GrCircleQuestion className="mr-1" />
          <span>{queriesCount} Queries </span>
        </p>
      </Link>

      <div className="flex justify-center mb-4">
        <Progress
          type="circle"
          percent={50} // The progress percentage you want to indicate
          size={80}
          strokeColor="#3B82F6" // Blue for achieved part
          trailColor="#7DD3FC" // Sky-blue for unachieved part
          format={() => <span className="text-xs">Current Status</span>} // Display custom status text inside the circle
        />
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <p className="flex items-center justify-center text-xs">
          <GoDotFill className="text-sky-600 mr-1" />
          <span>Total Attendees: </span>
          <span>{totalAttendees}</span>
        </p>
        <Link
          href={`${currentPath}/${id}/meetings`}
          passHref
        >
          <p className="flex items-center justify-center text-xs  hover:text-blue">
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
