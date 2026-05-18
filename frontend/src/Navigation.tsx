import React from 'react';

export const TopNavigation: React.FC = () => (
  <nav className="bg-slate-900 border-b border-slate-700 px-6 py-2 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-300">SanlamConnect Intelligence</span>
      <div className="flex gap-6 items-center">
        <a 
          href="https://dwf3ks4dra8f3.cloudfront.net/" 
          className="text-xs text-slate-400 hover:text-blue-300 transition"
        >
          Validation Lab
        </a>
        <a 
          href="http://sanlamconnect-performance-intelligence.s3-website-eu-west-1.amazonaws.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-blue-300 transition"
        >
          Performance Intelligence
        </a>
        <a 
          href="https://sanlamconnect-lxp-frontend-684756697968.eu-west-1.awsapprunner.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-blue-300 transition"
        >
          LXP Platform
        </a>
      </div>
    </div>
  </nav>
);
