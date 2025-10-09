import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...rest }) => {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <input type="checkbox" {...rest} />
      {label}
    </label>
  );
};

export default Checkbox;
