import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtitle, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 1500;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
        
        setAnimatedValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setAnimatedValue(value);
    }
  }, [isVisible, value]);

  const iconBgClasses = {
    blue: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
    green: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
    red: 'bg-gradient-to-br from-red-100 to-red-200 text-red-600',
    yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600',
    purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600',
    indigo: 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600',
    orange: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600'
  };

  const cardGradientClasses = {
    blue: 'gradient-card-blue',
    green: 'gradient-card-green',
    red: 'gradient-card-red',
    yellow: 'gradient-card-orange',
    purple: 'gradient-card-purple',
    indigo: 'gradient-card-blue',
    orange: 'gradient-card-orange'
  };

  return (
    <div className={`neumorphic-card p-6 ${cardGradientClasses[color]} transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      isVisible ? 'animate-fade-scale' : 'opacity-0'
    }`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {typeof value === 'number' ? animatedValue.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-3 text-sm font-semibold ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="animate-pulse">{trend.value}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-4 rounded-xl ${iconBgClasses[color]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
      
      {/* Animated progress bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-1 rounded-full transition-all duration-1000 ease-out ${
            color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
            color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
            color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
            color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
            color === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
            'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}
          style={{
            width: isVisible ? '100%' : '0%',
            transitionDelay: `${delay + 500}ms`
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatCard;
