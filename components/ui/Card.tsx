import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`card bg-white rounded-xl shadow-sm border border-[#F1EADF] p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;