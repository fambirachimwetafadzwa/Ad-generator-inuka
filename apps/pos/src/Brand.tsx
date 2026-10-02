import type { ReactNode } from 'react';

export function Mark({ size = 44 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs><linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff6a4d" /><stop offset="1" stopColor="#ffa04d" /></linearGradient></defs>
      <rect width="48" height="48" rx="14" fill="url(#mk)" />
      <path d="M33 18a10 10 0 0 0-17-3M15 30a10 10 0 0 0 17 3" fill="none" stroke="#1a0d08" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M17 9v7h7M31 39v-7h-7" fill="none" stroke="#1a0d08" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Mark size={size + 14} />
      <span style={{ fontWeight: 800, fontSize: size, letterSpacing: -0.5 }}>Sync<span style={{ color: 'var(--brand)' }}>POS</span></span>
    </div>
  );
}

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);
export const Icon = {
  sell: svg(<><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>),
  history: svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  cashup: svg(<><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 9.5v.01M17.5 14.5v.01" /></>),
  logout: svg(<><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
};
