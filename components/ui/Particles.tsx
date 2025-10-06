import React from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const Particles: React.FC<{ intensity?: 'low' | 'med' | 'high' }> = ({ intensity = 'low' }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  React.useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    const baseCount = intensity === 'low' ? 18 : intensity === 'med' ? 36 : 64;

    for (let i = 0; i < baseCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.05,
        r: 1 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.6
      });
    }

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.999;
        if (p.y < -10 || p.alpha < 0.02 || p.x < -20 || p.x > width + 20) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.vx = (Math.random() - 0.5) * 0.2;
          p.vy = -Math.random() * 0.4 - 0.05;
          p.r = 1 + Math.random() * 3;
          p.alpha = 0.2 + Math.random() * 0.6;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, prefersReduced]);

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-20" />
  );
};

export default Particles;
