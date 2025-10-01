import React, { FC, ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  // FIX: Add optional style prop to allow passing inline styles to the card component.
  style?: CSSProperties;
}

const Card: FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#F1EADF] p-6 ${className}`} style={style}>
      {children}
    </div>
  );
};

export default Card;