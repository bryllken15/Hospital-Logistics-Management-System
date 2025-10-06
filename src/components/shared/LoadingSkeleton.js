import React from 'react';

const LoadingSkeleton = ({
  className = '',
  lines = 3,
  height = 'h-4',
  width = 'w-full',
  variant = 'default'
}) => {
  const baseClasses = 'loading-skeleton rounded';

  if (variant === 'card') {
    return (
      <div className={`neumorphic-card p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="loading-skeleton h-4 w-24"></div>
          <div className="loading-skeleton w-12 h-12 rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="loading-skeleton h-8 w-16"></div>
          <div className="loading-skeleton h-3 w-20"></div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="loading-skeleton h-10 w-full mb-4 rounded"></div>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="loading-skeleton h-12 w-full mb-2 rounded"></div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`loading-skeleton ${height} ${index === lines - 1 ? 'w-3/4' : width}`}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`loading-skeleton ${height} ${width} ${baseClasses} ${className}`}></div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-fade-scale">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="loading-skeleton h-8 w-48"></div>
          <div className="loading-skeleton h-4 w-32"></div>
        </div>
        <div className="loading-skeleton w-32 h-10 rounded-lg"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} variant="card" className="animate-delay-100" />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neumorphic-card p-6">
          <div className="loading-skeleton h-6 w-32 mb-4"></div>
          <div className="loading-skeleton h-64 w-full rounded"></div>
        </div>
        <div className="neumorphic-card p-6">
          <div className="loading-skeleton h-6 w-40 mb-4"></div>
          <div className="loading-skeleton h-64 w-full rounded"></div>
        </div>
      </div>

      {/* Tables Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neumorphic-card p-6">
          <div className="loading-skeleton h-6 w-36 mb-4"></div>
          <LoadingSkeleton variant="table" lines={5} />
        </div>
        <div className="neumorphic-card p-6">
          <div className="loading-skeleton h-6 w-48 mb-4"></div>
          <LoadingSkeleton variant="table" lines={5} />
        </div>
      </div>
    </div>
  );
};

export { LoadingSkeleton, DashboardSkeleton };
export default LoadingSkeleton;