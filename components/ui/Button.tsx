import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary'|'ghost'}> = ({ children, variant = 'primary', ...props }) => {
  const base = 'inline-flex items-center justify-center px-3 py-2 rounded-md font-medium';
  const cls = variant === 'primary' ? `${base} bg-[var(--accent)] text-white` : `${base} bg-transparent`;
  return <button className={cls} {...props}>{children}</button>;
}

export default Button;
