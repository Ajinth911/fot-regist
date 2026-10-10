import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-10 px-4 text-xs rounded-xl font-medium',
    md: 'h-12 px-6 text-sm rounded-xl font-semibold',
    lg: 'h-14 px-8 text-base rounded-xl font-semibold',
  }[size];

  const variantClasses = {
    primary: 'bg-[#0A0A0A] text-[#FFFFFF] border border-[#0A0A0A] hover:bg-[#222222] shadow-sm',
    lime: 'bg-[#C2E600] text-[#0A0A0A] border border-[#C2E600] hover:bg-[#b5db00] shadow-[0_4px_16px_rgba(194,230,0,0.3)]',
    secondary: 'bg-[#FFFFFF] text-[#0A0A0A] border border-[#E6E6DF] hover:bg-[#F2F2EC] hover:border-[#0A0A0A] shadow-sm',
    danger: 'bg-[#FFF5F5] text-[#E53935] border border-[#E53935]/30 hover:bg-[#FEE2E2]',
    ghost: 'bg-transparent text-[#55554F] hover:text-[#0A0A0A] hover:bg-[#F2F2EC]',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading || props.disabled}
      className={`group inline-flex items-center justify-center gap-2.5 transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent animate-spin mr-1 rounded-full" />
      ) : null}
      <span>{children}</span>
      {icon && !loading ? (
        <span className={`inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 ${
          variant === 'primary' ? 'w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A]' : ''
        }`}>
          {icon}
        </span>
      ) : null}
    </button>
  );
};
