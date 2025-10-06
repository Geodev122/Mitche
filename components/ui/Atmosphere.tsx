import React from 'react';

const Atmosphere: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      const root = document.documentElement;
      root.style.setProperty('--atmo-x', `${x}`);
      root.style.setProperty('--atmo-y', `${y}`);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 atmo-bg"></div>
      {children}
    </div>
  );
};

export default Atmosphere;
