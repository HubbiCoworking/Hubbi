import type { ReactNode } from 'react';

type IconProps = { className?: string; strokeWidth?: number };

function Icon({ children, className, strokeWidth = 2 }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
export const ArrowLeft = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Icon>;
export const Check = (p: IconProps) => <Icon strokeWidth={3} {...p}><path d="m5 12 5 5 9-10" /></Icon>;
export const Alert = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></Icon>;
export const Eye = (p: IconProps) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const EyeOff = (p: IconProps) => <Icon {...p}><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.6 3.6M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" /></Icon>;
export const Calendar = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>;
export const Clock = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const Search = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
export const Wallet = (p: IconProps) => <Icon {...p}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18" /></Icon>;
export const Leaf = (p: IconProps) => <Icon {...p}><path d="M12 21c-4-3-7-6.5-7-10.5A7 7 0 0 1 12 3a7 7 0 0 1 7 7.5c0 4-3 7.5-7 10.5z" /></Icon>;
export const LeafPlus = (p: IconProps) => <Icon {...p}><path d="M12 21c-4-3-7-6.5-7-10.5A7 7 0 0 1 12 3a7 7 0 0 1 7 7.5c0 4-3 7.5-7 10.5z" /><path d="M12 8v6M9 11h6" /></Icon>;
export const Calculator = (p: IconProps) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" /></Icon>;
export const Undo = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Icon>;
export const Tag = (p: IconProps) => <Icon {...p}><path d="M20 12 12 20 4 12V4h8z" /><circle cx="8.5" cy="8.5" r="1.5" /></Icon>;
export const Receipt = (p: IconProps) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 13h8M8 17h4" /></Icon>;
export const Mail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></Icon>;
export const Team = (p: IconProps) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.7c1.7.8 2.8 2.6 3 5.3" /></Icon>;
export const Dot = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>
);
export const Menu = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const Close = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const HomeIcon = (p: IconProps) => <Icon {...p}><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></Icon>;
export const More = (p: IconProps) => <Icon strokeWidth={2.6} {...p}><path d="M5 12h.01M12 12h.01M19 12h.01" /></Icon>;
export const LogOut = (p: IconProps) => <Icon {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></Icon>;
export const ChevronRight = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="m9 6 6 6-6 6" /></Icon>;
export const CheckDouble = (p: IconProps) => <Icon strokeWidth={2.6} {...p}><path d="m2 12.5 4.5 4.5L15 8M10 15.5l1.5 1.5L22 7" /></Icon>;
export const MapPin = (p: IconProps) => <Icon {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Icon>;
export const Access = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="7.2" r="1.4" /><path d="M7.5 10h9M12 10v4M12 14l-2.5 4M12 14l2.5 4" /></Icon>;
