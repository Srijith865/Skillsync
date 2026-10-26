import React from 'react';

interface SkillBadgeProps {
  name: string;
  type: 'matching' | 'missing';
  urgency?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  reason?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ name, type, urgency, reason }) => {
  if (type === 'matching') {
    return (
      <div className="skill-badge-match">
        <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>✓</span>
        <span className="text-[var(--cream)] text-[0.67rem] tracking-wide">{name}</span>
      </div>
    );
  }

  const urgencyColor =
    urgency === 'HIGH' ? '#ff4545' :
    urgency === 'MEDIUM' ? '#f5a623' :
    '#6b6b8a';

  const urgencyBg =
    urgency === 'HIGH' ? 'rgba(255,69,69,0.07)' :
    urgency === 'MEDIUM' ? 'rgba(245,166,35,0.07)' :
    'rgba(107,107,138,0.07)';

  return (
    <div
      className="skill-badge-missing"
      style={{
        background: urgencyBg,
        border: `1px solid ${urgencyColor}28`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <span
          className="font-mono-ui text-[9px] font-bold tracking-widest px-1.5 py-0.5"
          style={{
            background: `${urgencyColor}18`,
            border: `1px solid ${urgencyColor}40`,
            color: urgencyColor,
          }}
        >
          {urgency ?? '—'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[var(--cream)] text-[0.72rem] font-medium leading-tight">{name}</div>
        {reason && (
          <div className="text-[var(--text-muted)] text-[0.62rem] mt-1 leading-relaxed">{reason}</div>
        )}
      </div>
    </div>
  );
};
