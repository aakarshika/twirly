// File: src/components/common/Button.jsx

import React from 'react';

/**
 * A reusable Button component with various style variants
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'outline', or 'ghost'
 * @param {string} props.size - Button size: 'sm', 'md', or 'lg'
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {function} props.onClick - Click handler function
 * @param {React.ReactNode} props.leftIcon - Optional icon to display before children
 * @param {React.ReactNode} props.rightIcon - Optional icon to display after children
 * @param {string} props.className - Additional CSS classes
 */
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
  // Base classes that all buttons share
  const baseClasses = 'font-medium transition-all rounded flex items-center justify-center gap-2';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-600',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-500',
    outline: 'border border-gray-700 text-white hover:bg-gray-900 disabled:border-gray-800 disabled:text-gray-600',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-900 disabled:text-gray-700',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClasses}
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} 
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {leftIcon && <span className="button-icon">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="button-icon">{rightIcon}</span>}
    </button>
  );
};

export default Button;
