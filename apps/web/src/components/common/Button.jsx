import React from 'react';
import { cn } from '@utils/utils';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const sizeClasses = {
  sm: 'px-3 py-1 text-sm min-h-[32px]',
  md: 'px-4 py-2 min-h-[40px]',
  lg: 'px-6 py-3 text-lg min-h-[48px]',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) => {
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  const variantStyle = {
    primary:   { background: t.ink,         color: t.bg,  border: 'none' },
    secondary: { background: t.bgDeep,      color: t.ink, border: `1px solid ${t.ink}30` },
    ghost:     { background: 'transparent', color: t.ink, border: 'none' },
    danger:    { background: t.red,         color: t.bg,  border: 'none' },
  }[variant] ?? { background: t.ink, color: t.bg, border: 'none' };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded transition-opacity',
        'font-[\'Fraunces\',serif]',
        sizeClasses[size] ?? sizeClasses.md,
        fullWidth && 'w-full',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      style={variantStyle}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;
