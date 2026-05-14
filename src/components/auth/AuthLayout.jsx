import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, footerText, footerLink, footerLinkText }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-8 bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>

        {footerText && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {footerText}{' '}
              <Link
                to={footerLink}
                className="font-medium text-amber-400 hover:text-amber-300"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
