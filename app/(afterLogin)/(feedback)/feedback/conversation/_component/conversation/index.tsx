import React from 'react';
import { Card } from 'antd';
import { GoChevronRight } from 'react-icons/go';
import Link from 'next/link';

interface CardData {
  id: string;
  name: string;
  description: string;
}

interface ConversationCardProps {
  data: CardData;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ data }) => {
  const { id, name, description } = data;

  return (
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="mt-auto">
        <Link href={`/feedback/conversation/${id}`} passHref>
          <span className="flex items-center text-blue-500 hover:text-blue-700">
            <span>See More</span>
            <GoChevronRight className="ml-1" />
          </span>
        </Link>
      </div>
    </Card>
  );
};

export default ConversationCard;
