import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="mt-24 py-8 px-5"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--dark)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 font-mono-ui text-xs">
        {/* Powered by Gemma 4 */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 font-semibold text-white"
            style={{
              background: 'rgba(0,0,242,0.12)',
              border: '1px solid rgba(0,0,242,0.35)',
              boxShadow: '0 0 16px rgba(0,0,242,0.15)',
            }}
          >
            <span style={{ color: 'var(--green)', fontSize: '0.9rem' }}>⚡</span>
            <span className="tracking-widest text-[10px] uppercase">Powered by Gemma 4</span>
          </div>
          <span className="text-[var(--text-dim)] text-[10px] hidden md:inline tracking-wide">
            // Google Gemini API
          </span>
        </div>

        {/* Right: meta */}
        <div className="flex items-center gap-4 text-[10px] tracking-widest text-[var(--text-dim)]">
          <span>ATS_ENGINE v2.4</span>
          <span>·</span>
          <span style={{ color: 'var(--cyan)' }}>HACKATHON SUBMISSION</span>
          <span>·</span>
          <span>MIT LICENSE</span>
        </div>
      </div>
    </footer>
  );
};
