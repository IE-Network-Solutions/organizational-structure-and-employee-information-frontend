import React from 'react';
import { Button, Card, Tooltip } from 'antd';
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
    <Card className="p-4 flex flex-col items-center shadow-lg rounded-lg h-80">
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

      <div className="mt-auto">
        <Link href={`/feedback/conversation/${id}`} passHref>
          <Button
            color="default"
            variant="outlined"
            icon={<FaLongArrowAltRight />}
            iconPosition="end"
          >
            Details
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ConversationCard;
