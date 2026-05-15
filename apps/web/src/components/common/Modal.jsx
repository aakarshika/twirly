import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { themes as risoThemes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-full mx-4',
};

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
  const { themeId } = useTheme();
  const t = risoThemes[themeId] ?? risoThemes.light;

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = e => {
    if (closeOnOutsideClick && e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`${sizeClasses[size] ?? sizeClasses.md} w-full max-h-[90vh] overflow-y-auto rounded-lg outline-none ${className}`}
        style={{
          backgroundColor: t.bg,
          border: `1px solid ${t.ink}20`,
          color: t.ink,
          fontFamily: '"Fraunces", serif',
        }}
      >
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${t.ink}18` }}
          >
            {title && (
              <h3 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.ink, fontSize: 20 }}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full transition-opacity hover:opacity-60 cursor-pointer"
                style={{ color: t.ink }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
