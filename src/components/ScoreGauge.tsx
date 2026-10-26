import React, { useEffect, useRef } from 'react';

interface ScoreGaugeProps {
  score: number;
  tier: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, tier }) => {
  const arcRef = useRef<SVGCircleElement>(null);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const tierColor =
    score >= 75 ? '#00d46a' :
    score >= 50 ? '#00c8e8' :
    score >= 30 ? '#f5a623' :
    '#ff4545';

  const tierLabel =
    score >= 75 ? 'STRONG MATCH' :
    score >= 50 ? 'MODERATE MATCH' :
    score >= 30 ? 'WEAK MATCH' :
    'POOR MATCH';

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    el.style.strokeDashoffset = String(circumference);
    const timeout = setTimeout(() => {
      el.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.strokeDashoffset = String(offset);
    }, 80);
    return () => clearTimeout(timeout);
  }, [score, offset, circumference]);

  return (
    <div
      className="bracket p-6 flex flex-col sm:flex-row items-center gap-8 animate-entry animate-entry-1"
      style={{ background: 'var(--dark-2)', border: '1px solid var(--border)' }}
    >
      {/* Arc Gauge */}
      <div className="flex-shrink-0 relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <circle
            ref={arcRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={tierColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${tierColor}88)` }}
          />
        </svg>

        {/* Score Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1">
          <span
            className="font-mono-ui font-bold leading-none"
            style={{ fontSize: '2.6rem', color: tierColor, textShadow: `0 0 20px ${tierColor}66` }}
          >
            {clampedScore}
          </span>
          <span className="font-mono-ui text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
            ATS SCORE
          </span>
        </div>
      </div>

      {/* Tier Info */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div>
          <div
            className="label-tag mb-2"
            style={{
              background: `${tierColor}14`,
              border: `1px solid ${tierColor}35`,
              color: tierColor,
            }}
          >
            ● {tierLabel}
          </div>
          <h2 className="text-lg font-semibold text-white leading-tight">{tier}</h2>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-mono-ui text-[10px] tracking-widest text-[var(--text-muted)] uppercase">Match Index</span>
            <span className="font-mono-ui text-[10px]" style={{ color: tierColor }}>{clampedScore}%</span>
          </div>
          <div
            className="w-full h-1.5 overflow-hidden"
            style={{ background: 'var(--border)', borderRadius: '1px' }}
          >
            <div
              className="h-full"
              style={{
                width: `${clampedScore}%`,
                background: `linear-gradient(90deg, ${tierColor}88, ${tierColor})`,
                boxShadow: `0 0 8px ${tierColor}`,
                transition: 'width 1.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '1px',
              }}
            />
          </div>
        </div>

        {/* Benchmarks */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ATS PASS', threshold: 60, icon: score >= 60 ? '✓' : '✗' },
            { label: 'INTERVIEW', threshold: 75, icon: score >= 75 ? '✓' : '✗' },
            { label: 'OFFER ZONE', threshold: 85, icon: score >= 85 ? '✓' : '✗' },
          ].map(({ label, threshold, icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 py-2 px-2"
              style={{
                background: 'var(--dark-3)',
                border: `1px solid ${score >= threshold ? tierColor + '33' : 'var(--border)'}`,
              }}
            >
              <span
                className="font-mono-ui text-base font-bold"
                style={{ color: score >= threshold ? tierColor : 'var(--text-dim)' }}
              >
                {icon}
              </span>
              <span
                className="font-mono-ui text-[9px] tracking-widest text-center leading-tight"
                style={{ color: score >= threshold ? 'var(--cream)' : 'var(--text-dim)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
