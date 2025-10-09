import * as React from 'react';
import { useId } from 'react';
// Use explicit extension to help some editor/tsserver configurations resolve the module
import Tooltip from './Tooltip.tsx';
import { HopePointCategory } from '../../types';

// Map five HBIM pillars to colors (these become the flower petals)
const PILLAR_COLORS: string[] = ['#7DD3FC', '#FBBF24', '#C084FC', '#34D399', '#FDBA74'];

interface Props {
  // breakdown values map to the five pillars in order: anchor, bridge, symbol, dialog, transpersonal
  breakdown?: Record<string, number> | undefined;
  size?: number;
}

// Render a 5-petal flower (SVG). Each petal fills proportionally based on the value for that pillar.
const Constellation: React.FC<Props> = ({ breakdown = {}, size = 140 }) => {
  // Map breakdown to an ordered array of pillar values. We accept either explicit keys or a fallback array.
  const pillarKeys = ['anchor', 'bridge', 'symbol', 'dialog', 'transpersonal'];
  const values = pillarKeys.map((k, i) => {
    // try canonical keys first, then numeric indexes or enum-like names
    const v = (breakdown as any)[k] ?? (breakdown as any)[Object.keys(breakdown || {})[i]] ?? 0;
    return Math.max(0, Number(v || 0));
  });

  const total = values.reduce((s, v) => s + v, 0);
  const maxForScale = Math.max(1, ...values, total / 5 || 1);

  const id = useId();

  // Petal geometry: five petals evenly spaced around center; petal path created via elliptical arcs
  const center = { x: size / 2, y: size / 2 };
  const petalRadius = size * 0.36;
  const petalWidth = size * 0.26;

  const petalPath = (angleDeg: number, fillRatio: number) => {
    // angle in degrees, fillRatio 0..1 determines inner cut to show progress
    const a = (angleDeg * Math.PI) / 180;
    const cx = center.x + Math.cos(a) * (petalRadius * 0.55);
    const cy = center.y + Math.sin(a) * (petalRadius * 0.55);

    // large petal outer point
    const ox = center.x + Math.cos(a) * petalRadius;
    const oy = center.y + Math.sin(a) * petalRadius;

    // orthogonal for width
    const orthoA = a + Math.PI / 2;
    const w = petalWidth;
    const x1 = cx + Math.cos(orthoA) * w;
    const y1 = cy + Math.sin(orthoA) * w;
    const x2 = cx - Math.cos(orthoA) * w;
    const y2 = cy - Math.sin(orthoA) * w;

    // inner cut point for progress
    const innerR = petalRadius * (0.12 + 0.75 * (1 - fillRatio));
    const ix = center.x + Math.cos(a) * innerR;
    const iy = center.y + Math.sin(a) * innerR;

    // build path from x1,y1 to outer to x2,y2 to inner back
    return `M ${x1} ${y1} Q ${ox} ${oy} ${x2} ${y2} L ${ix} ${iy} Z`;
  };

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-labelledby={`constellation-${id}`}>
        <title id={`constellation-${id}`}>Personal Constellation Flower</title>
        <defs>
          <filter id={`glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* petals */}
        {values.map((v, i) => {
          const angle = -90 + (i * 360) / values.length; // start at top
          const fillRatio = Math.min(1, v / maxForScale);
          const color = PILLAR_COLORS[i % PILLAR_COLORS.length];
          return (
            <g key={i} transform={`translate(0,0)`}> 
              {/* background petal */}
              <path d={petalPath(angle, 0)} fill={`${color}33`} stroke="none" />
              {/* filled portion */}
              <path d={petalPath(angle, fillRatio)} fill={color} stroke="none" filter={`url(#glow)`} opacity={0.95} />
            </g>
          );
        })}

        {/* center circle with total and flower center ring */}
        <g>
          <circle cx={center.x} cy={center.y} r={size * 0.14} fill="#111827" opacity={0.95} />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FDFDFD" fontSize={size * 0.12} fontWeight={700}>
            {total}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Constellation;
