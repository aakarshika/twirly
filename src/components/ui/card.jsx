import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  onClick,
  ...props 
}) => {
  const baseStyles = 'rounded-lg shadow-sm transition-all duration-200';
  
  const variants = {
    default: 'bg-white border border-gray-200 hover:shadow-md',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    flat: 'bg-gray-50',
    bordered: 'bg-white border-2 border-gray-200 hover:border-indigo-500',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'flat', 'bordered']),
  onClick: PropTypes.func,
};

export default Card; 