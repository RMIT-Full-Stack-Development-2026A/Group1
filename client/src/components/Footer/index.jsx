/**
 * Footer Component
 * Reusable footer for all pages
 */

import React from 'react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 flex justify-between items-center px-8 py-2 bg-[#0d0d1a] border-t-2 border-[#3d484d] text-[10px] uppercase opacity-60 font-body">
      <div className="flex items-center gap-6">
        <span className="text-primary-container">© 2077 NEON CIRCUIT SYSTEMS. ALL RIGHTS RESERVED.</span>
        <div className="flex items-center gap-4 text-outline-variant">
          <a className="hover:text-primary-container transition-colors duration-100" href="#terminal">
            TERMINAL_LOGS
          </a>
          <a className="hover:text-primary-container transition-colors duration-100" href="#support">
            SUPPORT_STRATA
          </a>
          <a className="hover:text-primary-container transition-colors duration-100" href="#legal">
            LEGAL_PROTOCOL
          </a>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-secondary-container">STATUS: ACTIVE_DAEMON</span>
        <span className="material-symbols-outlined text-xs">memory</span>
      </div>
    </footer>
  );
}
