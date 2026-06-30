import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FloatingRescueWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-bounce-short hover:-translate-y-1 transition-transform duration-300">
      <div className="bg-[#dc2626] text-white shadow-2xl rounded-2xl overflow-hidden relative group hover:bg-[#b91c1c] transition-colors w-28 h-28">
        
        <Link 
          to="/rescue" 
          className="flex flex-col items-center justify-center w-full h-full p-2"
        >
          <span className="text-4xl animate-pulse mb-1 shadow-black drop-shadow-md">🚨</span>
          
          <span className="font-bold text-xs uppercase tracking-wider text-center leading-tight">
            Urgent<br/>Rescue
          </span>
        </Link>
        <button 
          onClick={(e) => {
            e.preventDefault(); 
            setIsVisible(false);
          }}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full hover:bg-black/20 transition-colors"
          aria-label="Close"
        >
          <svg className="w-3.5 h-3.5 text-white/90 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      </div>
    </div>
  );
};

export default FloatingRescueWidget;