import React from 'react';
import type { RadarScores } from '../../domain/types';

interface RadarChartProps {
  scores: RadarScores;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  const metrics = [
    { label: 'Abstraction', value: scores.abstraction },
    { label: 'SOLID', value: scores.solid },
    { label: 'Extensibility', value: scores.extensibility },
    { label: 'Edge Cases', value: scores.edgeCases },
    { label: 'Trade-offs', value: scores.tradeoffs },
  ];

  const center = 100;
  const radius = 70;

  // Calculate polygon points
  const points = metrics.map((m, i) => {
    const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
    const r = (radius * m.value) / 100;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width="220" height="220" className="overflow-visible">
        {/* Background Grid Polygons */}
        {gridLevels.map((level, idx) => {
          const gridPoints = metrics.map((_, i) => {
            const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
            const r = radius * level;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          });
          return (
            <polygon
              key={idx}
              points={gridPoints.join(' ')}
              className="fill-none stroke-slate-800 stroke-1"
            />
          );
        })}

        {/* Axis Rays */}
        {metrics.map((_, i) => {
          const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-slate-800 stroke-1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={points.join(' ')}
          className="fill-indigo-500/30 stroke-indigo-400 stroke-2 transition-all duration-500"
        />

        {/* Data Vertices */}
        {metrics.map((m, i) => {
          const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
          const r = (radius * m.value) / 100;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-indigo-400 stroke-slate-900 stroke-2"
            />
          );
        })}

        {/* Metric Labels */}
        {metrics.map((m, i) => {
          const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
          const labelRadius = radius + 18;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-300 text-[10px] font-semibold"
            >
              {m.label} ({m.value})
            </text>
          );
        })}
      </svg>
    </div>
  );
};
