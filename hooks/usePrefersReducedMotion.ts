import { useEffect, useState } from 'react';

export default function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReduced(!!(mq && mq.matches));
    handler();
    if (mq && mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq && mq.addListener) mq.addListener(handler as any);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', handler);
      else if (mq && mq.removeListener) mq.removeListener(handler as any);
    };
  }, []);

  return prefersReduced;
}
