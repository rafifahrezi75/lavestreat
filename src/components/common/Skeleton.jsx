import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-brand-200/50 rounded-md ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-card border border-brand-200 p-6 flex flex-col gap-4">
      <Skeleton className="w-full aspect-video rounded-card" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}
