export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#16706A" />
      <circle cx="20" cy="34" r="11" fill="none" stroke="#EEF4F2" strokeWidth="4" />
      <circle cx="44" cy="34" r="11" fill="none" stroke="#EEF4F2" strokeWidth="4" />
      <path d="M29 32q3-4 6 0" fill="none" stroke="#EEF4F2" strokeWidth="4" />
      <path d="M12 34h16" stroke="#E7A93C" strokeWidth="2.5" strokeDasharray="3 2" />
    </svg>
  );
}

/** The large lens drawing on the sign-in screen. */
export function LensArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 300" className={className} aria-hidden="true">
      <circle cx="160" cy="150" r="120" fill="#E7A93C" fillOpacity="0.08" stroke="#5FB3AA" strokeWidth="5" />
      <circle cx="480" cy="150" r="120" fill="#E7A93C" fillOpacity="0.08" stroke="#5FB3AA" strokeWidth="5" />
      <path d="M280 140 Q320 105 360 140" fill="none" stroke="#5FB3AA" strokeWidth="5" />
      <path d="M40 130 L4 110 M600 130 L636 110" stroke="#5FB3AA" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 150 L260 150" stroke="#E7A93C" strokeWidth="3" strokeDasharray="10 8" />
      <path d="M415 85 L545 215" stroke="#E7A93C" strokeWidth="3" strokeDasharray="10 8" />
    </svg>
  );
}
