// File: src/components/layout/Footer.jsx

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col items-center justify-center p-6 text-center text-sm mt-8 pb-28 lg:pb-8 text-text-muted">
      <div className="max-w-6xl mx-auto">
        <p>© {currentYear} TWIRLY. All rights reserved.</p>

        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <a href="#" className="hover:text-text transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-text transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
