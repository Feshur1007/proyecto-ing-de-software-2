import React from 'react';

export default function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Sun Archetypes */}
      <circle cx="100" cy="80" r="50" stroke="#FBBF24" strokeWidth="8" />
      <path d="M50 80C50 52.3858 72.3858 30 100 30C127.614 30 150 52.3858 150 80" stroke="#FBBF24" strokeWidth="8" />
      <path d="M65 80C65 60.67 80.67 45 100 45C119.33 45 135 60.67 135 80" stroke="#FBBF24" strokeWidth="8" />
      
      {/* Hills / Fields */}
      <path 
        d="M20 120C40 100 80 100 120 120C160 140 180 130 180 120V180H20V120Z" 
        fill="#3F6212" 
      />
      <path 
        d="M20 140C50 120 100 120 140 150C170 170 180 160 180 150V180H20V140Z" 
        fill="#4D7C0F" 
        opacity="0.8"
      />
      <path 
        d="M20 160C60 150 120 150 180 170V180H20V160Z" 
        fill="#713F12" 
        opacity="0.6"
      />
    </svg>
  );
}
