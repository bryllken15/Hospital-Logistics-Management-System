import React, { useState, useEffect } from 'react';

const PageTransition = ({ children, isVisible = true }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isAnimating
          ? 'opacity-100 transform translate-y-0 scale-100'
          : 'opacity-0 transform translate-y-4 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;