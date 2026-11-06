import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-slate-200 border-t-sky-600 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
