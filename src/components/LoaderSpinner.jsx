'use client';

import React from 'react';

export default function LoaderSpinner({ className = '', message = 'Loading...' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-6 select-none ${className}`}>
      {/* 12-Tick Spinner wrapper */}
      <div className="loadingio-spinner-spinner-977el9wwy2v scale-50 md:scale-75 -my-8">
        <div className="ldio-4j5ay0xf86g">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {message && (
        <div className="text-center mt-2">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 animate-pulse">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
