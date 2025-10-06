import React from 'react';
import { HopePointCategory } from '../../types';

const CATEGORY_COLORS: Record<string, string> = {
  [HopePointCategory.SilentHero]: '#7DD3FC', // blue
  [HopePointCategory.VoiceOfCompassion]: '#FBBF24', // amber
  [HopePointCategory.CommunityBuilder]: '#C084FC', // purple
  [HopePointCategory.CommunityGift]: '#34D399', // green
};

interface Props {
  breakdown?: Record<string, number> | undefined;
  size?: number;
}

// Simple SVG constellation visualization: render colored stars proportional to counts
const Constellation: React.FC<Props> = ({ breakdown = {}, size = 120 }) => {
  const entries = Object.entries(breakdown || {});
  const total = entries.reduce((s, [, v]) => s + (v || 0), 0);

  // Generate positions for stars
  const positions = entries.map(([,], i) => {
    const angle = (i / Math.max(1, entries.length)) * Math.PI * 2;
    const r = 20 + (i % 3) * 18;
    const cx = size / 2 + Math.cos(angle) * r;
    const cy = size / 2 + Math.sin(angle) * r;
    return { cx, cy };
  });

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect width="100%" height="100%" fill="none" />
        {entries.map(([cat, count], i) => {
          const color = CATEGORY_COLORS[cat] || '#D1D5DB';
          const radius = Math.min(18, 6 + Math.sqrt(count || 0) * 4);
          const pos = positions[i] || { cx: size / 2, cy: size / 2 };
          return (
            <g key={cat}>
              <defs>
                <filter id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx={pos.cx} cy={pos.cy} r={radius} fill={color} filter={`url(#glow-${i})`} opacity={0.95} />
              {/* small inner star */}
              <circle cx={pos.cx} cy={pos.cy} r={Math.max(1, radius * 0.3)} fill="#ffffff" opacity={0.9} />
            </g>
          );
        })}
        {/* center badge showing total */}
        <g>
          <circle cx={size / 2} cy={size / 2} r={size * 0.16} fill="#111827" opacity={0.9} />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FDFDFD" fontSize={size * 0.14} fontWeight={700}>{total}</text>
        </g>
      </svg>
    </div>
  );
};

export default Constellation;
