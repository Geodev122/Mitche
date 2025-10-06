import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantMap: Record<string, string> = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300',
    secondary: 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 focus:ring-amber-200',
    ghost: 'bg-transparent text-amber-600 hover:bg-amber-50 focus:ring-amber-200'
  };

  return (
    <button className={`${base} ${variantMap[variant]} px-4 py-2 ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
