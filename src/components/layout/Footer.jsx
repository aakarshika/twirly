// File: src/components/layout/Footer.jsx

import React from 'react';
import { Github, Twitter, Instagram } from 'lucide-react';

/**
 * Footer component with copyright and social links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="p-6 text-center text-gray-500 text-sm mt-8 border-t border-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center space-x-6 mb-4">
          <a 
            href="#" 
            className="hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a 
            href="#" 
            className="hover:text-white transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={20} />
          </a>
          <a 
            href="#" 
            className="hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
        </div>
        
        <p>© {currentYear} COMPARE. All rights reserved.</p>
        
        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;