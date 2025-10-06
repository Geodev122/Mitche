import React from 'react';

const RippleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => {
  const ref = React.useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple-effect';
    btn.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 600);
    if (props.onClick) props.onClick(e as any);
  };

  return (
    <button {...props} ref={ref} onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {children}
    </button>
  );
};

export default RippleButton;
