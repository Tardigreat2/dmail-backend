import React, { useState } from 'react';

interface ModernTooltipProps {
  children: React.ReactNode;
  content: string;
}

export default function ModernTooltip({ children, content }: ModernTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-bold text-white bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-55 pointer-events-none whitespace-nowrap transform scale-100 opacity-100 transition-all duration-150 origin-bottom select-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
