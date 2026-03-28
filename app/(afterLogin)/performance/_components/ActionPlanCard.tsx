'use client';

import React from 'react';
import { TrendingDown } from 'lucide-react';

const resolved = 26;
const pending = 13;
const unresolved = 3;

const GREEN = '#10b981';
const ORANGE = '#f59e0b';
const RED = '#ef4444';

export default function ActionPlanCard() {
  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm h-[177px]"
      data-cy="performance-action-plan-card"
    >
      <h2 className="mb-2 text-base font-bold text-black">Action Plan</h2>

      <div className="mb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
            57<span className="text-3xl font-bold"> %</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TrendingDown
              className="h-5 w-5 shrink-0 text-red-500"
              strokeWidth={2.25}
              aria-hidden
            />
            <span className="text-sm font-medium text-red-500">8%</span>
            <span className="text-sm text-gray-500">Last Month</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Action plan resolved this month
        </p>
      </div>

      <div className="flex w-full gap-0.5 bg-gray-100 rounded-full p-0">
        <div
          className="min-w-0 flex-1"
          style={{ flex: `${resolved} 1 0%` }}
        >
          <div
            className="h-3 w-full rounded-full"
            style={{ backgroundColor: GREEN }}
            title={`Resolved ${resolved}`}
          />
        </div>
        <div
          className="min-w-0 flex-1"
          style={{ flex: `${pending} 1 0%` }}
        >
          <div
            className="h-3 w-full rounded-full"
            style={{ backgroundColor: ORANGE }}
            title={`Pending ${pending}`}
          />
        </div>
        <div
          className="min-w-0 flex-1"
          style={{ flex: `${unresolved} 1 0%` }}
        >
          <div
            className="h-3 w-full rounded-full"
            style={{ backgroundColor: RED }}
            title={`unresolved ${unresolved}`}
          />
        </div>
      </div>

      <div className="mt-3 flex  gap-10 text-xs font-medium">
        <div
          className="text-start"
          style={{  color: GREEN }}
        >
          Resolved {resolved}
        </div>
        <div
          className=" text-start"
          style={{  color: ORANGE }}
        >
          Pending {pending}
        </div>
        <div
          className="text-start"
          style={{  color: RED }}
        >
          unresolved {unresolved}
        </div>
      </div>
    </section>
  );
}
