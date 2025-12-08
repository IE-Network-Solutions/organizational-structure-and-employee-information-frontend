import React from 'react';

export default function PlanCardSkeleton() {
    return (
        <div className="rounded-3xl border border-gray-300 p-4 bg-white animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
            </div>

            {/* User Info & Status Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                </div>
            </div>

            {/* Key Result Skeleton */}
            <div className="rounded-3xl border border-[#F1F2F6] bg-white p-6">
                <div className="pl-2">
                    {/* Summary Bar Skeleton */}
                    <div className="mb-5 flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>

                    {/* Title Skeleton */}
                    <div className="flex items-start gap-3 mb-6">
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    </div>

                    {/* Tasks Skeleton */}
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments Skeleton */}
            <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}
