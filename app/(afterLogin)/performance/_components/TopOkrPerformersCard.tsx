'use client';

import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
const performers = [
  { name: 'Emily Chen', title: 'Product Designer', score: 54 },
  { name: 'James Wilson', title: 'Project Management', score: 54 },
  { name: 'Sarah Kim', title: 'DevOps', score: 54 },
  { name: 'Alex Rivera', title: 'Engineering Lead', score: 54 },
];



export default function TopOkrPerformersCard() {
  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm h-[338px]"
      data-cy="performance-top-okr-performers-card"
    >
      <h2 className="mb-4 text-base font-bold text-black">
        Top OKR Performers
      </h2>
      <ul className="scrollbar-none h-[265px] space-y-3 overflow-y-auto">
        {performers.map((person) => (
          <li
            key={person.name}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar size={36} icon={<UserOutlined />} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {person.name}
                </p>
                <p className="truncate text-xs font-normal text-gray-500">
                  {person.title}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold text-gray-900">
              {person.score}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
