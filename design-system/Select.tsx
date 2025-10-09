import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, error, className = '', children, ...rest }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <select className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white" {...rest}>
        {children}
      </select>
      {error && <div className="text-xs text-rose-600 mt-1">{error}</div>}
    </div>
  );
};

export default Select;
