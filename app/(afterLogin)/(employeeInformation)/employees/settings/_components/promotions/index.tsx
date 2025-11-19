'use client';

import { Card } from 'antd';
import React from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import TableData from '../table';

const Promotions = () => {
  return (
    <Card
      className="border-b-0 py-4 px-4 sm:px-6 lg:px-8"
      id="settings-promotions-card"
      data-cy="settings-promotions-card"
    >
      <div
        className="text-black font-bold text-lg mb-4"
        id="settings-promotions-title"
        data-cy="settings-promotions-title"
      >
        Promotions
      </div>
      <p
        className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs sm:text-sm my-4 sm:my-6 text-center"
        id="settings-promotions-description"
        data-cy="settings-promotions-description"
      >
        <RiErrorWarningFill
          className="text-yellow-500"
          id="settings-promotions-icon"
          data-cy="settings-promotions-icon"
        />
        <span
          id="settings-promotions-text"
          data-cy="settings-promotions-text"
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry standard dummy text ever
          since the 1500s.
        </span>
      </p>
      <div
        id="settings-promotions-table-wrapper"
        data-cy="settings-promotions-table-wrapper"
      >
        <TableData data-cy="settings-promotions-table" />
      </div>
    </Card>
  );
};

export default Promotions;
