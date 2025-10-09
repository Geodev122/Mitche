import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...rest }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <textarea className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-200" {...rest} />
      {error && <div className="text-xs text-rose-600 mt-1">{error}</div>}
    </div>
  );
};

export default Textarea;
