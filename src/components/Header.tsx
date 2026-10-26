import React from 'react';

interface HeaderProps {
  isDemoMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isDemoMode }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center text-white font-mono-ui font-bold text-xs tracking-widest"
            style={{ background: 'var(--blue)', boxShadow: '0 0 16px rgba(0,0,242,0.7)' }}
          >
            SS
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-bold text-sm text-white tracking-tight uppercase" style={{ letterSpacing: '-0.01em' }}>
              SkillSync AI
            </span>
            <span
              className="label-tag text-[var(--cyan)]"
              style={{ background: 'rgba(0,200,232,0.08)', border: '1px solid rgba(0,200,232,0.2)' }}
            >
              v2.4
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 font-mono-ui text-xs">
          {isDemoMode && (
            <span
              className="label-tag"
              style={{
                background: 'rgba(245,166,35,0.1)',
                border: '1px solid rgba(245,166,35,0.3)',
                color: 'var(--amber)',
              }}
            >
              DEMO
            </span>
          )}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5"
            style={{ background: 'var(--dark-3)', border: '1px solid var(--border)' }}
          >
            <div className="status-dot" />
            <span className="text-[var(--text-muted)] text-[10px] tracking-widest">GEMMA_4 LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
