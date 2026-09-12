import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace',
    });

    const renderChart = async () => {
      if (!containerRef.current || !chart.trim()) return;
      try {
        setError(null);
        containerRef.current.innerHTML = '';
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        console.warn('Mermaid syntax render error:', err);
        setError('Syntax error in Mermaid class diagram definition. Please verify diagram syntax.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-[250px] w-full items-center justify-center overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4"
    />
  );
};
