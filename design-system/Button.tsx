import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantMap: Record<string, string> = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300',
    secondary: 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 focus:ring-amber-200',
    ghost: 'bg-transparent text-amber-600 hover:bg-amber-50 focus:ring-amber-200',
    destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  };

  const sizeMap: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button className={`${base} ${variantMap[variant]} ${sizeMap[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
