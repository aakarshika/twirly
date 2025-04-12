// File: src/components/common/Modal.jsx

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * A reusable modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Function to call when closing the modal
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', or 'xl'
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {boolean} props.closeOnOutsideClick - Whether clicking outside closes the modal
 * @param {string} props.className - Additional CSS classes for the modal content
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = '',
}) => {
  const modalRef = useRef(null);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Prevent body scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, onClose]);
  
  // Close when clicking outside the modal
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-gray-900 border border-gray-800 rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            {title && <h3 className="text-xl font-bold">{title}</h3>}
            
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;