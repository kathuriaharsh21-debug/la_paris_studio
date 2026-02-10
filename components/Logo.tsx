
import React from 'react';

export const LaParisLogo: React.FC<{ className?: string; color?: string }> = ({ className = "h-8", color = "#D4AF37" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col items-center">
        <span className="brand-font text-2xl font-bold tracking-widest leading-none" style={{ color }}>LA PARIS</span>
        <span className="text-[10px] tracking-[0.3em] font-light leading-none" style={{ color }}>BAKERS PÂTISSERIE</span>
      </div>
    </div>
  );
};
