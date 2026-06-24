import React from 'react';
import { Card, Typography, Button, Tooltip } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

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
    <Card
      data-cy={`feedback-conversation-component-conversation-card-${id}`}
      id={`feedback-conversation-component-conversation-card-${id}`}
      bordered={false}
      bodyStyle={{
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="group h-80 overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg"
      style={{ border: '1px solid #e8e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          background: 'linear-gradient(160deg, #f8f9ff 0%, #ffffff 60%)',
        }}
      >
        <Title
          level={5}
          data-cy={`feedback-conversation-component-conversation-h3-${id}`}
          id={`feedback-conversation-component-conversation-h3-${id}`}
          style={{ margin: '0 0 10px', color: '#1a1a2e', fontSize: 15, fontWeight: 600 }}
        >
          {name}
        </Title>

        <div
          className="overflow-hidden flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
        >
          <Paragraph
            data-cy={`feedback-conversation-component-conversation-p-${id}`}
            id={`feedback-conversation-component-conversation-p-${id}`}
            style={{ color: '#6b7280', fontSize: 13, margin: 0, lineHeight: 1.65 }}
          >
            <Tooltip
              title={description}
              data-cy={`feedback-conversation-component-conversation-tooltip-${id}`}
              id={`feedback-conversation-component-conversation-tooltip-${id}`}
            >
              {description}
            </Tooltip>
          </Paragraph>
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Link
            href={`/feedback/conversation/${id}`}
            passHref
            data-cy={`feedback-conversation-component-conversation-link-${id}`}
            id={`feedback-conversation-component-conversation-link-${id}`}
          >
            <Button
              type="primary"
              ghost
              size="small"
              style={{
                borderColor: '#4a6fd5',
                color: '#4a6fd5',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 12,
              }}
              icon={
                <ArrowRightOutlined
                  data-cy={`feedback-conversation-component-conversation-icon-arrow-${id}`}
                  id={`feedback-conversation-component-conversation-icon-arrow-${id}`}
                />
              }
            >
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ConversationCard;
