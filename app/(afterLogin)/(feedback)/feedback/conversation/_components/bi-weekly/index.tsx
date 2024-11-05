import React from 'react';
import { Card, Progress } from 'antd';
import { GoDotFill } from 'react-icons/go';
import { GrCircleQuestion } from 'react-icons/gr';
import Link from 'next/link';

interface CardData {
  title: string;
  queriesCount: number;
  totalAttendees: number;
  meetingsConducted: number;
}

interface StatisticsCardProps {
  data: CardData;
}

const BiWeekly: React.FC<StatisticsCardProps> = ({ data }) => {
  const { title, queriesCount, totalAttendees, meetingsConducted } = data;

  return (
    <Link href={`/feedback/conversation/543211234`} passHref> {/* Next.js Link */}
      <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="flex items-center justify-center text-gray-600 mb-4">
          <GrCircleQuestion className='mr-1' />
          <span>{queriesCount} Queries </span></p>
        <div className="flex justify-center mb-4">
          <Progress
            type="circle"
            percent={30} // The progress percentage you want to indicate
            size={80}
            strokeColor="#3B82F6"  // Blue for achieved part
            trailColor="#7DD3FC"    // Sky-blue for unachieved part
            format={() => <span className='text-xs'>Current Status</span>} // Display custom status text inside the circle
          />
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p className='flex items-center justify-center text-xs'>
            <GoDotFill className='text-sky-600 mr-1' />
            <span>Total Attendees: </span>
            <span>{totalAttendees}</span>
          </p>
          <p className='flex items-center justify-center text-xs'>
            <GoDotFill className='text-blue mr-1' />
            <span>Meetings Conducted: </span>
            <span>{meetingsConducted}</span>
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default BiWeekly;
