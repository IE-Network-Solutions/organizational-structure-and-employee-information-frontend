import React from 'react';

interface MeetingTemplateCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const MeetingTemplateCard: React.FC<MeetingTemplateCardProps> = ({ title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};