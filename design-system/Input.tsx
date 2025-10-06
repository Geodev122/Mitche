import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...rest }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200" {...rest} />
      {error && <div className="text-xs text-rose-600 mt-1">{error}</div>}
    </div>
  );
};

export default Input;
