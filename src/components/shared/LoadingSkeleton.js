import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`neumorphic-card p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="loading-skeleton h-4 w-24 mb-2"></div>
                <div className="loading-skeleton h-8 w-16 mb-2"></div>
                <div className="loading-skeleton h-3 w-32"></div>
              </div>
              <div className="loading-skeleton h-12 w-12 rounded-xl"></div>
            </div>
            <div className="loading-skeleton h-1 w-full rounded-full"></div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`neumorphic-card p-6 ${className}`}>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="loading-skeleton h-4 w-32"></div>
                  <div className="loading-skeleton h-4 w-24"></div>
                  <div className="loading-skeleton h-4 w-20"></div>
                  <div className="loading-skeleton h-4 w-16"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'chart':
        return (
          <div className={`neumorphic-card p-6 ${className}`}>
            <div className="loading-skeleton h-6 w-32 mb-4"></div>
            <div className="loading-skeleton h-64 w-full rounded-lg"></div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 neumorphic-card">
                <div className="loading-skeleton h-10 w-10 rounded-full"></div>
                <div className="flex-1">
                  <div className="loading-skeleton h-4 w-24 mb-2"></div>
                  <div className="loading-skeleton h-3 w-32"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'stats':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="neumorphic-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="loading-skeleton h-4 w-24 mb-2"></div>
                    <div className="loading-skeleton h-8 w-16 mb-2"></div>
                    <div className="loading-skeleton h-3 w-32"></div>
                  </div>
                  <div className="loading-skeleton h-12 w-12 rounded-xl"></div>
                </div>
                <div className="loading-skeleton h-1 w-full rounded-full"></div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`loading-skeleton h-4 w-full rounded ${className}`}></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-delay-100" style={{ animationDelay: `${i * 100}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;