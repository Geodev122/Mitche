import React, { useEffect, useRef, useState } from 'react';

type Pillars = { anchor?: number; bridge?: number; symbol?: number; dialog?: number; transpersonal?: number };

const names: Array<keyof Pillars> = ['anchor','bridge','symbol','dialog','transpersonal'];

const colors = ['#FDE68A','#FECACA','#C7F9CC','#CBD5FF','#FDE68A'];

const ease = (n: number) => `${n}ms cubic-bezier(.2,.9,.3,1)`;

const ConstellationFlower: React.FC<{pillars?: Pillars; size?: number; highlight?: (keyof Pillars)[]}> = ({ pillars = {}, size = 120, highlight = [] }) => {
  const max = Math.max(...names.map(n => Number(pillars[n] || 0)), 1);
  const center = Math.round((Object.values(pillars).reduce((s, v) => s + (Number(v) || 0), 0)) || 0);
  const [pulses, setPulses] = useState<Record<string, number>>({});

  useEffect(() => {
    // trigger pulse animation for highlighted pillars
    const now = Date.now();
    const next: Record<string, number> = {};
    highlight.forEach(h => next[h] = now);
    setPulses(prev => ({ ...prev, ...next }));
  }, [highlight.join('|')]);

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Constellation flower" role="img">
        <g transform={`translate(${size/2},${size/2})`}>
          {names.map((n, i) => {
            const angle = (i / names.length) * Math.PI * 2 - Math.PI/2;
            const valRaw = Number(pillars[n] || 0);
            const val = valRaw / max;
            const r = 18 + val * (size/2 - 20);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const rx = 18 + val * 12;
            const ry = 28 + val * 18;
            const pulseSince = pulses[n] || 0;
            const pulseAge = pulseSince ? Date.now() - pulseSince : 0;
            const pulsing = pulseAge > 0 && pulseAge < 900;

            return (
              <g key={n} transform={`translate(${x},${y})`} style={{ transition: `transform 400ms ease` }}>
                {/* Accessible overlay: a foreignObject with tooltip content rendered on hover/focus */}
                <foreignObject x={-60} y={-70} width={120} height={80} style={{ pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="flower-tooltip" style={{ display: 'none' }}>
                      <div className="flower-tooltip__title">{n}</div>
                      <div className="flower-tooltip__bar">
                        <div className="flower-tooltip__bar-fill" style={{ width: `${Math.min(100, Math.round((valRaw / Math.max(1, max)) * 100))}%` }} />
                      </div>
                      <div className="flower-tooltip__value">{valRaw}</div>
                    </div>
                  </div>
                </foreignObject>

                <ellipse
                  cx={0}
                  cy={0}
                  rx={rx}
                  ry={ry}
                  fill={colors[i%colors.length]}
                  opacity={0.95}
                  transform={`rotate(${(angle*180/Math.PI)})`}
                  style={{
                    transition: `rx 400ms ease, ry 400ms ease, opacity 400ms ease, transform ${ease(400)}`,
                    filter: pulsing ? 'drop-shadow(0 6px 12px rgba(250,180,80,0.4))' : undefined,
                    transformOrigin: 'center'
                  }}
                />

                <text x={0} y={0} fontSize={8} textAnchor="middle" dominantBaseline="middle" fill="#1F2937">{n}</text>
              </g>
            );
          })}

          <circle r={size*0.12} fill="#111827" opacity={0.95} />
          <text x={0} y={2} fontSize={12} textAnchor="middle" fill="#fff">{center}</text>
        </g>
      </svg>

      <style>{`
        .flower-tooltip{ background: rgba(255,255,255,0.98); border-radius:8px; padding:8px; box-shadow: 0 6px 18px rgba(11,15,25,0.08); font-size:12px; color:#09121a }
        .flower-tooltip__bar{ background:#f1f5f9; width:120px; height:8px; border-radius:8px; overflow:hidden; margin-top:6px }
        .flower-tooltip__bar-fill{ background:linear-gradient(90deg,#f59e0b,#f97316); height:100%; }
        .flower-tooltip__title{ font-weight:600 }
        /* show the tooltip when the parent group is hovered or focused */
        svg g:hover .flower-tooltip, svg g:focus .flower-tooltip, svg g:active .flower-tooltip{ display:block; pointer-events:auto }
      `}</style>
    </div>
  );
}

export default ConstellationFlower;
