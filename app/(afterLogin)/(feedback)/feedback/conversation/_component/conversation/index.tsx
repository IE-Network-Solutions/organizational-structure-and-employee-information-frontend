import React from 'react';
import { Card } from 'antd';
import { FaLongArrowAltRight } from 'react-icons/fa';
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
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      <div className="mt-auto">
        <Link href={`/feedback/conversation/${id}`} passHref>
          <span className="flex justify-end items-center text-blue-500 hover:text-blue-700">
          <FaLongArrowAltRight />
          </span>
        </Link>
      </div>
    </Card>
  );
};

export default ConversationCard;
