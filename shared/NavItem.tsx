import React from 'react';
import clsx from 'clsx';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  /** Visual variant — 'dark' for dark sidebars, 'panel' for embedded panels */
  variant?: 'dark' | 'panel';
}

export function NavItem({ icon, label, active = false, onClick, variant = 'dark' }: NavItemProps) {
  const styles = {
    dark: {
      active: 'bg-[#34495e] text-white font-medium',
      idle:   'text-gray-400 hover:bg-white/5 hover:text-gray-200',
    },
    panel: {
      active: 'bg-white/10 text-white font-medium',
      idle:   'text-gray-400 hover:bg-white/5 hover:text-white',
    },
  };

  const s = styles[variant];

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all',
        active ? s.active : s.idle,
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
