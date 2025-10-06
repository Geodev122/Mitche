import React from 'react';
import RippleButton from './RippleButton';

const spawnSparkle = (parent: HTMLElement) => {
  const s = document.createElement('div');
  s.className = 'ritual-sparkle';
  s.style.position = 'absolute';
  s.style.left = `${20 + Math.random() * 60}%`;
  s.style.bottom = `${10 + Math.random() * 20}%`;
  s.style.width = '8px';
  s.style.height = '8px';
  s.style.opacity = '0';
  parent.appendChild(s);
  requestAnimationFrame(() => {
    s.style.opacity = '1';
    s.style.transform = `translateY(-${20 + Math.random() * 40}px) scale(1)`;
  });
  setTimeout(() => s.remove(), 900);
};

const RitualButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { ritual?: boolean }> = ({ children, ritual = false, className = '', ...props }) => {
  const ref = React.useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ritual && ref.current) {
      for (let i = 0; i < 6; i++) setTimeout(() => spawnSparkle(ref.current as HTMLElement), i * 80);
    }
    if (props.onClick) props.onClick(e as any);
  };

  return (
    <div className="relative inline-block">
      <RippleButton ref={ref as any} {...props} onClick={handleClick} className={className}>{children}</RippleButton>
    </div>
  );
}

export default RitualButton;
