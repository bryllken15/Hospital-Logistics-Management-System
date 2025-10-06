import React, { useState, useEffect } from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  loading = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), Math.random() * 300);
    return () => clearTimeout(timer);
  }, []);

  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-600',
      trendUp: 'text-blue-600',
      trendDown: 'text-blue-800',
      glow: 'shadow-blue-200/50'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100 text-green-600',
      trendUp: 'text-green-600',
      trendDown: 'text-green-800',
      glow: 'shadow-green-200/50'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100 text-red-600',
      trendUp: 'text-red-600',
      trendDown: 'text-red-800',
      glow: 'shadow-red-200/50'
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100 text-yellow-600',
      trendUp: 'text-yellow-600',
      trendDown: 'text-yellow-800',
      glow: 'shadow-yellow-200/50'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100 text-purple-600',
      trendUp: 'text-purple-600',
      trendDown: 'text-purple-800',
      glow: 'shadow-purple-200/50'
    },
    indigo: {
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100 text-indigo-600',
      trendUp: 'text-indigo-600',
      trendDown: 'text-indigo-800',
      glow: 'shadow-indigo-200/50'
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100 text-orange-600',
      trendUp: 'text-orange-600',
      trendDown: 'text-orange-800',
      glow: 'shadow-orange-200/50'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  if (loading) {
    return (
      <div className={`neumorphic-card p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="loading-skeleton h-4 w-24 mb-2"></div>
            <div className="loading-skeleton h-8 w-16 mb-1"></div>
            <div className="loading-skeleton h-3 w-20"></div>
          </div>
          <div className="loading-skeleton w-12 h-12 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`neumorphic-card p-6 hover:scale-105 transition-all duration-300 group cursor-pointer animate-fade-scale ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        background: `linear-gradient(145deg, #ffffff, #f8fafc)`,
        boxShadow: `
          8px 8px 16px rgba(0, 0, 0, 0.1),
          -8px -8px 16px rgba(255, 255, 255, 0.9),
          0 0 0 1px rgba(255, 255, 255, 0.2)
        `
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1 text-shadow-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1 text-shadow">
            {typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}K` : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              trend.direction === 'up' ? scheme.trendUp : scheme.trendDown
            }`}>
              <div className={`w-0 h-0 border-l-2 border-r-2 border-b-3 mr-1 ${
                trend.direction === 'up'
                  ? 'border-l-transparent border-r-transparent border-b-current'
                  : 'border-l-transparent border-r-transparent border-t-current transform rotate-180'
              }`}></div>
              <span>{trend.value}</span>
              {trend.direction === 'up' ? (
                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

    </div>
  );
};

export default StatCard;
