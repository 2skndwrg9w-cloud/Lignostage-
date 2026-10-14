import React from 'react';

interface ProjectGraphicProps {
  id: string;
  category: 'buehne' | 'stage-design' | 'festival';
  title: string;
  projectName?: string;
  customUrl?: string;
}

export const ProjectGraphic: React.FC<ProjectGraphicProps> = ({ id, category, title, projectName, customUrl }) => {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt={title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  // 1. Waldbühne & Baumkronen / Organisches Design
  if (id.includes('waldklang') || title.toLowerCase().includes('wald') || title.toLowerCase().includes('baum')) {
    return (
      <div className="relative w-full h-full bg-[#141d17] text-stone-200 flex flex-col justify-between p-4 sm:p-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#2e4a36_1px,transparent_1px)] [background-size:14px_14px] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-400 border-b border-[#2e4a36]/60 pb-2">
          <span className="font-mono text-emerald-400 font-semibold tracking-wide uppercase truncate max-w-[190px]">
            {projectName || 'Waldklang Open Air'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#2e4a36]/40 text-emerald-300 rounded font-mono">
            {category === 'stage-design' ? 'STAGE DESIGN' : 'HOLZBÜHNE'}
          </span>
        </div>

        <div className="relative z-10 my-auto py-1">
          <svg className="w-full h-24 text-emerald-300/80" viewBox="0 0 320 100" fill="none" stroke="currentColor">
            {/* Tree Silhouettes in Background */}
            <path d="M 30 75 L 45 40 L 40 40 L 55 15 L 70 40 L 65 40 L 80 75 Z" fill="#1b3022" stroke="#2e4a36" strokeWidth="1" />
            <path d="M 240 75 L 255 35 L 250 35 L 265 10 L 280 35 L 275 35 L 290 75 Z" fill="#1b3022" stroke="#2e4a36" strokeWidth="1" />
            
            {/* Natural Slope Contour */}
            <path d="M 10 82 Q 160 76 310 84" stroke="#4a5f4e" strokeWidth="1.5" strokeDasharray="3 3" />
            
            {/* Modular Platform Podest with Bühtecs Leveling */}
            <rect x="60" y="65" width="200" height="8" rx="2" fill="#5c3a21" stroke="#a4784a" strokeWidth="1.5" />
            <line x1="80" y1="73" x2="80" y2="82" stroke="#d97706" strokeWidth="3" />
            <line x1="130" y1="73" x2="130" y2="80" stroke="#d97706" strokeWidth="3" />
            <line x1="180" y1="73" x2="180" y2="78" stroke="#d97706" strokeWidth="3" />
            <line x1="230" y1="73" x2="230" y2="84" stroke="#d97706" strokeWidth="3" />
            
            {/* Organic Timber Curved Wings */}
            <path d="M 70 65 C 90 30, 110 25, 160 30 C 210 25, 230 30, 250 65" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
            <path d="M 85 65 C 100 40, 120 38, 160 40 C 200 38, 220 40, 235 65" stroke="#d97706" strokeWidth="1.5" fill="none" />
            
            {/* Hanging ambient fairy points */}
            <circle cx="110" cy="45" r="2.5" fill="#fde68a" />
            <circle cx="160" cy="38" r="3" fill="#fde68a" />
            <circle cx="210" cy="45" r="2.5" fill="#fde68a" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-[#2e4a36]/60">
          <span className="truncate">{title}</span>
          <span className="font-mono text-emerald-400">Natur & Akustik</span>
        </div>
      </div>
    );
  }

  // 2. Textil & Fabric Baldachin / Stage Design
  if (category === 'stage-design') {
    return (
      <div className="relative w-full h-full bg-[#18181b] text-neutral-200 flex flex-col justify-between p-4 sm:p-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:14px_14px] opacity-35 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2">
          <span className="font-mono text-amber-400 font-semibold tracking-wide uppercase truncate max-w-[190px]">
            {projectName || 'Lignostage Design'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 rounded font-mono">
            STAGE DESIGN
          </span>
        </div>

        <div className="relative z-10 my-auto py-1">
          <svg className="w-full h-24 text-amber-300/80" viewBox="0 0 320 100" fill="none" stroke="currentColor">
            {/* Tensile Fabric Ceiling Canopy Segments */}
            <path d="M 40 30 Q 160 10 280 30 L 260 65 Q 160 45 60 65 Z" fill="#2d1c10" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="40" y1="30" x2="160" y2="45" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="280" y1="30" x2="160" y2="45" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="160" y1="10" x2="160" y2="45" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Backstage Wooden Lamella Wall */}
            <rect x="70" y="55" width="180" height="30" fill="#1c1917" stroke="#78350f" strokeWidth="1" />
            <line x1="90" y1="55" x2="90" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="110" y1="55" x2="110" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="130" y1="55" x2="130" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="150" y1="55" x2="150" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="170" y1="55" x2="170" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="190" y1="55" x2="190" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="210" y1="55" x2="210" y2="85" stroke="#b45309" strokeWidth="1.5" />
            <line x1="230" y1="55" x2="230" y2="85" stroke="#b45309" strokeWidth="1.5" />

            {/* Platform Floor Line */}
            <rect x="50" y="85" width="220" height="6" rx="1" fill="#451a03" stroke="#92400e" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-neutral-800">
          <span className="truncate">{title}</span>
          <span className="font-mono text-amber-400">Textil & Holz</span>
        </div>
      </div>
    );
  }

  // 3. Modulare Holzbühne / Bogenkonstruktion
  return (
    <div className="relative w-full h-full bg-[#1c1917] text-stone-200 flex flex-col justify-between p-4 sm:p-5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#44403c_1px,transparent_1px)] [background-size:14px_14px] opacity-40 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800 pb-2">
        <span className="font-mono text-[#eab308] font-semibold tracking-wide uppercase truncate max-w-[190px]">
          {projectName || 'Lignostage Holzbühne'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-300 rounded font-mono">
          HOLZBÜHNE
        </span>
      </div>

      <div className="relative z-10 my-auto py-1">
        <svg className="w-full h-24 text-amber-200/85" viewBox="0 0 320 100" fill="none" stroke="currentColor">
          {/* Stage Base Pillars */}
          <rect x="25" y="65" width="270" height="8" rx="2" fill="#78350f" stroke="#d97706" strokeWidth="1.5" />
          
          {/* Vertical Supports & Bühtecs */}
          <line x1="45" y1="65" x2="45" y2="92" stroke="#b45309" strokeWidth="3" />
          <line x1="105" y1="65" x2="105" y2="92" stroke="#b45309" strokeWidth="3" />
          <line x1="160" y1="65" x2="160" y2="92" stroke="#b45309" strokeWidth="3" />
          <line x1="215" y1="65" x2="215" y2="92" stroke="#b45309" strokeWidth="3" />
          <line x1="275" y1="65" x2="275" y2="92" stroke="#b45309" strokeWidth="3" />
          
          {/* Diagonal Bracing (Fachwerk) */}
          <line x1="45" y1="92" x2="105" y2="65" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="105" y1="92" x2="160" y2="65" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="160" y1="92" x2="215" y2="65" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="215" y1="92" x2="275" y2="65" stroke="#78350f" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Arched Roof Framework */}
          <path d="M 35 65 Q 160 16 285 65" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <path d="M 50 65 Q 160 26 270 65" stroke="#d97706" strokeWidth="1.5" fill="none" />
          <line x1="75" y1="53" x2="75" y2="65" stroke="#b45309" strokeWidth="2" />
          <line x1="115" y1="38" x2="115" y2="65" stroke="#b45309" strokeWidth="2" />
          <line x1="160" y1="26" x2="160" y2="65" stroke="#f59e0b" strokeWidth="2" />
          <line x1="205" y1="38" x2="205" y2="65" stroke="#b45309" strokeWidth="2" />
          <line x1="245" y1="53" x2="245" y2="65" stroke="#b45309" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-800">
        <span className="truncate">{title}</span>
        <span className="font-mono text-amber-400">KVH Holz · Bühtecs</span>
      </div>
    </div>
  );
};

