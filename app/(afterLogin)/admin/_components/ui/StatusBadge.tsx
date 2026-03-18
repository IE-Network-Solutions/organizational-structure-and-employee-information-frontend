'use client';

import React from 'react';

export type StatusBadgeVariant = 'active' | 'paid' | 'pending' | 'unpaid' | 'overdue' | 'neutral';

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-orange-100 text-orange-700',
  unpaid: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-700',
};

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
  'data-cy'?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  'data-cy': dataCy,
}) => (
  <span
    data-cy={dataCy}
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
  >
    {children}
  </span>
);

export function getInvoiceStatusVariant(
  status: string | undefined
): StatusBadgeVariant {
  if (!status) return 'neutral';
  switch (status.toLowerCase()) {
    case 'paid':
      return 'paid';
    case 'pending':
    case 'issued':
      return 'pending';
    case 'overdue':
    case 'unpaid':
      return 'unpaid';
    default:
      return 'neutral';
  }
}
