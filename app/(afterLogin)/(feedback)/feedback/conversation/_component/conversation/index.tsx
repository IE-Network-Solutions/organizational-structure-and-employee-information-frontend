import React from 'react';
import { Card, Tooltip } from 'antd';
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
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg h-80 relative">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p
        className="text-gray-600 mb-4 overflow-hidden text-ellipsis"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
        }}
      >
        <Tooltip title={description}>{description}</Tooltip>
      </p>

      <Link
        href={`/feedback/conversation/${id}`}
        passHref
        className="absolute bottom-4 right-4"
      >
        <FaLongArrowAltRight className="text-3xl cursor-pointer text-gray-600 hover:text-black" />
      </Link>
    </Card>
  );
};

export default ConversationCard;
