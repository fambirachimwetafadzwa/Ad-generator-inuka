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

export function Logo({ size = 22, suffix }: { size?: number; suffix?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Mark size={size + 14} />
      <span style={{ fontWeight: 800, fontSize: size, letterSpacing: -0.5, lineHeight: 1.1, color: 'var(--text)' }}>
        Sync<span style={{ color: 'var(--brand)' }}>POS</span>
        {suffix && <small style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 0, color: 'var(--muted)' }}>{suffix}</small>}
      </span>
    </div>
  );
}
