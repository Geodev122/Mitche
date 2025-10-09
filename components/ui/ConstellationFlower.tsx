import React from 'react';

type Pillars = { anchor?: number; bridge?: number; symbol?: number; dialog?: number; transpersonal?: number };

const names: Array<keyof Pillars> = ['anchor','bridge','symbol','dialog','transpersonal'];

const colors = ['#FDE68A','#FECACA','#C7F9CC','#CBD5FF','#FDE68A'];

const ConstellationFlower: React.FC<{pillars?: Pillars; size?: number}> = ({ pillars = {}, size = 120 }) => {
  const max = Math.max(...names.map(n => Number(pillars[n] || 0)), 1);
  const center = Math.round((Object.values(pillars).reduce((s, v) => s + (Number(v) || 0), 0)) || 0);

  return (
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

          return (
            <g key={n} transform={`translate(${x},${y})`} style={{ transition: 'transform 400ms ease' }}>
              <title>{`${n}: ${valRaw}`}</title>
              <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={colors[i%colors.length]} opacity={0.95} transform={`rotate(${(angle*180/Math.PI)})`} style={{ transition: 'rx 400ms ease, ry 400ms ease, opacity 400ms ease' }} />
              <text x={0} y={0} fontSize={8} textAnchor="middle" dominantBaseline="middle" fill="#1F2937">{n}</text>
            </g>
          );
        })}

        <circle r={size*0.12} fill="#111827" opacity={0.95} />
        <text x={0} y={2} fontSize={12} textAnchor="middle" fill="#fff">{center}</text>
      </g>
    </svg>
  );
}

export default ConstellationFlower;
