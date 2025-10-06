import React from 'react';

const Tooltip: React.FC<{ content: React.ReactNode; children: React.ReactNode }> = ({ content, children }) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{content}</div>
    </div>
  );
};

export default Tooltip;
