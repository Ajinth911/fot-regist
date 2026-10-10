import React from 'react';

interface BadgeProps {
  variant?: 'lime' | 'surface' | 'outline' | 'danger' | 'warning' | 'success';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'surface',
  children,
  className = '',
}) => {
  const variantStyles = {
    lime: 'bg-[#C2E600] text-[#0A0A0A] border-transparent font-bold',
    surface: 'bg-[#F2F2EC] text-[#0A0A0A] border-[#E6E6DF] font-semibold',
    outline: 'bg-transparent text-[#55554F] border-[#E6E6DF]',
    danger: 'bg-[#FFF5F5] text-[#E53935] border-[#E53935]/30 font-bold',
    warning: 'bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]/30 font-bold',
    success: 'bg-[#F0FDF4] text-[#10B981] border-[#10B981]/30 font-bold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-tight border rounded-full ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
