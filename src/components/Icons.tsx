const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const HomeIcon = () => (
  <svg {...base}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor" stroke="none" /></svg>
);
export const BallIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3v18M5.6 5.6c3.2 2.9 3.2 9.9 0 12.8M18.4 5.6c-3.2 2.9-3.2 9.9 0 12.8" /></svg>
);
export const BarsIcon = () => (
  <svg {...base}><path d="M5 20V11M10 20V6M15 20v-7M20 20V9" strokeWidth={3} /></svg>
);
export const SearchIcon = () => (
  <svg {...base}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const GearIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const CalendarIcon = () => (
  <svg {...base} width={18} height={18}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const TrophyIcon = () => (
  <svg {...base} width={20} height={20}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4" /></svg>
);
export const FlameIcon = () => (
  <svg {...base} width={20} height={20}><path d="M12 22c4 0 7-2.7 7-6.5 0-3.4-2.3-5.6-4-7.5-.3 2-1.3 3-2.5 3.5C13 8 11.5 5 9 2c0 4-4 6.5-4 12 0 4.2 3 8 7 8z" fill="currentColor" stroke="none" /></svg>
);
export const ChevronRight = () => (
  <svg {...base} width={16} height={16}><path d="m9 6 6 6-6 6" /></svg>
);
